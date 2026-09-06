import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";

// clerkMiddleware() throws as soon as it runs without a publishable key, and
// this proxy runs on nearly every request — so it has to stay a pure pass
// through until Clerk keys are actually configured, or it takes down the
// entire site (including the anonymous wizard) rather than just Loved Ones.
export default CLERK_ENABLED ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // /relay is excluded: it's the PostHog reverse-proxy path (see
    // next.config.ts), high-volume and not Clerk-relevant, and PostHog's
    // own docs warn a catch-all middleware matcher can intercept and break
    // proxied ingestion requests before the rewrite ever runs.
    "/((?!_next|relay|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
