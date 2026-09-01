import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

const RECEPTIONS = ["loved", "liked", "missed"] as const;
type Reception = (typeof RECEPTIONS)[number];

// Records how a *given* gift landed. Narrow on purpose (like the sibling
// mark-as-given PATCH): only touches `reception` / `reception_note` so it can't
// disturb the gift's other fields. Passing reception: null clears it.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; giftId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id, giftId } = await params;

    const body = (await request.json()) as {
      reception: Reception | null;
      receptionNote?: string | null;
    };

    if (body.reception !== null && !RECEPTIONS.includes(body.reception as Reception)) {
      return Response.json({ error: "Unknown reception." }, { status: 400 });
    }

    const note = body.receptionNote?.trim() ? body.receptionNote.trim() : null;

    const sql = getDb();
    const [gift] = await sql`
      UPDATE loved_one_gifts SET
        reception = ${body.reception},
        reception_note = ${note},
        updated_at = NOW()
      WHERE id = ${giftId}
        AND loved_one_id = ${id}
        AND clerk_user_id = ${userId}
        AND status = 'given'
      RETURNING *
    `;
    if (!gift) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ gift });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id]/gifts/[giftId]/reception PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
