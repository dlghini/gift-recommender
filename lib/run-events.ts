import type { getDb } from "@/lib/db";

type Sql = ReturnType<typeof getDb>;

// Durable, self-contained event log for wizard runs, keyed by `run_id`. This is
// the training-data substrate for a future re-ranker / recommender, so it lives
// in Postgres (not only PostHog) and every write is validated against this
// allow-list.
export const RUN_EVENT_NAMES = new Set([
  "recommend_generated",
  "results_shown",
  "buy_clicked",
  "gift_saved",
  "gift_unsaved",
  "regenerate_clicked",
  "results_shared",
  "results_emailed",
  "reception_recorded",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidRunId(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

/** Best-effort insert. Never throws — telemetry must not break a user action. */
export async function logRunEvent(
  sql: Sql,
  runId: string,
  event: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  try {
    if (!isValidRunId(runId) || !RUN_EVENT_NAMES.has(event)) return;
    const safeMeta = JSON.stringify(meta).slice(0, 4000);
    await sql`
      INSERT INTO run_events (run_id, event, meta)
      VALUES (${runId}, ${event}, ${safeMeta}::jsonb)
    `;
  } catch (error) {
    console.error("[run-events] insert failed", error);
  }
}
