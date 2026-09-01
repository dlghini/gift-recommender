import Link from "next/link";
import { Gift, Heart } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/clerk-enabled";
import { LovedOnesNudge } from "@/components/loved-ones-nudge";

export function Nav() {
  return (
    <header className="border-b border-stone-100 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-stone-800">
          <Gift className="h-5 w-5 text-amber-500" />
          <span className="font-heading font-semibold text-sm whitespace-nowrap">The Gift Whisperer</span>
        </Link>
        <nav className="flex items-center gap-4 whitespace-nowrap text-sm text-stone-600 sm:gap-5">
          <Link href="/wizard" className="hidden hover:text-stone-900 sm:inline">
            Find a gift
          </Link>
          <span className="group relative inline-flex">
            <Link href="/loved-ones" className="inline-flex items-center gap-1.5 hover:text-stone-900">
              <Heart className="h-4 w-4 text-rose-400" />
              Loved ones
              <span className="hidden rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-bold uppercase leading-tight tracking-wide text-amber-700 sm:inline-block">
                New
              </span>
            </Link>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 hidden w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 translate-y-1 rounded-xl border border-amber-100 bg-white p-3 text-left opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:block"
            >
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-amber-100 bg-white" />
              <span className="mb-1 block font-heading text-xs font-semibold text-stone-900">
                Optional, and free
              </span>
              <span className="block text-xs leading-relaxed text-stone-600">
                The gift finder works without an account. Loved Ones adds a saved profile for
                each person, a history of what you&apos;ve given, and a reminder before
                birthdays, holidays, and anniversaries.
              </span>
            </span>
          </span>
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
      <LovedOnesNudge />
    </header>
  );
}
