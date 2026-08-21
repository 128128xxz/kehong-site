import { getInquiryEmailConfig } from "@/lib/emailConfig";
import type { VisitorDigestRecord } from "./digest-types";

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function formatDate(value: string) { return new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }); }

function rowText(row: VisitorDigestRecord) {
  const events = Object.entries(row.eventSummary).map(([type, count]) => `${type} x${count}`).join(", ") || "-";
  const reasons = row.scoreReasons.map((reason) => `${reason.label} +${reason.points}`).join(", ") || "-";
  return [
    `IP: ${row.rawIp}`, `首次访问: ${formatDate(row.firstSeenAt)}`, `最近访问: ${formatDate(row.lastSeenAt)}`,
    `访问次数: ${row.totalVisits}`, `估算会话时长: ${row.totalSessionSeconds}s`, `访问页面: ${row.visitedPages.join(", ") || "-"}`,
    `关键行为: ${events}`, `Referrer: ${row.referrer || "-"}`, `UTM: ${[row.utmSource, row.utmMedium, row.utmCampaign].filter(Boolean).join(" / ") || "-"}`,
    `行为评分: ${row.behaviorScore}`, `评分原因: ${reasons}`,
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
  const config = getInquiryEmailConfig();
  if (!config.valid) return { sent: false, reason: "DELIVERY_UNAVAILABLE" as const };
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: `Kehong Website <${config.from}>`, to: config.to, subject: email.subject, html: email.html, text: email.text }) }).catch(() => null);
  return response?.ok ? { sent: true as const } : { sent: false, reason: "PROVIDER_FAILURE" as const };
}
