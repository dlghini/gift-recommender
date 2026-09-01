import { getDb } from "@/lib/db";

// One-click unsubscribe from an email footer. No auth: the token identifies the
// user. A GET flips the pref immediately (and offers a re-subscribe link);
// `resubscribe=1` turns it back on.

type EmailType = "digest" | "reminders";

function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
    <body style="font-family:Helvetica,Arial,sans-serif;background:#e9eee6;margin:0;padding:48px 24px;color:#2f3a33;">
      <div style="max-width:420px;margin:0 auto;background:#fff;border:1px solid #e4d9cf;border-radius:12px;padding:28px;text-align:center;">
        <p style="font-family:Georgia,serif;font-size:20px;margin:0 0 12px;">The Gift Whisperer</p>
        ${body}
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type") as EmailType | null;
    const resubscribe = url.searchParams.get("resubscribe") === "1";

    if (!token || (type !== "digest" && type !== "reminders")) {
      return page("Unsubscribe", `<p style="font-size:14px;color:#6c756b;">This link looks incomplete. You can manage email in your account on the Loved ones page.</p>`);
    }

    const sql = getDb();
    const enabled = resubscribe;
    const [row] =
      type === "digest"
        ? await sql`UPDATE user_email_prefs SET digest_enabled = ${enabled}, updated_at = NOW() WHERE unsubscribe_token = ${token} RETURNING clerk_user_id`
        : await sql`UPDATE user_email_prefs SET reminders_enabled = ${enabled}, updated_at = NOW() WHERE unsubscribe_token = ${token} RETURNING clerk_user_id`;

    if (!row) {
      return page("Unsubscribe", `<p style="font-size:14px;color:#6c756b;">This link has expired or is no longer valid.</p>`);
    }

    const label = type === "digest" ? "the monthly summary" : "occasion reminders";
    if (resubscribe) {
      return page("Subscribed", `<p style="font-size:15px;">You're back on for ${label}.</p>`);
    }
    const back = `${url.origin}/api/email-unsubscribe?token=${token}&type=${type}&resubscribe=1`;
    return page(
      "Unsubscribed",
      `<p style="font-size:15px;">You're unsubscribed from ${label}.</p>
       <p style="font-size:13px;color:#8f978d;margin-top:14px;">Didn't mean to? <a href="${back}" style="color:#7a3a28;">Turn it back on</a>.</p>`
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/email-unsubscribe]", msg);
    return page("Unsubscribe", `<p style="font-size:14px;color:#6c756b;">Something went wrong. Please try again from the link in your email.</p>`);
  }
}
