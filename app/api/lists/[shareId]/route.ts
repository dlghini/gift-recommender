import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// GET is public (the share link). The owner gets extra fields (claimer emails);
// everyone else sees just the claim state.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const { userId } = await auth();

    const sql = getDb();
    const [list] = (await sql`
      SELECT id, clerk_user_id, share_id, recipient_name, occasion, created_at
      FROM gift_lists WHERE share_id = ${shareId}
    `) as {
      id: string;
      clerk_user_id: string;
      share_id: string;
      recipient_name: string;
      occasion: string | null;
      created_at: string;
    }[];
    if (!list) return Response.json({ error: "Not found." }, { status: 404 });

    const isOwner = Boolean(userId) && userId === list.clerk_user_id;

    const items = (await sql`
      SELECT id, name, price, rationale, url, image_url,
             claimed_by, claimed_email, claimed_at, purchased
      FROM gift_list_items WHERE list_id = ${list.id}
      ORDER BY created_at ASC
    `) as Record<string, unknown>[];

    const publicItems = items.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      rationale: it.rationale,
      url: it.url,
      imageUrl: it.image_url,
      claimedBy: it.claimed_by,
      claimedEmail: isOwner ? it.claimed_email : undefined,
      claimedAt: it.claimed_at,
      purchased: it.purchased,
    }));

    return Response.json({
      list: {
        shareId: list.share_id,
        recipientName: list.recipient_name,
        occasion: list.occasion,
        createdAt: list.created_at,
      },
      items: publicItems,
      isOwner,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists/[shareId] GET]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// DELETE: owner only.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { shareId } = await params;

    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM gift_lists
      WHERE share_id = ${shareId} AND clerk_user_id = ${userId}
      RETURNING id
    `;
    if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists/[shareId] DELETE]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
