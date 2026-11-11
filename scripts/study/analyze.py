"""Analysis of the gift-recommendation study. Usage: python3 scripts/study/analyze.py scripts/study/out/full3400.jsonl
Looks only at the top 3 picks per persona (what the site shows)."""
import json, re, sys, collections as C

rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
rows = [r for r in rows if r.get("ok")]
recs = []
for r in rows:
    for rank, g in enumerate(r["gifts"][:3], 1):
        recs.append({**{k: r[k] for k in ("id", "relationship", "ageRange", "occasion", "budget", "giftPreference", "interests")}, "rank": rank, **g})
N = len(recs)
pct = lambda a, b: f"{100*a/b:.1f}%" if b else "n/a"
print(f"personas {len(rows)}  recommendations (top 3) {N}")

usage = [r["usage"] for r in rows]
inp = sum(u["input_tokens"] for u in usage); out = sum(u["output_tokens"] for u in usage)
cr = sum(u.get("cache_read_input_tokens") or 0 for u in usage); cw = sum(u.get("cache_creation_input_tokens") or 0 for u in usage)
print(f"tokens in {inp:,} cache_read {cr:,} cache_write {cw:,} out {out:,}  est cost ${(inp*2+cr*.2+cw*2.5+out*10)/1e6:.2f}")

norm = lambda s: re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", s.lower())).strip()
print("\n== type / store")
print("type", {k: pct(v, N) for k, v in C.Counter(x["type"] for x in recs).items()})
print("store", {k: pct(v, N) for k, v in C.Counter(x["store"] for x in recs).items()})

def share(key, field="type", val="experience", sub=lambda x: True):
    d = C.defaultdict(lambda: [0, 0])
    for x in recs:
        if sub(x):
            d[x[key]][1] += 1; d[x[key]][0] += x[field] == val
    return {k: f"{100*a/b:.0f}% (n={b})" for k, (a, b) in sorted(d.items())}
both = lambda x: x["giftPreference"] == "both"
print("\n== experience share when user chose 'both' (prompt asks ~25%)")
print("overall", pct(sum(x["type"]=="experience" for x in recs if both(x)), sum(both(x) for x in recs)))
for k in ("relationship", "ageRange", "budget", "occasion"):
    print(k, share(k, sub=both))
print("\n== preference compliance")
for pref, t in (("gifts", "product"), ("experiences", "experience")):
    xs = [x for x in recs if x["giftPreference"] == pref]
    print(pref, "wrong type:", sum(x["type"] != t for x in xs), "of", len(xs))

print("\n== concentration")
prod = C.Counter(norm(x["name"]) for x in recs if x["type"] == "product")
exp = C.Counter(norm(x["name"]) for x in recs if x["type"] == "experience")
for label, c in (("products", prod), ("experiences", exp)):
    t = sum(c.values())
    print(label, "recs", t, "distinct", len(c), "top1 %s top10 %s top50 %s" % tuple(pct(sum(v for _, v in c.most_common(n)), t) for n in (1, 10, 50)))
    print("  top 12:", c.most_common(12))
print("distinct names across all recs", len(set(norm(x['name']) for x in recs)))

print("\n== budget behaviour (parsed price range vs stated band)")
lim = {"under-25": (0, 25), "25-50": (25, 50), "50-100": (50, 100), "100-250": (100, 250), "250+": (250, 1e9)}
def rng(p):
    n = [float(v.replace(",", "")) for v in re.findall(r"\d[\d,]*\.?\d*", p)]
    return (min(n), max(n)) if n else None
d = C.defaultdict(lambda: C.Counter())
for x in recs:
    v = rng(x["price"]); a, b = lim[x["budget"]]
    if not v: d[x["budget"]]["unparsed"] += 1; continue
    lo, hi = v
    if hi < a * 0.8: d[x["budget"]]["below"] += 1
    elif lo > b * 1.1: d[x["budget"]]["above"] += 1
    else: d[x["budget"]]["in band"] += 1
for b in lim: 
    t = sum(d[b].values()); print(b, {k: pct(v, t) for k, v in d[b].items()}, f"n={t}")

print("\n== recipient/age checks")
alc = re.compile(r"wine|whiskey|whisky|bourbon|beer|brewery|cocktail|spirits|liquor|vodka|tequila|distill")
for age in ("Under 10", "10–17"):
    xs = [x for x in recs if x["ageRange"] == age]
    hits = [x for x in xs if alc.search((x["name"] + " " + x["searchQuery"]).lower())]
    print(age, "alcohol-related picks:", len(hits), "of", len(xs), [h["name"] for h in hits[:5]])
print("Etsy share by occasion", share("occasion", "store", "etsy"))
print("Etsy share by relationship", share("relationship", "store", "etsy"))
print("Viator share by age", share("ageRange", "store", "viator"))

print("\n== experience types (top 15)", exp.most_common(15))
print("\n== rationale hygiene")
rat = [x["rationale"] for x in recs if x["rank"] <= 3]
print("em dashes", sum("—" in r for r in rat), "mean words", sum(len(r.split()) for r in rat)/len(rat))
print("rank-1 picks that are experiences:", pct(sum(x["type"]=="experience" and x["rank"]==1 for x in recs), len(rows)))
json.dump({"personas": len(rows), "recs": N}, open(sys.argv[1].replace(".jsonl", "_summary.json"), "w"))
