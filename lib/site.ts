import type { Metadata } from "next";

// Single source of truth for the site's public identity, shared by metadata,
// sitemap, robots and structured data. The apex domain 308s to the www host,
// so www is the canonical origin — everything search-facing must use it.
export const SITE_URL = "https://www.thegiftwhisperer.gifts";
export const SITE_NAME = "The Gift Whisperer";

// CAN-SPAM requires a valid physical postal address in every marketing email
// (a PO box or registered-agent address is fine). TODO: replace the placeholder.
export const MAILING_ADDRESS = "[YOUR MAILING ADDRESS]";
export const SITE_DESCRIPTION =
  "Thoughtful gift ideas for any person and any occasion. Tell The Gift Whisperer who you're shopping for and we'll do the thinking. Free, no sign-up.";

const OG_IMAGE_ALT = `${SITE_NAME}: thoughtful gift ideas for any person and any occasion`;

const OG_BASE = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "en_US",
  // The app/opengraph-image.tsx file convention only attaches the image to the
  // segment it lives in (the root layout). A page that sets its own `openGraph`
  // replaces that object wholesale, so the image has to be named again here or
  // routeMeta pages ship with no og:image.
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: OG_IMAGE_ALT }],
};

// Per-route metadata: a self-referencing canonical plus an og:url that matches
// it. `path` is root-relative ("/about") and resolves against `metadataBase`.
// Pass `ogImage` (a root-relative route, e.g. a colocated opengraph-image) to
// override the site-wide social image for this route; omit it to keep the default.
export function routeMeta(
  path: string,
  title: string,
  description: string,
  ogImage?: string
): Metadata {
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
    : OG_BASE.images;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG_BASE, title, description, url: path, images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage ?? "/opengraph-image"],
    },
  };
}
