import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id } = await params;

    const sql = getDb();
    const [lovedOne] = await sql`
      SELECT * FROM loved_ones WHERE id = ${id} AND clerk_user_id = ${userId}
    `;
    if (!lovedOne) return Response.json({ error: "Not found." }, { status: 404 });

    // Only explicit opt-outs are stored; a holiday not listed here defaults to enabled.
    const holidayPrefs = await sql`
      SELECT holiday_key, enabled FROM holiday_reminder_prefs WHERE loved_one_id = ${id}
    `;
    return Response.json({ lovedOne, holidayPrefs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id] GET]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id } = await params;

    const body = (await request.json()) as {
      name: string;
      relationship: string;
      birthdayMonth: number | null;
      birthdayDay: number | null;
      birthdayYear: number | null;
      anniversaryMonth: number | null;
      anniversaryDay: number | null;
      interestsNotes: string | null;
      birthdayReminderEnabled: boolean;
      anniversaryReminderEnabled: boolean;
    };

    if (!body.name?.trim() || !body.relationship?.trim()) {
      return Response.json({ error: "Name and relationship are required." }, { status: 400 });
    }

    const sql = getDb();
    const [lovedOne] = await sql`
      UPDATE loved_ones SET
        name = ${body.name.trim()},
        relationship = ${body.relationship.trim()},
        birthday_month = ${body.birthdayMonth ?? null},
        birthday_day = ${body.birthdayDay ?? null},
        birthday_year = ${body.birthdayYear ?? null},
        anniversary_month = ${body.anniversaryMonth ?? null},
        anniversary_day = ${body.anniversaryDay ?? null},
        interests_notes = ${body.interestsNotes ?? null},
        birthday_reminder_enabled = ${body.birthdayReminderEnabled ?? true},
        anniversary_reminder_enabled = ${body.anniversaryReminderEnabled ?? true}
      WHERE id = ${id} AND clerk_user_id = ${userId}
      RETURNING *
    `;
    if (!lovedOne) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ lovedOne });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id] PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id } = await params;

    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM loved_ones WHERE id = ${id} AND clerk_user_id = ${userId} RETURNING id
    `;
    if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id] DELETE]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
