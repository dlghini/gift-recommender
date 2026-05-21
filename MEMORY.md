# Project Memory

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (CSS-first config via `@import 'tailwindcss'` in `app/globals.css`)
- **UI Components**: shadcn/ui v4 (style: `base-nova`, Tailwind v4 compatible)
- **Icons**: lucide-react (installed by shadcn)

## Installed shadcn/ui Components

- `button` — `components/ui/button.tsx`
- `input` — `components/ui/input.tsx`
- `card` — `components/ui/card.tsx`
- `progress` — `components/ui/progress.tsx`

## Key Files

- `app/layout.tsx` — root layout with Geist fonts
- `app/globals.css` — Tailwind v4 + shadcn CSS variables (oklch color system, dark mode via `.dark` class)
- `components.json` — shadcn/ui config (aliases: `@/components`, `@/lib`, `@/hooks`)
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)

## Fonts

- **Heading**: Lora (serif) via `--font-lora` / `font-heading` Tailwind class
- **Body**: Geist Sans via `--font-geist-sans` / `font-sans`

## Design System

- **Brand name**: `giftspark`
- **Accent**: Amber/gold (`bg-amber-500`, `text-amber-600`, `bg-amber-50`)
- **Background**: `bg-amber-50` (warm off-white)
- **Cards**: `bg-white border-0 shadow-sm`
- **Primary CTA**: `bg-amber-500 hover:bg-amber-600 text-white`
- **Save icon**: `Heart` from lucide-react; filled `fill-rose-500` when saved

## Phases

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
- **`app/api/recommend/route.ts`** — POST handler using `@anthropic-ai/sdk` v0.96.0
- Model: `claude-opus-4-7` with structured JSON output via `output_config.format` (raw JSON schema, no Zod)
- Prompt caching: system prompt cached with `cache_control: { type: "ephemeral" }` in system array
- Returns `[{ name, price, rationale, tags, affiliateUrl }]` (3 items)
- **`app/page.tsx`** — replaced hardcoded mock data with live `/api/recommend` fetch
- `TAG_EMOJI` map + `pickEmoji()` for dynamic gift card emoji based on AI-returned tags
- Error banner (AlertCircle) on API failure, returns user to step 4 for retry
- `output_config` typed as `never` cast to work around SDK type gap

### Phase 4: Persistent Saved Gifts — COMPLETE
- `savedGifts: GiftResult[]` state initialized from `localStorage("giftspark_saved")` on mount
- `savedNames: Set<string>` derived from savedGifts for O(1) heart-state lookup (keyed by gift name, not index)
- `toggleSaved(gift)` saves/removes full gift objects to localStorage; persists across page refreshes and sessions
- Saved gifts section rendered below recommendations on results page — compact card with emoji, name, price, remove heart, and Buy button
- Saves survive "Try different gifts" regeneration (no longer cleared on new fetch)
