import { NextResponse } from "next/server";
import { getInquiryEmailConfig } from "@/lib/emailConfig";
import { mailReportFrom, mailReportRecipients } from "@/server/mail-history/config";
import { buildMailReport, reportHtml, reportText } from "@/server/mail-history/report";
import { sendWithResend } from "@/server/mail-history/resend";
import { isMailHistoryRedisConfigured } from "@/server/mail-history/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization")?.replace(/^Bearer\s+/iu, "") === secret;
}

function yesterdayLocalDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return new Intl.DateTimeFormat("en-CA", { timeZone: process.env.MAIL_REPORT_TIMEZONE?.trim() || "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  if ((process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") && !isMailHistoryRedisConfigured()) return NextResponse.json({ ok: false, code: "MAIL_HISTORY_REDIS_NOT_CONFIGURED" }, { status: 503 });
  const requestedDate = new URL(request.url).searchParams.get("date")?.trim();
  const date = requestedDate || yesterdayLocalDate();
  const report = await buildMailReport(date);
  const recipients = mailReportRecipients();
  const from = mailReportFrom();
  const config = getInquiryEmailConfig();
  if (!recipients.length || !from || !config.apiKey) return NextResponse.json({ ok: true, status: "generated_not_sent", date, report }, { status: 200 });
  const delivery = await sendWithResend({ apiKey: config.apiKey, from, to: recipients, subject: "Kehong Email Delivery & Outreach Report - " + date, html: reportHtml(report), text: reportText(report), source: "mail_report", campaign: "daily_mail_report" });
  return NextResponse.json({ ok: true, status: delivery.ok ? "sent" : "generated_not_sent", date, providerMessageId: delivery.ok ? delivery.providerMessageId : null, report }, { status: 200 });
}

export async function POST() { return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "GET" } }); }
