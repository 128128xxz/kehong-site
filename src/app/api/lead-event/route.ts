import { after, NextResponse } from "next/server";
import { isAllowedOrigin, parseLeadEvent, readJsonBodyWithLimit } from "@/server/b2b-intelligence/event-validation";
import { processVisitorEvent } from "@/server/b2b-intelligence/service";
import { allowLeadEvent } from "@/server/b2b-intelligence/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE" }, { status: 415 });
  if (!isAllowedOrigin(request)) return NextResponse.json({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, { status: 403 });
  if (!allowLeadEvent(request)) return NextResponse.json({ ok: false, code: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": "60" } });
  let event;
  try {
    const body = await readJsonBodyWithLimit(request);
    event = parseLeadEvent(JSON.parse(body));
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_BODY";
    const status = code === "BODY_TOO_LARGE" ? 413 : code === "PII_NOT_ALLOWED" ? 400 : 400;
    return NextResponse.json({ ok: false, code }, { status });
  }
  after(async () => {
    try { await processVisitorEvent(request, event); } catch (error) { console.error("Visitor digest event processing failed", { category: error instanceof Error ? error.name : "unknown" }); }
  });
  return NextResponse.json({ ok: true, eventId: event.eventId, accepted: true }, { status: 202, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function GET() {
  return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "POST" } });
}
