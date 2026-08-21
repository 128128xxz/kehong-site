import { visitorConfig, visitorIntelligenceEnabled } from "./config";
import { digestWindowForEvent } from "./service-window";
import { getVisitorDigestStore } from "./redis-store";
import type { DigestEventInput, DigestWindowKind } from "./digest-types";
import { extractTrustedClientIp, hashIp } from "./ip";

function expiry(nowMs: number) { return new Date(nowMs + visitorConfig.digestRetentionHours * 60 * 60 * 1000).toISOString(); }

export type VisitorEventProcessingOptions = { now?: () => Date };

export async function processVisitorEvent(request: Request, event: Omit<DigestEventInput, "rawIp" | "ipHash" | "occurredAt" | "digestWindow" | "expiresAt">, options: VisitorEventProcessingOptions = {}) {
  if (!visitorIntelligenceEnabled()) return { accepted: true, deduplicated: false, disabled: true };
  const rawIp = extractTrustedClientIp(request);
  const ipHash = hashIp(rawIp);
  if (!rawIp || !ipHash) return { accepted: true, deduplicated: false, stored: false, reason: "PUBLIC_IP_UNAVAILABLE" };
  const now = options.now?.() ?? new Date();
  const digestEvent: DigestEventInput = { ...event, rawIp, ipHash, occurredAt: now.toISOString(), digestWindow: digestWindowForEvent(now), expiresAt: expiry(now.getTime()) };
  await getVisitorDigestStore().upsertVisitor(digestEvent, visitorConfig.visitSessionTimeoutMinutes);
  return { accepted: true, deduplicated: false, stored: true };
}

export async function cleanupVisitorIntelligence() {
  const removed = await getVisitorDigestStore().cleanupExpired(new Date().toISOString());
  return { digestRows: removed };
}

export { digestWindowForEvent, digestWindowToSend } from "./service-window";
export type { DigestWindowKind };
