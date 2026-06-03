import Link from "next/link";
import { Gift, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Affiliate Disclosure — The Gift Whisperer",
  description: "Affiliate disclosure for The Gift Whisperer.",
};

export default function DisclosurePage() {
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
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <h1 className="font-heading text-4xl text-stone-900">Affiliate Disclosure</h1>
        </div>
        <p className="text-stone-400 text-sm mb-10">Last updated: June 1, 2026</p>

        <div className="space-y-6 text-stone-600 text-sm leading-relaxed">

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-amber-800 text-sm">
            <strong>Summary:</strong> Some links on this site are affiliate links. If you click
            through and make a purchase, we may earn a commission — at no extra cost to you.
            This never affects what we recommend.
          </div>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Amazon Associates</h2>
            <p>
              The Gift Whisperer is a participant in the Amazon Services LLC Associates Program,
              an affiliate advertising program designed to provide a means for sites to earn
              advertising fees by advertising and linking to Amazon.com.
            </p>
            <p className="mt-3">
              When you click a &quot;Buy now&quot; button that links to Amazon, you will be directed
              to Amazon.com with an affiliate tracking link. If you purchase the product — or
              anything else during that session — we may receive a small commission. The price
              you pay is exactly the same whether or not you use our link.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Etsy affiliate program</h2>
            <p>
              The Gift Whisperer participates in the Etsy affiliate program via Rakuten Advertising.
              Some recommendations link to Etsy, where handmade, personalized, and unique gifts
              are often a better fit. If you click through and make a purchase on Etsy, we may
              earn a commission at no extra cost to you.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Our recommendations are independent</h2>
            <p>
              Affiliate relationships do not influence which gifts we recommend. Our suggestions
              are based solely on the information you provide in the wizard — the recipient&apos;s
              relationship, age, occasion, interests, and your budget. No advertiser or affiliate
              partner has any input into our recommendations.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Prices and availability</h2>
            <p>
              Prices shown are estimates and may differ from current prices on Amazon or Etsy.
              Always check the product page for the actual price before purchasing.
              Product availability may change over time.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">FTC disclosure</h2>
            <p>
              In accordance with the Federal Trade Commission&apos;s guidelines (16 CFR Part 255),
              we disclose that we may receive compensation when you purchase products through
              links on this site. We only link to products we believe may be genuinely useful
              to our users.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">Questions?</h2>
            <p>
              If you have questions about our affiliate relationships, please contact us at{" "}
              <a
                href="mailto:dan.maghini@gmail.com"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                dan.maghini@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
