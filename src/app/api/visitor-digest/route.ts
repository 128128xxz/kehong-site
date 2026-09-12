import { NextResponse } from "next/server";
import { sendVisitorDigest } from "@/server/b2b-intelligence/digest-email";
import { getVisitorDigestStore, isRedisConfigured } from "@/server/b2b-intelligence/redis-store";
import { dailyDigestDateToSend } from "@/server/b2b-intelligence/service";

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
  if (kind !== "daily" && kind !== "all") return NextResponse.json({ ok: false, code: "WINDOW_REQUIRED" }, { status: 400 });
  // Visitor event collection and administrator digest delivery are separate controls.
  // Keep collection available while this outbound reporting path is disabled by default.
  if (process.env.B2B_VISITOR_INTELLIGENCE_ENABLED !== "true") return NextResponse.json({ ok: true, status: "disabled", sent: false });
  if ((process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") && !isRedisConfigured()) return NextResponse.json({ ok: false, code: "REDIS_NOT_CONFIGURED" }, { status: 503 });

  const now = new Date();
  const digestWindow = kind === "all" ? "all-retained" : dailyDigestDateToSend(now);
  const store = getVisitorDigestStore();
  if (await store.isWindowSent(digestWindow)) return NextResponse.json({ ok: true, status: "already_sent", digestWindow });
  const lock = await store.acquireDigestLock(digestWindow, 90);
  if (!lock) return NextResponse.json({ ok: true, status: "locked", digestWindow });
  try {
    const rows = kind === "all"
      ? await store.getAllVisitors(now.toISOString())
      : await store.getDailyVisitors(digestWindow, now.toISOString());
    if (!rows.length && process.env.B2B_DIGEST_SEND_EMPTY === "false") return NextResponse.json({ ok: true, status: "empty_not_sent", digestWindow });
    const result = await sendVisitorDigest(rows, digestWindow);
    if (!result.sent) return NextResponse.json({ ok: false, code: result.reason, digestWindow }, { status: result.reason === "DELIVERY_UNAVAILABLE" ? 503 : 502 });
    await store.markWindowSent(digestWindow);
    await store.cleanupExpired(now.toISOString());
    const uniqueVisitorCount = new Set(
      rows.map((row) => row.visitorId || row.ipHash || row.rawIp || "unknown"),
    ).size;
    const rawIpCount = new Set(rows.map((row) => row.rawIp).filter(Boolean)).size;
    const sessionCount = rows.reduce((sum, row) => sum + row.totalVisits, 0);

    return NextResponse.json({
      ok: true,
      status: "sent",
      digestWindow,
      visitorCount: uniqueVisitorCount,
      uniqueVisitorCount,
      rawIpCount,
      sessionCount,
    });
  } finally {
    await store.releaseDigestLock(digestWindow, lock);
  }
}

export async function POST() { return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "GET" } }); }
