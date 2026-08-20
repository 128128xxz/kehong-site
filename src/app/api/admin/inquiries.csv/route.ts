import { NextResponse } from "next/server";
import { hasAdminSession } from "@/server/b2b-intelligence/admin-auth";
import { getInquiryRepository } from "@/server/b2b-intelligence/repository-factory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (!hasAdminSession(request)) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const inquiries = await getInquiryRepository().listInquiries();
  const headers = ["id", "inquiry_type", "status", "company_name", "company_domain", "country", "industry", "network_type", "provider_confidence", "lead_score", "customer_name", "customer_email", "created_at"];
  const rows = inquiries.map((inquiry) => [inquiry.id, inquiry.inquiryType, inquiry.status, inquiry.companyName, "companyDomain" in inquiry ? inquiry.companyDomain : null, "countryName" in inquiry ? inquiry.countryName : null, "industry" in inquiry ? inquiry.industry : null, "networkType" in inquiry ? inquiry.networkType : null, "providerConfidence" in inquiry ? inquiry.providerConfidence : null, "leadScore" in inquiry ? inquiry.leadScore : null, "customerName" in inquiry ? inquiry.customerName : null, "customerEmail" in inquiry ? inquiry.customerEmail : null, inquiry.createdAt].map(csv).join(","));
  return new NextResponse([headers.map(csv).join(","), ...rows].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=kehong-inquiries.csv", "Cache-Control": "private, no-store, max-age=0" } });
}
