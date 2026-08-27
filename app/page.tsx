import type { Metadata } from "next";
import HomeClient from "./home-client";

// Thin server wrapper so the (client) landing page can still declare route
// metadata — notably a self-referencing canonical. Without it Google had no
// user-declared canonical and picked the apex (non-www) URL as canonical,
// leaving the homepage unindexed as a "duplicate".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}
