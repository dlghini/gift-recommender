import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// Per-user email preferences. No row for a user means "all defaults" (on), so
// GET falls back to true and PATCH upserts only the fields it's given.

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const sql = getDb();
    const [row] = (await sql`
      SELECT digest_enabled, reminders_enabled
      FROM user_email_prefs WHERE clerk_user_id = ${userId}
    `) as { digest_enabled: boolean; reminders_enabled: boolean }[];

    return Response.json({
      digestEnabled: row?.digest_enabled ?? true,
      remindersEnabled: row?.reminders_enabled ?? true,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/email-prefs GET]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const body = (await request.json()) as {
      digestEnabled?: boolean;
      remindersEnabled?: boolean;
    };
    const sets: string[] = [];
    if (typeof body.digestEnabled === "boolean") sets.push("digest");
    if (typeof body.remindersEnabled === "boolean") sets.push("reminders");
    if (sets.length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    const sql = getDb();
    // Seed the row (defaults on), then apply whichever flags were sent.
    await sql`
      INSERT INTO user_email_prefs (clerk_user_id) VALUES (${userId})
      ON CONFLICT (clerk_user_id) DO NOTHING
    `;
    if (typeof body.digestEnabled === "boolean") {
      await sql`UPDATE user_email_prefs SET digest_enabled = ${body.digestEnabled}, updated_at = NOW() WHERE clerk_user_id = ${userId}`;
    }
    if (typeof body.remindersEnabled === "boolean") {
      await sql`UPDATE user_email_prefs SET reminders_enabled = ${body.remindersEnabled}, updated_at = NOW() WHERE clerk_user_id = ${userId}`;
    }
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/email-prefs PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
