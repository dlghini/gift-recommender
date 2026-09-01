// Client-side wizard telemetry helpers. Companion to the server's
// lib/run-events.ts. Keep this import-safe for the browser (no server deps).

const INTERNAL_KEY = "gw_internal";

/** Reads ?internal=1 / ?internal=0 and persists the choice, so you can flag your
 *  own browsers (including on production) once. Call on mount. */
export function applyInternalParam(): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams(window.location.search).get("internal");
  try {
    if (p === "1") localStorage.setItem(INTERNAL_KEY, "1");
    else if (p === "0") localStorage.removeItem(INTERNAL_KEY);
  } catch {
    /* storage disabled */
  }
}

/** True for dev/preview hosts and any browser you've flagged with ?internal=1.
 *  Downstream analysis and model training filter these out. */
export function getIsInternal(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) return true;
  try {
    return localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

/** Fire-and-forget event to the durable run_events log. Never awaited. */
export function runEvent(
  runId: string | null | undefined,
  event: string,
  meta: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined" || !runId) return;
  const payload = JSON.stringify({ runId, event, meta });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/run-event", new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/run-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
