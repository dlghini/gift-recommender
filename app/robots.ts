import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawlers get everything except the API surface. Per-user Loved Ones detail
// pages sit behind Clerk auth, so an unauthenticated crawler only ever sees a
// sign-in wall there — no need to explicitly disallow them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
