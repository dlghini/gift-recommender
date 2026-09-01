import { clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { findDueOccasions, type LovedOneRow } from "@/lib/reminders";
import { ensureUnsubToken, unsubscribeUrl } from "@/lib/email-prefs";
import { MAILING_ADDRESS } from "@/lib/site";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderReminderEmail(label: string, lovedOneId: string, unsubUrl: string): string {
  const url = `https://www.thegiftwhisperer.gifts/wizard?lovedOneId=${lovedOneId}`;
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#e9eee6;">
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#2f3a33;text-align:center;margin-bottom:4px;">The Gift Whisperer</h1>
      <p style="text-align:center;color:#6c756b;font-size:14px;margin-bottom:24px;">A heads up on an upcoming occasion</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e4d9cf;">
        <tr><td style="padding:24px;text-align:center;">
          <p style="font-size:16px;color:#2f3a33;margin:0 0 16px 0;">${escapeHtml(label)} is coming up.</p>
          <a href="${url}" style="display:inline-block;background:#a8543a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">Get gift ideas &rarr;</a>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#8f978d;text-align:center;margin:24px 0 0 0;line-height:1.6;">
        You get occasion reminders because you saved this person in your Gift Whisperer account.
        <a href="${unsubUrl}" style="color:#8f978d;">Unsubscribe from reminders</a><br>
        ${MAILING_ADDRESS}
      </p>
    </div>`;
}

// Always run fresh — this reads "today" and hits the DB/email provider, never cacheable.
export const dynamic = "force-dynamic";

async function handleReminderRun(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get("authorization");
    // Vercel Cron auto-injects `Authorization: Bearer $CRON_SECRET`; accept either
    // env var name so a manual curl using REMINDER_CRON_SECRET still works too.
    const validSecrets = [process.env.CRON_SECRET, process.env.REMINDER_CRON_SECRET].filter(Boolean);
    if (!validSecrets.some((secret) => authHeader === `Bearer ${secret}`)) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sql = getDb();
    const lovedOnes = (await sql`
      SELECT id, clerk_user_id, name, relationship,
        birthday_month, birthday_day, anniversary_month, anniversary_day,
        birthday_reminder_enabled, anniversary_reminder_enabled
      FROM loved_ones
    `) as (LovedOneRow & { clerk_user_id: string })[];

    const prefRows = (await sql`
      SELECT loved_one_id, holiday_key FROM holiday_reminder_prefs WHERE enabled = false
    `) as { loved_one_id: string; holiday_key: string }[];
    const disabledHolidayKeys = new Set(prefRows.map((r) => `${r.loved_one_id}:${r.holiday_key}`));

    const dueOccasions = findDueOccasions(lovedOnes, disabledHolidayKeys);
    const ownerById = new Map(lovedOnes.map((lo) => [lo.id, lo.clerk_user_id]));

    const remindersOptedOut = new Set(
      (
        (await sql`
          SELECT clerk_user_id FROM user_email_prefs WHERE reminders_enabled = false
        `) as { clerk_user_id: string }[]
      ).map((r) => r.clerk_user_id)
    );

    let sent = 0;
    const clerk = await clerkClient();

    for (const occasion of dueOccasions) {
      const clerkUserId = ownerById.get(occasion.lovedOneId);
      if (!clerkUserId || remindersOptedOut.has(clerkUserId)) continue;

      // Atomic dedup: only proceed if this is the first time we're logging this
      // occasion for this year — protects against the external scheduler firing
      // more than once, or retrying after a failure. Done after the opt-out check
      // so an opted-out user isn't silently marked "sent" for the year.
      const [logged] = await sql`
        INSERT INTO reminder_log (loved_one_id, occasion_key, occasion_year)
        VALUES (${occasion.lovedOneId}, ${occasion.occasionKey}, ${occasion.occasionYear})
        ON CONFLICT (loved_one_id, occasion_key, occasion_year) DO NOTHING
        RETURNING id
      `;
      if (!logged) continue;

      try {
        const user = await clerk.users.getUser(clerkUserId);
        const primaryEmail =
          user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
          user.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) continue;

        const unsubUrl = unsubscribeUrl(await ensureUnsubToken(sql, clerkUserId), "reminders");
        const { error: sendResultError } = await getResend().emails.send({
          from: "The Gift Whisperer <hello@thegiftwhisperer.gifts>",
          to: primaryEmail,
          subject: `${occasion.label} is coming up`,
          html: renderReminderEmail(occasion.label, occasion.lovedOneId, unsubUrl),
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        if (sendResultError) {
          console.error("[send-reminders] Resend returned an error", occasion, sendResultError);
          continue;
        }
        sent += 1;
      } catch (sendError) {
        console.error("[send-reminders] failed to send", occasion, sendError);
      }
    }

    return Response.json({ ok: true, due: dueOccasions.length, sent });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/send-reminders]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// GET is what Vercel Cron actually calls; POST is kept for manual/external triggering.
export const GET = handleReminderRun;
export const POST = handleReminderRun;
