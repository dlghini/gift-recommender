"use client";

import { useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ARCHETYPES, type ArchetypeId } from "@/lib/gifting-style";

export function GiftingStyleResultActions({ archetypeId }: { archetypeId: ArchetypeId }) {
  const posthog = usePostHog();
  const archetype = ARCHETYPES[archetypeId];
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/gifting-style/${archetypeId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `I'm ${archetype.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed the share sheet, or clipboard blocked */
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      <Link
        href={archetype.ctaHref}
        onClick={() => posthog?.capture("quiz_cta_clicked", { archetype: archetypeId, target: archetype.ctaHref })}
        className="inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-amber-600"
      >
        {archetype.ctaLabel}
      </Link>
      <div className="flex items-center justify-center gap-4 text-sm">
        <button
          onClick={share}
          className="font-medium text-amber-600 hover:text-amber-700 cursor-pointer"
        >
          {copied ? "Link copied" : "Share your result"}
        </button>
        <span className="text-stone-300">·</span>
        <Link href="/gifting-style" className="font-medium text-stone-400 hover:text-stone-600">
          Retake the quiz
        </Link>
      </div>
    </div>
  );
}
