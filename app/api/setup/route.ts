import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const sql = getDb();
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
  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      email       TEXT NOT NULL,
      gifts       JSONB
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS loved_ones (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      clerk_user_id     TEXT NOT NULL,
      name              TEXT NOT NULL,
      relationship      TEXT NOT NULL,
      birthday_month    INTEGER,
      birthday_day      INTEGER,
      birthday_year     INTEGER,
      anniversary_month INTEGER,
      anniversary_day   INTEGER,
      interests         JSONB,
      interests_notes   TEXT,
      birthday_reminder_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
      anniversary_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE
    )
  `;
  // Added after the table shipped — no-op once the column exists.
  await sql`ALTER TABLE loved_ones ADD COLUMN IF NOT EXISTS interests JSONB`;
  await sql`CREATE INDEX IF NOT EXISTS loved_ones_clerk_user_id_idx ON loved_ones (clerk_user_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS loved_one_gifts (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      loved_one_id    UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
      clerk_user_id   TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'idea',
      name            TEXT NOT NULL,
      price           TEXT,
      rationale       TEXT,
      tags            JSONB,
      affiliate_url   TEXT,
      type            TEXT,
      store           TEXT,
      search_query    TEXT,
      image_url       TEXT,
      occasion_label  TEXT,
      given_at        DATE,
      updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS loved_one_gifts_loved_one_id_idx ON loved_one_gifts (loved_one_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS holiday_reminder_prefs (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      loved_one_id  UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
      holiday_key   TEXT NOT NULL,
      enabled       BOOLEAN NOT NULL DEFAULT TRUE,
      UNIQUE (loved_one_id, holiday_key)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS reminder_log (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      loved_one_id   UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
      occasion_key   TEXT NOT NULL,
      occasion_year  INTEGER NOT NULL,
      sent_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (loved_one_id, occasion_key, occasion_year)
    )
  `;
  return NextResponse.json({ ok: true, message: "Tables ready" });
}
