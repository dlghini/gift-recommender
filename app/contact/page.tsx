import Link from "next/link";
import { Gift, Mail } from "lucide-react";

export const metadata = {
  title: "Contact — The Gift Whisperer",
  description: "Get in touch with The Gift Whisperer team.",
};

export default function ContactPage() {
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
        <h1 className="font-heading text-4xl text-stone-900 mb-3">Say hello</h1>
        <p className="text-stone-500 text-base leading-relaxed mb-10">
          Have a question, found a bug, or just want to share a gift win? We&apos;d love to hear
          from you.
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-stone-500 text-sm mb-2">Drop us a line at</p>
            <a
              href="mailto:dan.maghini@gmail.com"
              className="font-heading text-xl text-stone-900 hover:text-amber-600 transition-colors"
            >
              dan.maghini@gmail.com
            </a>
          </div>
          <p className="text-stone-400 text-xs max-w-xs">
            We read every email and do our best to respond within a couple of business days.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-stone-500">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-2xl mb-2">🐛</div>
            <p className="font-medium text-stone-700 mb-1">Found a bug?</p>
            <p className="text-xs text-stone-400">Tell us what happened and we&apos;ll fix it fast.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-2xl mb-2">💡</div>
            <p className="font-medium text-stone-700 mb-1">Feature idea?</p>
            <p className="text-xs text-stone-400">We&apos;re always looking for ways to improve.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-2xl mb-2">🎁</div>
            <p className="font-medium text-stone-700 mb-1">Gift win?</p>
            <p className="text-xs text-stone-400">Share the story — we love hearing them.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
