import Link from "next/link";

/**
 * Short, clear-and-conspicuous affiliate disclosure, placed directly above any
 * block of affiliate links (homepage example cards, wizard results). The full
 * version lives at /disclosure; Amazon's required phrasing is included here.
 */
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-stone-400 leading-relaxed ${className}`}>
      Some links below are affiliate links. As an Amazon Associate, and through other
      retailer programs, we earn from qualifying purchases at no extra cost to you.{" "}
      <Link href="/disclosure" className="underline hover:text-stone-600">
        More
      </Link>
      .
    </p>
  );
}
