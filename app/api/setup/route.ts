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
  // Wizard-run instrumentation, groundwork for the future recommender model.
  // candidates = full ranked LLM pool (each item carries shown + position);
  // question_meta = per-question timing / skipped / changed.
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS run_id UUID`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS candidates JSONB`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS question_meta JSONB`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS quality_score REAL`;
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS score_version INTEGER`;
  await sql`CREATE INDEX IF NOT EXISTS sessions_run_id_idx ON sessions (run_id)`;
  // Durable per-run event log: the training-data substrate. In Postgres (not
  // only PostHog) so labelling/analysis is pure SQL.
  await sql`
    CREATE TABLE IF NOT EXISTS run_events (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      run_id     UUID NOT NULL,
      event      TEXT NOT NULL,
      meta       JSONB
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS run_events_run_id_idx ON run_events (run_id)`;
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
  // Links a saved gift back to the wizard run that produced it, so #5's
  // `reception` feedback joins to the exact inputs + candidate pool.
  await sql`ALTER TABLE loved_one_gifts ADD COLUMN IF NOT EXISTS run_id UUID`;
  // Post-purchase feedback on a "given" gift: how it landed, plus an optional note.
  // Values: 'loved' | 'liked' | 'missed'. Added after the table shipped.
  await sql`ALTER TABLE loved_one_gifts ADD COLUMN IF NOT EXISTS reception TEXT`;
  await sql`ALTER TABLE loved_one_gifts ADD COLUMN IF NOT EXISTS reception_note TEXT`;
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
  // One row per user per calendar month the "month ahead" digest was sent,
  // so a re-fired cron can't double-send. year_month is "YYYY-MM".
  await sql`
    CREATE TABLE IF NOT EXISTS digest_log (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id  TEXT NOT NULL,
      year_month     TEXT NOT NULL,
      sent_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (clerk_user_id, year_month)
    )
  `;
  // Per-user email preferences. Absence of a row = defaults (digest on),
  // so we only ever write a row when a user changes something.
  await sql`
    CREATE TABLE IF NOT EXISTS user_email_prefs (
      clerk_user_id  TEXT PRIMARY KEY,
      digest_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  // Group gift lists: an owner (signed-in) builds a list for a recipient and
  // shares `share_id`; anyone with the link can claim items with just a name.
  await sql`
    CREATE TABLE IF NOT EXISTS gift_lists (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      clerk_user_id  TEXT NOT NULL,
      share_id       TEXT NOT NULL UNIQUE,
      recipient_name TEXT NOT NULL,
      occasion       TEXT,
      loved_one_id   UUID REFERENCES loved_ones(id) ON DELETE SET NULL,
      updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS gift_lists_clerk_user_id_idx ON gift_lists (clerk_user_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS gift_list_items (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      list_id       UUID NOT NULL REFERENCES gift_lists(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      price         TEXT,
      rationale     TEXT,
      url           TEXT,
      image_url     TEXT,
      claimed_by    TEXT,
      claimed_email TEXT,
      claimed_at    TIMESTAMP WITH TIME ZONE,
      purchased     BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS gift_list_items_list_id_idx ON gift_list_items (list_id)`;
  return NextResponse.json({ ok: true, message: "Tables ready" });
}
