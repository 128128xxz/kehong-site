import { createHash } from "node:crypto";
import type { MailEvent } from "./types";

export const ROLE_ADDRESS_LOCAL_PARTS = new Set(["info", "sales", "support", "contact", "hello", "enquiry", "inquiries", "admin", "office", "marketing", "service", "help", "mail", "business", "export", "purchase", "purchasing"]);

export function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().replace(/^.*<([^>]+)>.*$/, "$1").toLowerCase();
}

export function emailDomain(value: string | null | undefined) {
  const email = normalizeEmail(value);
  const at = email.lastIndexOf("@");
  return at > 0 ? email.slice(at + 1) : null;
}

export function isRoleAddress(value: string | null | undefined) {
  const local = normalizeEmail(value).split("@")[0];
  return ROLE_ADDRESS_LOCAL_PARTS.has(local);
}

export function normalizeSubject(value: string | null | undefined) {
  return (value ?? "").replace(/^(?:(?:re|fw|fwd)\s*:\s*)+/iu, "").replace(/\s+/gu, " ").trim().toLocaleLowerCase();
}

export function safeProviderResponse(value: unknown, maxLength = 16000) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? null);
  if (!text) return null;
  return text.length > maxLength ? text.slice(0, maxLength) + "...[truncated]" : text;
}

export function stableHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function eventDedupeKey(event: Pick<MailEvent, "provider" | "providerEventId" | "eventType" | "mailMessageId" | "recipient" | "eventTime" | "diagnosticCode" | "rawEventReference">) {
  const provider = event.provider ?? "unknown";
  if (event.providerEventId) return provider + ":provider-event:" + event.providerEventId;
  return provider + ":" + event.eventType + ":" + (event.mailMessageId ?? "unmatched") + ":" + normalizeEmail(event.recipient) + ":" + event.eventTime + ":" + stableHash(event.diagnosticCode ?? event.rawEventReference ?? "");
}
