import type { Metadata } from "next";
import HomeClient from "./home-client";
import { GIFT_GUIDES } from "@/lib/gift-guides";

// Thin server wrapper so the (client) landing page can still declare route
// metadata — notably a self-referencing canonical. Without it Google had no
// user-declared canonical and picked the apex (non-www) URL as canonical,
// leaving the homepage unindexed as a "duplicate".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  const guides = GIFT_GUIDES.map((g) => {
    const label = g.keyword.replace(/^gifts for (the )?/i, "");
    return { slug: g.slug, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
  return <HomeClient guides={guides} />;
}
