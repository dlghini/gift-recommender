import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Square brand mark referenced by the Organization structured data (Google
// wants a logo at least 112x112). Same palette and heading face as the rest of
// the site's generated images: sage ground, clay accent, Lora lettering.
export const dynamic = "force-static";

const SIZE = { width: 512, height: 512 };

export async function GET() {
  const lora = await readFile(join(process.cwd(), "assets/Lora.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9eee6",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Lora",
            fontSize: 168,
            fontWeight: 600,
            color: "#91462f",
            letterSpacing: -3,
          }}
        >
          TGW
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: [{ name: "Lora", data: lora, style: "normal", weight: 600 }],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    }
  );
}
