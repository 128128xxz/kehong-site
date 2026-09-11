import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { classifyBounce, classifyReply, eventTypeForResend } from "@/server/mail-history/classification";
import { emailDomain, normalizeEmail, safeProviderResponse } from "@/server/mail-history/normalize";
import { ingestMailEvent } from "@/server/mail-history/service";
import { getMailHistoryStore } from "@/server/mail-history/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSignature(body: string, request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const id = request.headers.get("svix-id")?.trim();
  const timestamp = request.headers.get("svix-timestamp")?.trim();
  const signature = request.headers.get("svix-signature")?.trim();
  if (!secret || !id || !timestamp || !signature) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/u, ""), "base64");
  const expected = createHmac("sha256", key).update(id + "." + timestamp + "." + body).digest("base64");
  return signature.split(" ").some((part) => {
    const value = Buffer.from(part.replace(/^v1,/u, ""));
    const target = Buffer.from(expected);
    return value.length === target.length && timingSafeEqual(value, target);
  });
}

function recipients(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => normalizeEmail(typeof item === "string" ? item : "")).filter(Boolean);
  return typeof value === "string" ? value.split(/[;,\s]+/u).map(normalizeEmail).filter(Boolean) : [];
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!validSignature(body, request)) return NextResponse.json({ ok: false, code: "INVALID_SIGNATURE" }, { status: 401 });
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body) as Record<string, unknown>; } catch { return NextResponse.json({ ok: false, code: "INVALID_JSON" }, { status: 400 }); }
  const type = typeof payload.type === "string" ? payload.type : "unknown";
  const data = payload.data && typeof payload.data === "object" ? payload.data as Record<string, unknown> : {};
  const eventType = eventTypeForResend(type);
  const recipient = recipients(data.to ?? data.recipient)[0] ?? "";
  const smtp = typeof data.smtp_code === "string" ? data.smtp_code : typeof data.status_code === "string" ? data.status_code : null;
  const enhanced = typeof data.enhanced_status_code === "string" ? data.enhanced_status_code : null;
  const diagnostic = typeof data.diagnostic_code === "string" ? data.diagnostic_code : typeof data.reason === "string" ? data.reason : null;
  const bounce = classifyBounce({ eventType, smtpStatusCode: smtp, enhancedStatusCode: enhanced, diagnosticCode: diagnostic, providerResponse: JSON.stringify(data) });
  const providerMessageId = typeof data.email_id === "string" ? data.email_id : typeof data.id === "string" ? data.id : null;
  const providerEventId = typeof payload.id === "string" ? payload.id : request.headers.get("svix-id");
  const subject = typeof data.subject === "string" ? data.subject : null;
  const headers = data.headers && typeof data.headers === "object" ? Object.fromEntries(Object.entries(data.headers as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {};
  const mappedType = eventType === "hard_bounce" || eventType === "deferred" || eventType === "blocked" ? bounce.eventType : eventType;
  const event = await ingestMailEvent({
    provider: "resend",
    providerMessageId,
    providerEventId,
    eventType: mappedType,
    eventTime: typeof data.created_at === "string" ? data.created_at : typeof payload.created_at === "string" ? payload.created_at : new Date().toISOString(),
    recipient,
    subject,
    messageId: typeof data.message_id === "string" ? data.message_id : null,
    threadId: typeof data.thread_id === "string" ? data.thread_id : null,
    smtpStatusCode: smtp,
    enhancedStatusCode: enhanced,
    diagnosticCode: diagnostic,
    providerResponse: safeProviderResponse(data),
    rawPayload: payload,
    sender: typeof data.from === "string" ? data.from : null,
    campaignId: typeof data.tags === "object" && data.tags && typeof (data.tags as Record<string, unknown>).campaign === "string" ? (data.tags as Record<string, string>).campaign : null,
    receivedAt: new Date().toISOString(),
    bounceCategory: ["hard_bounce", "soft_bounce", "deferred", "blocked"].includes(eventType) ? bounce.category : null,
    bounceReason: ["hard_bounce", "soft_bounce", "deferred", "blocked"].includes(eventType) ? bounce.reason : null,
    replyKind: eventType === "reply" ? classifyReply(subject, headers) : null,
    source: "provider_webhook",
    confidence: "confirmed",
    rawEventReference: providerEventId ? "resend:" + providerEventId : null,
    retryable: bounce.retryable,
  });
  await getMailHistoryStore().upsertCoverage({
    id: "resend-webhook",
    source: "provider_webhook",
    startAt: new Date().toISOString(),
    endAt: null,
    sentAvailable: true,
    deliveredAvailable: true,
    bounceAvailable: true,
    replyAvailable: true,
    complaintAvailable: true,
    unsubscribeAvailable: true,
    deferredAvailable: true,
    notes: "Coverage begins when signed Resend webhook events are accepted by this endpoint.",
    confidence: "confirmed",
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, eventId: event.id, eventType: event.eventType, recipientDomain: emailDomain(recipient) });
}

export async function GET() {
  return NextResponse.json({ ok: true, provider: "resend", coverage: process.env.RESEND_WEBHOOK_SECRET?.trim() ? "configured" : "unavailable" });
}
