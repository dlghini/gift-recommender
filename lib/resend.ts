import { Resend } from "resend";

// Lazy singleton. The `resend` constructor throws on a missing API key, and
// `next build`'s "collecting page data" step evaluates every route module — so a
// module-level `new Resend(process.env.RESEND_API_KEY)` fails the whole build in
// any environment without RESEND_API_KEY set (e.g. Vercel Preview deployments,
// which only carry Production env vars if explicitly shared). Constructing on
// first use instead keeps the build green everywhere and defers the failure to
// an actual send. Mirrors lib/db.ts's getDb().
let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}
