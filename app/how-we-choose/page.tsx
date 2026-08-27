import Link from "next/link";
import { Gift, Compass } from "lucide-react";
import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/how-we-choose",
  "How We Choose Gifts",
  "The method behind The Gift Whisperer's recommendations: what goes into each pick, the rules the engine works inside, and how we stay independent."
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
            The Gift Whisperer isn&apos;t a bestseller list with a search box on top. Behind the
            wizard is a recommendation engine we built and maintain by hand &mdash; one that uses AI
            and machine learning to work through your answers, inside a set of rules we wrote and
            keep tuning. This page covers what goes into a pick, what the engine won&apos;t do, and
            who&apos;s accountable when it&apos;s wrong.
          </p>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">What goes into a recommendation</h2>
            <p>Every suggestion starts from what you enter in the wizard:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Who they are to you &mdash; partner, parent, sibling, friend, colleague, and so on.</li>
              <li>Their age range and the occasion. A 30th birthday and a retirement need different things.</li>
              <li>Their interests. The specific hobbies and themes you pick do most of the work.</li>
              <li>Anything you add in the free-text box. It gets read closely &mdash; &ldquo;already owns an espresso machine&rdquo; changes the answer.</li>
              <li>Your budget, which is a hard limit rather than a hint.</li>
              <li>Whether they prefer things or experiences, which sets the mix you get back.</li>
            </ul>
            <p className="mt-3">
              You get three picks, not thirty &mdash; a short shortlist you can act on, each with a
              reason in plain language for why it fits this particular person.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">The rules the engine works inside</h2>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>
                Real, specific, and easy to find. Every suggestion has to be an actual product or a
                bookable experience available in most places &mdash; a named item like a
                &ldquo;Kindle Paperwhite,&rdquo; not a vague &ldquo;e-reader,&rdquo; and never an
                invented product or a made-up model number.
              </li>
              <li>Inside your budget. Set &ldquo;$25&ndash;$50&rdquo; and the picks land there.</li>
              <li>
                Pointed at the right kind of store. Mainstream and mass-produced items link to
                Amazon; handmade, personalized, and vintage items link to Etsy; in-person
                experiences &mdash; classes, tastings, tours &mdash; link to Viator, and only the
                kind that exist in most cities.
              </li>
              <li>
                Linked to a search, not one listing. Each &ldquo;Buy&rdquo; or &ldquo;Book&rdquo;
                button opens a search for that item on the store, so the link still works after a
                single listing sells out or changes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">What&apos;s an estimate</h2>
            <p>
              Prices are estimates &mdash; a sense of the range, not a quote. The real number is
              whatever the store shows when you click through. For experiences, we pull a live
              &ldquo;from&rdquo; price where the provider publishes one.
            </p>
            <p className="mt-3">
              Photos are illustrative. The image on a card stands for the type of gift, not
              necessarily the exact product you&apos;ll land on. Check the listing before you buy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">What we don&apos;t do</h2>
            <ul className="space-y-1.5 list-disc pl-5">
              <li>No paid placement. No brand, retailer, or affiliate partner can buy its way into a recommendation.</li>
              <li>No ranking by payout. The affiliate commission on a gift has no bearing on whether it&apos;s suggested &mdash; the <Link href="/disclosure" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">affiliate disclosure</Link> covers how the money side works.</li>
              <li>No bestseller dump. If a set of picks reads like a generic top ten, that&apos;s a bug.</li>
              <li>No selling your data. See the <Link href="/privacy" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">privacy policy</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Who&apos;s responsible</h2>
            <p>
              The engine doesn&apos;t run unsupervised. Daniel M., who runs The Gift Whisperer,
              wrote the rules it works inside, watches what it produces, and tightens things when it
              gets one wrong &mdash; an off-topic pick, a price that&apos;s way off, a store that
              doesn&apos;t fit. Its suggestions are a starting point, not a verdict. You know the
              person; the site is just here to take the time and guesswork out of it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">When we get it wrong</h2>
            <p>
              If a recommendation is inaccurate, inappropriate, or just unhelpful, tell us and
              we&apos;ll fix the rule behind it. Email{" "}
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
              . Corrections that would change other people&apos;s results come first.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
