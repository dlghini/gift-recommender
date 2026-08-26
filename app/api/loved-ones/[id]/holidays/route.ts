import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { HOLIDAY_RULES } from "@/lib/holidays";

// holiday_reminder_prefs only stores explicit opt-outs; a missing row means
// the holiday defaults to on (see lib/holidays.ts / lib/reminders.ts).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id } = await params;

    const body = (await request.json()) as { holidayKey: string; enabled: boolean };
    if (!HOLIDAY_RULES.some((rule) => rule.key === body.holidayKey)) {
      return Response.json({ error: "Unknown holiday." }, { status: 400 });
    }

    const sql = getDb();
    const [lovedOne] = await sql`SELECT id FROM loved_ones WHERE id = ${id} AND clerk_user_id = ${userId}`;
    if (!lovedOne) return Response.json({ error: "Not found." }, { status: 404 });

    await sql`
      INSERT INTO holiday_reminder_prefs (loved_one_id, holiday_key, enabled)
      VALUES (${id}, ${body.holidayKey}, ${body.enabled})
      ON CONFLICT (loved_one_id, holiday_key) DO UPDATE SET enabled = ${body.enabled}
    `;
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id]/holidays PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
