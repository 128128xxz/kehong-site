import { NextResponse } from "next/server";
import { hasAdminSession } from "@/server/b2b-intelligence/admin-auth";
import { getInquiryRepository } from "@/server/b2b-intelligence/repository-factory";
import type { VisitorEventRecord, VisitorLeadRecord } from "@/server/b2b-intelligence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicEvent(event: VisitorEventRecord) {
  return { eventId: event.eventId, eventType: event.eventType, path: event.path, pageTitle: event.pageTitle, referrer: event.referrer, utmSource: event.utmSource, utmMedium: event.utmMedium, utmCampaign: event.utmCampaign, utmTerm: event.utmTerm, utmContent: event.utmContent, durationSeconds: event.durationSeconds, networkType: event.networkType, occurredAt: event.occurredAt };
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasAdminSession(request)) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  const repository = getInquiryRepository();
  const inquiries = await repository.listInquiries();
  const inquiry = inquiries.find((item) => item.id === id);
  if (!inquiry) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  const visitor = inquiry.inquiryType === "company_visitor_lead" ? inquiry : inquiries.find((item) => item.inquiryType === "company_visitor_lead" && item.linkedInquiryId === inquiry.id);
  const linkedInquiry = inquiry.inquiryType === "company_visitor_lead" ? inquiries.find((item) => item.id === inquiry.linkedInquiryId) ?? null : visitor ?? null;
  const events = visitor ? await repository.getVisitorEvents((visitor as VisitorLeadRecord).companyIdentity) : [];
  const notificationStatus = inquiry.inquiryType === "company_visitor_lead" ? await repository.getLatestNotificationStatus(inquiry.id) : null;
  return NextResponse.json({ ok: true, inquiry, linkedInquiry, events: events.map(publicEvent), notificationStatus }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
