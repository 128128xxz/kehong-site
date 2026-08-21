import { NextResponse } from "next/server";
import { sendVisitorDigest } from "@/server/b2b-intelligence/digest-email";
import { getVisitorDigestStore, isRedisConfigured } from "@/server/b2b-intelligence/redis-store";
import { digestWindowToSend } from "@/server/b2b-intelligence/service";
import type { DigestWindowKind } from "@/server/b2b-intelligence/digest-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization")?.replace(/^Bearer\s+/iu, "") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("window");
  if (kind !== "noon" && kind !== "evening") return NextResponse.json({ ok: false, code: "WINDOW_REQUIRED" }, { status: 400 });
  if (process.env.B2B_VISITOR_INTELLIGENCE_ENABLED !== "true") return NextResponse.json({ ok: true, status: "disabled", sent: false });
  if ((process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") && !isRedisConfigured()) return NextResponse.json({ ok: false, code: "REDIS_NOT_CONFIGURED" }, { status: 503 });

  const now = new Date();
  const digestWindow = digestWindowToSend(now, kind as DigestWindowKind);
  const store = getVisitorDigestStore();
  if (await store.isWindowSent(digestWindow)) return NextResponse.json({ ok: true, status: "already_sent", digestWindow });
  const lock = await store.acquireDigestLock(digestWindow, 90);
  if (!lock) return NextResponse.json({ ok: true, status: "locked", digestWindow });
  try {
    const rows = await store.getWindowVisitors(digestWindow, now.toISOString());
    if (!rows.length && process.env.B2B_DIGEST_SEND_EMPTY === "false") return NextResponse.json({ ok: true, status: "empty_not_sent", digestWindow });
    const result = await sendVisitorDigest(rows, digestWindow);
    if (!result.sent) return NextResponse.json({ ok: false, code: result.reason, digestWindow }, { status: result.reason === "DELIVERY_UNAVAILABLE" ? 503 : 502 });
    await store.markWindowSent(digestWindow);
    await store.cleanupExpired(now.toISOString());
    return NextResponse.json({ ok: true, status: "sent", digestWindow, visitorCount: rows.length });
  } finally {
    await store.releaseDigestLock(digestWindow, lock);
  }
}

export async function POST() { return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "GET" } }); }
