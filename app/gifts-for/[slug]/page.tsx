import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift } from "lucide-react";
import { routeMeta, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { PickCard } from "@/components/gift-guide/pick-card";
import { getGuide, allGuideSlugs, GIFT_GUIDES } from "@/lib/gift-guides";

// All guides are known at build time; anything else 404s.
export const dynamicParams = false;
// Static shell, refreshed weekly so the byline date and any copy edits roll out
// without a redeploy. The gift photos resolve client-side, so they aren't cached here.
export const revalidate = 604800;

export function generateStaticParams() {
  return allGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return routeMeta(`/gifts-for/${guide.slug}`, guide.title, guide.description);
}

function formatUpdated(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function GiftGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const url = `${SITE_URL}/gifts-for/${guide.slug}`;
  const allPicks = guide.sections.flatMap((s) => s.picks);
  const related = guide.related
    .map((s) => GIFT_GUIDES.find((g) => g.slug === s))
    .filter((g): g is (typeof GIFT_GUIDES)[number] => Boolean(g));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Gift guides", item: `${SITE_URL}/gifts-for` },
      { "@type": "ListItem", position: 3, name: guide.h1, item: url },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: guide.h1,
    description: guide.description,
    numberOfItems: allPicks.length,
    itemListElement: allPicks.map((pick, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: pick.name,
      description: pick.why,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqSchema} />

      <main className="mx-auto max-w-2xl px-4 py-12">
        <nav className="mb-6 text-sm text-stone-500">
          <Link href="/gifts-for" className="hover:text-stone-800">
            Gift guides
          </Link>
          <span className="mx-2 text-stone-300">/</span>
          <span className="text-stone-700">{guide.h1}</span>
        </nav>

        <h1 className="font-heading text-4xl text-stone-900">{guide.h1}</h1>
        <p className="mt-2 text-sm text-stone-400">
          Curated by Daniel M. &middot; Updated {formatUpdated(guide.updated)}
        </p>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-stone-600">
          {guide.intro.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-white p-5">
          <p className="text-sm text-stone-600">
            Want a shortlist built for one specific person instead of a category?
          </p>
          <Link
            href="/wizard"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Gift className="h-4 w-4" />
            Ask the Gift Whisperer
          </Link>
        </div>

        {guide.sections.map((section) => (
          <section key={section.heading} className="mt-12">
            <h2 className="font-heading text-2xl text-stone-900">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.picks.map((pick) => (
                <PickCard key={pick.name} pick={pick} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-12">
          <h2 className="font-heading text-2xl text-stone-900">Common questions</h2>
          <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {guide.faq.map((f) => (
              <div key={f.q} className="p-5">
                <h3 className="font-heading text-base font-medium text-stone-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-2xl text-stone-900">More gift guides</h2>
            <ul className="mt-4 space-y-2">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/gifts-for/${g.slug}`}
                    className="text-amber-700 underline underline-offset-2 hover:text-amber-800"
                  >
                    {g.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 border-t border-stone-200 pt-6 text-xs leading-relaxed text-stone-400">
          Some links on this page are affiliate links, which means we may earn a small
          commission if you buy through them, at no extra cost to you. It never affects
          which gifts we pick. See our{" "}
          <Link href="/disclosure" className="underline underline-offset-2 hover:text-stone-600">
            affiliate disclosure
          </Link>{" "}
          and{" "}
          <Link href="/how-we-choose" className="underline underline-offset-2 hover:text-stone-600">
            how we choose
          </Link>
          . Prices are estimates. Photos are illustrative.
        </p>
      </main>
    </div>
  );
}
