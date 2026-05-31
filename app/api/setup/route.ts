import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      relationship TEXT,
      age_range   TEXT,
      occasion    TEXT,
      interests   JSONB,
      freetext    TEXT,
      budget      TEXT,
      gifts       JSONB,
      attempt     INTEGER DEFAULT 1
    )
  `;
  return NextResponse.json({ ok: true, message: "Table ready" });
}
