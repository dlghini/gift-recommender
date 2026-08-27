import Link from "next/link";
import { Gift, Compass } from "lucide-react";
import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/how-we-choose",
  "How We Choose Gifts",
  "The method behind The Gift Whisperer's recommendations: what goes into each pick, the rules the recommender follows, and how we stay independent."
);

export default function HowWeChoosePage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <Gift className="w-4 h-4 text-amber-500" />
            <span className="font-heading text-lg font-semibold text-stone-900">The Gift Whisperer</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-6 h-6 text-amber-500" />
          <h1 className="font-heading text-4xl text-stone-900">How we choose gifts</h1>
        </div>
        <p className="text-stone-400 text-sm mb-10">Last updated: August 27, 2026</p>

        <div className="space-y-8 text-stone-600 text-sm leading-relaxed">
          <p className="text-stone-500 text-base">
            The Gift Whisperer isn&apos;t a bestseller list with a search box on top. When you fill in
            the wizard, your answers go through a recommendation engine we built and maintain by hand.
            This page explains what it does, what it will and won&apos;t do, and who is accountable for it.
          </p>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">What goes into a recommendation</h2>
            <p>Every suggestion starts from what you tell us in the wizard:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li><strong>Who they are to you</strong> — partner, parent, sibling, friend, colleague, and so on.</li>
              <li><strong>Their age range and the occasion</strong> — a 30th birthday and a retirement call for different things.</li>
              <li><strong>Their interests</strong> — the specific hobbies and themes you pick, which do most of the work.</li>
              <li><strong>Anything else you add</strong> — the free-text box is read closely; &ldquo;already owns an espresso machine&rdquo; changes the answer.</li>
              <li><strong>Your budget</strong> — a hard constraint, not a suggestion.</li>
              <li><strong>Whether they prefer things or experiences</strong> — which decides the mix you get back.</li>
            </ul>
            <p className="mt-3">
              We return three picks, not thirty. The point is a short, considered shortlist you can
              actually act on — each one with a plain-English reason it fits this particular person.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">The rules the recommender follows</h2>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>
                <strong>Real, specific, widely available.</strong> Suggestions have to be actual
                products or bookable experiences you can find in most places — a named item like a
                &ldquo;Kindle Paperwhite,&rdquo; not a vague &ldquo;e-reader,&rdquo; and never an
                invented product or a made-up model number.
              </li>
              <li>
                <strong>Inside your budget.</strong> If you set &ldquo;$25–$50,&rdquo; the picks land
                in that range.
              </li>
              <li>
                <strong>Matched to the right kind of store.</strong> Mainstream, branded, and
                mass-produced items point to Amazon; handmade, personalized, custom, and vintage
                items point to Etsy; in-person experiences — classes, tastings, tours — point to
                Viator. Experiences are always things that exist in most cities, not something tied
                to one specific place.
              </li>
              <li>
                <strong>Links go to a search, not a single listing.</strong> Each &ldquo;Buy&rdquo; or
                &ldquo;Book&rdquo; button opens a search for that item on the store, so the link keeps
                working even when an individual listing sells out or changes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">What&apos;s an estimate, and what isn&apos;t</h2>
            <p>
              <strong>Prices are estimates.</strong> They give you a sense of the range; the real
              number is whatever the store shows when you click through. For experiences, we pull a
              live &ldquo;from&rdquo; price where the provider makes one available.
            </p>
            <p className="mt-3">
              <strong>Images are illustrative.</strong> The photo on a card represents the type of
              gift, not necessarily the exact product you&apos;ll land on. Always check the listing
              before you buy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">What we don&apos;t do</h2>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>We don&apos;t take payment for placement. No brand, retailer, or affiliate partner can buy its way into a recommendation.</li>
              <li>We don&apos;t rank by what pays the most. The affiliate commission on a gift has no bearing on whether it&apos;s suggested — see our <Link href="/disclosure" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">affiliate disclosure</Link> for how the money side works.</li>
              <li>We don&apos;t just dump a bestseller list. If a recommendation reads like a generic &ldquo;top 10,&rdquo; it&apos;s a bug, not the design.</li>
              <li>We don&apos;t sell or share what you enter. See the <Link href="/privacy" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">privacy policy</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Who&apos;s accountable</h2>
            <p>
              The recommender is built, tuned, and monitored by Dan Maghini, who runs The Gift
              Whisperer independently. Its output is reviewed regularly, and when it gets something
              wrong — an off-topic pick, a price that&apos;s way off, a store that doesn&apos;t fit —
              the rules get adjusted. Every suggestion is a starting point for you to judge, not a
              verdict. You know the person; we&apos;re just trying to save you the legwork.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">When we get it wrong</h2>
            <p>
              If a recommendation is inaccurate, inappropriate, or just plain unhelpful, tell us and
              we&apos;ll fix the underlying rule. Email{" "}
              <a
                href="mailto:dan.maghini@gmail.com"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                dan.maghini@gmail.com
              </a>{" "}
              or use the{" "}
              <Link href="/contact" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
                contact page
              </Link>
              . Corrections that affect other people&apos;s results get priority.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
