import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Social image for the quiz landing page. Separate from the per-archetype
// result images so a link to the quiz itself has its own shareable card.
// Palette + type mirror the live site (sage ground, warm-clay eyebrow, Lora).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "What's your gifting style?";

export default async function Image() {
  const lora = await readFile(join(process.cwd(), "assets/Lora.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9eee6",
          padding: "80px",
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
          {SITE_NAME}
        </div>
        <div
          style={{
            fontFamily: "Lora",
            fontSize: 86,
            fontWeight: 600,
            color: "#2b332d",
            textAlign: "center",
            lineHeight: 1.1,
            marginTop: 30,
          }}
        >
          What&apos;s your gifting style?
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#6c756b",
            textAlign: "center",
            marginTop: 26,
            maxWidth: 820,
          }}
        >
          A quick six-question quiz. Find out, and see what to do about it.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Lora", data: lora, style: "normal", weight: 600 }],
    }
  );
}
