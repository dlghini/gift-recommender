import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { SITE_NAME } from "@/lib/site";
import { getGuide, allGuideSlugs } from "@/lib/gift-guides";

// Tall 2:3 image used when a visitor saves a guide to Pinterest from the
// "Save to Pinterest" button. Pinterest fetches it by URL, so every guide gets
// one without any hand-managed assets. Palette and type mirror the site's
// opengraph-image: sage ground, warm-clay eyebrow, Lora headline.
export const dynamicParams = false;

export function generateStaticParams() {
  return allGuideSlugs().map((slug) => ({ slug }));
}

const SIZE = { width: 1000, height: 1500 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const pickCount = guide.sections.reduce((n, s) => n + s.picks.length, 0);
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
          justifyContent: "space-between",
          background: "#e9eee6",
          padding: "120px 90px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#91462f",
            fontWeight: 600,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Lora",
              fontSize: 118,
              fontWeight: 600,
              color: "#2b332d",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {guide.h1}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 48,
              fontSize: 44,
              color: "#6c756b",
              textAlign: "center",
            }}
          >
            {`${pickCount} ideas, picked by hand`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#6c756b",
            letterSpacing: 2,
          }}
        >
          thegiftwhisperer.gifts
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
