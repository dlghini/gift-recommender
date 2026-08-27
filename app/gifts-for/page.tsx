import Link from "next/link";
import { Gift } from "lucide-react";
import { routeMeta, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { GIFT_GUIDES } from "@/lib/gift-guides";
import { pickEmoji } from "@/lib/gift-emoji";

export const metadata = routeMeta(
  "/gifts-for",
  "Gift Guides",
  "Hand-curated gift guides for the people who are hard to shop for: book lovers, coffee lovers, dog and cat people, and anyone who already has everything."
);

export default function GiftGuidesIndexPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Gift Whisperer gift guides",
    itemListElement: GIFT_GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.h1,
      url: `${SITE_URL}/gifts-for/${g.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <JsonLd data={itemListSchema} />

      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-heading text-4xl text-stone-900">Gift guides</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Short, curated lists for the people who are genuinely hard to shop for. Every pick
          is a real product or a bookable experience, with a reason it fits. For a shortlist
          built around one specific person, the{" "}
          <Link
            href="/wizard"
            className="text-amber-700 underline underline-offset-2 hover:text-amber-800"
          >
            wizard
          </Link>{" "}
          does that.
        </p>

        <ul className="mt-8 space-y-3">
          {GIFT_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/gifts-for/${g.slug}`}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-amber-300"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-2xl">
                  {pickEmoji(g.sections[0]?.picks[0]?.tags ?? [])}
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-lg font-medium text-stone-900">
                    {g.h1}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-500">{g.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl border border-amber-200 bg-white p-5">
          <p className="text-sm text-stone-600">
            None of these quite fit? Tell the Gift Whisperer about the person and get three
            picks matched to them.
          </p>
          <Link
            href="/wizard"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Gift className="h-4 w-4" />
            Start the wizard
          </Link>
        </div>
      </main>
    </div>
  );
}
