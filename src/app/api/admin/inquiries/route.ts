import { NextResponse } from "next/server";
import { hasAdminSession } from "@/server/b2b-intelligence/admin-auth";
import { getInquiryRepository } from "@/server/b2b-intelligence/repository-factory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status") || undefined;
  const highScore = url.searchParams.get("highScore") === "true";
  const inquiryType = type === "customer_submitted" || type === "company_visitor_lead" ? type : undefined;
  const inquiries = await getInquiryRepository().listInquiries({ inquiryType, status, highScore });
  return NextResponse.json({ ok: true, inquiries }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST() {
  return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "GET" } });
}
