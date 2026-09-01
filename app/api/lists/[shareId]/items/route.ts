import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// POST: owner adds an item to their list.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { shareId } = await params;

    const body = (await request.json()) as {
      name: string;
      price?: string | null;
      rationale?: string | null;
      url?: string | null;
      imageUrl?: string | null;
    };
    if (!body.name?.trim()) {
      return Response.json({ error: "A gift name is required." }, { status: 400 });
    }

    const sql = getDb();
    const [list] = await sql`
      SELECT id FROM gift_lists WHERE share_id = ${shareId} AND clerk_user_id = ${userId}
    `;
    if (!list) return Response.json({ error: "Not found." }, { status: 404 });

    const [item] = await sql`
      INSERT INTO gift_list_items (list_id, name, price, rationale, url, image_url)
      VALUES (
        ${list.id}, ${body.name.trim()}, ${body.price?.trim() || null},
        ${body.rationale?.trim() || null}, ${body.url?.trim() || null},
        ${body.imageUrl?.trim() || null}
      )
      RETURNING id, name, price, rationale, url, image_url AS "imageUrl",
                claimed_by AS "claimedBy", claimed_at AS "claimedAt", purchased
    `;
    return Response.json({ item });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists/[shareId]/items POST]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
