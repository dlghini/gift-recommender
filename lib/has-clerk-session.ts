// Clerk sets a non-httpOnly `__client_uat` cookie specifically so app code
// can cheaply check "has this browser ever signed in" without loading the
// full Clerk script — "0" or absent means never signed in here. Used to
// decide whether it's worth paying for Clerk at all; see
// components/lazy-clerk-provider.tsx.
export function hasClerkSessionCookie(cookieHeader: string): boolean {
  const match = cookieHeader.match(/(?:^|;\s*)__client_uat=([^;]*)/);
  return !!match && match[1] !== "0" && match[1] !== "";
}

/** Client-side variant, reads document.cookie directly. */
export function hasClerkSession(): boolean {
  if (typeof document === "undefined") return false;
  return hasClerkSessionCookie(document.cookie);
}
