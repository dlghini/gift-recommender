import Link from "next/link";
import { Gift, FileText } from "lucide-react";
import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/terms",
  "Terms of Service",
  "The terms that govern your use of The Gift Whisperer: what the service is, what it isn't, and the limits of our responsibility."
);

export default function TermsPage() {
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
          <FileText className="w-6 h-6 text-amber-500" />
          <h1 className="font-heading text-4xl text-stone-900">Terms of Service</h1>
        </div>
        <p className="text-stone-400 text-sm mb-10">Effective date: September 1, 2026</p>

        <div className="prose-stone space-y-8 text-stone-600 text-sm leading-relaxed">

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">1. Acceptance</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) are a legal agreement between you and
              The Gift Whisperer (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) covering your
              use of the website at thegiftwhisperer.gifts and everything on it (the
              &quot;Service&quot;). By using the Service you agree to these Terms and to our{" "}
              <Link href="/privacy" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">2. What the Service is</h2>
            <p>
              The Gift Whisperer is a free tool that suggests gift ideas based on a few
              details you provide about the person you are shopping for. Optionally, you can
              create an account to save profiles for people you buy for (&quot;Loved Ones&quot;),
              keep a history of gifts, receive occasion reminders by email, and build shared
              &quot;group gift lists&quot; that other people can view and claim items from.
            </p>
            <p className="mt-3">
              The Service is provided for personal, non-commercial use. We may change, suspend,
              or discontinue any part of it at any time.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">3. Recommendations are suggestions, not advice</h2>
            <p>
              Gift ideas are generated automatically and are suggestions only. We do not
              guarantee that a suggested product or experience is available, accurately priced,
              suitable, or a good fit. Prices, availability, and details shown on the Service
              may be out of date or estimated; the retailer&apos;s own listing is always the
              source of truth. You are responsible for your own purchasing decisions.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">4. Accounts and the information you enter</h2>
            <p>
              Account sign-in is handled by our authentication provider. You are responsible
              for keeping your login secure and for activity that happens under your account.
            </p>
            <p className="mt-3">
              When you add a Loved One profile or create a group gift list, you may enter
              information about other people (names, relationship, birthdays, interests, notes).
              You represent that you are entitled to provide that information and to receive
              reminders about those people. Do not enter information about someone who has
              asked you not to. When you share a group gift list link, anyone who has the link
              can see the list and the names of people who claim items.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>scrape, crawl, or bulk-download the Service, or use it to build a competing dataset or product;</li>
              <li>probe, disrupt, or overload the Service or its infrastructure, or bypass rate limits;</li>
              <li>use the Service to harass, defame, or invade the privacy of any person;</li>
              <li>submit unlawful content, malware, or content that infringes someone else&apos;s rights;</li>
              <li>misrepresent your affiliation with any person or organization.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">6. Affiliate links and third parties</h2>
            <p>
              Some links on the Service are affiliate links, and we may earn a commission on
              qualifying purchases at no extra cost to you. See our{" "}
              <Link href="/disclosure" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
                Affiliate Disclosure
              </Link>
              . We do not sell any products ourselves. Any purchase is a transaction between
              you and the retailer, governed by that retailer&apos;s terms. We are not
              responsible for products, fulfillment, returns, or customer service provided by
              third parties, and we do not endorse or take responsibility for third-party
              websites the Service links to.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">7. Intellectual property</h2>
            <p>
              The Service&apos;s name, design, text, and original content are owned by us and
              protected by law. You may use the Service for its intended purpose but may not
              copy, republish, or create derivative works from its content without permission.
              Product names and trademarks referenced in recommendations belong to their
              respective owners.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">8. Disclaimer of warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot;, without
              warranties of any kind, whether express or implied, including implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement. We do
              not warrant that the Service will be uninterrupted, error-free, secure, or that
              any recommendation will meet your expectations.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">9. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, we will not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or for any loss of
              profits, data, goodwill, or gifts gone wrong, arising out of or related to your
              use of the Service. Our total liability for any claim relating to the Service
              will not exceed one hundred U.S. dollars (USD $100). Some jurisdictions do not
              allow certain limitations, so parts of this section may not apply to you.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from claims and expenses (including
              reasonable legal fees) arising from your misuse of the Service, your violation of
              these Terms, or information you submitted about another person.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">11. Termination</h2>
            <p>
              You may stop using the Service at any time and, if you have an account, delete
              it. We may suspend or terminate your access if you violate these Terms or to
              protect the Service. Sections that by their nature should survive termination
              (including sections 3 and 6&ndash;10) will survive.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">12. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. When we do, we will post the
              revised version on this page with a new effective date. If a change is
              significant, we will make reasonable efforts to flag it. Continued use of the
              Service after a change takes effect means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">13. Governing law</h2>
            <p>
              These Terms are governed by the laws of the State of Texas, USA, without regard
              to its conflict-of-laws rules. Any dispute that is not resolved informally will
              be brought exclusively in the state or federal courts located in Travis County,
              Texas, and you consent to their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">14. Contact</h2>
            <p>
              Questions about these Terms? Email{" "}
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
