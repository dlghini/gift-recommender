import Link from "next/link";
import { Gift } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";

export function Nav() {
  return (
    <header className="border-b border-stone-100 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-stone-800">
          <Gift className="h-5 w-5 text-amber-500" />
          <span className="font-heading font-semibold text-sm">The Gift Whisperer</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-stone-600">
          <Link href="/wizard" className="hover:text-stone-900">
            Find a gift
          </Link>
          <Link href="/loved-ones" className="hover:text-stone-900">
            Loved ones
          </Link>
          {CLERK_ENABLED && (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-amber-600 hover:text-amber-700">
                    Sign in
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
