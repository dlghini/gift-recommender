"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { Heart, X } from "lucide-react";

const STORAGE_KEY = "gw:lovedones-nudge:v1";

// First-visit nudge pointing at the "Loved ones" nav tab. Shows once per
// browser, a short beat after load, and never on the Loved Ones page itself.
export function LovedOnesNudge() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname?.startsWith("/loved-ones")) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      dismissed = false;
    }
    if (dismissed) return;
    const timer = setTimeout(() => {
      setVisible(true);
      posthog?.capture("loved_ones_nudge_shown");
    }, 1200);
    return () => clearTimeout(timer);
  }, [pathname, posthog]);

  function close(reason: "dismissed" | "clicked") {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // private mode / storage disabled — the nudge just reappears next load
    }
    setVisible(false);
    posthog?.capture(reason === "clicked" ? "loved_ones_nudge_clicked" : "loved_ones_nudge_dismissed");
  }

  if (!mounted || pathname?.startsWith("/loved-ones")) return null;

  return (
    <div
      className={`fixed right-3 top-[4.25rem] z-50 w-80 max-w-[calc(100vw-1.5rem)] transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
      }`}
    >
      <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 border-l border-t border-amber-100 bg-white" />
      <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-lg">
        <button
          type="button"
          onClick={() => close("dismissed")}
          aria-label="Dismiss"
          className="absolute right-2.5 top-2.5 text-stone-300 hover:text-stone-500"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-1 flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-rose-500" />
          <span className="font-heading text-sm font-semibold text-stone-900">New: Loved Ones</span>
        </div>
        <p className="text-xs leading-relaxed text-stone-600">
          Keep a profile for each person you shop for: saved ideas, a history of what
          you&apos;ve given, and a reminder before every birthday, holiday, and
          anniversary. The gift finder still works without an account.
        </p>
        <Link
          href="/loved-ones"
          onClick={() => close("clicked")}
          className="mt-2.5 inline-block text-xs font-semibold text-amber-600 hover:text-amber-700"
        >
          Take a look &rarr;
        </Link>
      </div>
    </div>
  );
}
