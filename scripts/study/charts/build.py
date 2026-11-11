"""Builds the three shareable chart images and the one-page press sheet from lib/research/gift-study-data.json.
Usage: python3 scripts/study/charts/build.py   (needs Google Chrome; writes to public/research/)"""
import json, os, subprocess, html, tempfile
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", "..", ".."))
OUT = os.path.join(REPO, "public", "research")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
D = json.load(open(os.path.join(REPO, "lib", "research", "gift-study-data.json")))
BG, INK, ACC, MUTE, TRACK, BAR = "#e9eee8", "#282824", "#8b4327", "#5f665e", "#d5ddd3", "#c08a6a"
SRC = "thegiftwhisperer.gifts/research/ai-gift-recommendations"
esc = html.escape

def bars(items, maxv, big=False):
    rows = []
    for label, val, shown in items:
        pct = 0 if val == 0 else max(2, min(100, 100 * val / maxv))
        rows.append(f'<div class="row{" big" if big else ""}"><div class="lab"><span>{esc(label)}</span><b>{esc(shown)}</b></div><div class="tr"><div class="br" style="width:{pct}%"></div></div></div>')
    return "".join(rows)

def frame(title, sub, body, note):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0}}
body{{width:1200px;height:675px;background:{BG};font-family:Georgia,'Times New Roman',serif;color:{INK};position:relative;overflow:hidden}}
.wrap{{position:absolute;left:56px;right:56px;top:40px}}
h1{{font-size:42px;line-height:1.15;margin:0 0 8px;font-weight:700}}
.sub{{font-size:22px;color:{MUTE};font-style:italic;margin:0 0 26px}}
.cols{{display:flex;gap:56px}}
.col{{flex:1}}
.ct{{font-size:18px;letter-spacing:3px;text-transform:uppercase;color:{ACC};font-weight:700;margin:0 0 12px}}
.row{{margin:0 0 15px}}
.row.big{{margin:0 0 34px}} .row.big .lab{{font-size:28px;margin-bottom:8px}} .row.big .tr,.row.big .br{{height:22px;border-radius:11px}}
.lab{{display:flex;justify-content:space-between;font-size:20px;margin-bottom:5px}}
.lab b{{font-weight:400;color:{MUTE}}}
.tr{{height:12px;background:{TRACK};border-radius:6px}}
.br{{height:12px;background:{BAR};border-radius:6px}}
.foot{{position:absolute;left:56px;right:56px;bottom:26px;display:flex;justify-content:space-between;align-items:flex-end;font-size:16px;color:{MUTE}}}
.foot .b{{font-weight:700;letter-spacing:4px;color:{INK};font-size:18px}}
.note{{max-width:760px;line-height:1.35}}
</style></head><body><div class="wrap"><h1>{title}</h1><p class="sub">{sub}</p>{body}</div>
<div class="foot"><div class="note">{note}<br>{SRC}</div><div class="b">THE GIFT WHISPERER</div></div></body></html>"""

tp, te = D["topProducts"], D["topExperiences"]
c1 = frame(
    "The same few gifts keep coming back",
    f"{D['recommendations']:,} gift picks for {D['personas']:,} made-up shoppers",
    '<div class="cols"><div class="col"><p class="ct">Most common products</p>' + bars([(p["name"], p["share"], f'{p["share"]}%') for p in tp[:6]], 6.6) + '</div>'
    '<div class="col"><p class="ct">Most common experiences</p>' + bars([(p["name"], p["share"], f'{p["share"]}%') for p in te[:6]], 6.6) + '</div></div>',
    f'Share of product picks (left) and experience picks (right), names counted as the AI wrote them. {D["kindleReaders"]["share"]:.0f}% of shoppers who like reading got a Kindle product in their three.')
pc = D["prefCompliance"]
c2 = frame(
    "Told what they like, it sticks to it",
    "Share of picks that were experiences, by what the shopper asked for",
    '<div style="width:1088px;margin-top:34px">' + bars([
        ("Shoppers who want things only", 0.0, "0%"),
        ("Shoppers who said they like both", D["bothExperienceShare"], f'{D["bothExperienceShare"]}%'),
        ("Shoppers who want experiences only", 100, "100%"),
    ], 100, big=True) + '</div>',
    f'Zero of {pc["gifts"]["picks"]:,} things-only picks were experiences; zero of {pc["experiences"]["picks"]:,} experiences-only picks were products.')
rel = D["personalizedByRelationship"]; occ = D["personalizedByOccasion"]
c3 = frame(
    "Partners and anniversaries get the personalized gifts",
    "Share of product picks that were personalized, custom, engraved or monogrammed",
    '<div class="cols"><div class="col"><p class="ct">By relationship</p>' + bars([(r["label"], r["share"], f'{r["share"]:.0f}%') for r in rel], 40) + '</div>'
    '<div class="col"><p class="ct">By occasion</p>' + bars([(o["label"], o["share"], f'{o["share"]:.0f}%') for o in occ], 40) + '</div></div>',
    "Both charts use the same scale. Made-up shoppers, one AI model on one day.")

def shot(htmltext, name, w=1200, h=675):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(htmltext); p = f.name
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={w},{h}", f"--screenshot={os.path.join(OUT, 'charts', name)}", "file://" + p], check=True, capture_output=True)
    os.unlink(p)

shot(c1, "ai-gifts-repeat.png"); shot(c2, "ai-gifts-experiences.png"); shot(c3, "ai-gifts-personalized.png")

n = D["names"]
sheet = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page{{size:Letter;margin:0.6in}}
body{{font-family:Georgia,'Times New Roman',serif;color:{INK};font-size:11.5pt;line-height:1.4;margin:0}}
h1{{font-size:21pt;line-height:1.15;margin:0 0 4pt}} h2{{font-size:12pt;letter-spacing:2px;text-transform:uppercase;color:{ACC};margin:14pt 0 4pt}}
.s{{color:{MUTE};font-style:italic;margin:0 0 8pt}} ul{{margin:0;padding-left:16pt}} li{{margin:0 0 3pt}} p{{margin:0 0 5pt}}
.f{{margin-top:12pt;border-top:1px solid #b0a07a;padding-top:6pt;font-size:10pt;color:{MUTE}}}
</style></head><body>
<h1>We asked an AI for {D['recommendations']:,} gift ideas</h1>
<p class="s">{D['personas']:,} made-up shoppers, three gift picks each. The Gift Whisperer, November 11, 2026.</p>
<p>The Gift Whisperer is a small gift recommendation site in Austin, Texas. To see what its AI recommender does across thousands of questions instead of one, founder Daniel Maghini made up {D['personas']:,} shoppers from the answers the recommender asks for (who the gift is for, age, occasion, interests, budget, things or experiences) and ran every one through it.</p>
<h2>Key numbers</h2><ul>
<li>{D['distinctProducts']:,} different products and {D['distinctExperiences']:,} different experiences across {D['recommendations']:,} picks.</li>
<li>The same gifts repeat: the Kindle Paperwhite was {tp[0]['share']}% of all product picks, and {D['kindleReaders']['share']:.0f}% of shoppers who like reading got a Kindle product. A wine tasting tour was {te[0]['share']}% of experience picks; the ten most common experiences made up {D['experienceTop10Share']:.0f}% of them.</li>
<li>{D['typeSplit']['experience']}% of picks were experiences. Shoppers who said they like both got experiences {D['bothExperienceShare']}% of the time. When told "things only" or "experiences only," the AI never broke the rule.</li>
<li>Personalized gifts were {D['personalizedByRelationship'][0]['share']:.0f}% of product picks for partners, {D['personalizedByRelationship'][5]['share']:.0f}% for colleagues and {D['personalizedByOccasion'][0]['share']:.0f}% for anniversaries.</li>
<li>Budgets held up to $100. At "$250 or more," about 1 in 5 picks ({100 - D['budget'][4]['inBand']:.1f}%) cost less than $250.</li>
<li>Nothing alcohol-related went to anyone under 18 apart from two mocktail classes.</li>
<li>About 1 in 9 product names ({n['estimatedMismatchShare']}% estimated) did not match a listing exactly as written; {n['nothingCloseShare']}% of the names checked had nothing close.</li></ul>
<h2>Method in brief</h2>
<p>{D['personas']:,} unique shoppers generated with a fixed random seed from the recommender's own options. One request each on November 11, 2026, using the same instructions and AI model as the live recommender. The top three picks per shopper were analyzed. Product names were checked by a second AI model with web search: all {n['specificChecked']} brand and model names plus a random {n['genericChecked']} of the other {n['genericPool']:,}. Full method on the page.</p>
<h2>Limits</h2>
<p>Made-up shoppers, not real ones: this describes the AI, not what people want or buy. One AI model on one day. No purchases were made. Name checks depend on web search and an AI judge, so treat them as estimates.</p>
<h2>Data</h2>
<p>A CSV of every pick is on the page. Free to quote, chart and cite with a link back; please don't republish the full file.</p>
<div class="f">Full page, method and data: https://{SRC}<br>Contact: https://www.thegiftwhisperer.gifts/contact &middot; Daniel Maghini, Founder, The Gift Whisperer</div>
</body></html>"""
with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
    f.write(sheet); sp = f.name
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={os.path.join(OUT, 'ai-gift-recommendations-press-sheet.pdf')}", "file://" + sp], check=True, capture_output=True)
os.unlink(sp)
print("built")
