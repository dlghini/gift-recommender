"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { usePostHog } from "posthog-js/react";

// Most search visitors to the research page are looking for a gift idea, so the
// finder is offered before the findings, not only at the bottom.
export function FinderCta() {
  const posthog = usePostHog();

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-white p-5">
      <p className="text-sm text-stone-600">
        Need a gift idea for someone specific? Answer a few questions and get three picks.
      </p>
      <Link
        href="/wizard"
        onClick={() => posthog?.capture("cta_clicked", { location: "research_top" })}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
      >
        <Gift className="h-4 w-4" />
        Ask the Gift Whisperer
      </Link>
    </div>
  );
}
