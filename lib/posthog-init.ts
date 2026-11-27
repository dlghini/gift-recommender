import posthog from "posthog-js";
import { getIsInternal } from "@/lib/wizard-telemetry";

/**
 * Starts PostHog once. Safe to call repeatedly: the provider calls it on every
 * normal load, and the error screens call it too, because after a crash the
 * provider may never have run.
 */
export function initPostHog(): void {
  if (posthog.__loaded) return;

  posthog.init("phc_usMgxvSLpr9iEkaqZNJ56ygGLnqTKFvNrsJEXMeW7Xdd", {
    // Relative path so requests go through our own domain (see the
    // rewrites in next.config.ts) instead of directly to posthog.com,
    // which ad blockers filter by domain. ui_host still points at the
    // real PostHog domain — that's what the in-app toolbar/links need.
    api_host: "/relay",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    // Sends uncaught errors and unhandled promise rejections as `$exception`
    // events (not console.error calls). Set here rather than in the PostHog
    // dashboard so it is visible in the repo.
    capture_exceptions: true,
    loaded: (ph) => {
      // Tag browsers the app already treats as internal/dev traffic (same
      // signal lib/wizard-telemetry.ts uses for run_events.is_internal —
      // localhost/.vercel.app previews, or a browser flagged with
      // ?internal=1) with PostHog's own $internal_or_test_user person
      // property. Nothing set this before, so the project's "Internal /
      // Test users" cohort had 0 members despite existing since launch.
      // person_profiles stays "identified_only" — this only creates a
      // profile for flagged browsers, real anonymous visitors are unaffected.
      if (getIsInternal()) {
        ph.setPersonProperties({ $internal_or_test_user: true });
      }
    },
  });
}
