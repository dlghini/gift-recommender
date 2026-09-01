import { ImageResponse } from "next/og";
import { ARCHETYPES, ARCHETYPE_ORDER, type ArchetypeId } from "@/lib/gifting-style";
import { SITE_NAME } from "@/lib/site";

// One social image per archetype result page. The quiz is the main
// Pinterest/Reddit/IG asset, so each result needs its own shareable card
// rather than the generic site-wide image. Text-only + default font to keep
// the build dependency-free, matching app/opengraph-image.tsx.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Your gifting style";

// Prerender all six at build time (same params as the page).
export function generateStaticParams() {
  return ARCHETYPE_ORDER.map((archetype) => ({ archetype }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ archetype: string }>;
}) {
  const { archetype } = await params;
  const a = ARCHETYPES[archetype as ArchetypeId] ?? ARCHETYPES.overthinker;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#fffbeb",
          padding: "90px",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#d97706",
            fontWeight: 700,
          }}
        >
          {`${SITE_NAME} · Gifting style`}
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: "#1c1917",
            lineHeight: 1.05,
            marginTop: 28,
          }}
        >
          {a.name}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#78716c",
            marginTop: 24,
            maxWidth: 940,
            lineHeight: 1.35,
          }}
        >
          {a.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
