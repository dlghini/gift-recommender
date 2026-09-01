import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Social image for the quiz landing page. Separate from the per-archetype
// result images so a link to the quiz itself has its own shareable card.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "What's your gifting style?";

export default function Image() {
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
          background: "#fffbeb",
          padding: "80px",
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
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: "#1c1917",
            textAlign: "center",
            lineHeight: 1.1,
            marginTop: 32,
          }}
        >
          What&apos;s your gifting style?
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#78716c",
            textAlign: "center",
            marginTop: 28,
            maxWidth: 820,
          }}
        >
          A quick six-question quiz. Find out, and see what to do about it.
        </div>
      </div>
    ),
    { ...size }
  );
}
