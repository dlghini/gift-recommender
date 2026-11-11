// Prepares the baseline-vs-variant comparison: takes the first N personas of the baseline run and the
// variant run, applies the shipped name cleanup, and writes the distinct product names that still need
// verifying (names already verified in verify_full.jsonl are reused).
// Usage: node scripts/study/compare-prep.mjs scripts/study/out/variantA400.jsonl 400
import fs from "node:fs";
import { cleanName } from "../../lib/gift-format.ts";

const [variantPath, nStr] = process.argv.slice(2);
const N = Number(nStr);
const read = (p) => fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.ok);
const base = read("scripts/study/out/full3400.jsonl").filter((r) => Number(r.id.slice(1)) <= N);
const variant = read(variantPath).filter((r) => Number(r.id.slice(1)) <= N);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

const prior = new Map();
for (const f of ["verify_full", "verify_compare", "verify_compareB"])
  if (fs.existsSync(`scripts/study/out/${f}.jsonl`)) for (const r of read(`scripts/study/out/${f}.jsonl`)) prior.set(r.key, r);

const names = new Map();
for (const [label, rows] of [["baseline", base], ["variant", variant]])
  for (const r of rows) for (const g of r.gifts.slice(0, 3)) {
    if (g.type !== "product") continue;
    const name = cleanName(g.name);
    const key = norm(name);
    const e = names.get(key) ?? { key, name, n: 0, stratum: "compare" };
    e.n++; names.set(key, e);
  }
const need = [...names.values()].filter((e) => !prior.has(e.key));
fs.writeFileSync("scripts/study/out/compare_names.json", JSON.stringify(need));
console.log(`baseline personas ${base.length}, variant personas ${variant.length}; distinct cleaned product names ${names.size}; already verified ${names.size - need.length}; to verify ${need.length}`);
