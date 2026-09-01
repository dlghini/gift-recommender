import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// Per-user email preferences. No row for a user means "all defaults" (digest on),
// so GET falls back to true and PATCH upserts only when they change something.

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const sql = getDb();
    const [row] = (await sql`
      SELECT digest_enabled FROM user_email_prefs WHERE clerk_user_id = ${userId}
    `) as { digest_enabled: boolean }[];

    return Response.json({ digestEnabled: row?.digest_enabled ?? true });
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

    const body = (await request.json()) as { digestEnabled: boolean };
    if (typeof body.digestEnabled !== "boolean") {
      return Response.json({ error: "digestEnabled must be a boolean." }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO user_email_prefs (clerk_user_id, digest_enabled, updated_at)
      VALUES (${userId}, ${body.digestEnabled}, NOW())
      ON CONFLICT (clerk_user_id)
      DO UPDATE SET digest_enabled = ${body.digestEnabled}, updated_at = NOW()
    `;
    return Response.json({ ok: true, digestEnabled: body.digestEnabled });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/email-prefs PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
