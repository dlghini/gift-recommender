"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { getIsInternal } from "@/lib/wizard-telemetry";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
