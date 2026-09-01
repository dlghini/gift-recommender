import type { getDb } from "@/lib/db";

type Sql = ReturnType<typeof getDb>;

/**
 * Returns a stable per-user unsubscribe token, creating the `user_email_prefs`
 * row (and the token) if needed. Used to build the unsubscribe link in every
 * outgoing email, so a recipient can opt out without signing in (CAN-SPAM).
 */
export async function ensureUnsubToken(sql: Sql, clerkUserId: string): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "");
  const [row] = (await sql`
    INSERT INTO user_email_prefs (clerk_user_id, unsubscribe_token)
    VALUES (${clerkUserId}, ${token})
    ON CONFLICT (clerk_user_id) DO UPDATE
      SET unsubscribe_token = COALESCE(user_email_prefs.unsubscribe_token, EXCLUDED.unsubscribe_token)
    RETURNING unsubscribe_token
  `) as { unsubscribe_token: string }[];
  return row.unsubscribe_token;
}

export function unsubscribeUrl(token: string, type: "digest" | "reminders"): string {
  return `https://www.thegiftwhisperer.gifts/api/email-unsubscribe?token=${token}&type=${type}`;
}
