import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const sql = getDb();
    const lovedOnes = await sql`
      SELECT * FROM loved_ones WHERE clerk_user_id = ${userId} ORDER BY name ASC
    `;
    return Response.json({ lovedOnes });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones GET]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

    const body = (await request.json()) as {
      name: string;
      relationship: string;
      birthdayMonth?: number | null;
      birthdayDay?: number | null;
      birthdayYear?: number | null;
      anniversaryMonth?: number | null;
      anniversaryDay?: number | null;
      interestsNotes?: string | null;
    };

    if (!body.name?.trim() || !body.relationship?.trim()) {
      return Response.json({ error: "Name and relationship are required." }, { status: 400 });
    }

    const sql = getDb();
    const [lovedOne] = await sql`
      INSERT INTO loved_ones (
        clerk_user_id, name, relationship,
        birthday_month, birthday_day, birthday_year,
        anniversary_month, anniversary_day, interests_notes
      ) VALUES (
        ${userId}, ${body.name.trim()}, ${body.relationship.trim()},
        ${body.birthdayMonth ?? null}, ${body.birthdayDay ?? null}, ${body.birthdayYear ?? null},
        ${body.anniversaryMonth ?? null}, ${body.anniversaryDay ?? null}, ${body.interestsNotes ?? null}
      )
      RETURNING *
    `;
    return Response.json({ lovedOne });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/loved-ones POST]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
