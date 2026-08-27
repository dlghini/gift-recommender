import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Site-wide social share image. The file convention applies this to every route
// (and nested segments) automatically, so it fixes the missing og:image
// everywhere at once. Text-only + default font to keep the build dependency-free.
export const alt = `${SITE_NAME} — thoughtful gift ideas for any person and any occasion`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          The Gift Whisperer
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
          Never give a bad gift again
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#78716c",
            textAlign: "center",
            marginTop: 28,
            maxWidth: 760,
          }}
        >
          Tell us who you&apos;re shopping for. We&apos;ll do the thinking.
        </div>
      </div>
    ),
    { ...size }
  );
}
