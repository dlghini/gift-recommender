# Project Memory

## App Identity
- **Brand name**: The Gift Whisperer
- **Domain**: thegiftwhisperer.gifts
- **GitHub**: https://github.com/dlghini/gift-recommender.git (main branch, auto-deploys to Vercel)
- No mention of "AI" anywhere on the site — deliberate choice

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (CSS-first config via `@import 'tailwindcss'` in `app/globals.css`)
- **UI Components**: shadcn/ui v4 (style: `base-nova`, Tailwind v4 compatible)
- **Icons**: lucide-react (installed by shadcn)
- **AI**: Anthropic SDK (`claude-sonnet-4-6`) with prompt caching and structured JSON output
- **Database**: Neon Postgres (`@neondatabase/serverless`) for session logging
- **Rate limiting**: Upstash Redis, 25 req/hour/IP on `/api/recommend`
- **Analytics**: Vercel Analytics + PostHog (funnel/event tracking)
- **Email**: Resend (transactional email — DNS verification pending, not live yet)
- **Deployment**: Vercel (auto-deploy from main branch)
- **Domain registrar**: Namecheap

## Installed shadcn/ui Components

- `button` — `components/ui/button.tsx`
- `input` — `components/ui/input.tsx`
- `card` — `components/ui/card.tsx`
- `progress` — `components/ui/progress.tsx`

## Key Files

- `app/page.tsx` — marketing landing page only (hero, 3 static example gift cards with real Amazon affiliate links, how-it-works, CTAs into `/wizard`)
- `app/wizard/page.tsx` — full wizard + results UI (the original all-in-one flow, moved here)
- `app/api/recommend/route.ts` — POST handler calling Claude, logs sessions to Neon, rate limiting
- `app/api/setup/route.ts` — GET handler that creates the sessions table (run once)
- `components/posthog-provider.tsx` — PostHog client wrapper
- `lib/db.ts` — lazy Neon client via `getDb()`
- `app/layout.tsx` — root layout with Geist fonts
- `app/globals.css` — Tailwind v4 + shadcn CSS variables (oklch color system, dark mode via `.dark` class)
- `components.json` — shadcn/ui config (aliases: `@/components`, `@/lib`, `@/hooks`)
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `.env.local` — `ANTHROPIC_API_KEY`, Neon/Postgres credentials, Upstash credentials, `RESEND_API_KEY` (gitignored)

## Fonts

- **Heading**: Lora (serif) via `--font-lora` / `font-heading` Tailwind class
- **Body**: Geist Sans via `--font-geist-sans` / `font-sans`

## Design System

- **Accent**: Amber/gold (`bg-amber-500`, `text-amber-600`, `bg-amber-50`)
- **Background**: `bg-amber-50` (warm off-white)
- **Cards**: `bg-white border-0 shadow-sm`
- **Primary CTA**: `bg-amber-500 hover:bg-amber-600 text-white`
- **Save icon**: `Heart` from lucide-react; filled `fill-rose-500` when saved

## Infrastructure Notes

- `DATABASE_URL`, `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` must all be set in Vercel
- After deploying, visit `thegiftwhisperer.gifts/api/setup` once to create the sessions table in production
- `.env.local` is gitignored — secrets must be added manually in the Vercel dashboard
- Resend sending domain `hello@thegiftwhisperer.gifts` — DKIM verified, MX and SPF still failing to resolve via Namecheap Custom MX; blocks email capture feature
- A weekly scheduled cloud routine (`trig_01TkauHiFAyPU2EUhPnBTo1J`, Mondays 9am America/Chicago) POSTs a test request to production `/api/recommend` and reports PASS/FAIL, as an early-warning check for the Upstash rate-limiter gotcha above (see Phase 13b). Limitation: since the endpoint fails open, a PASS does NOT prove the Upstash database is still alive — only manually checking console.upstash.com can confirm that.

## Affiliate Setup

- **Amazon Associates** — tag `giftwhisper0e-20`. Account was suspended because Amazon's bot couldn't find the tag on the page (recommendations were client-side dynamic). Fixed by adding static example gift cards with real affiliate links to the landing page HTML. **Reinstated 2026-08-26** (case #21744947221) — active again in all previously-configured countries. Pre-suspension earnings weren't voided: $6.23 total commission from early June, with $5.51 already paid out (initiated Aug 18) despite the suspension.
- **Amazon OneLink** — flagged in the reinstatement email as a way to monetize international traffic via a single store ID with automatic geo-redirect to local Amazon marketplaces. Evaluated 2026-08-26, deliberately **deferred**: per-marketplace commission rates aren't uniform, geo-IP misdetection can send US buyers into a foreign checkout, it's another third-party script with its own failure mode, EU marketplaces add GDPR/compliance surface our privacy/disclosure pages don't cover, and international traffic volume is unconfirmed (PostHog shows ~33% non-US over 180 days but on only 46 total visitors with no bot filtering — not reliable). Revisit once the account has clean post-reinstatement history and PostHog goal tracking confirms real international volume.
- **Etsy via Rakuten** — publisher SID `4710093`, MID `54027`, link token `wa9JRgUhXO8`. Approved and live. Deeplink format: `https://click.linksynergy.com/deeplink?id=wa9JRgUhXO8&mid=54027&murl=ENCODED_ETSY_URL`
- **Etsy Open API** — denied, no reconsideration possible. Plan is to use Unsplash's free API for contextual images on Etsy cards instead.
- **Viator** — approved (~8% commission), partner ID not yet retrieved.
- **Groupon via CJ Affiliate** — applied, pending.
- Strategy: always link to search pages, never individual product/listing pages.

## Completed Features

### Phase 1: Foundation & Guardrails — COMPLETE
- Initialized shadcn/ui with Tailwind v4 support
- Installed button, input, card, progress components
- Established CLAUDE.md rules and MEMORY.md tracking

### Phase 2: Mock UI — COMPLETE
- 4-step intake wizard: relationship+age (1) → occasion (2) → interests+freetext (3) → budget (4)
- Loading screen → results dashboard
- Results: 3 gift cards with name, price, rationale, interest tags, wishlist heart toggle, Buy now button
- Progress bar: custom div (not shadcn Progress) for easier amber color control

### Phase 3: AI Backend — COMPLETE
- `app/api/recommend/route.ts` using `@anthropic-ai/sdk`, model `claude-sonnet-4-6`, structured JSON output
- Prompt caching on system prompt via `cache_control: { type: "ephemeral" }`
- Returns `[{ name, price, rationale, tags, store, searchQuery }]` (3 items)
- `TAG_EMOJI` map + `pickEmoji()` for dynamic gift card emoji based on returned tags
- Error banner on API failure, returns user to step 4 for retry

### Phase 4: Persistent Saved Gifts — COMPLETE
- Saved gifts persisted to `localStorage`, keyed by gift name
- Saved gifts section rendered below recommendations; survives "Try different gifts" regeneration

### Phase 5: Session Logging — COMPLETE
- Sessions logged to Neon Postgres on each recommendation (relationship, age, occasion, interests, freetext, budget, gifts JSON, attempt number)

### Phase 6: Compliance & Info Pages — COMPLETE
- `components/footer.tsx` — shared footer with links to About, Privacy, Disclosure, Contact
- `app/about/page.tsx`, `app/privacy/page.tsx`, `app/disclosure/page.tsx`, `app/contact/page.tsx`
- Inline affiliate disclosure note above gift cards on results page

### Phase 7: Etsy Affiliate (Rakuten) — COMPLETE
- Claude returns `store: "amazon" | "etsy"` per gift
- Etsy gifts route through Rakuten deeplink; Amazon gifts use Associates tag

### Phase 8: Shareable Results Links — COMPLETE
- Wizard form + results encoded into a shareable URL payload

### Phase 9: Rate Limiting — COMPLETE
- Upstash Redis, 25 req/hour/IP on `/api/recommend`, fails gracefully when env vars unset locally

### Phase 10: PostHog Analytics — COMPLETE
- `components/posthog-provider.tsx` wraps the app
- Events: `wizard_step_completed`, `wizard_completed`, `recommendations_shown`, `recommendations_error`, `buy_clicked`, `gift_saved`, `gift_unsaved`, `results_shared`, `regenerate_clicked`, `cta_clicked`, `example_buy_clicked`

### Phase 11: Landing Page / Wizard Split — COMPLETE
- Split the single all-in-one flow into a marketing `app/page.tsx` (hero, 3 static example gift cards with real Amazon affiliate links, how-it-works) and a standalone `app/wizard/page.tsx` holding the full wizard + results experience
- Landing page hero headline: "Never give a bad gift again."
- How-it-works copy is store-agnostic (no explicit Amazon/Etsy mention)
- Amazon Associates re-suspension fix: static affiliate links now visible in landing page HTML for the bot to find

### Phase 14: Gift Card Images (Viator real photos + Unsplash fallback) — DONE, live in dev
- Discovered Viator's `/search/freetext` response (already being called for every `store: "viator"` gift) includes an `images` array per result with multiple resolution `variants` — this data was being fetched all along but discarded. Added `pickViatorImageUrl()` in [route.ts](app/api/recommend/route.ts) to pick the variant closest to 200px wide.
- Added `fetchUnsplashImage(query)` as a generic fallback for any gift without a real product photo: Amazon and Etsy gifts always use it (neither has a real per-product image source yet); Viator gifts use it only if Viator's own image lookup comes back empty. Gracefully no-ops (returns `undefined`) if `UNSPLASH_ACCESS_KEY` isn't set, same pattern as the other optional integrations. Uses `cache: "no-store"` on the fetch — defensive against this Next.js version's fetch-caching defaults for what's inherently a non-cacheable, per-query search call.
- **Bug found and fixed during testing**: the original logic did `const listing = await fetchViatorListing(query); if (!listing) return gift;` — meaning if the Viator API call failed *entirely* (not just missing an image, but a hard failure like an invalid key or network error), it bailed out before ever attempting the Unsplash fallback. Since our Viator sandbox key has been invalid since Phase 12, this meant **every Viator gift silently got zero image** until fixed. Restructured so `fetchUnsplashImage` is attempted whenever there's no Viator image, independent of whether the Viator listing itself succeeded or failed.
- Frontend: added `imageUrl?: string` to `GiftResult`, and a new `GiftThumb` component in [wizard/page.tsx](app/wizard/page.tsx) that renders the real photo when present (with `onError` fallback to the emoji if the image URL 404s/fails to load) and falls back to the existing `pickEmoji()` treatment otherwise. Used in both the main results cards and the saved-gifts list.
- **`UNSPLASH_ACCESS_KEY` obtained and live in `.env.local`** (2026-08-26) — user created a free Unsplash account, confirmed it by email, and Claude registered a Developer app ("The Gift Whisperer", Demo tier: 50 req/hour) after the user explicitly approved accepting Unsplash's API Terms of Use. **Still needs to be added to Vercel Production** before this works in the deployed app.
- Verified end-to-end with the real key: direct `/api/recommend` calls and the full wizard UI both show real Unsplash photos rendering on Etsy and Viator cards; a genuinely-zero-Unsplash-match query (a specific brand name like "HexClad") correctly falls back to the emoji with no error — confirmed this is Unsplash returning a real `0 results`, not a bug. Build passes with no type errors.
- **Not yet done, worth doing before relying on this long-term**: Unsplash's guidelines for anything beyond Demo tier require (a) hotlinking the original image URL (already done — we use their CDN URL directly, never download/re-host) and (b) triggering a GET to the photo's `download_location` endpoint whenever a photo is actually shown/used, which we do not currently do. Not required for Demo tier's 50 req/hour, but needed if this ever applies for Unsplash's Production tier (1,000 req/hour).
- **Follow-up 2026-08-26: tags-based retry for branded/specific queries.** A specific branded search term (e.g. "HexClad hybrid frying pan") often has zero matches on stock photography even though the general category clearly does. Added a retry in `fetchUnsplashImage()`: if the primary query (the gift's `searchQuery`/name) returns nothing, retry once with `gift.tags.join(" ")` (e.g. "cooking kitchen home chef upgrade") before giving up and falling back to the emoji. Chose tags over adding a new Claude-generated field for this — no schema change, no extra Claude output cost, and tags are already generic/photogenic by nature. Verified directly against Unsplash: the exact "HexClad hybrid frying pan" query (0 results) now succeeds via its tags retry (65 results).
- **Follow-up 2026-08-26: static landing-page example images.** The 5 hardcoded `EXAMPLE_GIFTS` cards on `app/page.tsx` (marketing landing page) were still emoji-only — these are static content that never changes, so rather than wire up a live API call for them, hand-curated a real Unsplash photo URL for each (searched via the Unsplash API, picked a good visual match, verified each URL resolves with a 200) and hardcoded it directly into the `EXAMPLE_GIFTS` array as `imageUrl`. Added a small local `ExampleThumb` component (same pattern as `GiftThumb` in the wizard, but not shared/extracted — kept as a page-local duplicate consistent with how `TAG_EMOJI`/`pickEmoji` are already duplicated between `page.tsx` and `wizard/page.tsx`) with the same `onError`-falls-back-to-emoji behavior. No new env var or API dependency added to the marketing page — it stays fully static (still prerenders as `○ Static` in the build output). Verified all 5 render as real `<img>` elements via the accessibility tree, no console errors.

### Phase 15: Fix Bad Virtual-Experience Viator Suggestions — DONE
- **Bug**: the system prompt in [route.ts](app/api/recommend/route.ts) told Claude that "digital/online experiences (virtual classes, online tastings)" were equally valid `store: "viator"` picks. Found in production via a real example: recommended "Online Fashion Design Masterclass for Kids" as a Viator experience for a young child — Viator has no real inventory for purely virtual/online classes, so `fetchViatorListing()` found no product match, returned `null`, and `buildBuyUrl()` fell back to a bare `viator.com/searchResults/all?text=...` link. That's Viator's own sitewide fuzzy-text search with zero relevance/geo filtering, so it surfaced unrelated in-person activities (fashion shows, perfume classes, boat cruises) from random countries (Paris, Amsterdam, Chicago, Barcelona) that only loosely keyword-matched on "fashion."
- **Fix**: rewrote the relevant system prompt lines to restrict `store: "viator"` to real, in-person bookable experiences only, and explicitly tell Claude not to suggest purely virtual/online-only experiences for it. Also reframed the "recipient's location is unknown" guidance — instead of treating "just suggest something online" as the way to sidestep not knowing their city, now nudges Claude toward common, widely-available experience *types* (sunset sailing cruise, cooking class, wine tasting) that exist in most places, since Viator's own site geolocates the visitor once they click through.
- Verified via direct API test with the same failing scenario (child, Fashion/Art interests, experience preference): all 3 recommendations came back as in-person workshops/classes ("Kids Fashion Design Workshop," "Children's Art Class," "Kids Jewelry Making Workshop") — no more "online"/"virtual" framing. Build passes.
- **Follow-up**: see roadmap item #27 and Phase 16 below — pursued the real affiliate programs (MasterClass, Skillshare, Outschool) to bring virtual-experience recommendations back properly; MasterClass and Outschool applications both submitted, Skillshare is closed to new applicants.

### Phase 16: Virtual-Experience Affiliate Program Setup (Awin/Impact) — APPLICATIONS SUBMITTED
- **Awin account** (already existed for Outschool prospecting) fully set up: business profile completed ("a publisher" / "an individual" / "website(s)" / "editorial content"), applied to join **Outschool (US)** with a short intro message — status **Pending**.
- **Impact.com account**: signed in (existing account, Google SSO), completed profile setup (business category + "Personalize your profile" description), added `thegiftwhisperer.gifts` as a website channel, and verified ownership via a site-verification meta tag (see below) — required to get past Impact's "view only" marketplace restriction.
- **Added `impact-site-verification` meta tag** to [app/layout.tsx](app/layout.tsx) via the `metadata.other` field (Next's documented mechanism for arbitrary meta tags — renders as `<meta name="..." content="...">`, which worked fine for Impact's verifier even though their own example snippet showed a non-standard `value=` attribute instead of `content=`). Deployed to production and verification succeeded.
- **Even after verifying**, Impact's own dashboard then surfaced: *"impact.com marketplace application — Declined. You currently do not qualify for access to impact.com's Marketplace... This does not affect any of your existing or pending brand program relationships. Your impact.com account can continue to be used when partnering directly with brands via their unique sign-up links."* So our Impact account works for direct brand sign-up links, but can't browse/search their general marketplace.
- **MasterClass** — ✅ found and applied. Third-party affiliate-directory sites had contradicted each other (Impact / ShareASale / FlexOffers all separately claimed) and masterclass.com itself has no discoverable public affiliate page (`/affiliates` 404s) — but Impact.com *does* host it, just not discoverable via the (declined) marketplace search. Found the direct brand page at `app.impact.com/advertiser-advertiser-info/MasterClass.brand` (two programs listed: "MasterClass" and "MasterClass Creator", both 25% on subscription purchases) and applied to the plain "MasterClass" program via its dedicated sign-up flow (`campaign-promo-signup/MasterClass.brand`) — this is exactly the "brand's own unique sign-up link" path Impact's decline notice said would still work. Confirmed via in-app notification: *"Your application to join MasterClass has been received."* Status: **Pending**.
- **Skillshare**: parked, blocked — confirmed directly on skillshare.com/en/affiliates: *"Our affiliate Program is currently invite only. Check back soon for future openings."* Not a network issue, the program itself isn't open.

### Phase 13b: Production Outage — Upstash Rate Limiter Deleted — RESOLVED
- **What happened**: the free-tier Upstash Redis database backing rate limiting (`noted-labrador...upstash.io`) was silently auto-deleted by Upstash after 14 days of inactivity. This broke `/api/recommend` (the core feature) and the new `/api/send-results` in production with a generic `{"error":"fetch failed"}` — both were unusable for real users until this was found and fixed.
- **Root cause in code**: `ratelimit.limit(ip)` was only guarded by `if (ratelimit)` (checking env vars are *set*), not wrapped in try/catch — so an unreachable host threw instead of failing gracefully like the "env vars unset" case already did.
- **Fix**: created a new Upstash Redis database (`gift-whisperer-ratelimit`, free tier, us-east-1, hostname `closing-boar-165545.upstash.io`) and updated `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` in Vercel Production. Also wrapped the rate-limit check in both `app/api/recommend/route.ts` and `app/api/send-results/route.ts` in try/catch so it now **fails open** (logs and continues) if the rate limiter is ever unreachable again — this is a real risk to watch since the free tier will delete this new database too after another 14 days of low traffic.
- Old dead database (`gift-whisperer` / `noted-labrador`) still shows as "Deleted" in Upstash console with a restore option available for a while, but a fresh one was simpler than restoring — not restored, left as-is (harmless, no cost).
- **Worth reconsidering later**: if traffic stays low, this exact outage will recur every ~14 days on the free tier. The fail-open fix means it won't take down the app next time, but rate limiting itself will silently stop working until someone notices and recreates the database again. Upgrading to Upstash's Pay-as-You-Go plan (~$0.2/100K commands) would eliminate the auto-deletion risk entirely for very little cost, but wasn't done — would need explicit user approval since it requires adding a payment method.

### Phase 13: Email Capture ("Send to my inbox") — COMPLETE
- Resend domain verification finished (DKIM/SPF/MX on `send.thegiftwhisperer.gifts` all resolved) — confirmed **Verified** in Resend dashboard.
- `resend` npm package installed (memory previously said this was already done — it wasn't; corrected).
- Created a Resend API key scoped to sending-only access, restricted to `thegiftwhisperer.gifts` domain — added to `.env.local` and needs to be added to Vercel Production env vars as `RESEND_API_KEY` before this works live.
- `app/api/setup/route.ts` now also creates a `subscribers` table (`id`, `created_at`, `email`, `gifts` JSONB) — same lazy-migration pattern as `sessions`. Re-run `/api/setup` in production once deployed.
- New `app/api/send-results/route.ts`: validates email format, rate-limits by IP (10/hour via Upstash, separate prefix from `/api/recommend`), logs the subscriber (best-effort, non-blocking), and sends a branded HTML email via Resend from `hello@thegiftwhisperer.gifts` with the 3 gift cards + real affiliate buy/book links (escapes all interpolated text to prevent HTML injection into the email body).
- `app/wizard/page.tsx`: new "Send these to your inbox" card on the results screen (email input + Send button, success/error states), tracked via PostHog (`results_emailed` / `results_email_error`).
- Tested end-to-end via direct API calls: subscriber row confirmed in Neon, email confirmed **Delivered** in Resend's dashboard, rendered preview looks correct (amber/indigo styling matching product vs experience cards).
- Resend flagged two non-blocking insights on the test send: "Ensure link URLs match sending domain" (expected — these are affiliate emails, external links are the point) and "Use a subdomain" (optional deliverability best practice, e.g. `hello@send.thegiftwhisperer.gifts` instead of the root domain — not applied, current setup delivers fine as-is).
- `RESEND_API_KEY` added to Vercel Production, deployed, `/api/setup` re-run against production — confirmed working end-to-end live (see Phase 13b for the rate-limiter outage that briefly blocked this, now resolved).

### Phase 12b: Static Etsy/Viator Example Links — COMPLETE
- Same crawlability fix that resolved the Amazon Associates suspension, extended to the other two affiliate programs: added 1 Etsy example card and 1 Viator experience example card to the landing page (`app/page.tsx`), alongside the existing 3 Amazon cards (kept untouched since the Amazon reapplication is still pending — didn't want to reduce Amazon's link count mid-appeal).
- Rationale: neither Etsy nor Viator had any crawlable affiliate link anywhere in static HTML before this — same failure mode that got Amazon's bot to flag the site, just not yet triggered for these two.
- Verified via direct `curl` of the built page that real, tagged links for all three stores appear in the raw HTML (not just after JS hydration).

### Phase 12: Experience Recommendations (Viator) — IN PROGRESS
- `app/api/recommend/route.ts`: Claude response schema now includes `type: "product" | "experience"`, and `store` extended to `"amazon" | "etsy" | "viator"`. A `giftPreference` field (`"experiences" | "gifts" | "both"`) is sent from the wizard and used to instruct Claude on the experience/product mix per request (all-experience, all-product, or capped at 1-of-3 experience for "both").
- `fetchViatorListing()` calls Viator's `/search/freetext` API (sandbox: `api.sandbox.viator.com/partner`) server-side for any `store: "viator"` gift, using `VIATOR_API_KEY` (header `exp-api-key`). Returns real `fromPrice` and a pre-attributed `productUrl` when available; falls back gracefully to Claude's estimated price and `"#"` if the API call fails (e.g. key not yet active, no results).
- `app/wizard/page.tsx`: new "Do they prefer experiences or physical gifts?" question added to step 3 (interests), not a new wizard step. `GiftResult` type extended with `type` field. `buildBuyUrl()` uses the real Viator `affiliateUrl` when present, otherwise falls back to a basic `viator.com` search link with `pid=P00304135`.
- Card UI: experience-type gifts get an "Experience" badge, indigo accent border/price/button, and "Book now" instead of "Buy now".
- Status as of 2026-08-25: code built, tested end-to-end in dev — wizard question, Claude type/mix logic, and card UI all confirmed working. Viator API enrichment confirmed to gracefully fall back (verified via direct curl: sandbox key returns 401 "Invalid API Key" since it was just created — Viator warns this can take up to 24h to activate). Re-test the live pricing path once the key activates. Groupon integration still blocked on CJ Affiliate approval (see [[project_overview]]).

## Prioritized Roadmap

1. ~~Session logging~~ ✅ DONE
2. ~~Privacy policy page~~ ✅ DONE
3. ~~Affiliate disclosure~~ ✅ DONE
4. ~~About page~~ ✅ DONE
5. ~~Contact page~~ ✅ DONE
6. ~~Amazon affiliate integration~~ ✅ DONE — suspended, reapplication pending on confirmed static landing page links
7. ~~Instagram Business account~~ ✅ DONE
8. Create account on Adstellar.ai
9. ~~Etsy affiliate integration (Rakuten)~~ ✅ DONE
10. ~~Shareable results links~~ ✅ DONE
11. ~~Rate limiting~~ ✅ DONE — 25 req/hour/IP via Upstash Redis
12. ~~PostHog analytics~~ ✅ DONE
13. ~~Landing page split from wizard~~ ✅ DONE
14. ~~Fix Resend DNS + build email capture~~ ✅ DONE (see Phase 13) — code complete, tested end-to-end locally; still needs `RESEND_API_KEY` in Vercel + deploy + prod `/api/setup` run
15. ~~Reapply to Amazon Associates~~ ✅ DONE — reinstated 2026-08-26, see Affiliate Setup above
16. ~~Real/contextual gift images~~ ✅ DONE 2026-08-26 (see Phase 14) — now covers all 3 stores, not just Etsy as originally scoped
17. Experience recommendations (Viator + Groupon, `type: "product" | "experience"` on schema) — IN PROGRESS, Viator side built (see Phase 12), Groupon blocked on affiliate approval
18. Smarter Claude search queries (tighter `searchQuery` values)
19. ~~Amazon Product Advertising API~~ ✅ APPLIED 2026-08-26 — access now provisioned via Amazon's newer "Creators API" program, not the old webservices.amazon.com flow. Created application `thegiftwhisperer` (App ID `giftwhisper0e-20.thegiftwhisperer`), generated credentials, saved to `.env.local` as `AMAZON_PAAPI_CREDENTIAL_ID` / `AMAZON_PAAPI_SECRET` — **still needs to be added to Vercel Production** before any deployed code can use it. Real eligibility gate is 10 qualifying sales in the trailing 30 days (not 10 sales ever, as previously noted here — that was stale); review takes up to 48h and may show `AssociateNotEligible` until met. Unconfirmed whether sales credited during the recent Amazon suspension count toward that window.
20. Uncommon Goods affiliate (via CJ Affiliate, product feed)
21. User profiles + auth (Clerk, optional login, loved-one profiles, birthday reminders)
22. Metabase — connect to Neon for no-code dashboards
23. Etsy geo-targeted affiliate routing (US → Rakuten, UK/EU → Awin)
24. Interest-tag matched affiliate partners (REI for Outdoors, Best Buy for Tech, etc.)
25. ML recommendation model
26. Amazon OneLink (international traffic monetization) — deliberately deferred, see Affiliate Setup above for reasoning
27. **Virtual-experience affiliate programs (MasterClass, Skillshare, Outschool)** — researched 2026-08-26 after a bug where Claude suggested a purely virtual "online kids fashion design class" for `store: "viator"`; Viator has no real inventory for online-only experiences, so it silently fell back to a generic sitewide search with irrelevant, multi-country results. Immediate fix shipped (see Phase 15 below) restricts Viator to in-person-only experiences. This item is the follow-up:
    - **Outschool** — ✅ application submitted via Awin (2026-08-26), status **Pending**. Awin account fully set up: business profile completed, website channel added and verified (via Awin's own "Skip verification for now" option — no site meta tag needed for Awin, unlike Impact below).
    - **MasterClass** — ✅ application submitted via Impact (2026-08-26), status **Pending**, 25% commission on subscription purchases. Third-party "affiliate directory" sites had disagreed on which network hosts it, but it turned out to genuinely be on Impact — just not discoverable via Impact's (declined) marketplace search. Found via its direct brand page at `app.impact.com/advertiser-advertiser-info/MasterClass.brand`, applied through its dedicated sign-up flow.
    - **Skillshare** — **blocked, parked.** Confirmed directly on skillshare.com/en/affiliates: *"Our affiliate Program is currently invite only. Check back soon for future openings."* Not a network problem — the program itself isn't accepting new applicants right now regardless of network.
    - **Impact.com account** — created and fully set up (business category, website channel `thegiftwhisperer.gifts` verified via meta tag — see Phase 16), but the account's **general Marketplace/search access was declined** ("You currently do not qualify for access to impact.com's Marketplace... does not affect existing/pending brand program relationships... can still partner directly via brands' unique sign-up links"). MasterClass's application above is exactly that path — found its direct brand URL outside the blocked marketplace search and applied there successfully.
    - None of these three have a public product-search API even where applicable, so any future integration would be a generic tagged deep-link into their own site search (same pattern as Amazon/Etsy today), not Viator-style live pricing.

## Traffic Snapshot (PostHog, pulled 2026-08-26, last 180 days)

46 unique visitors, 61 pageviews, 49 sessions, 71% bounce rate, 3m22s avg session. ~All traffic is "Direct" source (45/46) — no real acquisition channel yet. Traffic peaked launch week (Jun 7–13, 12 visitors), mostly quiet since. Geography: US 31, Germany 4, France 3, Poland 3, India 2, UK/Mexico/Netherlands 1 each (treat with caution — small sample, no bot filtering applied). No conversion goals configured in PostHog yet.

**Gotcha for future sessions:** the landing/wizard route split (commit `cf55e60`, 2026-08-25 5:08pm) means `/wizard` didn't exist before that — `app/page.tsx` *was* the entire wizard flow on one route for the ~3 months prior. Don't compare historical `/` traffic against `/wizard` traffic as a conversion funnel; they measure different eras of the app. (A first pass at this analysis made exactly this mistake.)
