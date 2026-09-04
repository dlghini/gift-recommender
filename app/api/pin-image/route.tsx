import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Pinterest pin creative (2:3, Pinterest's recommended ratio). One route,
// driven entirely by query params, so any guide/variant can be rendered
// without a new file. Layout mirrors the site's original, simplest pin
// template (icon, eyebrow, big numeral, title, italic tagline, generous
// open space, footer) recolored to the current sage/clay/Lora system.
export const runtime = "nodejs";

const loadLora = () => readFile(join(process.cwd(), "assets/Lora.ttf"));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eyebrow = searchParams.get("eyebrow") || "GIFT GUIDE";
  const number = searchParams.get("number") || "15";
  const title = searchParams.get("title") || SITE_NAME;
  const tagline = searchParams.get("tagline") || "";

  const lora = await loadLora();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#e9eee6",
          padding: "115px 90px",
        }}
      >
        <svg
          width="152"
          height="152"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#91462f"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 8.3h17v12.4h-17z" />
          <path d="M3.2 12.2h17.4M12 8.1v12.6M7.6 8.2C6 8 5 6.4 5.6 4.9 6.3 3.4 9 3.6 10.4 5.2c1 1.1 1.6 3 1.6 3s.7-2 1.8-3.1c1.4-1.5 4-1.6 4.6 0 .5 1.6-.6 3-2.2 3.1" />
        </svg>

        <div
          style={{
            fontSize: 33,
            letterSpacing: 9,
            textTransform: "uppercase",
            color: "#91462f",
            fontWeight: 600,
            marginTop: 44,
            display: "flex",
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            fontFamily: "Lora",
            fontSize: 142,
            fontWeight: 600,
            color: "#91462f",
            marginTop: 40,
            display: "flex",
          }}
        >
          {number}
        </div>

        <div
          style={{
            fontFamily: "Lora",
            fontSize: 92,
            fontWeight: 600,
            color: "#2b332d",
            lineHeight: 1.16,
            textAlign: "center",
            marginTop: 32,
            display: "flex",
            maxWidth: 800,
          }}
        >
          {title}
        </div>

        {tagline ? (
          <div
            style={{
              fontFamily: "Lora",
              fontStyle: "italic",
              fontSize: 37,
              color: "#8b9285",
              marginTop: 36,
              textAlign: "center",
              display: "flex",
              maxWidth: 700,
            }}
          >
            {tagline}
          </div>
        ) : null}

        <div style={{ flex: 1 }} />

        <div style={{ width: 140, height: 2, background: "#c8a556", marginBottom: 32 }} />

        <div
          style={{
            fontSize: 34,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#2b332d",
            fontWeight: 600,
            display: "flex",
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 28, color: "#8b9285", marginTop: 12, display: "flex" }}>
          thegiftwhisperer.gifts
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 1500,
      fonts: [{ name: "Lora", data: lora, style: "normal", weight: 600 }],
    }
  );
}
