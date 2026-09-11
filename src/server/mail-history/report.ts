import { mailHistoryConfig } from "./config";
import { getMailHistoryStore } from "./store";
import type { MailDataCoverage, MailEvent, MailMessage, MailReportStats } from "./types";

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function localDate(value: Date) { return new Intl.DateTimeFormat("en-CA", { timeZone: mailHistoryConfig.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(value); }
function localDateToUtc(date: string) {
  const approximate = new Date(date + "T00:00:00.000Z");
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: mailHistoryConfig.timezone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(approximate);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const renderedUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return new Date(approximate.getTime() - renderedUtc + approximate.getTime());
}
export function localDayRange(date: string) { const start = localDateToUtc(date); return { from: start.toISOString(), to: new Date(start.getTime() + 86400000).toISOString(), timezone: mailHistoryConfig.timezone }; }
function emptyStats(): MailReportStats { return { scheduled: 0, queued: 0, accepted: 0, sent: 0, delivered: 0, deferred: 0, softBounce: 0, hardBounce: 0, blocked: 0, failed: 0, rejected: 0, complaint: 0, unsubscribe: 0, humanReplies: 0, autoReplies: 0, skipped: 0 }; }
function stats(events: MailEvent[]) {
  const output = emptyStats();
  const seen = new Map<string, Set<string>>();
  const add = (key: keyof MailReportStats, event: MailEvent) => {
    const id = event.mailMessageId ?? event.id;
    if (!seen.has(key)) seen.set(key, new Set());
    if (seen.get(key)!.has(id)) return;
    seen.get(key)!.add(id);
    output[key] += 1;
  };
  const map: Partial<Record<MailEvent["eventType"], keyof MailReportStats>> = { scheduled: "scheduled", queued: "queued", accepted: "accepted", sent: "sent", delivered: "delivered", deferred: "deferred", soft_bounce: "softBounce", hard_bounce: "hardBounce", blocked: "blocked", failed: "failed", rejected: "rejected", complaint: "complaint", unsubscribe: "unsubscribe", skipped: "skipped" };
  for (const event of events) { const key = map[event.eventType]; if (key) add(key, event); if (event.eventType === "reply") add(event.replyKind === "auto" ? "autoReplies" : "humanReplies", event); if (event.eventType === "auto_reply") add("autoReplies", event); }
  return output;
}
function coverageStatus(rows: MailDataCoverage[], key: keyof Pick<MailDataCoverage, "sentAvailable" | "deliveredAvailable" | "bounceAvailable" | "replyAvailable" | "complaintAvailable" | "unsubscribeAvailable" | "deferredAvailable">, range: { from: string; to: string }) {
  const relevant = rows.filter((row) => row.startAt < range.to && (!row.endAt || row.endAt > range.from));
  if (!relevant.length || relevant.some((row) => row[key] === false)) return "unavailable";
  if (relevant.every((row) => row[key] === true)) return "available";
  if (relevant.some((row) => row[key] === true)) return "partial";
  return "unknown";
}
function percentage(value: number, denominator: number, available: boolean) { if (!available) return "Unavailable due to incomplete event coverage"; if (!denominator) return "Unavailable due to zero denominator"; return (value / denominator * 100).toFixed(1) + "% (" + value + "/" + denominator + ")"; }
function previousDate(date: string) { const value = localDateToUtc(date); value.setUTCDate(value.getUTCDate() - 1); return localDate(value); }
function messageCompany(message: MailMessage) {
  if (message.company) return message.company;
  const source = message.sourceRecord ?? {};
  return ["company", "company name", "company_name", "organization", "organisation"].map((key) => source[key]?.trim()).find(Boolean) || null;
}
function sendRecords(messages: MailMessage[], events: MailEvent[], range: { from: string; to: string }) {
  const eventsByMessage = new Map<string, MailEvent[]>();
  for (const event of events) if (event.mailMessageId) eventsByMessage.set(event.mailMessageId, [...(eventsByMessage.get(event.mailMessageId) || []), event]);
  return messages.filter((message) => {
    const related = eventsByMessage.get(message.id) || [];
    const created = Date.parse(message.createdAt);
    return related.length > 0 || (Number.isFinite(created) && created >= Date.parse(range.from) && created < Date.parse(range.to));
  }).map((message) => {
    const related = [...(eventsByMessage.get(message.id) || [])].sort((a, b) => Date.parse(a.eventTime) - Date.parse(b.eventTime));
    const latest = related.at(-1);
    const accepted = related.find((event) => event.eventType === "sent" || event.eventType === "accepted");
    return {
      company: messageCompany(message),
      recipient: message.recipient,
      recipients: message.recipients,
      sentAt: message.firstSentAt || accepted?.eventTime || null,
      subject: message.subject,
      campaign: message.campaign,
      sendStatus: latest?.eventType || (message.firstSentAt ? "sent" : "queued"),
      trackingId: message.trackingId,
    };
  });
}

export async function buildMailReport(date: string) {
  const range = localDayRange(date);
  const store = getMailHistoryStore();
  const values = await Promise.all([store.findEvents({ from: range.from, to: range.to }), store.findMessages(), store.findCoverage(), store.findSuppressions()]);
  const events = values[0];
  const messages = values[1];
  const coverage = values[2];
  const suppressions = values[3];
  const domainHolds = await store.findDomainHolds({ activeOnly: true });
  const auditLogs = await store.findAuditLogs({ from: range.from, to: range.to });
  const summary = stats(events);
  const messageMap = new Map(messages.map((message) => [message.id, message]));
  const domains = new Map<string, MailReportStats>();
  for (const event of events) {
    const message = event.mailMessageId ? messageMap.get(event.mailMessageId) : undefined;
    const domainNames = event.recipientDomain ? [event.recipientDomain] : message?.recipients.map((recipient) => recipient.split("@").pop() || "unknown") || ["unknown"];
    for (const domain of domainNames) domains.set(domain, Object.assign(domains.get(domain) || emptyStats(), stats([event])));
  }
  const reasons = new Map<string, { count: number; domains: Set<string>; firstSeen: string; lastSeen: string; smtp: Set<string> }>();
  for (const event of events.filter((item) => ["hard_bounce", "soft_bounce", "deferred", "blocked"].includes(item.eventType))) {
    const reason = event.bounceReason || event.bounceCategory || "Unknown";
    const current = reasons.get(reason) || { count: 0, domains: new Set<string>(), firstSeen: event.eventTime, lastSeen: event.eventTime, smtp: new Set<string>() };
    current.count += 1;
    if (event.recipientDomain) current.domains.add(event.recipientDomain);
    if (event.smtpStatusCode) current.smtp.add(event.smtpStatusCode);
    current.firstSeen = event.eventTime < current.firstSeen ? event.eventTime : current.firstSeen;
    current.lastSeen = event.eventTime > current.lastSeen ? event.eventTime : current.lastSeen;
    reasons.set(reason, current);
  }
  const dataCoverage = { sent: coverageStatus(coverage, "sentAvailable", range), delivered: coverageStatus(coverage, "deliveredAvailable", range), bounce: coverageStatus(coverage, "bounceAvailable", range), reply: coverageStatus(coverage, "replyAvailable", range), complaint: coverageStatus(coverage, "complaintAvailable", range), unsubscribe: coverageStatus(coverage, "unsubscribeAvailable", range), deferred: coverageStatus(coverage, "deferredAvailable", range) };
  const normalizedBounceTypes = new Map<string, number>();
  const sourceStats = new Map<string, MailReportStats>();
  const senderStats = new Map<string, MailReportStats>();
  const campaignStats = new Map<string, MailReportStats>();
  const roleAddressStats = new Map<string, MailReportStats>();
  const addGrouped = (map: Map<string, MailReportStats>, key: string, event: MailEvent) => map.set(key, Object.assign(map.get(key) || emptyStats(), stats([event])));
  for (const event of events) {
    if (event.normalizedBounceType && event.normalizedBounceType !== "unknown") normalizedBounceTypes.set(event.normalizedBounceType, (normalizedBounceTypes.get(event.normalizedBounceType) || 0) + 1);
    addGrouped(sourceStats, event.source || "unknown", event);
    const message = event.mailMessageId ? messageMap.get(event.mailMessageId) : undefined;
    addGrouped(senderStats, event.sender || message?.sender || "unknown", event);
    addGrouped(campaignStats, event.campaignId || message?.campaign || "unknown", event);
    addGrouped(roleAddressStats, message?.roleAddress ? "role_address" : "named_or_unknown_address", event);
  }
  const previousRange = localDayRange(previousDate(date));
  const sevenStart = localDayRange(previousDate(previousDate(date))).from;
  const trends = await Promise.all([store.findEvents({ from: previousRange.from, to: previousRange.to }), store.findEvents({ from: sevenStart, to: range.to })]);
  const previous = stats(trends[0]);
  const sevenDay = stats(trends[1]);
  const newSuppressions = suppressions.filter((item) => item.createdAt >= range.from && item.createdAt < range.to);
  const facts = summary.hardBounce ? [summary.hardBounce + " hard bounce event(s) observed and treated as non-retryable."] : [];
  if (summary.deferred) facts.push(summary.deferred + " deferred event(s) observed.");
  if (summary.humanReplies) facts.push(summary.humanReplies + " human reply event(s) observed.");
  if (!facts.length) facts.push("No counted hard bounce, deferred, or human reply events observed in this reporting window.");
  const interpretation = [];
  if (summary.hardBounce) interpretation.push("Permanent recipient or domain failure is more likely for hard-bounce records; inspect preserved diagnostics before widening suppression.");
  if (summary.deferred) interpretation.push("Deferred events indicate temporary delivery difficulty, not proof of provider blocking or sender-reputation damage.");
  if ((summary.sent || summary.accepted) && !summary.delivered) interpretation.push("Sent or accepted records exist without complete delivered-event coverage; delivery rate is intentionally unavailable.");
  if (!interpretation.length) interpretation.push("There is not enough event coverage to make a stronger causal interpretation.");
  const nextActions = [];
  if (newSuppressions.length) nextActions.push({ priority: "P0", evidence: newSuppressions.length + " new active suppression(s)", why: "Permanent, complaint, unsubscribe, or repeated temporary failures must not be contacted normally.", action: "Keep recipients out of ordinary send queues and require manual override for review.", confidence: "high" });
  if (summary.deferred || summary.softBounce) nextActions.push({ priority: "P1", evidence: summary.deferred + " deferred and " + summary.softBounce + " soft-bounce event(s)", why: "Temporary failures need cooldown and diagnostic review.", action: "Use configured exponential backoff and inspect enhanced status codes before retrying.", confidence: "medium" });
  if (dataCoverage.delivered !== "available") nextActions.push({ priority: "P2", evidence: "Delivered coverage: " + dataCoverage.delivered, why: "Accepted or sent is not delivered.", action: "Verify the signed Resend webhook or import a complete provider delivery export before publishing delivery trends.", confidence: "high" });
  const report = {
    reportType: "Historical Email Health Report", date, timezone: range.timezone, utcRange: range, generatedAt: new Date().toISOString(), dataCoverage, summary,
    rates: {
      deliveryRate: percentage(summary.delivered, summary.sent || summary.accepted, dataCoverage.delivered === "available"),
      bounceRate: percentage(summary.hardBounce + summary.softBounce, summary.sent || summary.accepted, dataCoverage.bounce === "available"),
      observedBouncePerSentAttempt: percentage(summary.hardBounce + summary.softBounce + summary.deferred + summary.blocked, summary.sent || summary.accepted, true),
      hardBounceRate: percentage(summary.hardBounce, summary.sent || summary.accepted, dataCoverage.bounce === "available"),
      softBounceRate: percentage(summary.softBounce, summary.sent || summary.accepted, dataCoverage.bounce === "available"),
      complaintRate: percentage(summary.complaint, summary.sent || summary.accepted, dataCoverage.complaint === "available"),
      replyRate: percentage(summary.humanReplies, summary.sent || summary.accepted, dataCoverage.reply === "available"),
    },
    trend: { previousDay: previous, sevenDayWindow: sevenDay, sampleWarning: summary.sent + summary.accepted < 10 ? "Small sample: percentage movement is not a reliable trend signal." : null },
    normalizedBounceTypes: Object.fromEntries(normalizedBounceTypes),
    rateDefinitions: {
      observedBouncePerSentAttempt: "hard_bounce + soft_bounce + deferred + blocked divided by observed sent/accepted attempts; this is not a standard delivery bounce rate when delivered coverage is incomplete.",
      deliveryRate: "delivered divided by sent/accepted only when delivered coverage is available.",
    },
    sourceStats: Object.fromEntries(sourceStats),
    senderStats: Object.fromEntries(senderStats),
    campaignStats: Object.fromEntries(campaignStats),
    roleAddressStats: Object.fromEntries(roleAddressStats),
    recipientDomains: [...domains.entries()].map(([name, value]) => Object.assign({ domain: name }, value)).sort((a, b) => b.hardBounce + b.softBounce + b.deferred - a.hardBounce - a.softBounce - a.deferred),
    bounceReasons: [...reasons.entries()].map(([name, value]) => ({ reason: name, count: value.count, percentage: events.length ? (value.count / events.length * 100).toFixed(1) + "%" : "Unavailable", affectedDomains: [...value.domains], firstSeen: value.firstSeen, lastSeen: value.lastSeen, smtpStatusCodes: [...value.smtp] })).sort((a, b) => b.count - a.count),
    newSuppressions, activeSuppressions: suppressions.filter((item) => item.active), domainHolds, auditLogs,
    sendRecords: sendRecords(messages, events, range),
    replies: events.filter((event) => event.eventType === "reply" || event.eventType === "auto_reply").map((event) => ({ recipient: event.recipient, recipientDomain: event.recipientDomain, subject: event.mailMessageId ? messageMap.get(event.mailMessageId)?.subject || null : null, eventTime: event.eventTime, kind: event.replyKind || (event.eventType === "auto_reply" ? "auto" : "human") })),
    facts, interpretation, nextActions, events, limitations: ["Historical null values are not interpreted as zero.", "Scheduled is not sent, sent/accepted is not delivered, and absence of bounce is not delivery proof.", "Local and provider sources retain separate confidence and coverage semantics.", "Reply and bounce rates are not standard delivery rates unless provider event coverage is complete."],
  };
  await store.saveReportSnapshot(date, report);
  return report;
}

export function reportText(report: Awaited<ReturnType<typeof buildMailReport>>) {
  const statsValue = report.summary;
  const lines = ["# Kehong Email Delivery & Outreach Report", "Reporting date: " + report.date, "Timezone: " + report.timezone, "UTC Query Range: " + report.utcRange.from + " to " + report.utcRange.to, "", "## Data Coverage", "Sent: " + report.dataCoverage.sent, "Delivered Events: " + report.dataCoverage.delivered, "Bounce: " + report.dataCoverage.bounce, "Deferred: " + report.dataCoverage.deferred, "Reply: " + report.dataCoverage.reply, "Complaint: " + report.dataCoverage.complaint, "Unsubscribe: " + report.dataCoverage.unsubscribe, "", "## Overview"];
  for (const [key, value] of Object.entries(statsValue)) lines.push(key + ": " + value);
  lines.push("", "## Rates");
  for (const [key, value] of Object.entries(report.rates)) lines.push(key + ": " + value);
  lines.push("", "## Trend", "Today vs Yesterday: sent/accepted " + (statsValue.sent + statsValue.accepted) + " vs " + (report.trend.previousDay.sent + report.trend.previousDay.accepted) + "; hard bounce " + statsValue.hardBounce + " vs " + report.trend.previousDay.hardBounce + "; deferred " + statsValue.deferred + " vs " + report.trend.previousDay.deferred + "; human replies " + statsValue.humanReplies + " vs " + report.trend.previousDay.humanReplies + ".", "Today vs 7-Day Window: sent/accepted " + (statsValue.sent + statsValue.accepted) + " vs " + (report.trend.sevenDayWindow.sent + report.trend.sevenDayWindow.accepted) + ".", report.trend.sampleWarning || "Sample size is not flagged as small.", "", "## Recipient Domains");
  lines.push(...(report.recipientDomains.length ? report.recipientDomains.map((item) => item.domain + ": sent " + (item.sent + item.accepted) + ", delivered " + item.delivered + ", deferred " + item.deferred + ", hard bounce " + item.hardBounce + ", soft bounce " + item.softBounce + ", blocked " + item.blocked + ", human replies " + item.humanReplies + ", auto replies " + item.autoReplies) : ["No recipient-domain events in this window."]));
  lines.push("", "## Send Records");
  if (report.sendRecords.length) for (const item of report.sendRecords) lines.push("", "Company: " + (item.company || "-"), "Recipient: " + (item.recipients.join(", ") || item.recipient || "-"), "Sent at: " + (item.sentAt || "-"), "Subject: " + (item.subject || "-"), "Campaign: " + (item.campaign || "-"), "Send status: " + item.sendStatus, "Tracking ID: " + (item.trackingId || "-"));
  else lines.push("No send records in this window.");
  lines.push("", "## Bounce Reasons");
  lines.push(...(report.bounceReasons.length ? report.bounceReasons.map((item) => item.reason + ": " + item.count + " (" + item.percentage + "); domains " + (item.affectedDomains.join(", ") || "-") + "; SMTP " + (item.smtpStatusCodes.join(", ") || "-")) : ["No bounce/deferred reason records in this window."]));
  lines.push("", "## Standard Bounce Types");
  lines.push(...(Object.entries(report.normalizedBounceTypes).length ? Object.entries(report.normalizedBounceTypes).map(([type, count]) => type + ": " + count) : ["No normalized bounce types in this window."]));
  lines.push("", "## Grouped Quality Stats");
  lines.push("By source: " + JSON.stringify(report.sourceStats));
  lines.push("By sender: " + JSON.stringify(report.senderStats));
  lines.push("By campaign: " + JSON.stringify(report.campaignStats));
  lines.push("Role address vs named/unknown: " + JSON.stringify(report.roleAddressStats));
  lines.push("", "## New Suppressions");
  lines.push(...(report.newSuppressions.length ? report.newSuppressions.map((item) => item.recipientNormalized + ": " + item.suppressionType + "; " + item.reason) : ["None recorded in this window."]));
  lines.push("", "## Active Domain Holds");
  lines.push(...(report.domainHolds.length ? report.domainHolds.map((item) => item.domain + ": " + item.holdType + "; expires " + (item.expiresAt || "never") + "; consecutive failures " + item.consecutiveFailureCount) : ["None recorded."]));
  lines.push("", "## Replies");
  lines.push(...(report.replies.length ? report.replies.map((item) => item.kind + ": " + (item.recipient || "unknown") + " / " + (item.recipientDomain || "unknown") + " / " + (item.subject || "(no subject)") + " / " + item.eventTime) : ["No reply events in this window."]));
  lines.push("", "## Facts", ...report.facts.map((item) => "- " + item), "", "## Interpretation", ...report.interpretation.map((item) => "- " + item), "", "## Next Actions");
  lines.push(...(report.nextActions.length ? report.nextActions.map((item) => item.priority + ": Evidence: " + item.evidence + "; Why: " + item.why + "; Action: " + item.action + "; Confidence: " + item.confidence) : ["No additional action generated from current evidence."]));
  lines.push("", "## Limitations", ...report.limitations.map((item) => "- " + item));
  return lines.join("\n");
}

export function reportHtml(report: Awaited<ReturnType<typeof buildMailReport>>) { return "<div style=\"font-family:Arial,sans-serif\"><pre style=\"white-space:pre-wrap;font:14px/1.6 Arial,sans-serif\">" + escapeHtml(reportText(report)) + "</pre></div>"; }
export function currentLocalDate() { return localDate(new Date()); }
