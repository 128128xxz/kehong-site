import { randomUUID } from "node:crypto";
import { createQueuedMail, safeRecordMailEvent, safeUpdateMailMessage, unsuppressedRecipients } from "./service";
import { normalizeEmail, safeProviderResponse, stableHash } from "./normalize";
import { mailHistoryConfig } from "./config";
import { getMailHistoryStore } from "./store";
import { addTrackingIdToEmail, createTrackingId } from "./tracking";

export type ResendSendInput = {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string }>;
  company?: string | null;
  source: string;
  campaign?: string;
  templateId?: string;
  tag?: string;
  messageId?: string;
  queueStatus?: string | null;
  attemptNumber?: number | null;
};

export async function sendWithResend(input: ResendSendInput) {
  const lockKey = stableHash([input.source, input.campaign ?? "", input.messageId ?? "", input.subject, ...input.to.map(normalizeEmail).sort()].join("|"));
  const lockStore = getMailHistoryStore();
  const lockToken = await lockStore.acquireSendLock(lockKey, mailHistoryConfig.sendLockTtlSeconds);
  if (!lockToken) {
    await lockStore.appendAuditLog({ id: randomUUID(), action: "send_lock_denied", recipient: null, domain: null, sourceEventId: null, messageId: input.messageId ?? null, reason: "another identical send is in progress or within lock TTL", before: null, after: { source: input.source, campaign: input.campaign ?? null }, createdAt: new Date().toISOString() });
    return { ok: false as const, skipped: true as const, networkError: false, reason: "DUPLICATE_SEND_IN_PROGRESS" as const, status: 409, skippedRecipients: input.to.map((recipient) => ({ recipient, reason: "send_lock_denied" })) };
  }
  try {
  const trackingId = createTrackingId();
  const checked = await unsuppressedRecipients(input.to, { source: input.source, campaign: input.campaign, subject: input.subject, messageId: input.messageId, queueStatus: input.queueStatus, attemptNumber: input.attemptNumber });
  const record = await createQueuedMail({
    source: input.source,
    provider: "resend",
    recipient: checked.allowed[0] || input.to[0] || "",
    recipients: input.to,
    company: input.company ?? null,
    trackingId,
    sender: normalizeEmail(input.from),
    subject: input.subject,
    campaign: input.campaign ?? null,
    templateId: input.templateId ?? null,
    tag: input.tag ?? null,
    confidence: "confirmed",
  }).catch(() => null);
  if (!checked.allowed.length) {
    if (record) await safeRecordMailEvent({ mailMessageId: record.id, provider: "resend", eventType: "skipped", recipient: record.recipient, source: input.source, confidence: "confirmed", bounceReason: checked.skipped.map((item) => item.recipient + ": " + item.reason).join("; ") });
    return { ok: false as const, skipped: true as const, networkError: false, reason: "SUPPRESSED" as const, status: 0, trackingId, skippedRecipients: checked.skipped };
  }
  const finalChecked = await unsuppressedRecipients(checked.allowed, { source: input.source, campaign: input.campaign, subject: input.subject, messageId: input.messageId, queueStatus: input.queueStatus, attemptNumber: input.attemptNumber });
  if (!finalChecked.allowed.length) {
    if (record) for (const skipped of finalChecked.skipped) await safeRecordMailEvent({ mailMessageId: record.id, provider: "resend", eventType: "skipped", recipient: skipped.recipient, source: input.source, confidence: "confirmed", bounceReason: skipped.reason });
    return { ok: false as const, skipped: true as const, networkError: false, reason: "SUPPRESSED" as const, status: 0, trackingId, skippedRecipients: [...checked.skipped, ...finalChecked.skipped] };
  }
  checked.allowed.splice(0, checked.allowed.length, ...finalChecked.allowed);
  if (record) {
    checked.skipped.push(...finalChecked.skipped);
    for (const skipped of finalChecked.skipped) await safeRecordMailEvent({ mailMessageId: record.id, provider: "resend", eventType: "skipped", recipient: skipped.recipient, source: input.source, confidence: "confirmed", bounceReason: skipped.reason });
  }
  if (!record) return { ok: false as const, skipped: false as const, networkError: false, reason: "MAIL_HISTORY_UNAVAILABLE" as const, status: 503, trackingId, skippedRecipients: checked.skipped };
  const trackedEmail = addTrackingIdToEmail({ html: input.html, text: input.text, trackingId });
  const body = {
    from: input.from,
    to: checked.allowed,
    reply_to: input.replyTo || undefined,
    subject: input.subject,
    html: trackedEmail.html,
    text: trackedEmail.text,
    ...(input.attachments?.length ? { attachments: input.attachments } : {}),
  };
  let response: Response;
  let responseText = "";
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + input.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    responseText = await response.text();
  } catch (error) {
    if (record) await safeRecordMailEvent({ mailMessageId: record.id, provider: "resend", eventType: "failed", recipient: record.recipient, source: input.source, confidence: "confirmed", providerResponse: error instanceof Error ? error.message : "network error", retryable: true });
    return { ok: false as const, skipped: false as const, networkError: true, reason: "PROVIDER_FAILURE" as const, status: 0, trackingId, skippedRecipients: checked.skipped };
  }
  let providerMessageId: string | null = null;
  try {
    const parsed = JSON.parse(responseText) as { id?: unknown };
    if (typeof parsed.id === "string" && parsed.id) providerMessageId = parsed.id;
  } catch {
    // Preserve the raw response in the event when the provider does not return JSON.
  }
  if (!response.ok) {
    if (record) await safeRecordMailEvent({ mailMessageId: record.id, provider: "resend", eventType: "failed", recipient: record.recipient, source: input.source, confidence: "confirmed", providerResponse: safeProviderResponse(responseText), retryable: response.status >= 400 && response.status < 500 });
    return { ok: false as const, skipped: false as const, networkError: false, reason: "PROVIDER_FAILURE" as const, status: response.status, trackingId, skippedRecipients: checked.skipped };
  }
  if (record) {
    await safeUpdateMailMessage(record.id, { providerMessageId });
    await safeRecordMailEvent({ mailMessageId: record.id, provider: "resend", eventType: "accepted", recipient: record.recipient, sender: input.from, campaignId: input.campaign, source: input.source, confidence: "confirmed", providerResponse: providerMessageId ? { id: providerMessageId } : responseText });
    await getMailHistoryStore().upsertCoverage({
      id: "resend-api",
      source: "resend_api",
      startAt: new Date().toISOString(),
      endAt: null,
      sentAvailable: false,
      deliveredAvailable: false,
      bounceAvailable: false,
      replyAvailable: false,
      complaintAvailable: false,
      unsubscribeAvailable: false,
      deferredAvailable: false,
      notes: "Resend API response proves request acceptance only; provider delivery events require the signed webhook.",
      confidence: "confirmed",
      createdAt: new Date().toISOString(),
    }).catch(() => undefined);
  }
  return { ok: true as const, skipped: false as const, networkError: false, reason: null, status: response.status, providerMessageId, trackingId, skippedRecipients: checked.skipped };
  } finally {
    await lockStore.releaseSendLock(lockKey, lockToken).catch(() => false);
  }
}
