import Link from "next/link";
import { Gift } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white py-8 mt-auto">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" />
            <span className="font-heading text-sm font-semibold text-stone-800">
              The Gift Whisperer
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-stone-400">
            <Link href="/about" className="hover:text-stone-700 transition-colors">
              About
            </Link>
            <Link href="/gifts-for" className="hover:text-stone-700 transition-colors">
              Gift guides
            </Link>
            <Link href="/gifting-style" className="hover:text-stone-700 transition-colors">
              Gifting style quiz
            </Link>
            <Link href="/how-we-choose" className="hover:text-stone-700 transition-colors">
              How we choose
            </Link>
            <Link href="/privacy" className="hover:text-stone-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/disclosure" className="hover:text-stone-700 transition-colors">
              Affiliate Disclosure
            </Link>
            <Link href="/contact" className="hover:text-stone-700 transition-colors">
              Contact
            </Link>
          </nav>
          <p className="text-xs text-stone-300">© {new Date().getFullYear()} The Gift Whisperer</p>
        </div>
      </div>
    </footer>
  );
}
