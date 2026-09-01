import Link from "next/link";
import { Gift, Sparkles, Heart, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DoodleIcon } from "@/components/doodle-icon";

import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/about",
  "About",
  "How The Gift Whisperer works: tell us about the person and the occasion, and we find a genuinely well-matched gift instead of a generic one."
);

export default function AboutPage() {
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
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Our story</span>
          </div>
          <h1 className="font-heading text-4xl text-stone-900 mb-4">
            The right gift for anyone, in minutes.
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            Finding a meaningful gift is hard. Not because there aren&apos;t enough options, but
            because there are too many. The Gift Whisperer cuts through the noise with
            recommendations tailored to the person you&apos;re buying for.
          </p>
        </div>

        <div className="grid gap-4 mb-12">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6 flex gap-4">
              <DoodleIcon name="person" className="w-7 h-7 shrink-0 text-amber-600" />
              <div>
                <h2 className="font-heading text-lg text-stone-900 mb-1">Smarter than a bestseller list</h2>
                <p className="text-stone-500 text-sm leading-relaxed">
                  We look at the full picture: the recipient&apos;s relationship to you, their age,
                  the occasion, their interests, and your budget. Then we think through thousands
                  of possibilities to surface three gifts that genuinely fit.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6 flex gap-4">
              <DoodleIcon name="target" className="w-7 h-7 shrink-0 text-amber-600" />
              <div>
                <h2 className="font-heading text-lg text-stone-900 mb-1">Thoughtful, not generic</h2>
                <p className="text-stone-500 text-sm leading-relaxed">
                  We don&apos;t serve up a ranked list of bestsellers. Each suggestion comes
                  with a rationale: a plain-language explanation of why that specific gift
                  makes sense for that specific person. You decide if it clicks.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6 flex gap-4">
              <DoodleIcon name="heart" className="w-7 h-7 shrink-0 text-amber-600" />
              <div>
                <h2 className="font-heading text-lg text-stone-900 mb-1">Save your favorites</h2>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Heart any recommendation to save it to your wishlist. Saved gifts persist
                  across sessions so you can come back and compare, or share them with
                  someone who keeps asking what you want.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Who&apos;s behind this</span>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed">
            The Gift Whisperer is built and run by <strong className="text-stone-700">Daniel M.</strong>{" "}
            No team, no investors, no advertiser deciding what you see.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mt-3">
            I&apos;ve always loved giving gifts, and I take pride in finding something that fits a
            person, right down to their quirks and the specific way they are. Plenty of people
            don&apos;t have the time or patience for that, so gift-giving turns into a chore they
            dread. I built this to take the time and guesswork out of it, so giving a good gift can
            feel fun again.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mt-3">
            How the picks get made, and what this site will and won&apos;t do, is on the{" "}
            <Link href="/how-we-choose" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
              how we choose gifts
            </Link>{" "}
            page. Questions or corrections:{" "}
            <a href="mailto:dan.maghini@gmail.com" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
              dan.maghini@gmail.com
            </a>.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading text-base text-stone-900 mb-1">A note on honesty</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Some links on this site are affiliate links. If you click through and buy
              something, we may earn a small commission at no extra cost to you. This never
              influences what we recommend. Our only job is to help you find a gift they&apos;ll love.{" "}
              <Link href="/disclosure" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
                Read our full affiliate disclosure.
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Heart className="w-5 h-5 text-rose-400 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">
            Built with care.{" "}
            <Link href="/contact" className="text-amber-600 hover:text-amber-700">
              Say hello.
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
