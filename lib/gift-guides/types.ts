import type { Store } from "@/lib/affiliate";

export interface GiftPick {
  /** Specific, real, widely available product or bookable experience type. */
  name: string;
  /** Realistic range, e.g. "$25–$45". */
  price: string;
  /** One or two sentences on why it fits this recipient. */
  why: string;
  /** 1–3 interest/theme tags (drive the emoji fallback). */
  tags: string[];
  store: Store;
  /** 2–5 word query that reliably surfaces this on the store. */
  searchQuery: string;
}

export interface GiftGuideSection {
  heading: string;
  picks: GiftPick[];
}

export interface GiftGuide {
  /** URL slug under /gifts-for/, e.g. "book-lovers". */
  slug: string;
  /** The exact target keyword, e.g. "gifts for book lovers". */
  keyword: string;
  h1: string;
  title: string;
  description: string;
  /** Intro paragraphs. */
  intro: string[];
  sections: GiftGuideSection[];
  faq: { q: string; a: string }[];
  /** Sibling guide slugs to cross-link. */
  related: string[];
  /** ISO date, shown in the byline. */
  updated: string;
}
