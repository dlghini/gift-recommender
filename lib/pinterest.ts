// Pinterest Tag — conversion tracking for Pinterest Ads.
//
// The tag ID comes from ads.pinterest.com → Conversions → Pinterest tag. The
// base script is loaded once by <PinterestTag> in the root layout; this module
// is the typed wrapper other code uses to fire events.
//
// Enhanced Match is left to Pinterest's automatic mode: the wizard is anonymous
// so there's no email to hash and pass through `pintrk('load', …, { em })`.

export const PINTEREST_TAG_ID = "2613775431715";

declare global {
  interface Window {
    pintrk?: (...args: unknown[]) => void;
  }
}

type EventParams = {
  // Unique per-event id — only useful once a Conversions API server feed exists
  // to dedupe against. Harmless to omit for tag-only tracking.
  event_id?: string;
  value?: number;
  currency?: string;
  order_quantity?: number;
  lead_type?: string;
  property?: string;
  [key: string]: unknown;
};

// Fire a Pinterest standard event (`lead`, `signup`, `checkout`, `custom`, …).
// No-ops when the tag script hasn't loaded — blocked, still initialising, or
// server-side — so callers never need to guard.
export function trackPinterest(event: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  window.pintrk?.("track", event, params);
}

// Register a client-side route change. The base tag fires the first page view
// on load; <PinterestTag> calls this for subsequent SPA navigations.
export function pinterestPageView(): void {
  if (typeof window === "undefined") return;
  window.pintrk?.("page");
}

// Pull a numeric value out of a free-form price string ("$45", "Around $40",
// "$30–50" → 45 / 40 / 30). Returns undefined when there's no number to use, so
// callers can drop `value` rather than send NaN.
export function parsePriceValue(price: string | undefined): number | undefined {
  if (!price) return undefined;
  const match = price.replace(/,/g, "").match(/\d+(\.\d+)?/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : undefined;
}
