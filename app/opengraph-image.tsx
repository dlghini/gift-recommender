import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Site-wide social share image. The file convention applies this to every route
// (and nested segments) automatically, so it fixes the missing og:image
// everywhere at once. Palette + type mirror the live site: sage ground,
// warm-clay eyebrow, Lora (the site's heading face) for the headline.
export const alt = `${SITE_NAME}: thoughtful gift ideas for any person and any occasion`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
            fontSize: 26,
            letterSpacing: 8,
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
            fontSize: 84,
            fontWeight: 600,
            color: "#2b332d",
            textAlign: "center",
            lineHeight: 1.1,
            marginTop: 32,
          }}
        >
          Never give a bad gift again
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#6c756b",
            textAlign: "center",
            marginTop: 28,
            maxWidth: 760,
          }}
        >
          Tell us who you&apos;re shopping for. We&apos;ll do the thinking.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Lora", data: lora, style: "normal", weight: 600 }],
    }
  );
}
