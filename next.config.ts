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
};

export default nextConfig;
