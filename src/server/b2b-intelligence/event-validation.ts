import { randomUUID } from "node:crypto";
import { isProductionEnvironment } from "./config";
import { visitorEventTypes, type VisitorEventInput } from "./types";

const allowedKeys = new Set(["eventId", "eventType", "path", "pageTitle", "referrer", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "durationSeconds"]);
const piiKeys = /(?:name|email|phone|whatsapp|message|attachment|cookie|password|payment|ip)/iu;

function text(value: unknown, max: number) {
  if (value == null) return null;
  if (typeof value !== "string") throw new Error("INVALID_TEXT");
  const normalized = value.replace(/[\u0000-\u001f\u007f]/gu, "").trim();
  if (normalized.length > max) throw new Error("FIELD_TOO_LONG");
  return normalized || null;
}

function referrer(value: unknown) {
  const normalized = text(value, 1024);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    if (!/^https?:$/iu.test(parsed.protocol)) throw new Error("INVALID_REFERRER");
    return `${parsed.origin}${parsed.pathname}`.slice(0, 1024);
  } catch {
    throw new Error("INVALID_REFERRER");
  }
}

export function parseLeadEvent(value: unknown): VisitorEventInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_BODY");
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (piiKeys.test(key)) throw new Error("PII_NOT_ALLOWED");
    if (!allowedKeys.has(key)) throw new Error("UNKNOWN_FIELD");
  }
  const eventType = record.eventType;
  if (typeof eventType !== "string" || !visitorEventTypes.includes(eventType as typeof visitorEventTypes[number])) throw new Error("INVALID_EVENT_TYPE");
  const path = text(record.path, 512);
  if (!path || !path.startsWith("/") || path.startsWith("//")) throw new Error("INVALID_PATH");
  const duration = record.durationSeconds == null || record.durationSeconds === "" ? null : Number(record.durationSeconds);
  if (duration != null && (!Number.isInteger(duration) || duration < 0 || duration > 3600)) throw new Error("INVALID_DURATION");
  const eventId = text(record.eventId, 100) ?? randomUUID();
  return {
    eventId,
    eventType: eventType as VisitorEventInput["eventType"],
    path,
    pageTitle: text(record.pageTitle, 200),
    referrer: referrer(record.referrer),
    utmSource: text(record.utmSource, 120),
    utmMedium: text(record.utmMedium, 120),
    utmCampaign: text(record.utmCampaign, 160),
    utmTerm: text(record.utmTerm, 160),
    utmContent: text(record.utmContent, 160),
    durationSeconds: duration,
  };
}

export async function readJsonBodyWithLimit(request: Request, maxBytes = 16_384) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > maxBytes) throw new Error("BODY_TOO_LARGE");
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      total += next.value.byteLength;
      if (total > maxBytes) throw new Error("BODY_TOO_LARGE");
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return !isProductionEnvironment();
  const requestOrigin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if ([requestOrigin, configured?.replace(/\/$/u, "")].filter(Boolean).includes(origin)) return true;
  if (!isProductionEnvironment()) {
    try {
      const requested = new URL(requestOrigin);
      const supplied = new URL(origin);
      const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
      return requested.port === supplied.port && localHosts.has(requested.hostname) && localHosts.has(supplied.hostname);
    } catch {
      return false;
    }
  }
  return false;
}
