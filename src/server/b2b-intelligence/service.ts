import { randomUUID } from "node:crypto";
import { visitorConfig, visitorIntelligenceEnabled } from "./config";
import { digestWindowForEvent } from "./service-window";
import { getVisitorDigestStore } from "./redis-store";
import type { DigestEventInput, VisitorIdentityMode } from "./digest-types";
import { classifyBotSignals, extractGeoHeaders, isLikelyDatacenter } from "./traffic-classification";
import { parseUserAgentHeader } from "./user-agent";
import { extractTrustedClientIp, hashIp } from "./ip";

function expiry(nowMs: number) { return new Date(nowMs + visitorConfig.digestRetentionHours * 60 * 60 * 1000).toISOString(); }

function extractIdentity(event: Pick<DigestEventInput, "visitorId" | "sessionId" | "identityMode"> & Partial<Pick<DigestEventInput, "automationHint">>, request: Request) {
  const providedVisitorId = event.visitorId?.trim();
  const providedSessionId = event.sessionId?.trim();
  const automationHint = typeof event.automationHint === "boolean" ? event.automationHint : false;
  const identityMode: VisitorIdentityMode = (event.identityMode ?? "cookie") as VisitorIdentityMode;
  const userAgent = request.headers.get("user-agent");
  const userAgentInfo = parseUserAgentHeader(userAgent);
  const bot = classifyBotSignals({
    userAgent: userAgentInfo.userAgent,
    automationHint,
    eventSeed: `${providedVisitorId ?? "unknown"}:session:${providedSessionId ?? "unknown"}`,
  });
  const geo = extractGeoHeaders(request);
  const asnOrg = geo.asnOrg;
  const isDatacenter = isLikelyDatacenter(asnOrg);

  return {
    visitorId: providedVisitorId || randomUUID(),
    sessionId: providedSessionId || randomUUID(),
    identityMode: identityMode ?? "ip_fallback",
    automationHint,
    userAgent: userAgentInfo.userAgent,
    browser: userAgentInfo.browser,
    os: userAgentInfo.os,
    deviceType: userAgentInfo.deviceType,
    botStatus: bot.botStatus,
    botReasons: bot.botReasons,
    geo,
    isDatacenter: isDatacenter === null ? null : Boolean(isDatacenter),
  };
}

export type VisitorEventProcessingOptions = { now?: () => Date };

export async function processVisitorEvent(request: Request, event: Omit<DigestEventInput, "rawIp" | "ipHash" | "occurredAt" | "digestWindow" | "expiresAt">, options: VisitorEventProcessingOptions = {}) {
  if (!visitorIntelligenceEnabled()) return { accepted: true, deduplicated: false, disabled: true };

  const rawIp = extractTrustedClientIp(request);
  const ipHash = hashIp(rawIp);
  const now = options.now?.() ?? new Date();
  const identity = extractIdentity(event, request);
  const fallbackVisitorId = ipHash ? `ip_${ipHash}` : `ip_unknown_${randomUUID()}`;
  const visitorId =
    identity.identityMode === "ip_fallback" && ipHash
      ? fallbackVisitorId
      : identity.visitorId || fallbackVisitorId;
  const identityMode = rawIp && event.identityMode ? event.identityMode : identity.identityMode;

  const digestEvent: DigestEventInput = {
    ...event,
    rawIp,
    ipHash,
    visitorId,
    identityMode,
    userAgent: identity.userAgent,
    browser: identity.browser,
    os: identity.os,
    deviceType: identity.deviceType,
    sessionId: event.sessionId || identity.sessionId,
    countryCode: identity.geo.countryCode,
    region: identity.geo.region,
    city: identity.geo.city,
    asn: identity.geo.asn,
    asnOrg: identity.geo.asnOrg,
    isDatacenter: identity.isDatacenter,
    cloudProvider: identity.geo.cloudProvider,
    botStatus: identity.botStatus,
    botReasons: identity.botReasons,
    occurredAt: now.toISOString(),
    digestWindow: digestWindowForEvent(now),
    expiresAt: expiry(now.getTime()),
    automationHint: identity.automationHint,
  };
  await getVisitorDigestStore().upsertVisitor(digestEvent, visitorConfig.visitSessionTimeoutMinutes);
  return { accepted: true, deduplicated: false, stored: true };
}

export async function cleanupVisitorIntelligence() {
  const removed = await getVisitorDigestStore().cleanupExpired(new Date().toISOString());
  return { digestRows: removed };
}

export { dailyDigestDateToSend, digestCalendarDate, digestDayToSend, digestWindowForEvent, digestWindowToSend, digestWindowsForDay } from "./service-window";
export type { DigestEventInput, DigestWindowKind } from "./digest-types";
