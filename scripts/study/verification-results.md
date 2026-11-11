# Full product-name verification (2026-11-11)

Script: `scripts/study/verify.mjs` (Claude Haiku 5.5 + web search, 2 searches max per name, about $15 total). Calibration against the 38 hand-checked names from `hallucination-check.md`: caught 6 of 6 known bad names; 1 false alarm among 31 good names.

Population: the 2,576 distinct product names in the top-3 picks (5,809 product picks). All 644 brand/model-style names were checked (a census); 200 of the 1,932 generic-looking names were checked (random sample, seed 11).

| Group | Checked | Exact | Generic category | Discontinued | Wrong name (near miss) | Not found |
|---|---|---|---|---|---|---|
| Brand/model names | 644 of 644 | 450 | 27 | 36 | 128 | 3 |
| Generic-looking names | 200 of 1,932 | 58 | 110 | 0 | 28 | 4 |

- Wrong-name rate (near miss + not found): 20.3% of distinct brand/model names (+/-3 pts), 16.0% of generic-looking names (+/-5 pts).
- Weighted by how often each name was recommended: 6.7% of brand/model picks and 13.1% of generic-looking picks. Estimated across all 5,809 product picks: **about 10.8%** have a name that does not match a product as written. Only 7 of 844 checked names (0.8%) had nothing close at all.
- Discontinued: 6.7% of brand/model picks (Kindle Oasis alone is 40 picks; also iPad 10th gen, Apple Watch Series 9, Garmin Forerunner 55 and 265, Sony WH-1000XM4).
- "Near miss" is strict: the brand and product line are usually real, the exact name is not. Typical cases are an invented bundle ("Nintendo Switch Baby Bib and Burp Cloth Set"), "with X" add-ons ("Anker Power Bank with Travel Organizer Set"), a model number that does not exist ("Anker 537 Portable Power Station"), or a hedge instead of a name ("Lululemon-Style ... (by Amazon brands)").
- Brands with the highest wrong-name share among brand/model names: Melissa & Doug 21 of 43, Nintendo 16 of 32 (mostly invented accessory bundles), Moleskine 11 of 22, Anker 6 of 54, LEGO 5 of 27, Theragun 5 of 29. Names with no digit were wrong more often (24.7%) than names with a model number (13.0%).
- Experiences (43% of picks) were not checked.

Limits: a model judging web-search snippets, not a purchase test; strictness means some flagged names are close to right. Raw per-name verdicts are in `scripts/study/out/verify_full.jsonl` (local, gitignored).
