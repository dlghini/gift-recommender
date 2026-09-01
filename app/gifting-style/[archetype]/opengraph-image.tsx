import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ARCHETYPES, ARCHETYPE_ORDER, type ArchetypeId } from "@/lib/gifting-style";
import { SITE_NAME } from "@/lib/site";

// One social image per archetype result page. The quiz is the main
// Pinterest/Reddit/IG asset, so each result needs its own shareable card.
// Palette + type mirror the live site: sage ground, warm-clay eyebrow,
// Lora (the site's heading face) for the archetype name.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Your gifting style";

// Prerender all six at build time (same params as the page).
export function generateStaticParams() {
  return ARCHETYPE_ORDER.map((archetype) => ({ archetype }));
}

const loadLora = () => readFile(join(process.cwd(), "assets/Lora.ttf"));

export default async function Image({
  params,
}: {
  params: Promise<{ archetype: string }>;
}) {
  const { archetype } = await params;
  const a = ARCHETYPES[archetype as ArchetypeId] ?? ARCHETYPES.overthinker;
  const lora = await loadLora();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#e9eee6",
          padding: "90px",
        }}
      >
        <div
          style={{
            fontSize: 25,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: "#91462f",
            fontWeight: 600,
          }}
        >
          {`${SITE_NAME} · Gifting style`}
        </div>
        <div
          style={{
            fontFamily: "Lora",
            fontSize: 92,
            fontWeight: 600,
            color: "#2b332d",
            lineHeight: 1.05,
            marginTop: 26,
          }}
        >
          {a.name}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#6c756b",
            marginTop: 24,
            maxWidth: 940,
            lineHeight: 1.35,
          }}
        >
          {a.tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Lora", data: lora, style: "normal", weight: 600 }],
    }
  );
}
