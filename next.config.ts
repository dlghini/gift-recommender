import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Gift-card thumbnails currently render via plain <img>. These patterns are
    // here so the programmatic gift pages (and any future OG images) can switch
    // to next/image without a config change. Pixabay is the fallback provider
    // (see lib/pixabay.ts); add Viator / Amazon / Etsy hosts here when those
    // images move to next/image too.
    remotePatterns: [
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
  },
  // PostHog reverse proxy: routes analytics traffic through our own domain
  // under /relay (a name PostHog's own guide says to keep deliberately
  // un-analytics-sounding, so ad/tracker blocklists don't pattern-match it
  // the way they now do /ingest, /analytics, etc.) so ad blockers that filter
  // by third-party domain don't drop it — PostHog was reporting a 10-25%
  // event loss to this on Installation Health. See components/posthog-provider.tsx
  // for the client-side api_host/ui_host that pairs with this, and proxy.ts
  // for the matcher exclusion so Clerk's middleware doesn't intercept it.
  // Docs: https://posthog.com/docs/advanced/proxy/nextjs
  async rewrites() {
    return [
      {
        source: "/relay/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/relay/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required alongside the rewrites above — PostHog's API uses trailing
  // slashes (e.g. /relay/e/), and without this Next.js would redirect them
  // and break event capture.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
