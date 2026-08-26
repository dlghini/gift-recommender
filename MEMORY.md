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

## Affiliate Setup

- **Amazon Associates** — tag `giftwhisper0e-20`. Account was suspended because Amazon's bot couldn't find the tag on the page (recommendations were client-side dynamic). Fixed by adding static example gift cards with real affiliate links to the landing page HTML; reapplication pending confirmation.
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

### Phase 13: Email Capture ("Send to my inbox") — COMPLETE
- Resend domain verification finished (DKIM/SPF/MX on `send.thegiftwhisperer.gifts` all resolved) — confirmed **Verified** in Resend dashboard.
- `resend` npm package installed (memory previously said this was already done — it wasn't; corrected).
- Created a Resend API key scoped to sending-only access, restricted to `thegiftwhisperer.gifts` domain — added to `.env.local` and needs to be added to Vercel Production env vars as `RESEND_API_KEY` before this works live.
- `app/api/setup/route.ts` now also creates a `subscribers` table (`id`, `created_at`, `email`, `gifts` JSONB) — same lazy-migration pattern as `sessions`. Re-run `/api/setup` in production once deployed.
- New `app/api/send-results/route.ts`: validates email format, rate-limits by IP (10/hour via Upstash, separate prefix from `/api/recommend`), logs the subscriber (best-effort, non-blocking), and sends a branded HTML email via Resend from `hello@thegiftwhisperer.gifts` with the 3 gift cards + real affiliate buy/book links (escapes all interpolated text to prevent HTML injection into the email body).
- `app/wizard/page.tsx`: new "Send these to your inbox" card on the results screen (email input + Send button, success/error states), tracked via PostHog (`results_emailed` / `results_email_error`).
- Tested end-to-end via direct API calls: subscriber row confirmed in Neon, email confirmed **Delivered** in Resend's dashboard, rendered preview looks correct (amber/indigo styling matching product vs experience cards).
- Resend flagged two non-blocking insights on the test send: "Ensure link URLs match sending domain" (expected — these are affiliate emails, external links are the point) and "Use a subdomain" (optional deliverability best practice, e.g. `hello@send.thegiftwhisperer.gifts` instead of the root domain — not applied, current setup delivers fine as-is).
- Not yet done: add `RESEND_API_KEY` to Vercel, push to `origin/main`, redeploy, re-run `/api/setup` against production DB.

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
15. Reapply to Amazon Associates
16. Unsplash API for Etsy gift images (Etsy Open API denied, final)
17. Experience recommendations (Viator + Groupon, `type: "product" | "experience"` on schema) — IN PROGRESS, Viator side built (see Phase 12), Groupon blocked on affiliate approval
18. Smarter Claude search queries (tighter `searchQuery` values)
19. Amazon Product Advertising API (needs 10 qualifying sales)
20. Uncommon Goods affiliate (via CJ Affiliate, product feed)
21. User profiles + auth (Clerk, optional login, loved-one profiles, birthday reminders)
22. Metabase — connect to Neon for no-code dashboards
23. Etsy geo-targeted affiliate routing (US → Rakuten, UK/EU → Awin)
24. Interest-tag matched affiliate partners (REI for Outdoors, Best Buy for Tech, etc.)
25. ML recommendation model
