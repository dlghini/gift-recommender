"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { buildAffiliateUrl } from "@/lib/affiliate";
import { pickEmoji } from "@/lib/gift-emoji";
import type { GiftPick } from "@/lib/gift-guides/types";

const STORE_LABEL: Record<GiftPick["store"], string> = {
  amazon: "Amazon",
  etsy: "Etsy",
  viator: "Viator",
};

// These pages are static, so there's no image URL baked in. Resolve one on mount
// from the same (cached) Pixabay search the wizard uses, and fall back to an emoji
// while it loads or if nothing comes back.
function PickImage({ pick }: { pick: GiftPick }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      q: pick.searchQuery || pick.name,
      tags: pick.tags.join(","),
    });
    fetch(`/api/resolve-image?${params}`)
      .then((r) => r.json())
      .then((data: { imageUrl: string | null }) => {
        if (active && data.imageUrl) setSrc(data.imageUrl);
        else if (active) setFailed(true);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [pick.searchQuery, pick.name, pick.tags]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg bg-stone-100 object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-3xl">
      {pickEmoji(pick.tags)}
    </div>
  );
}

export function PickCard({ pick }: { pick: GiftPick }) {
  const href = buildAffiliateUrl(pick.store, pick.searchQuery);

  return (
    <div className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
      <PickImage pick={pick} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-heading text-base font-medium text-stone-900">{pick.name}</h3>
          <span className="text-sm font-medium text-stone-500">{pick.price}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">{pick.why}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {pick.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener"
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5",
            "text-sm font-medium text-white transition-colors hover:bg-amber-600"
          )}
        >
          Find it on {STORE_LABEL[pick.store]}
          <span aria-hidden>&rarr;</span>
        </a>
      </div>
    </div>
  );
}
