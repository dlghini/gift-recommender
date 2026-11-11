"""Baseline vs prompt-variant comparison on the same personas.
Usage: python3 scripts/study/compare.py scripts/study/out/variantA400.jsonl 400"""
import json, re, sys, math, collections as C, subprocess
variant_path, N = sys.argv[1], int(sys.argv[2])
rd = lambda p: [json.loads(l) for l in open(p) if l.strip()]
base = [r for r in rd("scripts/study/out/full3400.jsonl") if r.get("ok") and int(r["id"][1:]) <= N]
var = [r for r in rd(variant_path) if r.get("ok") and int(r["id"][1:]) <= N]
norm = lambda s: re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", s.lower())).strip()
# cleaned names, same function the site now uses
js = "import {cleanName} from './lib/gift-format.ts'; import fs from 'node:fs'; const n=JSON.parse(fs.readFileSync(0,'utf8')); console.log(JSON.stringify(n.map(cleanName)))"
def clean(names):
    out = subprocess.run(["node", "--input-type=module", "-e", js], input=json.dumps(names), capture_output=True, text=True).stdout
    return json.loads(out)
verd = {}
for p in ("scripts/study/out/verify_full.jsonl", "scripts/study/out/verify_compare.jsonl", "scripts/study/out/verify_compareB.jsonl"):
    for r in rd(p):
        if r.get("ok"): verd[r["key"]] = r["verdict"]

def stats(label, rows):
    recs = [dict(g, **{k: r[k] for k in ("budget", "giftPreference", "relationship", "ageRange")}) for r in rows for g in r["gifts"][:3]]
    names = clean([g["name"] for g in recs])
    for g, n in zip(recs, names): g["clean"] = n
    prods = [g for g in recs if g["type"] == "product"]
    known = [g for g in prods if norm(g["clean"]) in verd]
    c = C.Counter(verd[norm(g["clean"])] for g in known)
    tot = len(known)
    wrong = c["near_miss"] + c["not_found"]
    distinct = C.Counter(norm(g["clean"]) for g in prods)
    top10 = sum(v for _, v in distinct.most_common(10)) / len(prods)
    exp_share = sum(g["type"] == "experience" for g in recs) / len(recs)
    both = [g for g in recs if g["giftPreference"] == "both"]
    bundle = re.compile(r"\b(with|and|\+|&|set|kit|bundle|combo)\b", re.I)
    lim = {"under-25": (0, 25), "25-50": (25, 50), "50-100": (50, 100), "100-250": (100, 250), "250+": (250, 1e9)}
    def rng(p):
        n = [float(v.replace(",", "")) for v in re.findall(r"\d[\d,]*\.?\d*", p)]
        return (min(n), max(n)) if n else None
    inb = tb = 0
    for g in recs:
        v = rng(g["price"]); 
        if not v: continue
        a, b = lim[g["budget"]]; tb += 1; inb += (v[1] >= a * 0.8 and v[0] <= b * 1.1)
    hi = [g for g in recs if g["budget"] == "250+" and rng(g["price"])]
    hi_ok = sum(rng(g["price"])[1] >= 250 for g in hi) / len(hi)
    print(f"\n== {label}: {len(rows)} personas, {len(recs)} recs, {len(prods)} product picks ({tot} verified, {len(prods)-tot} not yet)")
    print(f"  verdicts (pick-weighted): " + ", ".join(f"{k} {100*v/tot:.1f}%" for k, v in c.most_common()))
    print(f"  WRONG NAME (near_miss+not_found): {100*wrong/tot:.1f}%   discontinued {100*c['discontinued']/tot:.1f}%")
    print(f"  distinct product names {len(distinct)} ({100*len(distinct)/len(prods):.0f}% of picks), top-10 share {100*top10:.1f}%")
    print(f"  names with bundle-ish words {100*sum(bool(bundle.search(g['clean'])) for g in prods)/len(prods):.1f}%   raw price strings with words {sum(bool(re.search(r'[A-Za-z]', re.sub(r'(from|per person|for two)', '', g['price'], flags=re.I))) for g in recs)}")
    print(f"  experience share {100*exp_share:.1f}% (both-pref {100*sum(g['type']=='experience' for g in both)/len(both):.1f}%)  price in band {100*inb/tb:.1f}%  250+ budget picks reaching $250: {100*hi_ok:.1f}%")
    return {g["clean"] for g in prods}
a = stats("BASELINE (production prompt)", base)
b = stats("VARIANT (naming rules)", var)
print(f"\nproduct names shared by both: {len(a & b)} of {len(a)} baseline / {len(b)} variant")
