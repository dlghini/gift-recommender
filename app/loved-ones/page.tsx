import { Show, SignInButton } from "@clerk/nextjs";
import { LovedOnesList } from "@/components/loved-ones-list";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";
import { routeMeta } from "@/lib/site";

export const metadata = routeMeta(
  "/loved-ones",
  "Loved Ones",
  "Create a free profile for each person you shop for: save gift ideas, keep a history of what you've given, and get a nudge before every occasion."
);

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
                <h1 className="font-heading text-2xl text-stone-900 mb-2">Keep track of the people you love</h1>
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
            <h1 className="font-heading text-2xl text-stone-900 mb-2">Loved ones is almost here</h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              We&apos;re still finishing setup on this one — check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
