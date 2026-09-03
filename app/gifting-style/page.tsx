import Link from "next/link";
import { GiftingStyleQuiz } from "@/components/gifting-style-quiz";
import { routeMeta } from "@/lib/site";
import { ARCHETYPE_ORDER, ARCHETYPES } from "@/lib/gifting-style";

export const metadata = routeMeta(
  "/gifting-style",
  "What's your gifting style?",
  "A quick six-question quiz. Are you the Overthinker, the Last-Minute Legend, the Experience Giver, or something else? Find out and see what to do about it.",
  "/gifting-style/opengraph-image"
);

export default function GiftingStylePage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <GiftingStyleQuiz />

        {/* Also gives the six result pages a real internal link, so crawlers
            don't treat them as orphans (they're otherwise only reached by
            finishing the quiz, which is client-side navigation). */}
        <section className="mt-20 border-t border-stone-200 pt-12">
          <h2 className="font-heading text-2xl text-stone-900 mb-1">The six gifting styles</h2>
          <p className="text-stone-500 text-sm mb-6">
            Take the quiz for your result, or read any of them here.
          </p>
          <ul className="flex flex-col gap-3">
            {ARCHETYPE_ORDER.map((id) => {
              const archetype = ARCHETYPES[id];
              return (
                <li key={id}>
                  <Link
                    href={`/gifting-style/${id}`}
                    className="block rounded-xl border border-stone-200 bg-white px-5 py-4 transition-colors hover:border-amber-300"
                  >
                    <span className="font-heading text-base text-stone-900">{archetype.name}</span>
                    <span className="mt-0.5 block text-sm text-stone-500">{archetype.tagline}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
