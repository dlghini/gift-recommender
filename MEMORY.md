# Project Memory

## App Identity
- **Brand name**: The Gift Whisperer
- **Domain**: thegiftwhisperer.gifts
- **GitHub**: https://github.com/dlghini/gift-recommender.git (main branch, auto-deploys to Vercel)

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (CSS-first config via `@import 'tailwindcss'` in `app/globals.css`)
- **UI Components**: shadcn/ui v4 (style: `base-nova`, Tailwind v4 compatible)
- **Icons**: lucide-react (installed by shadcn)
- **AI**: Anthropic SDK (`claude-sonnet-4-6`) with prompt caching and structured JSON output
- **Database**: Neon Postgres (`@neondatabase/serverless`) for session logging
- **Deployment**: Vercel (auto-deploy from main branch)
- **Domain registrar**: Namecheap

## Installed shadcn/ui Components

- `button` — `components/ui/button.tsx`
- `input` — `components/ui/input.tsx`
- `card` — `components/ui/card.tsx`
- `progress` — `components/ui/progress.tsx`

## Key Files

- `app/page.tsx` — full client-side wizard + results UI
- `app/api/recommend/route.ts` — POST handler calling Claude, logs sessions to DB
- `app/api/setup/route.ts` — GET handler that creates the sessions table (run once)
- `lib/db.ts` — lazy Neon client via `getDb()`
- `app/layout.tsx` — root layout with Geist fonts
- `app/globals.css` — Tailwind v4 + shadcn CSS variables (oklch color system, dark mode via `.dark` class)
- `components.json` — shadcn/ui config (aliases: `@/components`, `@/lib`, `@/hooks`)
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `.env.local` — `ANTHROPIC_API_KEY` and all Neon/Postgres credentials (gitignored)

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

- `DATABASE_URL` env var must be set in Vercel's production environment (via Vercel Storage → Neon integration)
- After deploying, visit `thegiftwhisperer.gifts/api/setup` once to create the sessions table in production
- `.env.local` is gitignored — Anthropic API key must be added manually in Vercel dashboard

## Completed Features

### Phase 1: Foundation & Guardrails — COMPLETE
- Initialized shadcn/ui with Tailwind v4 support
- Installed button, input, card, progress components
- Established CLAUDE.md rules and MEMORY.md tracking

### Phase 2: Mock UI — COMPLETE
- **File**: `app/page.tsx` (client component, all state local)
- 4-step intake wizard: relationship+age (1) → occasion (2) → interests+freetext (3) → budget (4)
- Loading screen (2.2s setTimeout) → results dashboard
- Results: 3 hardcoded gift cards with name, price, rationale, interest tags, wishlist heart toggle, Buy now button
- Progress bar: custom div (not shadcn Progress) for easier amber color control
- Added Lora font to `app/layout.tsx`, `--font-heading` updated in `app/globals.css`

### Phase 3: AI Backend — COMPLETE
- **`app/api/recommend/route.ts`** — POST handler using `@anthropic-ai/sdk`
- Model: `claude-sonnet-4-6` with structured JSON output via `output_config.format` (raw JSON schema, no Zod)
- Prompt caching: system prompt cached with `cache_control: { type: "ephemeral" }` in system array
- Returns `[{ name, price, rationale, tags, affiliateUrl }]` (3 items)
- **`app/page.tsx`** — replaced hardcoded mock data with live `/api/recommend` fetch
- `TAG_EMOJI` map + `pickEmoji()` for dynamic gift card emoji based on AI-returned tags
- Error banner (AlertCircle) on API failure, returns user to step 4 for retry

### Phase 4: Persistent Saved Gifts — COMPLETE
- `savedGifts: GiftResult[]` state initialized from `localStorage("giftspark_saved")` on mount
- `savedNames: Set<string>` derived from savedGifts for O(1) heart-state lookup (keyed by gift name, not index)
- `toggleSaved(gift)` saves/removes full gift objects to localStorage; persists across page refreshes and sessions
- Saved gifts section rendered below recommendations on results page — compact card with emoji, name, price, remove heart, and Buy button
- Saves survive "Try different gifts" regeneration (no longer cleared on new fetch)

### Phase 5: Session Logging — COMPLETE
- Sessions logged to Neon Postgres on each recommendation
- Logs: relationship, age, occasion, interests, freetext, budget, gifts JSON, attempt number

## Completed Features (continued)

### Phase 6: Compliance & Info Pages — COMPLETE
- `components/footer.tsx` — shared footer in layout with links to About, Privacy, Disclosure, Contact
- `app/about/page.tsx` — brand story, how it works, AI explanation, affiliate honesty note
- `app/privacy/page.tsx` — full privacy policy (data collection, third parties, FTC)
- `app/disclosure/page.tsx` — Amazon Associates affiliate disclosure (FTC compliant)
- `app/contact/page.tsx` — contact page with hello@thegiftwhisperer.gifts
- Inline affiliate disclosure note added to results page above gift cards
- All 4 pages are statically generated at build time

## Prioritized Roadmap

1. ~~Session logging~~ ✅ DONE
2. ~~Privacy policy page~~ ✅ DONE
3. ~~Affiliate disclosure~~ ✅ DONE
4. ~~About page~~ ✅ DONE
5. ~~Contact page~~ ✅ DONE
6. Amazon affiliate integration (Amazon Associates program)
7. Etsy affiliate integration (via Awin)
8. Uncommon Goods affiliate integration
9. Shareable results links (encode wizard state in URL)
10. Email the list ("Send to my email" on results screen)
11. Real product images + prices (Amazon Product Advertising API)
12. Landing page (homepage with headline, example outputs, CTA)
13. Analytics (PostHog — behavioral tracking, drop-off, clicks)
14. Metabase — connect to Neon for no-code dashboards and insights
15. Rate limiting (per-IP throttling on `/api/recommend`)
16. Interest-tag matched affiliate partners (REI for Outdoors, Best Buy for Tech, etc.)
17. ML recommendation model — collaborative filtering on wizard inputs + gift selections
