import { clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { findDueOccasions, type DueOccasion, type LovedOneRow } from "@/lib/reminders";
import { ensureUnsubToken, unsubscribeUrl } from "@/lib/email-prefs";
import { MAILING_ADDRESS } from "@/lib/site";

// How far ahead the monthly digest looks. Wider than the 14-day single-event
// reminder window so one email covers "the month ahead" plus a little slack.
const DIGEST_LEAD_DAYS = 45;

const SITE = "https://www.thegiftwhisperer.gifts";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatOccasionDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

interface LovedOneFull extends LovedOneRow {
  clerk_user_id: string;
}

interface PersonBlock {
  lovedOne: LovedOneFull;
  occasions: DueOccasion[];
}

// The digest is a nudge, not a recommendation: one card per person with their
// upcoming dates and a button into the wizard, where the real (tagged) ideas
// live. No LLM call, no failure mode.
function renderDigestEmail(blocks: PersonBlock[], unsubUrl: string): string {
  const occasionCount = blocks.reduce((n, b) => n + b.occasions.length, 0);

  const personHtml = blocks
    .map(({ lovedOne, occasions }) => {
      const occLines = occasions
        .map(
          (o) =>
            `<p style="margin:0 0 4px 0;font-size:14px;color:#2f3a33;">${escapeHtml(
              o.label
            )} &middot; <span style="color:#6c756b;">${formatOccasionDate(o.date)}</span></p>`
        )
        .join("");

      const wizardUrl = `${SITE}/wizard?lovedOneId=${lovedOne.id}`;

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e4d9cf;margin-bottom:14px;">
          <tr><td style="padding:24px;text-align:center;">
            <p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:17px;color:#2f3a33;">${escapeHtml(
              lovedOne.name
            )} <span style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8f978d;">&middot; ${escapeHtml(
              lovedOne.relationship
            )}</span></p>
            ${occLines}
            <div style="margin-top:18px;">
              <a href="${wizardUrl}" style="display:inline-block;background:#a8543a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">Get gift ideas &rarr;</a>
            </div>
          </td></tr>
        </table>`;
    })
    .join("");

  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#e9eee6;">
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#2f3a33;text-align:center;margin:0 0 4px 0;">The Gift Whisperer</h1>
      <p style="text-align:center;color:#6c756b;font-size:14px;margin:0 0 20px 0;">Your gifting month ahead</p>
      <p style="font-size:14px;color:#2f3a33;margin:0 0 16px 0;">${occasionCount} occasion${
    occasionCount === 1 ? "" : "s"
  } coming up in the next few weeks.</p>
      ${personHtml}
      <p style="font-size:12px;color:#8f978d;text-align:center;margin:24px 0 0 0;line-height:1.6;">
        You get this monthly summary because you have a Gift Whisperer account.
        <a href="${unsubUrl}" style="color:#8f978d;">Unsubscribe</a> &middot;
        <a href="${SITE}/loved-ones" style="color:#8f978d;">manage email</a><br>
        ${MAILING_ADDRESS}
      </p>
    </div>`;
}

export const dynamic = "force-dynamic";

async function handleDigestRun(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get("authorization");
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
    `) as LovedOneFull[];

    const prefRows = (await sql`
      SELECT loved_one_id, holiday_key FROM holiday_reminder_prefs WHERE enabled = false
    `) as { loved_one_id: string; holiday_key: string }[];
    const disabledHolidayKeys = new Set(prefRows.map((r) => `${r.loved_one_id}:${r.holiday_key}`));

    const optedOut = new Set(
      (
        (await sql`
          SELECT clerk_user_id FROM user_email_prefs WHERE digest_enabled = false
        `) as { clerk_user_id: string }[]
      ).map((r) => r.clerk_user_id)
    );

    const dueOccasions = findDueOccasions(lovedOnes, disabledHolidayKeys, new Date(), DIGEST_LEAD_DAYS);
    const lovedOneById = new Map(lovedOnes.map((lo) => [lo.id, lo]));

    // occasions -> per user -> per person, sorted soonest first within a person.
    const byUser = new Map<string, Map<string, PersonBlock>>();
    for (const occ of dueOccasions) {
      const lo = lovedOneById.get(occ.lovedOneId);
      if (!lo) continue;
      let personMap = byUser.get(lo.clerk_user_id);
      if (!personMap) {
        personMap = new Map();
        byUser.set(lo.clerk_user_id, personMap);
      }
      let block = personMap.get(lo.id);
      if (!block) {
        block = { lovedOne: lo, occasions: [] };
        personMap.set(lo.id, block);
      }
      block.occasions.push(occ);
    }

    const yearMonth = new Date().toISOString().slice(0, 7);
    const clerk = await clerkClient();
    let sent = 0;
    let skippedOptOut = 0;

    for (const [clerkUserId, personMap] of byUser) {
      if (optedOut.has(clerkUserId)) {
        skippedOptOut += 1;
        continue;
      }

      // Atomic dedup: first writer for this user+month wins.
      const [logged] = await sql`
        INSERT INTO digest_log (clerk_user_id, year_month)
        VALUES (${clerkUserId}, ${yearMonth})
        ON CONFLICT (clerk_user_id, year_month) DO NOTHING
        RETURNING id
      `;
      if (!logged) continue;

      const blocks = [...personMap.values()]
        .map((b) => ({
          ...b,
          occasions: [...b.occasions].sort((a, z) => a.date.getTime() - z.date.getTime()),
        }))
        .sort((a, z) => a.occasions[0].date.getTime() - z.occasions[0].date.getTime());

      try {
        const user = await clerk.users.getUser(clerkUserId);
        const primaryEmail =
          user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
          user.emailAddresses[0]?.emailAddress;
        if (!primaryEmail) continue;

        const unsubUrl = unsubscribeUrl(await ensureUnsubToken(sql, clerkUserId), "digest");

        const { error: sendResultError } = await getResend().emails.send({
          from: "The Gift Whisperer <hello@thegiftwhisperer.gifts>",
          to: primaryEmail,
          subject: "Your gifting month ahead",
          html: renderDigestEmail(blocks, unsubUrl),
          headers: {
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        if (sendResultError) {
          console.error("[send-digest] Resend error", clerkUserId, sendResultError);
          continue;
        }
        sent += 1;
      } catch (sendError) {
        console.error("[send-digest] failed for user", clerkUserId, sendError);
      }
    }

    return Response.json({ ok: true, users: byUser.size, sent, skippedOptOut });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/send-digest]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export const GET = handleDigestRun;
export const POST = handleDigestRun;
