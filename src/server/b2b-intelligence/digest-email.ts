import { getInquiryEmailConfig, isValidEmail, parseEmailList } from "@/lib/emailConfig";
import type { BotStatus, VisitorDigestRecord } from "./digest-types";
import { sendWithResend } from "@/server/mail-history/resend";

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }

function isKnownBot(status: BotStatus) { return status === "probable_bot" || status === "verified_bot"; }

function uniqueCount(rows: VisitorDigestRecord[], selector: (row: VisitorDigestRecord) => string | null) {
  return new Set(rows.map(selector).filter((value): value is string => Boolean(value))).size;
}

function topSummaryRows(rows: VisitorDigestRecord[]) {
  const rawIpCount = uniqueCount(rows, (row) => row.rawIp);
  const uniqueVisitors = uniqueCount(rows, (row) => row.visitorId || row.ipHash);
  const sessions = rows.reduce((sum, row) => sum + row.totalVisits, 0);
  const probableBots = rows.filter((row) => isKnownBot(row.botStatus)).length;
  const probableHumans = rows.filter((row) => row.humanStatus === "probable_human").length;
  const engagedHumans = rows.filter((row) => row.humanStatus === "engaged_human").length;
  const productViewers = rows.filter((row) => (row.productPages?.length ?? 0) > 0).length;
  const highOrHotLeads = rows.filter((row) => row.leadLevel === "HIGH" || row.leadLevel === "HOT").length;
  const formSubmissions = rows.reduce((sum, row) => sum + (row.eventSummary.form_submit ?? 0), 0);

  return [
    `Raw IP count: ${rawIpCount}`,
    `Unique visitors: ${uniqueVisitors}`,
    `Sessions: ${sessions}`,
    `Probable bots: ${probableBots}`,
    `Probable humans: ${probableHumans}`,
    `Engaged humans: ${engagedHumans}`,
    `Product viewers: ${productViewers}`,
    `High/HOT leads: ${highOrHotLeads}`,
    `Form submissions: ${formSubmissions}`,
  ];
}

function rowText(row: VisitorDigestRecord) {
  const reasons = row.scoreReasons.map((reason) => `${reason.label}(${reason.points})`).join(", ") || "-";
  const events = Object.entries(row.eventSummary).map(([type, count]) => `${type} x${count}`).join(", ") || "-";
  const botStatus = row.botStatus;
  const humanStatus = row.humanStatus;
  const referrer = row.referrer || "-";
  const utm = [row.utmSource, row.utmMedium, row.utmCampaign, row.utmTerm, row.utmContent].filter(Boolean).join(" / ") || "-";
  const countryCity = `${row.countryCode || "Unknown"} / ${row.city || "Unknown"}`;

  return [
    `Visitor: ${countryCity}`,
    `IP: ${row.rawIp ?? "-"}`,
    `Browser / OS / Device: ${row.browser || "-"} / ${row.os || "-"} / ${row.deviceType}`,
    `Sessions: ${row.totalVisits}`,
    `Engaged time: ${row.engagementSeconds}s`,
    `Pages: ${row.uniquePageCount}`,
    `Events: ${events}`,
    `Bot status: ${botStatus}`,
    `Human status: ${humanStatus}`,
    `Lead score: ${row.behaviorScore}`,
    `Lead level: ${row.leadLevel}`,
    `Score reasons: ${reasons}`,
    `Referrer: ${referrer}`,
    `UTM: ${utm}`,
    `Estimate pages: ${row.visitedPages.join(", ") || "-"}`,
  ].join("\n");
}

export function getDigestEmailConfig() {
  const inquiryConfig = getInquiryEmailConfig();
  const recipientValue = process.env.B2B_DIGEST_TO_EMAIL?.trim() || process.env.INQUIRY_TO_EMAIL?.trim() || process.env.EMAIL_TO?.trim();
  const recipients = parseEmailList(recipientValue);
  const missing = inquiryConfig.missing.filter((key) => key !== "EMAIL_TO");
  const invalid = inquiryConfig.invalid.filter((key) => key !== "EMAIL_TO");
  if (recipients.length === 0) missing.push("EMAIL_TO");
  invalid.push(...recipients.filter((email) => !isValidEmail(email)).map(() => "EMAIL_TO"));
  return {
    ...inquiryConfig,
    to: recipients,
    missing: [...new Set(missing)],
    invalid: [...new Set(invalid)],
    valid: missing.length === 0 && invalid.length === 0,
  };
}

export function buildVisitorDigestEmail(rows: VisitorDigestRecord[], digestWindow: string) {
  const subject = `Kehong visitor digest — ${digestWindow}`;
  const empty = "本统计日期暂无访客记录。";
  const summary = rows.length ? topSummaryRows(rows) : ["No qualified visitors"];
  const text = rows.length
    ? [
      `Visitor behavior digest (${digestWindow})`,
      ...summary,
      "",
      ...rows.map((row, index) => `Visitor ${index + 1}\n${rowText(row)}`),
    ].join("\n\n")
    : [
      `Visitor behavior digest (${digestWindow})`,
      ...summary,
      "",
      empty,
    ].join("\n\n");

  const html = rows.length
    ? `<h2>访客行为汇总</h2><p>统计窗口：${escapeHtml(digestWindow)}</p><p>${escapeHtml(summary.join(" | "))}</p>${rows.map((row, index) => `<section><h3>访客 ${index + 1}</h3><pre style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.6">${escapeHtml(rowText(row))}</pre></section>`).join("")}`
    : `<h2>${escapeHtml(empty)}</h2><p>统计窗口：${escapeHtml(digestWindow)}</p>`;
  return { subject, text, html };
}

export async function sendVisitorDigest(rows: VisitorDigestRecord[], digestWindow: string) {
  const email = buildVisitorDigestEmail(rows, digestWindow);
  const transport = process.env.B2B_DIGEST_EMAIL_TRANSPORT;
  if (transport === "mock" || transport === "captured") return { sent: true as const, transport, email };
  const config = getDigestEmailConfig();
  if (!config.valid) return { sent: false, reason: "DELIVERY_UNAVAILABLE" as const };
  const result = await sendWithResend({ apiKey: config.apiKey, from: `Kehong Website <${config.from}>`, to: config.to, subject: email.subject, html: email.html, text: email.text, source: "visitor_digest", campaign: "visitor_digest" });
  return result.ok ? { sent: true as const } : { sent: false, reason: "PROVIDER_FAILURE" as const };
}
