import { randomUUID } from "node:crypto";
import { mailHistoryConfig } from "./config";
import { classifyBounce } from "./classification";
import { emailDomain, eventDedupeKey, isRoleAddress, normalizeEmail, normalizeSubject, safeProviderResponse } from "./normalize";
import { getMailHistoryStore } from "./store";
import type { BounceCategory, MailConfidence, MailDomainHold, MailEvent, MailEventType, MailMatchConfidence, MailMessage, MailSource, MailSuppression, ReplyKind } from "./types";

export type MailMessageInput = {
  source: MailSource | string;
  provider?: string | null;
  providerMessageId?: string | null;
  messageId?: string | null;
  threadId?: string | null;
  recipient: string;
  recipients?: string[];
  company?: string | null;
  trackingId?: string | null;
  sender?: string | null;
  subject?: string | null;
  templateId?: string | null;
  campaign?: string | null;
  tag?: string | null;
  scheduledAt?: string | null;
  historicalSource?: string | null;
  confidence?: MailConfidence;
  matchingConfidence?: MailMatchConfidence;
  sourceRecord?: Record<string, string> | null;
  queueStatus?: string | null;
  mxVerified?: string | null;
};

export type MailEventInput = {
  mailMessageId?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
  providerEventId?: string | null;
  eventType: MailEventType;
  eventTime?: string;
  recipient?: string | null;
  subject?: string | null;
  messageId?: string | null;
  threadId?: string | null;
  smtpStatusCode?: string | null;
  enhancedStatusCode?: string | null;
  diagnosticCode?: string | null;
  providerResponse?: unknown;
  bounceCategory?: BounceCategory | null;
  bounceReason?: string | null;
  replyKind?: ReplyKind | null;
  attemptNumber?: number | null;
  source: MailSource | string;
  confidence: MailConfidence;
  matchingConfidence?: MailMatchConfidence;
  rawEventReference?: string | null;
  retryable?: boolean | null;
  retryAfter?: string | null;
  sender?: string | null;
  campaignId?: string | null;
  receivedAt?: string | null;
  rawPayload?: unknown | null;
  rawRecord?: Record<string, unknown> | null;
};

function messageFromInput(input: MailMessageInput, now = new Date().toISOString()): MailMessage {
  const recipients = (input.recipients?.length ? input.recipients : [input.recipient]).map(normalizeEmail).filter(Boolean);
  const recipient = normalizeEmail(input.recipient) || recipients[0] || "";
  return {
    id: randomUUID(),
    source: input.source,
    provider: input.provider ?? null,
    providerMessageId: input.providerMessageId ?? null,
    messageId: input.messageId ?? null,
    threadId: input.threadId ?? null,
    recipient,
    recipients,
    company: input.company?.trim() || null,
    trackingId: input.trackingId ?? null,
    recipientDomain: emailDomain(recipient),
    sender: normalizeEmail(input.sender),
    senderDomain: emailDomain(input.sender),
    subject: input.subject?.trim() || null,
    templateId: input.templateId ?? null,
    campaign: input.campaign ?? null,
    tag: input.tag ?? null,
    scheduledAt: input.scheduledAt ?? null,
    firstSentAt: null,
    lastEventAt: null,
    createdAt: now,
    updatedAt: now,
    historicalSource: input.historicalSource ?? null,
    confidence: input.confidence ?? "unknown",
    matchingConfidence: input.matchingConfidence ?? null,
    sourceRecord: input.sourceRecord ?? null,
    roleAddress: isRoleAddress(recipient),
    queueStatus: input.queueStatus ?? null,
    mxVerified: input.mxVerified ?? null,
  };
}

function eventFromInput(input: MailEventInput, now = new Date().toISOString()): MailEvent {
  const recipient = normalizeEmail(input.recipient);
  return {
    id: randomUUID(),
    mailMessageId: input.mailMessageId ?? null,
    provider: input.provider ?? null,
    providerEventId: input.providerEventId ?? null,
    eventType: input.eventType,
    eventTime: input.eventTime ?? now,
    recipient: recipient || null,
    recipientDomain: emailDomain(recipient),
    smtpStatusCode: input.smtpStatusCode ?? null,
    enhancedStatusCode: input.enhancedStatusCode ?? null,
    diagnosticCode: input.diagnosticCode ?? null,
    providerResponse: safeProviderResponse(input.providerResponse),
    bounceCategory: input.bounceCategory ?? null,
    bounceReason: input.bounceReason ?? null,
    replyKind: input.replyKind ?? null,
    attemptNumber: input.attemptNumber ?? null,
    source: input.source,
    confidence: input.confidence,
    matchingConfidence: input.matchingConfidence ?? null,
    rawEventReference: input.rawEventReference ?? null,
    retryable: input.retryable ?? null,
    retryAfter: input.retryAfter ?? null,
    sender: normalizeEmail(input.sender),
    senderDomain: emailDomain(input.sender),
    campaignId: input.campaignId ?? null,
    receivedAt: input.receivedAt ?? null,
    rawPayload: input.rawPayload ?? null,
    rawRecord: input.rawRecord ?? null,
    createdAt: now,
  };
}

export async function createMailMessage(input: MailMessageInput) {
  return getMailHistoryStore().upsertMessage(messageFromInput(input));
}

export async function safeCreateMailMessage(input: MailMessageInput) {
  try { return await createMailMessage(input); } catch (error) { console.error("mail history message write failed", error); return null; }
}

export async function safeUpdateMailMessage(id: string, patch: Partial<MailMessage>) {
  try { return await getMailHistoryStore().updateMessage(id, patch); } catch (error) { console.error("mail history message update failed", error); return null; }
}

export async function recordMailEvent(input: MailEventInput) {
  const store = getMailHistoryStore();
  const event = eventFromInput(input);
  if (["hard_bounce", "soft_bounce", "deferred", "blocked", "rejected", "failed"].includes(event.eventType)) {
    const classified = classifyBounce(event);
    event.bounceCategory = classified.category;
    event.bounceReason = event.bounceReason ?? classified.reason;
    event.retryable = event.retryable ?? classified.retryable;
    event.normalizedBounceType = classified.normalizedType;
    event.matchedRuleId = classified.matchedRuleId;
    event.classifierVersion = classified.classifierVersion;
    event.classificationConfidence = classified.confidence;
    event.classificationPriority = classified.priority;
  }
  const result = await store.appendEvent(event);
  if (result.inserted) {
    if (event.mailMessageId) {
      await store.updateMessage(event.mailMessageId, { lastEventAt: event.eventTime, ...(event.eventType === "sent" || event.eventType === "accepted" ? { firstSentAt: event.eventTime } : {}) });
    }
    await applySuppression(event);
  }
  return result.event;
}

export async function safeRecordMailEvent(input: MailEventInput) {
  try { return await recordMailEvent(input); } catch (error) { console.error("mail history event write failed", error); return null; }
}

export async function createQueuedMail(input: MailMessageInput) {
  const message = await createMailMessage(input);
  await recordMailEvent({ mailMessageId: message.id, provider: message.provider, eventType: "queued", eventTime: message.createdAt, recipient: message.recipient, source: input.source, confidence: input.confidence ?? "unknown", matchingConfidence: message.matchingConfidence });
  return message;
}

export async function findOrCreateMessageForEvent(input: MailMessageInput & { eventTime?: string }) {
  const store = getMailHistoryStore();
  if (input.provider && input.providerMessageId) {
    const matches = await store.findMessagesByProviderId(input.provider, input.providerMessageId);
    if (matches[0]) return { message: matches[0], matchingConfidence: "provider_id" as const };
  }
  const recipient = normalizeEmail(input.recipient);
  const subject = normalizeSubject(input.subject);
  const occurredAt = Date.parse(input.eventTime ?? new Date().toISOString());
  const candidates = recipient ? (await store.findMessages()).filter((message) => {
    const created = Date.parse(message.createdAt);
    return (message.recipient === recipient || message.recipients.includes(recipient)) && normalizeSubject(message.subject) === subject && Number.isFinite(created) && Number.isFinite(occurredAt) && Math.abs(created - occurredAt) <= 7 * 24 * 60 * 60 * 1000;
  }) : [];
  if (candidates.length === 1) {
    const matchingConfidence = input.messageId ? "message_id" as const : input.threadId ? "thread" as const : "fallback" as const;
    await store.updateMessage(candidates[0].id, { providerMessageId: input.providerMessageId ?? candidates[0].providerMessageId, messageId: input.messageId ?? candidates[0].messageId, threadId: input.threadId ?? candidates[0].threadId, matchingConfidence });
    return { message: (await store.getMessage(candidates[0].id)) ?? candidates[0], matchingConfidence };
  }
  const message = await createMailMessage({ ...input, matchingConfidence: candidates.length ? "unmatched" : "unmatched" });
  return { message, matchingConfidence: "unmatched" as const };
}

export async function ingestMailEvent(input: MailEventInput) {
  const match = await findOrCreateMessageForEvent({
    source: input.source,
    provider: input.provider,
    providerMessageId: input.providerMessageId ?? null,
    messageId: input.messageId,
    threadId: input.threadId,
    recipient: input.recipient ?? "",
    subject: input.subject,
    confidence: input.confidence,
    matchingConfidence: input.matchingConfidence,
    eventTime: input.eventTime,
  });
  return recordMailEvent({ ...input, mailMessageId: match.message.id, matchingConfidence: match.matchingConfidence });
}

async function applySuppression(event: MailEvent) {
  const recipient = normalizeEmail(event.recipient);
  if (!recipient) return;
  const normalizedType = event.normalizedBounceType;
  if (normalizedType === "domain_infrastructure") {
    await applyDomainHold(event);
    return;
  }
  let type: MailSuppression["suppressionType"] | null = null;
  if (normalizedType === "hard_bounce_recipient") type = "permanent_hard_bounce";
  if (event.eventType === "complaint") type = "complaint";
  if (event.eventType === "unsubscribe") type = "unsubscribe";
  if (normalizedType === "soft_bounce_mailbox") {
    const timestamp = Date.parse(event.eventTime);
    const from = new Date(timestamp - mailHistoryConfig.repeatedSoftBounceWindowDays * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date(timestamp + 1).toISOString();
    const softBounces = (await getMailHistoryStore().findEvents({ from, to })).filter((item) => normalizeEmail(item.recipient) === recipient && item.normalizedBounceType === "soft_bounce_mailbox");
    type = softBounces.length >= mailHistoryConfig.repeatedSoftBounceThreshold ? "repeated_soft_bounce" : "temporary_mailbox";
  }
  if (normalizedType === "policy_or_authentication") type = "temporary_policy";
  if (!type) return;
  const store = getMailHistoryStore();
  const existing = await store.getSuppression(recipient);
  if (existing?.manuallyOverriddenAt || (existing?.active && ["complaint", "unsubscribe", "permanent_hard_bounce", "hard_bounce"].includes(existing.suppressionType) && type !== "complaint" && type !== "unsubscribe" && type !== "permanent_hard_bounce")) return;
  const next = await store.upsertSuppression({
    id: existing?.id ?? randomUUID(),
    recipient: event.recipient ?? recipient,
    recipientNormalized: recipient,
    recipientDomain: emailDomain(recipient) ?? "",
    suppressionType: type,
    status: "active",
    reason: event.bounceReason ?? event.diagnosticCode ?? event.eventType,
    sourceEventId: event.id,
    firstSeenAt: existing?.firstSeenAt ?? event.eventTime,
    lastSeenAt: event.eventTime,
    retryCount: (existing?.retryCount ?? 0) + (event.retryable ? 1 : 0),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    expiresAt: ["temporary_mailbox", "temporary_policy", "repeated_soft_bounce"].includes(type) ? new Date(Date.parse(event.eventTime) + (["temporary_policy"].includes(type) ? mailHistoryConfig.temporaryPolicyHoldHours * 3600000 : ["repeated_soft_bounce"].includes(type) ? mailHistoryConfig.repeatedSoftBounceWindowDays * 86400000 : mailHistoryConfig.temporaryMailboxHoldDays * 86400000)).toISOString() : null,
    active: true,
    manuallyOverriddenAt: existing?.manuallyOverriddenAt ?? null,
    notes: existing?.notes ?? null,
  });
  await store.appendAuditLog({ id: randomUUID(), action: existing ? "suppression_updated" : "suppression_created", recipient, domain: emailDomain(recipient), sourceEventId: event.id, messageId: event.mailMessageId, reason: next.reason, before: existing, after: next, createdAt: new Date().toISOString() });
}

async function applyDomainHold(event: MailEvent) {
  const domain = (event.recipientDomain || emailDomain(event.recipient) || "").toLowerCase();
  if (!domain) return;
  const store = getMailHistoryStore();
  const existing = await store.getDomainHold(domain);
  const failures = (await store.findEvents()).filter((item) => (item.recipientDomain || emailDomain(item.recipient) || "").toLowerCase() === domain && item.normalizedBounceType === "domain_infrastructure").length;
  const permanent = failures >= mailHistoryConfig.domainPermanentFailureThreshold;
  const hold: MailDomainHold = {
    id: existing?.id ?? randomUUID(),
    domain,
    holdType: permanent ? "permanent_invalid_domain" : /mx|mail\s+host/iu.test(event.diagnosticCode ?? "") ? "temporary_mx" : "temporary_dns",
    status: "active",
    reason: event.bounceReason ?? event.diagnosticCode ?? "domain infrastructure failure",
    sourceBounceEventId: event.id,
    firstSeenAt: existing?.firstSeenAt ?? event.eventTime,
    lastCheckedAt: null,
    expiresAt: permanent ? null : new Date(Date.parse(event.eventTime) + mailHistoryConfig.temporaryDomainHoldHours * 3600000).toISOString(),
    checkCount: existing?.checkCount ?? 0,
    consecutiveFailureCount: failures,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await store.upsertDomainHold(hold);
  await store.appendAuditLog({ id: randomUUID(), action: existing && permanent && existing.holdType !== "permanent_invalid_domain" ? "domain_hold_upgraded" : existing ? "domain_hold_updated" : "domain_hold_created", recipient: null, domain, sourceEventId: event.id, messageId: event.mailMessageId, reason: hold.reason, before: existing, after: hold, createdAt: new Date().toISOString() });
}

export async function suppressionDecision(recipient: string, now = new Date()) {
  const normalized = normalizeEmail(recipient);
  if (!normalized) return { suppressed: false, reason: null as string | null };
  const store = getMailHistoryStore();
  const suppression = await store.getSuppression(normalized);
  if (suppression?.active && (!suppression.status || suppression.status === "active") && (!suppression.expiresAt || Date.parse(suppression.expiresAt) > now.getTime())) return { suppressed: true, scope: "recipient" as const, reason: suppression.suppressionType + ": " + suppression.reason };
  const hold = await store.getDomainHold(emailDomain(normalized) ?? "");
  if (hold?.status === "active" && (!hold.expiresAt || Date.parse(hold.expiresAt) > now.getTime())) return { suppressed: true, scope: "domain" as const, reason: hold.holdType + ": " + hold.reason };
  return { suppressed: false, reason: null as string | null };
}

export type SendGuardInput = { source?: string; campaign?: string | null; subject?: string | null; messageId?: string | null; queueStatus?: string | null; attemptNumber?: number | null };

export async function sendEligibility(recipient: string, context: SendGuardInput = {}) {
  const normalized = normalizeEmail(recipient);
  const suppression = await suppressionDecision(normalized);
  if (suppression.suppressed) return { allowed: false as const, reason: suppression.reason ?? "suppressed" };
  if (/^(?:pending|not\s*checked)$/iu.test(context.queueStatus?.trim() ?? "")) return { allowed: false as const, reason: "queue_status_requires_review: " + context.queueStatus };
  if (context.attemptNumber && context.attemptNumber > mailHistoryConfig.retryMaxAttempts) return { allowed: false as const, reason: "max_attempts_reached" };
  const store = getMailHistoryStore();
  const cutoff = Date.now() - mailHistoryConfig.duplicateSendWindowMinutes * 60000;
  const messages = await store.findMessages();
  const recentEvents = await store.findEvents({ from: new Date(cutoff).toISOString() });
  const duplicate = messages.find((message) => normalizeEmail(message.recipient) === normalized && (!context.messageId || message.messageId === context.messageId) && (!context.campaign || message.campaign === context.campaign) && (!context.subject || normalizeSubject(message.subject) === normalizeSubject(context.subject)) && ((message.firstSentAt && Date.parse(message.firstSentAt) >= cutoff) || recentEvents.some((event) => event.mailMessageId === message.id && event.eventType === "accepted")));
  if (duplicate) return { allowed: false as const, reason: "duplicate_send_window: " + duplicate.id };
  return { allowed: true as const, reason: null };
}

export async function unsuppressedRecipients(recipients: string[], context: SendGuardInput = {}) {
  const allowed: string[] = [];
  const skipped: Array<{ recipient: string; reason: string }> = [];
  for (const recipient of recipients) {
    const decision = await sendEligibility(recipient, context);
    if (!decision.allowed) {
      skipped.push({ recipient, reason: decision.reason });
      await getMailHistoryStore().appendAuditLog({ id: randomUUID(), action: "send_blocked", recipient: normalizeEmail(recipient), domain: emailDomain(recipient), sourceEventId: null, messageId: context.messageId ?? null, reason: decision.reason, before: null, after: { source: context.source, campaign: context.campaign, subject: context.subject }, createdAt: new Date().toISOString() });
    }
    else allowed.push(recipient);
  }
  return { allowed, skipped };
}

export function retryDecision(event: MailEvent, now = new Date()) {
  if (!event.retryable || event.eventType === "hard_bounce" || event.eventType === "complaint" || event.eventType === "unsubscribe") return { retry: false, reason: "permanent_or_non_retryable" };
  const attempt = event.attemptNumber ?? 1;
  if (["policy_or_authentication", "relay_or_configuration", "unknown"].includes(event.normalizedBounceType ?? "")) return { retry: false, reason: "manual_review_required" };
  if (event.normalizedBounceType === "soft_bounce_mailbox" && attempt >= mailHistoryConfig.softBounceMaxAttempts) return { retry: false, reason: "soft_bounce_max_attempts_reached" };
  if (attempt >= mailHistoryConfig.retryMaxAttempts) return { retry: false, reason: "max_attempts_reached" };
  const delayMinutes = Math.min(mailHistoryConfig.retryMaxDelayHours * 60, mailHistoryConfig.retryMinDelayMinutes * 2 ** Math.max(0, attempt - 1));
  return { retry: true, reason: "temporary_failure", retryAt: new Date(now.getTime() + delayMinutes * 60_000).toISOString() };
}

export function mailEventDedupeKey(event: MailEvent) { return eventDedupeKey(event); }
