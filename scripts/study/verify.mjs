// Automated product-name verifier for the gift study. For each distinct product name it asks a
// Claude model with web search whether a product with that name is actually sold.
// Usage:
//   node --env-file=.env.local scripts/study/verify.mjs --mode calibrate --model claude-haiku-5-5
//   node --env-file=.env.local scripts/study/verify.mjs --mode full --model claude-haiku-5-5 --out scripts/study/out/verify_full.jsonl
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), [])
);
const MODE = args.mode ?? "calibrate";
const MODEL = args.model ?? "claude-haiku-5-5";
const OUT = args.out ?? `scripts/study/out/verify_${MODE}_${MODEL}.jsonl`;
const CONC = Number(args.concurrency ?? 8);
const client = new Anthropic();

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const BRAND = /\b(kindle|nintendo|apple|airpods?|jbl|bose|sony|yeti|hydro ?flask|theragun|fitbit|garmin|instant pot|lego|dyson|ninja|keurig|osmo|ravensburger|polaroid|fujifilm|instax|anker|logitech|oura|whoop|lodge|le creuset|stanley|owala|nespresso|breville|cuisinart|vitamix|kitchenaid|roku|google|amazon|echo|samsung|canon|gopro|dji|peloton|bowflex|hatch|moleskine|leuchtturm|crayola|play-?doh|barbie|hot wheels|nerf|melissa|magna|squishmallow|cricut|ugg|patagonia|carhartt|columbia|north face|nike|adidas|lululemon)\b/i;

function loadProducts() {
  const rows = fs.readFileSync("scripts/study/out/full3400.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const m = new Map();
  for (const r of rows) for (const g of r.gifts.slice(0, 3)) {
    if (g.type !== "product") continue;
    const k = norm(g.name);
    const e = m.get(k) ?? { key: k, name: g.name, price: g.price, n: 0 };
    e.n++; m.set(k, e);
  }
  return [...m.values()];
}
const isSpecific = (p) => BRAND.test(p.name) || /\d/.test(p.name);

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const PROMPT = (name) => `Check whether this is a real product that a US shopper can find for sale (new, from a retailer or the manufacturer): "${name}"

Use web search. Then answer with ONLY a JSON object:
{"verdict": "exact" | "discontinued" | "category" | "near_miss" | "not_found",
 "real_name": "<the actual product name you found, or null>",
 "note": "<one short sentence of evidence>"}

Definitions:
- exact: a shopper searching this name would land on that product. Same brand and product line counts, even if the name omits a generation or model suffix ("Theragun Mini" for "Mini 3rd Gen"), a color or size, or uses a generic noun or different word order ("Instax Mini Link Printer", "Wooden Play Food Set"). Also exact if the product line is sold in several versions and the name fits at least one current version.
- discontinued: the product existed under this name but is no longer sold new.
- category: the name is a generic type of item ("insulated tumbler", "puzzle set"), not one specific product, and such items are widely sold.
- near_miss: a real product exists but the name is materially wrong: a model number or variant that does not exist, different key words, a brand paired with a product it does not make, or a bundle that is not sold. Put the real name in real_name.
- not_found: you could not find any product matching, and nothing close.
Be strict about exact model names and variants. Do not guess; if search finds no listing, say not_found or near_miss.`;

async function verifyOne(p) {
  const messages = [{ role: "user", content: PROMPT(p.name) }];
  let usage = { in: 0, out: 0, search: 0 };
  for (let turn = 0; turn < 4; turn++) {
    let r;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        r = await client.messages.create({
          model: MODEL, max_tokens: 1500, messages,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
          output_config: { effort: "low" },
        });
        break;
      } catch (e) {
        if (attempt === 4) return { ...p, ok: false, error: String(e?.message ?? e).slice(0, 300) };
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      }
    }
    usage.in += r.usage.input_tokens + (r.usage.cache_read_input_tokens || 0);
    usage.out += r.usage.output_tokens;
    usage.search += r.usage.server_tool_use?.web_search_requests ?? 0;
    if (r.stop_reason === "pause_turn") { messages.push({ role: "assistant", content: r.content }); continue; }
    const text = r.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    const mt = text.match(/\{[\s\S]*\}/g);
    let v = null;
    if (mt) for (const cand of mt.reverse()) { try { v = JSON.parse(cand); if (v.verdict) break; } catch {} }
    if (!v?.verdict) {
      // Tolerate JSON broken by unescaped quotes in the note: pull the fields out by pattern.
      const vm = text.match(/"verdict"\s*:\s*"(exact|discontinued|category|near_miss|not_found)"/);
      const rn = text.match(/"real_name"\s*:\s*"([^"]*)"/);
      if (vm) v = { verdict: vm[1], real_name: rn ? rn[1] : null, note: "(note unparsed)" };
    }
    if (!v?.verdict) return { ...p, ok: false, error: "unparseable: " + text.slice(0, 200), usage };
    return { ...p, ok: true, model: MODEL, ...v, usage };
  }
  return { ...p, ok: false, error: "too many pause_turns" };
}

// Hand labels from the manual spot-check (good = exists, discontinued, or category; bad = near_miss / not_found).
const BAD = ["band-in-a-box clap & sing", "explorer backpack set", "kids play kitchen mixer toy", "hand2mind outdoor explorer", "moleskine travel art collection", "mix and match art studio"];
const GOOD = ["kindle paperwhite", "jbl clip 4 portable bluetooth speaker", "hydro flask wide mouth water bottle", "theragun mini percussion", "nintendo switch oled", "sony wh-1000xm5", "yeti hopper flip soft cooler", "8bitdo pro 2", "fitbit inspire 3", "garmin etrex handheld", "fujifilm instax mini 12 camera", "coleman 2-person camping tent", "audio-technica at-lp60x", "global knives 3-piece", "crayola inspiration art case", "osprey fairview 55", "little passports world edition", "instax mini link printer", "theragun prime", "garmin instinct 2", "osprey kestrel 48", "melissa & doug wooden play food set", "echo show 8", "anker portable charger powercore 10000mah", "bose soundlink max", "dji mini 4 pro", "moleskine art sketchbook set", "elgato stream deck", "nanit pro smart baby monitor", "jbl flip essential", "peloton guide", "lego boombox"];

async function pool(items, fn, conc) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: conc }, async () => { while (i < items.length) { const it = items[i++]; out.push(await fn(it)); } }));
  return out;
}

const all = loadProducts();
let todo;
if (MODE === "calibrate") {
  const lc = (s) => s.toLowerCase();
  todo = all.filter((p) => [...BAD, ...GOOD].some((k) => lc(p.name).includes(k)));
  // one product per label key so each hand label is tested once
  const seen = new Set(); todo = todo.filter((p) => { const k = [...BAD, ...GOOD].find((x) => lc(p.name).includes(x)); if (seen.has(k)) return false; seen.add(k); p.label = BAD.includes(k) ? "bad" : "good"; return true; });
} else if (MODE === "names") {
  todo = JSON.parse(fs.readFileSync(args.names, "utf8"));
} else {
  const spec = all.filter(isSpecific);
  const gen = all.filter((p) => !isSpecific(p));
  const rand = rng(11); const gsample = gen.map((p) => [rand(), p]).sort((a, b) => a[0] - b[0]).slice(0, Number(args.generic ?? 200)).map((x) => x[1]);
  todo = [...spec.map((p) => ({ ...p, stratum: "specific" })), ...gsample.map((p) => ({ ...p, stratum: "generic" }))];
}
const done = new Set();
if (fs.existsSync(OUT)) for (const l of fs.readFileSync(OUT, "utf8").split("\n")) if (l) { const r = JSON.parse(l); if (r.ok) done.add(r.key); }
todo = todo.filter((p) => !done.has(p.key));
if (args.limit) todo = todo.slice(0, Number(args.limit));
console.log(`mode=${MODE} model=${MODEL} todo=${todo.length} already=${done.size}`);
fs.mkdirSync("scripts/study/out", { recursive: true });
let fails = 0, n = 0;
const results = await pool(todo, async (p) => {
  if (fails >= 6) return null;
  const r = await verifyOne(p);
  if (!r.ok) { fails++; console.error("FAILED", p.name, r.error); } else { fails = 0; fs.appendFileSync(OUT, JSON.stringify(r) + "\n"); }
  if (++n % 25 === 0) console.log(`${n}/${todo.length}`);
  return r;
}, CONC);
if (fails >= 6) console.log("STOPPED after repeated failures; rerun to resume");

if (MODE === "calibrate") {
  const rs = results.filter((r) => r?.ok);
  const bad = new Set(["near_miss", "not_found"]);
  let tp = 0, fn = 0, fp = 0, tn = 0;
  for (const r of rs) { const flagged = bad.has(r.verdict); if (r.label === "bad") flagged ? tp++ : fn++; else flagged ? fp++ : tn++; }
  console.log({ n: rs.length, caught_bad: tp, missed_bad: fn, false_alarms: fp, correct_good: tn });
  for (const r of rs.filter((r) => (r.label === "bad") !== bad.has(r.verdict))) console.log("DISAGREE", r.label, "|", r.name, "->", r.verdict, "|", r.real_name, "|", r.note);
  const u = rs.reduce((a, r) => ({ i: a.i + r.usage.in, o: a.o + r.usage.out, s: a.s + r.usage.search }), { i: 0, o: 0, s: 0 });
  console.log("usage per check:", { in: Math.round(u.i / rs.length), out: Math.round(u.o / rs.length), searches: (u.s / rs.length).toFixed(2) });
}
