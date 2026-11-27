"use client";

import posthog from "posthog-js";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { initPostHog } from "@/lib/posthog-init";

// Next catches render errors before they reach window.onerror, so PostHog's
// automatic capture never sees them. The error screens report them by hand.
export function ErrorScreen({
  error,
  onRetry,
  boundary,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
  boundary: "page" | "root";
}) {
  useEffect(() => {
    initPostHog();
    posthog.captureException(error, {
      error_boundary: boundary,
      error_digest: error.digest,
    });
  }, [error, boundary]);

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-amber-50 px-4 py-16 text-center">
      <h1 className="font-heading text-3xl text-stone-900">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-stone-600">
        This page ran into a problem. Try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Button size="lg" onClick={onRetry}>
          Try again
        </Button>
        {/* A full page load, not client navigation, to start clean. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="text-sm text-stone-600 underline underline-offset-4">
          Go to the homepage
        </a>
      </div>
    </div>
  );
}
