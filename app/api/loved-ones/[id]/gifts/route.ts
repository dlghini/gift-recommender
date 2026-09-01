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
    const gifts = await sql`
      SELECT * FROM loved_one_gifts
      WHERE loved_one_id = ${id} AND clerk_user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return Response.json({ gifts });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id]/gifts GET]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { id } = await params;

    const sql = getDb();
    // Confirm the loved one belongs to this user before attaching a gift to it.
    const [lovedOne] = await sql`SELECT id FROM loved_ones WHERE id = ${id} AND clerk_user_id = ${userId}`;
    if (!lovedOne) return Response.json({ error: "Not found." }, { status: 404 });

    const body = (await request.json()) as {
      status?: "idea" | "given";
      name: string;
      price?: string;
      rationale?: string;
      tags?: string[];
      affiliateUrl?: string;
      type?: "product" | "experience";
      store?: string;
      searchQuery?: string;
      imageUrl?: string;
      occasionLabel?: string;
      givenAt?: string; // ISO date, only meaningful when status is "given"
      runId?: string; // wizard run this idea came from, for outcome-feedback joins
    };

    if (!body.name?.trim()) {
      return Response.json({ error: "Gift name is required." }, { status: 400 });
    }

    const runId = /^[0-9a-f-]{36}$/i.test(body.runId ?? "") ? body.runId : null;

    const [gift] = await sql`
      INSERT INTO loved_one_gifts (
        loved_one_id, clerk_user_id, status, name, price, rationale, tags,
        affiliate_url, type, store, search_query, image_url, occasion_label, given_at, run_id
      ) VALUES (
        ${id}, ${userId}, ${body.status ?? "idea"}, ${body.name.trim()}, ${body.price ?? null},
        ${body.rationale ?? null}, ${JSON.stringify(body.tags ?? [])},
        ${body.affiliateUrl ?? null}, ${body.type ?? null}, ${body.store ?? null},
        ${body.searchQuery ?? null}, ${body.imageUrl ?? null}, ${body.occasionLabel ?? null},
        ${body.givenAt ?? null}, ${runId}
      )
      RETURNING *
    `;
    return Response.json({ gift });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones/[id]/gifts POST]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
