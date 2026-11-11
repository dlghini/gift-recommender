// Deterministic cleanup of model-written gift fields before they are shown or stored.
// The model sometimes puts commentary in the price ("$40-$60, bundle with other gifts to
// reach budget") or hedges in the name ("... (or similar percussion massager)",
// "Lululemon-Style ..."). Both read as defects on the page, so they are trimmed here.

const NUMBER = String.raw`\d+(?:,\d{3})*(?:\.\d+)?`;
const PRICE_RE = new RegExp(String.raw`\$\s?${NUMBER}(?:\s?[–—-]\s?\$?\s?${NUMBER})?\+?`);

/**
 * Keep only the price or range ("$40–$60", "$250+"), plus a leading "From" and a trailing
 * "per person" / "for two" when present, since those change what the number means. Everything else
 * (commentary in parentheses or after a comma) is dropped. Falls back to the input.
 */
export function cleanPrice(price: string): string {
  const m = price.match(PRICE_RE);
  if (!m || m.index === undefined) return price.trim();
  const core = m[0].replace(/\s+/g, "").replace(/[—-](?=\$?\d)/, "–");
  const from = /^\s*from\s*$/i.test(price.slice(0, m.index)) ? "From " : "";
  const unit = price.slice(m.index + m[0].length).match(/^\s*(per person|for two|for 2)\b/i);
  const suffix = unit ? ` ${unit[1].toLowerCase().replace("for 2", "for two")}` : "";
  return `${from}${core}${suffix}`;
}

const HEDGE = /\b(or similar|similar|style|inspired|alternative|equivalent|compatible|knock-?off|by amazon|generic|brands?)\b/i;

/** Drop hedging from a product name without touching ordinary parentheticals. */
export function cleanName(name: string): string {
  let out = name;
  // "(... or similar ...)", "(Le Creuset Style ...)": parentheticals that contain a hedge word.
  out = out.replace(/\s*\(([^)]*)\)/g, (whole, inner: string) => (HEDGE.test(inner) ? "" : whole));
  // Trailing " or similar ..." / ", or a similar ..."
  out = out.replace(/[,;]?\s+or (?:a )?similar\b.*$/i, "");
  // A leading "Lululemon-Style Belt Bag" -> "Belt Bag" (only the first word, so honest
  // descriptions like "Personalized Varsity-Style Jacket" are left alone).
  out = out.replace(/^[\w&'.]+-style\s+/i, "");
  out = out.replace(/\s{2,}/g, " ").trim();
  return out.length >= 3 ? out : name.trim();
}

export function cleanGift<T extends { name: string; price: string }>(gift: T): T {
  return { ...gift, name: cleanName(gift.name), price: cleanPrice(gift.price) };
}
