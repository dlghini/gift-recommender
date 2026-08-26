import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// Marks an "idea" gift as actually given. This endpoint is intentionally
// narrow (not a general partial-update) so it can't accidentally null out
// fields a caller didn't intend to touch.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; giftId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id, giftId } = await params;

    const body = (await request.json()) as {
      occasionLabel?: string;
      givenAt?: string; // ISO date, defaults to today
    };

    const sql = getDb();
    const [gift] = await sql`
      UPDATE loved_one_gifts SET
        status = 'given',
        given_at = ${body.givenAt ?? new Date().toISOString().slice(0, 10)},
        occasion_label = ${body.occasionLabel ?? null},
        updated_at = NOW()
      WHERE id = ${giftId} AND loved_one_id = ${id} AND clerk_user_id = ${userId}
      RETURNING *
    `;
    if (!gift) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ gift });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id]/gifts/[giftId] PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; giftId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id, giftId } = await params;

    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM loved_one_gifts
      WHERE id = ${giftId} AND loved_one_id = ${id} AND clerk_user_id = ${userId}
      RETURNING id
    `;
    if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id]/gifts/[giftId] DELETE]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
