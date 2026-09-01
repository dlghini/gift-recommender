import Link from "next/link";
import { Gift } from "lucide-react";
import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/privacy",
  "Privacy Policy",
  "What data The Gift Whisperer collects, how it's used, who processes it, and the choices you have over it."
);

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
        <p className="text-stone-400 text-sm mb-10">Effective date: September 1, 2026</p>

        <div className="prose-stone space-y-8 text-stone-600 text-sm leading-relaxed">

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">1. Information we collect</h2>
            <p><strong>From the gift finder.</strong> When you use the wizard we store what you enter:
              the recipient&apos;s relationship to you, approximate age range, the occasion,
              interests, any free-text description, and your budget range. We also store the gift
              ideas that were generated for that request and, if you interact with the results,
              which ones you clicked, saved, or asked to regenerate. The gift finder does not
              require an account and these inputs are not tied to your name.</p>
            <p className="mt-3"><strong>If you create an account.</strong> Sign-in is handled by our
              authentication provider, which stores your email address and login credentials.
              If you add &quot;Loved Ones&quot;, we store the profiles you create: names,
              relationship, birthdays or anniversaries, interests, free-text notes, your
              reminder preferences, and any gifts you save or log against a person, including
              your feedback on how a gift landed.</p>
            <p className="mt-3"><strong>Group gift lists.</strong> If you build a shared list, we store the
              list contents and, when someone claims an item using the share link, the name
              they enter and an email address if they choose to provide one.</p>
            <p className="mt-3"><strong>Automatically.</strong> Standard technical data such as your
              IP address (used for rate limiting and abuse prevention) and, for signed-in
              accounts, a session cookie set by our authentication provider. We use a
              privacy-focused product-analytics service to understand how the Service is used.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>to generate and improve gift recommendations;</li>
              <li>to run the Loved Ones features you opt into: saved profiles, gift history, and occasion reminders;</li>
              <li>to send the emails described in section 3;</li>
              <li>to operate group gift lists and let people claim items;</li>
              <li>to analyze usage patterns, and to build and evaluate the systems that produce recommendations, including future machine-learning models. Wizard-run data is used for this in aggregate; runs that come from our own testing are flagged and excluded;</li>
              <li>to keep the Service secure and prevent abuse.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information, and we do not use it for
              advertising beyond the affiliate links described in our{" "}
              <Link href="/disclosure" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
                Affiliate Disclosure
              </Link>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">3. Email</h2>
            <p>If you have an account, we may send you:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li><strong>Occasion reminders</strong> — a note roughly two weeks before a birthday, anniversary, or applicable holiday for a Loved One;</li>
              <li><strong>A monthly summary</strong> — a once-a-month digest of upcoming occasions;</li>
              <li><strong>List notifications</strong> — a note to the list owner when someone claims a gift.</li>
            </ul>
            <p className="mt-3">You can turn reminders and the monthly summary on or off on your
              Loved Ones page, or use the unsubscribe link in any of those emails. Each email
              also includes our postal address, as required by law. We use a third-party email
              provider to deliver these messages.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">4. Local storage</h2>
            <p>If you are not signed in, gifts you save are kept in your browser&apos;s local
              storage and stay on your device. Clearing your browser&apos;s site data removes
              them.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">5. Service providers</h2>
            <p>We share data only with the vendors that run the Service on our behalf, and only
              as needed to operate it:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>hosting and content delivery;</li>
              <li>a managed database provider (where account, Loved Ones, list, and wizard-run data is stored);</li>
              <li>an authentication provider (account sign-in and email address);</li>
              <li>an email delivery provider (reminders, the monthly summary, list notifications);</li>
              <li>a product-analytics provider;</li>
              <li>image providers used to illustrate gift ideas.</li>
            </ul>
            <p className="mt-3">Each processes data under its own privacy terms. We do not sell or
              rent your data to anyone.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">6. Affiliate partners and cookies</h2>
            <p>We participate in the Amazon Services LLC Associates Program and other affiliate
              programs. When you click a &quot;Buy now&quot; or &quot;Book now&quot; link,
              the retailer may set tracking cookies on your device; their privacy policy
              governs that. Aside from the sign-in session cookie for account holders, we do
              not set first-party advertising cookies. You can control cookies through your
              browser settings.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">7. Data retention and your choices</h2>
            <p>If you have an account, you can delete it at any time. Deleting your account
              removes your Loved Ones profiles, saved and logged gifts, group gift lists, and
              email preferences. It also unlinks your account from any wizard-run records.</p>
            <p className="mt-3">Wizard-run data (the inputs, the ideas generated, and the
              interactions with the results) is retained for analytics and to build and
              evaluate recommendation systems. Where it is not tied to an account it is not
              associated with your identity. To request access to or deletion of data
              associated with you, email us at the address below and we will do what is
              reasonably possible given how the data is stored.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">8. Children&apos;s privacy</h2>
            <p>The Service is not directed to children under 13, and we do not knowingly collect
              personal information from them. If you believe a child has provided us
              information, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">9. Changes to this policy</h2>
            <p>We may update this policy from time to time. When we do, we will post the revised
              version here with a new effective date. Continued use of the Service after a
              change takes effect means you accept the updated policy.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl text-stone-800 mb-3">10. Contact</h2>
            <p>Questions or requests about your data? Email{" "}
              <a
                href="mailto:dan.maghini@gmail.com"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                dan.maghini@gmail.com
              </a>
              .</p>
          </section>
        </div>
      </main>
    </div>
  );
}
