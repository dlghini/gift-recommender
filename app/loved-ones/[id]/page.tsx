import type { Metadata } from "next";
import { Show, SignInButton } from "@clerk/nextjs";
import { LovedOneDetail } from "@/components/loved-one-detail";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";

// Per-user, auth-gated content — never index individual profile pages.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LovedOneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!CLERK_ENABLED) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <p className="font-heading text-2xl text-stone-900">Loved ones is almost here</p>
      </div>
    );
  }

  return (
    <>
      <Show when="signed-in">
        <LovedOneDetail id={id} />
      </Show>
      <Show when="signed-out">
        <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="font-heading text-2xl text-stone-900 mb-4">Sign in to view this profile</p>
            <SignInButton mode="modal">
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </Show>
    </>
  );
}
