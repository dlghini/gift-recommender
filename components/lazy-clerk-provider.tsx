"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ClerkProvider, useClerk } from "@clerk/nextjs";

// Rendering <ClerkProvider> loads Clerk's full cross-origin script
// immediately, for every visitor, whether or not anyone's signed in — real
// weight paid by the anonymous wizard, which is most of this site's
// traffic, and a likely contributor to a crash reported in a
// memory-constrained mobile browsing context (see MEMORY.md). This defers
// that: the real ClerkProvider only mounts once one of these is true:
//   - this browser already has a Clerk session (checked via a cookie,
//     server-side on first render so there's no flash for returning users)
//   - the current route genuinely needs it (Loved Ones / lists)
//   - someone explicitly asks to sign in (requestClerk())
const CLERK_REQUIRED_PREFIXES = ["/loved-ones", "/lists"];

function pathNeedsClerk(pathname: string | null): boolean {
  if (!pathname) return false;
  return CLERK_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

interface ClerkLazyContextValue {
  /** True once the real <ClerkProvider> is mounted — safe to call useUser()/useAuth() etc. */
  clerkReady: boolean;
  /** Mount the real ClerkProvider now (e.g. an anonymous visitor clicked "Sign in"). */
  requestClerk: () => void;
}

const ClerkLazyContext = createContext<ClerkLazyContextValue>({
  clerkReady: false,
  requestClerk: () => {},
});

/** Read clerkReady/requestClerk from anywhere under LazyClerkProvider. */
export function useClerkLazy(): ClerkLazyContextValue {
  return useContext(ClerkLazyContext);
}

// Rendered inside the real ClerkProvider once mounted, purely to open the
// sign-in modal the moment Clerk finishes loading, when that mount was
// triggered by someone clicking a plain (pre-Clerk) "Sign in" button rather
// than by an existing session or a Clerk-requiring route.
function AutoOpenSignIn({ pending, onOpened }: { pending: boolean; onOpened: () => void }) {
  const clerk = useClerk();
  useEffect(() => {
    if (!pending) return;
    clerk.openSignIn();
    onOpened();
  }, [pending, clerk, onOpened]);
  return null;
}

export function LazyClerkProvider({
  children,
  initialWantsClerk,
}: {
  children: React.ReactNode;
  initialWantsClerk: boolean;
}) {
  const pathname = usePathname();
  const [wantsClerk, setWantsClerk] = useState(() => initialWantsClerk || pathNeedsClerk(pathname));
  const [pendingSignIn, setPendingSignIn] = useState(false);

  // Route changes (e.g. clicking "Loved ones" in the nav) can require
  // Clerk even when the initial server-rendered page didn't.
  useEffect(() => {
    if (pathNeedsClerk(pathname)) setWantsClerk(true);
  }, [pathname]);

  function requestClerk() {
    setPendingSignIn(true);
    setWantsClerk(true);
  }

  if (!wantsClerk) {
    return <ClerkLazyContext.Provider value={{ clerkReady: false, requestClerk }}>{children}</ClerkLazyContext.Provider>;
  }

  return (
    <ClerkProvider>
      <ClerkLazyContext.Provider value={{ clerkReady: true, requestClerk }}>
        <AutoOpenSignIn pending={pendingSignIn} onOpened={() => setPendingSignIn(false)} />
        {children}
      </ClerkLazyContext.Provider>
    </ClerkProvider>
  );
}
