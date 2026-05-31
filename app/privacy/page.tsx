import Link from "next/link";
import { Gift } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — The Gift Whisperer",
  description: "Privacy policy for The Gift Whisperer.",
};

export default function PrivacyPage() {
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
        <h1 className="font-heading text-4xl text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-stone-400 text-sm mb-10">Effective date: May 31, 2026</p>

        <div className="prose-stone space-y-8 text-stone-600 text-sm leading-relaxed">

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">1. Information we collect</h2>
            <p>
              When you use The Gift Whisperer, we collect the information you enter in our
              gift-finding wizard: the recipient&apos;s relationship to you, their approximate
              age range, the occasion, their interests, any free-text description you provide,
              and your budget range. This information is stored in our database to help us
              understand how people use the service and improve our recommendations over time.
            </p>
            <p className="mt-3">
              We do not collect your name, email address, payment information, or any other
              personally identifiable information unless you voluntarily contact us.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">2. How we use your information</h2>
            <p>
              We use the information you provide to generate personalized gift recommendations
              via Claude AI (by Anthropic). We also store anonymized session data — including
              your wizard inputs and the gifts we recommended — to analyze usage patterns and
              improve our service. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">3. Local storage</h2>
            <p>
              Your saved gifts are stored in your browser&apos;s local storage under the key{" "}
              <code className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-xs font-mono">
                giftspark_saved
              </code>
              . This data never leaves your device and is not transmitted to our servers.
              You can clear it at any time by clearing your browser&apos;s local storage or
              site data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">4. Third-party services</h2>
            <p>We rely on the following third-party services, each with their own privacy policies:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside marker:text-amber-400">
              <li>
                <strong className="text-stone-700">Anthropic (Claude AI)</strong> — Your wizard
                inputs are sent to Anthropic&apos;s API to generate gift recommendations.
                Anthropic&apos;s privacy practices govern how this data is handled.
              </li>
              <li>
                <strong className="text-stone-700">Amazon Associates</strong> — We participate in
                the Amazon Services LLC Associates Program. When you click a "Buy now" link,
                Amazon may set tracking cookies on your device. Amazon&apos;s privacy policy governs
                their data practices.
              </li>
              <li>
                <strong className="text-stone-700">Vercel</strong> — Our website is hosted on
                Vercel, which may log standard server access information such as IP addresses and
                request timestamps.
              </li>
              <li>
                <strong className="text-stone-700">Neon</strong> — We use Neon (a Postgres
                cloud database) to store anonymized session data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">5. Cookies</h2>
            <p>
              We do not set first-party cookies. Amazon and other affiliate partners may set
              tracking cookies when you click links on our site. You can control cookie
              behavior through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">6. Data retention</h2>
            <p>
              We retain anonymized session data indefinitely for analytics purposes. Because
              we do not collect personally identifiable information, we are unable to
              retrieve or delete data tied to a specific individual on request. If you have
              concerns, please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">7. Children&apos;s privacy</h2>
            <p>
              Our service is not directed to children under the age of 13. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">8. Changes to this policy</h2>
            <p>
              We may update this privacy policy from time to time. When we do, we will post
              the revised policy on this page with an updated effective date. Continued use
              of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">9. Contact</h2>
            <p>
              If you have questions or concerns about this privacy policy, please email us at{" "}
              <a
                href="mailto:hello@thegiftwhisperer.gifts"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                hello@thegiftwhisperer.gifts
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
