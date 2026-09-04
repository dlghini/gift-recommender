import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Pinterest pin creative (2:3, Pinterest's recommended ratio). One route,
// driven entirely by query params, so any guide/variant can be rendered
// without a new file. Layout mirrors the original pin template (centered,
// big numeral, italic tagline, generously spaced bullet list) recolored to
// the site's current sage/clay/Lora system instead of the old cream/gold.
export const runtime = "nodejs";

const loadLora = () => readFile(join(process.cwd(), "assets/Lora.ttf"));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eyebrow = searchParams.get("eyebrow") || "GIFT GUIDE";
  const number = searchParams.get("number") || "15";
  const title = searchParams.get("title") || SITE_NAME;
  const tagline = searchParams.get("tagline") || "";
  const bullets = (searchParams.get("bullets") || "")
    .split("|")
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 4);
  const totalPicks = Number(searchParams.get("total") || "15");
  const remaining = Math.max(totalPicks - bullets.length, 0);

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
          padding: "110px 100px",
        }}
      >
        <svg
          width="46"
          height="46"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#91462f"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 8.3h17v12.4h-17z" />
          <path d="M3.2 12.2h17.4M12 8.1v12.6M7.6 8.2C6 8 5 6.4 5.6 4.9 6.3 3.4 9 3.6 10.4 5.2c1 1.1 1.6 3 1.6 3s.7-2 1.8-3.1c1.4-1.5 4-1.6 4.6 0 .5 1.6-.6 3-2.2 3.1" />
        </svg>

        <div
          style={{
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#91462f",
            fontWeight: 600,
            marginTop: 20,
            display: "flex",
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            fontFamily: "Lora",
            fontSize: 68,
            fontWeight: 600,
            color: "#91462f",
            marginTop: 24,
            display: "flex",
          }}
        >
          {number}
        </div>

        <div
          style={{
            fontFamily: "Lora",
            fontSize: 58,
            fontWeight: 600,
            color: "#2b332d",
            lineHeight: 1.18,
            textAlign: "center",
            marginTop: 14,
            display: "flex",
            maxWidth: 720,
          }}
        >
          {title}
        </div>

        {tagline ? (
          <div
            style={{
              fontFamily: "Lora",
              fontStyle: "italic",
              fontSize: 28,
              color: "#8b9285",
              marginTop: 22,
              textAlign: "center",
              display: "flex",
            }}
          >
            {tagline}
          </div>
        ) : null}

        <div style={{ width: 120, height: 2, background: "#c8a97a", marginTop: 40 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 34,
            marginTop: 48,
            alignItems: "flex-start",
          }}
        >
          {bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: "#c8a97a",
                  transform: "rotate(45deg)",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontFamily: "Lora", fontSize: 32, color: "#2b332d", display: "flex" }}>
                {b}
              </div>
            </div>
          ))}
        </div>

        {remaining > 0 ? (
          <div
            style={{
              fontFamily: "Lora",
              fontStyle: "italic",
              fontSize: 24,
              color: "#8b9285",
              marginTop: 36,
              display: "flex",
            }}
          >
            {`+ ${remaining} more, a reason for each`}
          </div>
        ) : null}

        <div style={{ flex: 1 }} />

        <div style={{ width: 120, height: 2, background: "#cfd7cb", marginBottom: 26 }} />

        <div
          style={{
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#2b332d",
            fontWeight: 600,
            display: "flex",
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 22, color: "#8b9285", marginTop: 8, display: "flex" }}>
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
