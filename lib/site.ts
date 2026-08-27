import type { Metadata } from "next";

// Single source of truth for the site's public identity, shared by metadata,
// sitemap, robots and structured data. The apex domain 308s to the www host,
// so www is the canonical origin — everything search-facing must use it.
export const SITE_URL = "https://www.thegiftwhisperer.gifts";
export const SITE_NAME = "The Gift Whisperer";
export const SITE_DESCRIPTION =
  "Thoughtful gift ideas for any person and any occasion. Tell The Gift Whisperer who you're shopping for and we'll do the thinking — free, no sign-up.";

const OG_BASE = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "en_US",
};

// Per-route metadata: a self-referencing canonical plus an og:url that matches
// it. Next replaces the whole `openGraph` object when a page defines one, so the
// shared base is re-spread here. `path` is root-relative ("/about") and resolves
// against `metadataBase`.
export function routeMeta(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG_BASE, title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}
