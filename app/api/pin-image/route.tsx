import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Pinterest pin creative (2:3, Pinterest's recommended ratio). One route,
// driven entirely by query params, so any guide/variant can be rendered
// without a new file. Palette + type mirror the live site: sage ground,
// warm-clay eyebrow, Lora for the headline — same system as the OG images.
export const runtime = "nodejs";

const loadLora = () => readFile(join(process.cwd(), "assets/Lora.ttf"));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eyebrow = searchParams.get("eyebrow") || "GIFT GUIDE";
  const title = searchParams.get("title") || SITE_NAME;
  const bullets = (searchParams.get("bullets") || "")
    .split("|")
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 4);

  const lora = await loadLora();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#e9eee6",
          padding: "72px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#91462f"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 8.3h17v12.4h-17z" />
            <path d="M3.2 12.2h17.4M12 8.1v12.6M7.6 8.2C6 8 5 6.4 5.6 4.9 6.3 3.4 9 3.6 10.4 5.2c1 1.1 1.6 3 1.6 3s.7-2 1.8-3.1c1.4-1.5 4-1.6 4.6 0 .5 1.6-.6 3-2.2 3.1" />
          </svg>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#91462f",
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            fontFamily: "Lora",
            fontSize: 76,
            fontWeight: 600,
            color: "#2b332d",
            lineHeight: 1.12,
            marginTop: 40,
            display: "flex",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginTop: 56,
          }}
        >
          {bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#91462f",
                  marginTop: 12,
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 34, color: "#3c453d", lineHeight: 1.3, display: "flex" }}>
                {b}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "2px solid #cfd7cb",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#2b332d",
              fontWeight: 600,
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 24, color: "#6c756b", marginTop: 8 }}>
            thegiftwhisperer.gifts
          </div>
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
