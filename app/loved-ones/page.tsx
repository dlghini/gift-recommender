import type { Metadata } from "next";
import { Show, SignInButton } from "@clerk/nextjs";
import { LovedOnesList } from "@/components/loved-ones-list";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Loved Ones",
  description:
    "Save gift ideas by person, keep a history of what you've given, and get a reminder before each occasion.",
  alternates: { canonical: "/loved-ones" },
};

export default function LovedOnesPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {CLERK_ENABLED ? (
          <>
            <Show when="signed-in">
              <LovedOnesList />
            </Show>
            <Show when="signed-out">
              <div className="text-center py-20">
                <p className="font-heading text-2xl text-stone-900 mb-2">Keep track of the people you love</p>
                <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
                  Sign in to save gift ideas by person, log what you&apos;ve already given them, and get a
                  reminder before their birthday and other special occasions.
                </p>
                <SignInButton mode="modal" forceRedirectUrl="/loved-ones">
                  <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </Show>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-heading text-2xl text-stone-900 mb-2">Loved ones is almost here</p>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              We&apos;re still finishing setup on this one — check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
