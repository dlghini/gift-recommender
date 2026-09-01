import { getDb } from "@/lib/db";
import { logRunEvent, RUN_EVENT_NAMES, isValidRunId } from "@/lib/run-events";

// Public analytics beacon: the wizard posts post-result events here (buy click,
// save, regenerate, ...) alongside its PostHog calls, so the durable run_events
// log in Postgres has them for labelling. No auth by design; writes are
// validated against the event allow-list and a run_id must be a UUID. Worst
// case is junk rows, which downstream filters ignore.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      runId?: string;
      event?: string;
      meta?: Record<string, unknown>;
    };
    if (!isValidRunId(body.runId) || !body.event || !RUN_EVENT_NAMES.has(body.event)) {
      return new Response(null, { status: 204 });
    }
    await logRunEvent(getDb(), body.runId, body.event, body.meta ?? {});
    return Response.json({ ok: true });
  } catch {
    // Never surface a telemetry failure.
    return new Response(null, { status: 204 });
  }
}
