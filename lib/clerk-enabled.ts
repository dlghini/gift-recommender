// Loved Ones/accounts are opt-in on top of an otherwise fully anonymous app.
// Until Clerk keys are actually configured (a manual step outside this repo —
// see the Loved Ones implementation plan), every Clerk hook/component would
// throw as soon as it mounted. Gating on this constant keeps the rest of the
// site (wizard included) working even when Clerk isn't wired up yet, matching
// this codebase's existing "optional integration fails open" pattern.
export const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
