import { NextResponse } from "next/server";
import { adminOriginAllowed, adminSecretConfigured, adminSessionCookie, allowAdminAttempt, clearAdminSessionCookie, hasAdminSession, verifyAdminSecret } from "@/server/b2b-intelligence/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!adminSecretConfigured()) return NextResponse.json({ ok: false, code: "ADMIN_NOT_CONFIGURED" }, { status: 503 });
  if (!adminOriginAllowed(request)) return NextResponse.json({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, { status: 403 });
  let secret: unknown;
  try { secret = (await request.json() as { secret?: unknown }).secret; } catch { return NextResponse.json({ ok: false, code: "INVALID_BODY" }, { status: 400 }); }
  const valid = verifyAdminSecret(secret);
  if (!allowAdminAttempt(request, valid) || !valid) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  response.headers.set("Set-Cookie", adminSessionCookie());
  return response;
}

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: hasAdminSession(request) }, { status: hasAdminSession(request) ? 200 : 401, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function DELETE(request: Request) {
  if (!adminOriginAllowed(request)) return NextResponse.json({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", clearAdminSessionCookie());
  return response;
}
