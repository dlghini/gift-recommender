import { Show, SignInButton } from "@clerk/nextjs";
import { GiftListsDashboard } from "@/components/gift-lists-dashboard";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";
import { routeMeta } from "@/lib/site";

export const metadata = {
  ...routeMeta(
    "/lists",
    "Group gift lists",
    "Build a shared gift list for someone and send the link to family or friends. Everyone claims a gift so nobody doubles up."
  ),
  robots: { index: false, follow: false },
};

export default function ListsPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {CLERK_ENABLED ? (
          <>
            <Show when="signed-in">
              <GiftListsDashboard />
            </Show>
            <Show when="signed-out">
              <div className="text-center py-20">
                <h1 className="font-heading text-2xl text-stone-900 mb-2">Group gift lists</h1>
                <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
                  Sign in to build a shared gift list for someone and send the link to family or
                  friends. Everyone claims a gift so nobody doubles up.
                </p>
                <SignInButton mode="modal" forceRedirectUrl="/lists">
                  <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </Show>
          </>
        ) : (
          <div className="text-center py-20">
            <h1 className="font-heading text-2xl text-stone-900 mb-2">Group gift lists are almost here</h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              We&apos;re still finishing setup on this one. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
