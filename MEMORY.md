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
14. Fix Resend DNS + build email capture ("Send to my inbox" on results screen, `/api/send-results`, Neon `subscribers` table)
15. Reapply to Amazon Associates
16. Unsplash API for Etsy gift images (Etsy Open API denied, final)
17. Experience recommendations (Viator + Groupon, `type: "product" | "experience"` on schema)
18. Smarter Claude search queries (tighter `searchQuery` values)
19. Amazon Product Advertising API (needs 10 qualifying sales)
20. Uncommon Goods affiliate (via CJ Affiliate, product feed)
21. User profiles + auth (Clerk, optional login, loved-one profiles, birthday reminders)
22. Metabase — connect to Neon for no-code dashboards
23. Etsy geo-targeted affiliate routing (US → Rakuten, UK/EU → Awin)
24. Interest-tag matched affiliate partners (REI for Outdoors, Best Buy for Tech, etc.)
25. ML recommendation model
