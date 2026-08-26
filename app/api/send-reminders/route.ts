import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { findDueOccasions, type LovedOneRow } from "@/lib/reminders";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderReminderEmail(label: string, lovedOneId: string): string {
  const url = `https://www.thegiftwhisperer.gifts/wizard?lovedOneId=${lovedOneId}`;
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fffbeb;">
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#1c1917;text-align:center;margin-bottom:4px;">🎁 The Gift Whisperer</h1>
      <p style="text-align:center;color:#78716c;font-size:14px;margin-bottom:24px;">A heads up on an upcoming occasion</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #f0e6d2;">
        <tr><td style="padding:24px;text-align:center;">
          <p style="font-size:16px;color:#1c1917;margin:0 0 16px 0;">${escapeHtml(label)} is coming up.</p>
          <a href="${url}" style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">Get gift ideas →</a>
        </td></tr>
      </table>
    </div>`;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.REMINDER_CRON_SECRET}`) {
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

    let sent = 0;
    const clerk = await clerkClient();

    for (const occasion of dueOccasions) {
      // Atomic dedup: only proceed if this is the first time we're logging this
      // occasion for this year — protects against the external scheduler firing
      // more than once, or retrying after a failure.
      const [logged] = await sql`
        INSERT INTO reminder_log (loved_one_id, occasion_key, occasion_year)
        VALUES (${occasion.lovedOneId}, ${occasion.occasionKey}, ${occasion.occasionYear})
        ON CONFLICT (loved_one_id, occasion_key, occasion_year) DO NOTHING
        RETURNING id
      `;
      if (!logged) continue;

      const clerkUserId = ownerById.get(occasion.lovedOneId);
      if (!clerkUserId) continue;

      try {
        const user = await clerk.users.getUser(clerkUserId);
        const primaryEmail =
          user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
          user.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) continue;

        await resend.emails.send({
          from: "The Gift Whisperer <hello@thegiftwhisperer.gifts>",
          to: primaryEmail,
          subject: `${occasion.label} is coming up 🎁`,
          html: renderReminderEmail(occasion.label, occasion.lovedOneId),
        });
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
