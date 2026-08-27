import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allGuideSlugs } from "@/lib/gift-guides";

// Hand-maintained for the core pages; the gift-guide entries are generated from
// the guide data so a new guide shows up here automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/wizard", changeFrequency: "monthly", priority: 0.9 },
    { path: "/gifts-for", changeFrequency: "weekly", priority: 0.8 },
    ...allGuideSlugs().map((slug) => ({
      path: `/gifts-for/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { path: "/loved-ones", changeFrequency: "monthly", priority: 0.5 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/how-we-choose", changeFrequency: "monthly", priority: 0.4 },
    { path: "/disclosure", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
