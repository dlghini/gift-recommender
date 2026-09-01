import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ARCHETYPES, ARCHETYPE_ORDER, type ArchetypeId } from "@/lib/gifting-style";
import { routeMeta } from "@/lib/site";
import { GiftingStyleResultActions } from "@/components/gifting-style-result-actions";

export function generateStaticParams() {
  return ARCHETYPE_ORDER.map((archetype) => ({ archetype }));
}

function resolve(param: string): ArchetypeId | null {
  return (ARCHETYPE_ORDER as string[]).includes(param) ? (param as ArchetypeId) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ archetype: string }>;
}): Promise<Metadata> {
  const { archetype: raw } = await params;
  const id = resolve(raw);
  if (!id) return {};
  const a = ARCHETYPES[id];
  return routeMeta(
    `/gifting-style/${id}`,
    `You're ${a.name}`,
    `${a.tagline} Take the gifting style quiz and find your own.`
  );
}

export default async function GiftingStyleResultPage({
  params,
}: {
  params: Promise<{ archetype: string }>;
}) {
  const { archetype: raw } = await params;
  const id = resolve(raw);
  if (!id) notFound();
  const a = ARCHETYPES[id];

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">
          Your gifting style
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl text-stone-900 leading-tight">{a.name}</h1>
        <p className="font-heading text-lg text-stone-500 mt-3">{a.tagline}</p>

        <p className="text-stone-600 text-base leading-relaxed mt-8">{a.blurb}</p>

        <div className="mt-6 rounded-xl border border-amber-100 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Your gifting kryptonite
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">{a.kryptonite}</p>
        </div>

        <div className="mt-10 border-t border-amber-100 pt-8">
          <h2 className="font-heading text-2xl text-stone-900">{a.ctaHeading}</h2>
          <p className="text-stone-500 text-base leading-relaxed mt-2">{a.ctaBody}</p>
          <GiftingStyleResultActions archetypeId={id} />
        </div>

        <p className="text-xs text-stone-400 mt-12 text-center">
          <Link href="/gifting-style" className="hover:text-stone-600">
            What&apos;s your gifting style?
          </Link>
        </p>
      </div>
    </div>
  );
}
