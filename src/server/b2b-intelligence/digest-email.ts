import { getInquiryEmailConfig, isValidEmail, parseEmailList } from "@/lib/emailConfig";
import type { VisitorDigestRecord } from "./digest-types";
import { sendWithResend } from "@/server/mail-history/resend";

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function formatDate(value: string) { return new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }); }

function getDigestEmailConfig() {
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

function rowText(row: VisitorDigestRecord) {
  const events = Object.entries(row.eventSummary).map(([type, count]) => `${type} x${count}`).join(", ") || "-";
  return [
    `IP: ${row.rawIp}`, `首次访问: ${formatDate(row.firstSeenAt)}`, `最近访问: ${formatDate(row.lastSeenAt)}`,
    `访问次数: ${row.totalVisits}`, `估算会话时长: ${row.totalSessionSeconds}s`, `访问页面: ${row.visitedPages.join(", ") || "-"}`,
    `关键行为: ${events}`, `Referrer: ${row.referrer || "-"}`, `UTM: ${[row.utmSource, row.utmMedium, row.utmCampaign].filter(Boolean).join(" / ") || "-"}`,
  ].join("\n");
}

export function buildVisitorDigestEmail(rows: VisitorDigestRecord[], digestWindow: string) {
  const subject = `Kehong visitor digest — ${digestWindow}`;
  const empty = "本统计周期暂无达到汇报条件的访客。";
  const text = rows.length ? [`Visitor behavior digest (${digestWindow})`, "", ...rows.map((row, index) => `Visitor ${index + 1}\n${rowText(row)}`)].join("\n\n") : empty;
  const html = rows.length ? `<h2>访客行为汇总</h2><p>统计窗口：${escapeHtml(digestWindow)}</p>${rows.map((row, index) => `<section><h3>访客 ${index + 1}</h3><pre style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.6">${escapeHtml(rowText(row))}</pre></section>`).join("")}` : `<h2>${escapeHtml(empty)}</h2><p>统计窗口：${escapeHtml(digestWindow)}</p>`;
  return { subject, text, html };
}

export async function sendVisitorDigest(rows: VisitorDigestRecord[], digestWindow: string) {
  const email = buildVisitorDigestEmail(rows, digestWindow);
  const transport = process.env.B2B_DIGEST_EMAIL_TRANSPORT;
  if (transport === "mock" || transport === "captured") return { sent: true as const, transport, email };
  const config = getDigestEmailConfig();
  if (!config.valid) return { sent: false, reason: "DELIVERY_UNAVAILABLE" as const };
  const result = await sendWithResend({
    apiKey: config.apiKey,
    from: config.from,
    to: config.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    source: "visitor_digest",
    campaign: "visitor_digest",
  });
  return result.ok
    ? { sent: true as const }
    : { sent: false, reason: result.reason === "MAIL_HISTORY_UNAVAILABLE" ? "DELIVERY_UNAVAILABLE" as const : "PROVIDER_FAILURE" as const };
}
