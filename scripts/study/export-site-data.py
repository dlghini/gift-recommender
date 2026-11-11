"""Builds the published numbers (lib/research/gift-study-data.json) and the downloadable CSV
(public/research/gift-recommendations-3400-personas.csv) from the raw study output.
Usage: python3 scripts/study/export-site-data.py"""
import json, re, csv, math, collections as C

rd = lambda p: [json.loads(l) for l in open(p) if l.strip()]
rows = [r for r in rd("scripts/study/out/full3400.jsonl") if r.get("ok")]
ver = {r["key"]: r for r in rd("scripts/study/out/verify_full.jsonl") if r.get("ok")}
norm = lambda s: re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", s.lower())).strip()
pct = lambda a, b: round(100 * a / b, 1) if b else None

recs = []
for r in rows:
    for rank, g in enumerate(r["gifts"][:3], 1):
        recs.append({**{k: r[k] for k in ("id", "relationship", "ageRange", "occasion", "budget", "giftPreference", "interests")}, "rank": rank, **g})
N = len(recs)
prods = [x for x in recs if x["type"] == "product"]; exps = [x for x in recs if x["type"] == "experience"]
out = {"personas": len(rows), "recommendations": N, "productPicks": len(prods), "experiencePicks": len(exps)}
out["typeSplit"] = {"product": pct(len(prods), N), "experience": pct(len(exps), N)}
st = C.Counter(x["store"] for x in recs); out["storeSplit"] = {k: pct(v, N) for k, v in st.items()}

both = [x for x in recs if x["giftPreference"] == "both"]
out["bothExperienceShare"] = pct(sum(x["type"] == "experience" for x in both), len(both))
out["bothPicks"] = len(both)
out["prefCompliance"] = {p: {"picks": sum(x["giftPreference"] == p for x in recs),
                              "wrong": sum(x["giftPreference"] == p and x["type"] != t for x in recs)}
                         for p, t in (("gifts", "product"), ("experiences", "experience"))}

def top(counter, total, k=10): return [{"name": n, "picks": c, "share": pct(c, total)} for n, c in counter.most_common(k)]
display = {}
for x in recs: display.setdefault(norm(x["name"]), x["name"])
pc = C.Counter(norm(x["name"]) for x in prods); ec = C.Counter(norm(x["name"]) for x in exps)
out["topProducts"] = [{**t, "name": display[t["name"]]} for t in top(pc, len(prods))]
out["topExperiences"] = [{**t, "name": display[t["name"]]} for t in top(ec, len(exps))]
out["distinctProducts"] = len(pc); out["distinctExperiences"] = len(ec)
out["productTop10Share"] = pct(sum(v for _, v in pc.most_common(10)), len(prods))
out["productTop50Share"] = pct(sum(v for _, v in pc.most_common(50)), len(prods))
out["experienceTop10Share"] = pct(sum(v for _, v in ec.most_common(10)), len(exps))
reading = [r for r in rows if "Reading" in r["interests"]]
out["kindleReaders"] = {"personas": len(reading), "share": pct(sum(any("kindle paperwhite" == norm(g["name"]) or norm(g["name"]).startswith("kindle") for g in r["gifts"][:3]) for r in reading), len(reading))}

# most-recommended product / experience per interest (share of personas with that interest who got it in top 3)
per_int = {}
for it in sorted({i for r in rows for i in r["interests"]}):
    grp = [r for r in rows if it in r["interests"]]
    cnt = C.Counter()
    for r in grp:
        for k in {norm(g["name"]) for g in r["gifts"][:3] if g["type"] == "product"}: cnt[k] += 1
    k, c = cnt.most_common(1)[0]
    per_int[it] = {"personas": len(grp), "name": display.get(k, k), "share": pct(c, len(grp))}
out["topProductByInterest"] = per_int

# budget
lim = {"under-25": (0, 25), "25-50": (25, 50), "50-100": (50, 100), "100-250": (100, 250), "250+": (250, 1e9)}
label = {"under-25": "Under $25", "25-50": "$25 to $50", "50-100": "$50 to $100", "100-250": "$100 to $250", "250+": "$250 or more"}
def rng(p):
    n = [float(v.replace(",", "")) for v in re.findall(r"\d[\d,]*\.?\d*", p)]
    return (min(n), max(n)) if n else None
bud = []
for b, (a, z) in lim.items():
    xs = [x for x in recs if x["budget"] == b and rng(x["price"])]
    inb = sum(rng(x["price"])[1] >= a * 0.8 and rng(x["price"])[0] <= z * 1.1 for x in xs)
    mids = sorted((rng(x["price"])[0] + rng(x["price"])[1]) / 2 for x in xs)
    bud.append({"budget": label[b], "picks": len(xs), "inBand": pct(inb, len(xs)), "median": mids[len(mids) // 2]})
out["budget"] = bud
x250 = [x for x in recs if x["budget"] == "250+" and rng(x["price"])]
out["budget250ReachShare"] = pct(sum(rng(x["price"])[1] >= 250 for x in x250), len(x250))

# personalization
pers = lambda x: bool(re.search(r"personaliz|custom|engrav|monogram", x["name"], re.I))
def pshare(key, vals):
    return [{"label": v, "share": pct(sum(pers(x) for x in prods if x[key] == v), sum(1 for x in prods if x[key] == v)), "picks": sum(1 for x in prods if x[key] == v)} for v in vals]
out["personalizedByRelationship"] = pshare("relationship", ["Partner", "Parent", "Child", "Friend", "Sibling", "Colleague"])
out["personalizedByOccasion"] = pshare("occasion", ["Anniversary", "Baby Shower", "Graduation", "Birthday", "Holiday", "Just Because"])
out["etsyByOccasion"] = [{"label": o, "share": pct(sum(x["store"] == "etsy" for x in recs if x["occasion"] == o), sum(1 for x in recs if x["occasion"] == o))} for o in ["Anniversary", "Baby Shower", "Graduation", "Birthday", "Holiday", "Just Because"]]

alc = re.compile(r"wine|whiskey|whisky|bourbon|beer|brewery|cocktail|spirits|liquor|vodka|tequila|distill")
minors = [x for x in recs if x["ageRange"] in ("Under 10", "10–17")]
out["minors"] = {"picks": len(minors), "alcoholRelated": sum(bool(alc.search((x["name"] + " " + x["searchQuery"]).lower())) for x in minors)}
wt = [x for x in recs if "wine tasting" in x["name"].lower()]
out["wineTastingUnder18"] = sum(x["ageRange"] in ("Under 10", "10–17") for x in wt)

# name verification (census of brand/model-style names + 200 sampled generic-looking names)
spec = [r for r in ver.values() if r["stratum"] == "specific"]; gen = [r for r in ver.values() if r["stratum"] == "generic"]
bad = lambda r: r["verdict"] in ("near_miss", "not_found")
sp_picks = sum(r["n"] for r in spec); sp_bad = sum(r["n"] for r in spec if bad(r)); sp_disc = sum(r["n"] for r in spec if r["verdict"] == "discontinued")
gen_rate = sum(r["n"] for r in gen if bad(r)) / sum(r["n"] for r in gen)
gen_picks_all = len(prods) - sp_picks
est = (sp_bad + gen_rate * gen_picks_all) / (sp_picks + gen_picks_all)
nf = sum(r["verdict"] == "not_found" for r in ver.values())
out["names"] = {"checked": len(ver), "specificChecked": len(spec), "genericChecked": len(gen), "genericPool": len(pc) - len(spec),
                "estimatedMismatchShare": round(100 * est, 1), "nothingCloseNames": nf, "nothingCloseShare": pct(nf, len(ver)),
                "specificMismatchShareByPick": pct(sp_bad, sp_picks), "specificDiscontinuedShareByPick": pct(sp_disc, sp_picks),
                "specificMismatchShareDistinct": pct(sum(bad(r) for r in spec), len(spec))}
out["generatedOn"] = "2026-11-11"
json.dump(out, open("lib/research/gift-study-data.json", "w"), indent=1, ensure_ascii=False)

with open("public/research/gift-recommendations-3400-personas.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["persona_id", "relationship", "age_range", "occasion", "budget", "gift_preference", "interests", "rank", "gift_name", "price", "type", "store", "name_check"])
    for x in recs:
        v = ver.get(norm(x["name"])); chk = v["verdict"] if v and x["type"] == "product" else ("not_applicable" if x["type"] == "experience" else "unchecked")
        w.writerow([x["id"], x["relationship"], x["ageRange"], x["occasion"], x["budget"], x["giftPreference"], "; ".join(x["interests"]), x["rank"], x["name"], x["price"], x["type"], x["store"], chk])
print(json.dumps(out, indent=1, ensure_ascii=False)[:6000])
