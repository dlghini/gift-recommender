import Anthropic from "@anthropic-ai/sdk";
import { clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { findDueOccasions, type DueOccasion, type LovedOneRow } from "@/lib/reminders";
import { buildAffiliateUrl, type Store } from "@/lib/affiliate";
import { ensureUnsubToken, unsubscribeUrl } from "@/lib/email-prefs";
import { MAILING_ADDRESS } from "@/lib/site";

// How far ahead the monthly digest looks. Wider than the 14-day single-event
// reminder window so one email covers "the month ahead" plus a little slack.
const DIGEST_LEAD_DAYS = 45;

const SITE = "https://www.thegiftwhisperer.gifts";

const client = new Anthropic();

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
  interests: string[] | null;
  interests_notes: string | null;
}

interface PersonBlock {
  lovedOne: LovedOneFull;
  occasions: DueOccasion[];
}

interface GeneratedIdea {
  name: string;
  why: string;
  store: Store;
  searchQuery: string;
}

const IDEAS_SCHEMA = {
  type: "object",
  properties: {
    people: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lovedOneId: { type: "string" },
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                why: { type: "string" },
                store: { type: "string", enum: ["amazon", "etsy", "viator"] },
                searchQuery: { type: "string" },
              },
              required: ["name", "why", "store", "searchQuery"],
              additionalProperties: false,
            },
          },
        },
        required: ["lovedOneId", "ideas"],
        additionalProperties: false,
      },
    },
  },
  required: ["people"],
  additionalProperties: false,
};

// One Claude call per user: a couple of concrete ideas per person, keyed by id.
// Returns an empty map on any failure so the email still goes out (occasion list
// + wizard links), just without inline ideas.
async function generateIdeas(blocks: PersonBlock[]): Promise<Map<string, GeneratedIdea[]>> {
  const result = new Map<string, GeneratedIdea[]>();
  const people = blocks.map(({ lovedOne, occasions }) => {
    const interests = (lovedOne.interests ?? []).join(", ") || "unknown";
    const notes = lovedOne.interests_notes ? ` Notes: ${lovedOne.interests_notes}.` : "";
    const occ = occasions
      .map((o) => `${o.label} (${formatOccasionDate(o.date)})`)
      .join("; ");
    return `- id ${lovedOne.id}: ${lovedOne.name}, ${lovedOne.relationship}. Interests: ${interests}.${notes} Coming up: ${occ}`;
  });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: [
        {
          type: "text",
          text: [
            "You suggest gift ideas for a monthly summary email. For each person, give exactly 2 specific, real, widely-available gift ideas suited to their interests and the upcoming occasion.",
            "Each idea needs: `name` (a concrete product or experience, not a category), `why` (one warm sentence, plain punctuation, no em dashes), `store`, and `searchQuery` (2 to 5 words that reliably surface it).",
            "`store` is one of: \"etsy\" for handmade, personalized, custom, artisan, or vintage physical items; \"viator\" for real in-person bookable experiences (tours, classes, tastings) - never virtual/online-only ones; \"amazon\" for mainstream branded products, books, electronics, and anything mass-produced.",
            "Optimize `searchQuery` for the chosen store's search. Do not repeat an idea across people.",
          ].join(" "),
        },
      ],
      output_config: { format: { type: "json_schema", schema: IDEAS_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `People and their upcoming occasions:\n${people.join("\n")}`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return result;
    const data = JSON.parse(textBlock.text) as {
      people: { lovedOneId: string; ideas: GeneratedIdea[] }[];
    };
    for (const p of data.people) {
      result.set(p.lovedOneId, p.ideas.slice(0, 2));
    }
  } catch (error) {
    console.error("[send-digest] idea generation failed", error);
  }
  return result;
}

function renderDigestEmail(
  blocks: PersonBlock[],
  ideasByLovedOne: Map<string, GeneratedIdea[]>,
  unsubUrl: string
): string {
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

      const ideas = ideasByLovedOne.get(lovedOne.id) ?? [];
      const ideasHtml = ideas.length
        ? `<ul style="margin:12px 0 0 0;padding-left:18px;">${ideas
            .map(
              (idea) =>
                `<li style="font-size:13px;color:#2f3a33;margin-bottom:8px;"><a href="${buildAffiliateUrl(
                  idea.store,
                  idea.searchQuery || idea.name
                )}" style="color:#7a3a28;text-decoration:none;font-weight:600;">${escapeHtml(
                  idea.name
                )}</a><br><span style="color:#6c756b;">${escapeHtml(idea.why)}</span></li>`
            )
            .join("")}</ul>`
        : "";

      const wizardUrl = `${SITE}/wizard?lovedOneId=${lovedOne.id}`;

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e4d9cf;margin-bottom:12px;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:16px;color:#2f3a33;">${escapeHtml(
              lovedOne.name
            )} <span style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8f978d;">&middot; ${escapeHtml(
              lovedOne.relationship
            )}</span></p>
            ${occLines}
            ${ideasHtml}
            <p style="margin:14px 0 0 0;"><a href="${wizardUrl}" style="font-size:13px;color:#7a3a28;text-decoration:none;font-weight:600;">More ideas for ${escapeHtml(
              lovedOne.name
            )} &rarr;</a></p>
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
        birthday_reminder_enabled, anniversary_reminder_enabled,
        interests, interests_notes
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

        const ideasByLovedOne = await generateIdeas(blocks);
        const unsubUrl = unsubscribeUrl(await ensureUnsubToken(sql, clerkUserId), "digest");

        const { error: sendResultError } = await getResend().emails.send({
          from: "The Gift Whisperer <hello@thegiftwhisperer.gifts>",
          to: primaryEmail,
          subject: "Your gifting month ahead",
          html: renderDigestEmail(blocks, ideasByLovedOne, unsubUrl),
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
