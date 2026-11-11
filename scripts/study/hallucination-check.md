# Hallucination spot-check (2026-11-11)

**Question:** when Claude names a specific product, does it exist?

**Method.** From the 2,576 distinct product names in the top-3 picks (5,809 product picks), drawn with a fixed seed (`random.seed(7)`, script run inline; sample saved locally at `scripts/study/out/halluc_sample.json`):
- Stratum "top": the 20 most-recommended products that name a brand or model (17 searched, 3 skipped: Lodge Cast Iron Skillet, Le Creuset Dutch Oven, Anker Portable Charger Power Bank).
- Stratum "random specific": 35 names drawn at random from the 644 brand/model-style names (products containing a known brand or a digit); the first 35 of 50 drawn. 30 searched; 5 skipped as obviously real or generic (8-foot trampoline, Moleskine Classic Notebook, iPad with Apple Pencil, Switch carrying case, PlayStation 5).
- Stratum "generic": 1,932 of the 2,576 names (75%) are product types ("travel journal notebook"), which exist by definition. Only 4 were searched, and those were picked because they looked suspicious, so they are NOT a random sample.

Each name was checked with a web search (standard mode). Amazon blocks scraping, so retailer and manufacturer pages in the results were the evidence. A pick counts as real when a product matching the name appears on a manufacturer or retailer page.

## Results

| Bucket | Top-20 (17 checked) | Random specific (30 checked) |
|---|---|---|
| Real, current, name matches | 17 | 19 |
| Real but discontinued or retired | 0 | 3 (JBL Flip Essential, Peloton Guide, LEGO VIDIYO Boombox) |
| Generic category, not a single product | 0 | 3 |
| Near-miss: real product exists under a slightly different name | 0 | 3 |
| Not found | 0 | 2 |

- **Not found (2 of 30, 6.7%):** "Hand2mind Outdoor Explorer Kit" (hand2mind sells other kits; this name did not appear) and "Moleskine Travel Art Collection Sketchbook Set" (Moleskine has Art Collection sketchbook sets and Cahier travel journals, not this name).
- **Near-miss (3 of 30, 10%):** "Melissa & Doug Band-in-a-Box Clap & Sing Rhythm Set" (real name: Clap! Clang! Tap!), "Melissa & Doug Explorer Backpack Set" (real: Let's Explore Hiking Play Set), "KitchenAid Kids Play Kitchen Mixer Toy" (real: KitchenAid Pretend Play Kids Mixer, seen on UK retailers).
- A wrong or unverifiable name in the random-specific sample: 5 of 30 (16.7%), 95% interval roughly 6% to 35% at this sample size. Not-found alone: 6.7%, interval roughly 1% to 22%.
- The most-recommended products (top 17 checked) were all real.
- Suspect generics: 4 checked, 1 near-miss ("Faber-Castell Mix and Match Art Studio"; Faber-Castell has a "Mix & Match" line but no product by that name), 3 real (Elgato Stream Deck, Nanit Pro, Carter's layette sets). Not a random sample, so not counted in any rate.

## Other things the check turned up
- **Stale availability.** The Peloton Guide (sales ended July 2025 per one report), JBL Flip Essential (superseded 2022), LEGO VIDIYO Boombox (retired 2021) and Kindle Oasis (newest sources found were from 2019, current availability not confirmed; 40 top-3 picks) are real but may not be buyable new.
- **Prices drift low for electronics.** Nintendo Switch OLED listed at $250 vs $349.99 MSRP; All-Clad D3 10-piece $300-$400 vs $700+ at one retailer; Audio-Technica AT-LP60X $149 vs $179-$199; Fitbit Charge $99 vs $159.95 (Charge 6); YETI Hopper Flip 18 $250-$300 vs $320; Little Passports one-year box $100-$120 vs $27.95 a month. Seen informally, not measured across the sample.
- Brand-plus-model names that are plausible but wrong usually land on a real brand with a real product line; the failure is the exact product name, not an invented brand.

## Limits
Web-search verification, not a purchase test. Search snippets can miss a real product (false "not found") and retailer listings can persist after a product is gone. Small samples; intervals above are approximate. Experiences (43% of picks) were not checked: they are generic activity types that the site sends to a Viator search rather than to a named listing.
