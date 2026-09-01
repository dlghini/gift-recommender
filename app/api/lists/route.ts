import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

// GET: the signed-in user's group lists, with claimed/total counts.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const sql = getDb();
    const lists = await sql`
      SELECT
        gl.id, gl.share_id, gl.recipient_name, gl.occasion, gl.created_at,
        COUNT(gli.id)::int AS item_count,
        COUNT(gli.claimed_by)::int AS claimed_count
      FROM gift_lists gl
      LEFT JOIN gift_list_items gli ON gli.list_id = gl.id
      WHERE gl.clerk_user_id = ${userId}
      GROUP BY gl.id
      ORDER BY gl.created_at DESC
    `;
    return Response.json({ lists });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists GET]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// POST: create a list. Optionally seeded from a Loved One (name + link).
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const body = (await request.json()) as {
      recipientName: string;
      occasion?: string | null;
      lovedOneId?: string | null;
    };
    if (!body.recipientName?.trim()) {
      return Response.json({ error: "A recipient name is required." }, { status: 400 });
    }

    const sql = getDb();

    // If a Loved One id is passed, confirm it belongs to this user before linking.
    let lovedOneId: string | null = null;
    if (body.lovedOneId) {
      const [lo] = await sql`
        SELECT id FROM loved_ones WHERE id = ${body.lovedOneId} AND clerk_user_id = ${userId}
      `;
      if (lo) lovedOneId = body.lovedOneId;
    }

    const shareId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const [list] = await sql`
      INSERT INTO gift_lists (clerk_user_id, share_id, recipient_name, occasion, loved_one_id)
      VALUES (
        ${userId}, ${shareId}, ${body.recipientName.trim()},
        ${body.occasion?.trim() || null}, ${lovedOneId}
      )
      RETURNING id, share_id, recipient_name, occasion, created_at
    `;
    return Response.json({ list });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists POST]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
