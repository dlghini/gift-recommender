// Offline runner for the gift-recommendation study. Sends each synthetic persona through the
// SAME system prompt, schema, model and user-message template as app/api/recommend/route.ts
// (extracted from that file at run time so the two cannot drift), bypassing the rate limit.
//
// Usage: node --env-file=.env.local scripts/study/run.mjs --n 100 --seed 1 --out scripts/study/out/test.jsonl
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { generatePersonas } from "./personas.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), [])
);
const N = Number(args.n ?? 100);
const SEED = Number(args.seed ?? 1);
const OUT = args.out ?? "scripts/study/out/test.jsonl";
const CONCURRENCY = Number(args.concurrency ?? 6);

// Pull the live prompt definitions out of the route file.
const src = fs.readFileSync("app/api/recommend/route.ts", "utf8");
const start = src.indexOf("const CANDIDATE_POOL_SIZE");
const end = src.indexOf("const VIATOR_PID");
if (start < 0 || end < 0) throw new Error("Could not locate prompt block in route.ts");
const block = src.slice(start, end).replace(/: Record<string, string>/g, "");
const defs = new Function(
  `${block}; return { CANDIDATE_POOL_SIZE, SYSTEM_PROMPT, GIFT_SCHEMA, GIFT_PREFERENCE_INSTRUCTIONS, BUDGET_LABELS };`
)();
const { CANDIDATE_POOL_SIZE, GIFT_SCHEMA, GIFT_PREFERENCE_INSTRUCTIONS, BUDGET_LABELS } = defs;
// Optional experiment: append extra rules to the production system prompt (--extra path/to/file.txt).
const EXTRA = args.extra ? fs.readFileSync(args.extra, "utf8") : "";
const SYSTEM_PROMPT = defs.SYSTEM_PROMPT + EXTRA;
const MODEL = /model:\s*"([^"]+)"/.exec(src)?.[1];
if (!MODEL) throw new Error("model not found in route.ts");

const client = new Anthropic();

function userMessage(p) {
  return `Recommend ${CANDIDATE_POOL_SIZE} gift ideas, ranked best fit first, for:
- Recipient: ${p.relationship}, age range ${p.ageRange}
- Occasion: ${p.occasion}
- Interests: ${p.interests.join(", ")}
- Budget: ${BUDGET_LABELS[p.budget] ?? p.budget}

${GIFT_PREFERENCE_INSTRUCTIONS[p.giftPreference]}`;
}

async function runOne(p) {
  const t0 = Date.now();
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await client.messages.create({
        model: MODEL,
        max_tokens: 2600,
        thinking: { type: "disabled" },
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        output_config: { effort: "medium", format: { type: "json_schema", schema: GIFT_SCHEMA } },
        messages: [{ role: "user", content: userMessage(p) }],
      });
      const text = r.content.find((b) => b.type === "text")?.text ?? "";
      let gifts = null;
      try { gifts = JSON.parse(text).gifts; } catch {}
      return { ...p, model: MODEL, ok: !!gifts, stop_reason: r.stop_reason, usage: r.usage, ms: Date.now() - t0, gifts };
    } catch (e) {
      if (attempt === 4) return { ...p, ok: false, error: String(e?.message ?? e) };
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const done = new Set();
if (fs.existsSync(OUT)) for (const l of fs.readFileSync(OUT, "utf8").split("\n")) if (l) { const r = JSON.parse(l); if (r.ok) done.add(r.id); }
const todo = generatePersonas(N, SEED).filter((p) => !done.has(p.id));
console.log(`extra=${args.extra ?? "none"} model=${MODEL} personas=${N} already=${done.size} todo=${todo.length}`);

let i = 0, finished = 0, consecutiveFails = 0;
async function worker() {
  while (i < todo.length) {
    const p = todo[i++];
    if (consecutiveFails >= 5) return; // e.g. out of credits: stop instead of burning through the list
    const rec = await runOne(p);
    if (!rec.ok) {
      // Failed rows are not saved, so a rerun retries them.
      consecutiveFails++;
      console.error(`FAILED ${p.id}: ${rec.error}`);
      continue;
    }
    consecutiveFails = 0;
    fs.appendFileSync(OUT, JSON.stringify(rec) + "\n");
    if (++finished % 10 === 0) console.log(`${finished}/${todo.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(consecutiveFails >= 5 ? "STOPPED after repeated failures (see above); rerun to resume" : "done");
