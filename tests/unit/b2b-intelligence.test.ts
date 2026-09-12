import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getVisitorDigest } from "@/app/api/visitor-digest/route";
import { buildVisitorDigestEmail, sendVisitorDigest } from "@/server/b2b-intelligence/digest-email";
import { scoreBehavior } from "@/server/b2b-intelligence/behavior-scoring";
import { getVisitorDigestStore, MemoryVisitorDigestStore, resetMemoryVisitorDigestStore } from "@/server/b2b-intelligence/redis-store";
import { dailyDigestDateToSend, digestWindowForEvent, digestWindowToSend } from "@/server/b2b-intelligence/service";
import { hashIp, isPublicRoutableIp, normalizeIp } from "@/server/b2b-intelligence/ip";
import { parseLeadEvent } from "@/server/b2b-intelligence/event-validation";
import type { DigestEventInput, VisitorDigestRecord } from "@/server/b2b-intelligence/digest-types";

const originalEnv = { ...process.env };

function event(overrides: Partial<DigestEventInput> = {}): DigestEventInput {
  return {
    eventId: "event-1",
    eventType: "page_view",
    path: "/en",
    pageTitle: "Home",
    referrer: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    durationSeconds: null,
    rawIp: "8.8.8.8",
    ipHash: "hash",
    visitorId: "visitor-a",
    sessionId: "session-a",
    identityMode: "cookie",
    automationHint: false,
    userAgent: "Mozilla/5.0 Chrome/120.0.0.0",
    browser: "Chrome",
    os: "Windows",
    deviceType: "desktop",
    countryCode: "US",
    region: "CA",
    city: "Mountain View",
    asn: "AS15169",
    asnOrg: "Google LLC",
    isDatacenter: false,
    cloudProvider: null,
    botStatus: "not_bot",
    botReasons: [],
    occurredAt: "2026-08-21T04:00:00.000Z",
    digestWindow: "2026-08-21-12-18",
    expiresAt: "2026-08-23T04:00:00.000Z",
    ...overrides,
  };
}

function record(overrides: Partial<VisitorDigestRecord> = {}): VisitorDigestRecord {
  return {
    ...event(),
    id: "row-1",
    visitorId: "visitor-a",
    sessionId: "session-a",
    identityMode: "cookie",
    userAgent: "Mozilla/5.0 Chrome/120.0.0.0",
    browser: "Chrome",
    os: "Windows",
    deviceType: "desktop",
    countryCode: "US",
    region: "CA",
    city: "Mountain View",
    asn: "AS15169",
    asnOrg: "Google LLC",
    isDatacenter: false,
    cloudProvider: null,
    botStatus: "not_bot",
    botReasons: [],
    firstSeenAt: "2026-08-21T04:00:00.000Z",
    lastSeenAt: "2026-08-21T04:00:00.000Z",
    totalEvents: 1,
    totalVisits: 1,
    totalSessionSeconds: 0,
    visitedPages: ["/en"],
    productPages: [],
    eventSummary: { page_view: 1 },
    sessionEngagementSeconds: 0,
    sessionUniquePageCount: 1,
    sessionVisitedPages: ["/en"],
    sessionEventSummary: { page_view: 1 },
    engagementSeconds: 0,
    uniquePageCount: 1,
    validRepeatVisit: false,
    leadLevel: "LOW",
    humanStatus: "low_engagement",
    behaviorScore: 0,
    scoreReasons: [],
    sentAt: null,
    ...overrides,
  };
}

describe("visitor digest behavior", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, IP_HASH_SECRET: "unit-test-secret", B2B_DIGEST_SCORE_THRESHOLD: "0" };
    delete process.env.B2B_DIGEST_EMAIL_TRANSPORT;
  });

  it("normalizes and filters public IPv4/IPv6 without accepting client body IP", () => {
    expect(normalizeIp("::ffff:8.8.8.8")).toBe("8.8.8.8");
    expect(isPublicRoutableIp("8.8.8.8")).toBe(true);
    expect(isPublicRoutableIp("192.168.1.4")).toBe(false);
    expect(hashIp("8.8.8.8")).toMatch(/^[a-f0-9]{64}$/u);
    expect(() => parseLeadEvent({ eventType: "page_view", path: "/en", ip: "8.8.8.8" })).toThrow("PII_NOT_ALLOWED");
  });

  it("accepts heartbeat duration and clamps it at the server boundary", () => {
    const parsed = parseLeadEvent({
      eventType: "engagement_ping",
      path: "/en",
      durationSeconds: 90,
      automationHint: true,
    });
    expect(parsed.eventType).toBe("engagement_ping");
    expect(parsed.durationSeconds).toBe(30);
    expect(parsed.automationHint).toBe(true);
  });

  it("counts explicit sessions and preserves a changed-IP cookie identity", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(event(), 30);
    const row = await store.upsertVisitor(event({
      eventId: "event-2",
      rawIp: "1.1.1.1",
      ipHash: "hash-b",
      occurredAt: "2026-08-21T04:05:00.000Z",
    }), 30);
    expect(row.visitorId).toBe("visitor-a");
    expect(row.totalVisits).toBe(1);
    const secondSession = await store.upsertVisitor(event({
      eventId: "event-3",
      sessionId: "session-b",
      occurredAt: "2026-08-21T05:00:00.000Z",
    }), 30);
    expect(secondSession.totalVisits).toBe(2);
  });

  it("reports the complete previous Asia/Shanghai calendar day without score filtering", async () => {
    const repository = new MemoryVisitorDigestStore();
    await repository.upsertVisitor(event({ eventId: "day-1", ipHash: "day-1", occurredAt: "2026-09-01T10:00:00.000Z", digestWindow: "2026-09-01-18-12", expiresAt: "2026-09-04T00:00:00.000Z" }), 30);
    await repository.upsertVisitor(event({ eventId: "day-2", ipHash: "day-2", occurredAt: "2026-09-02T04:00:00.000Z", digestWindow: "2026-09-02-12-18", expiresAt: "2026-09-04T00:00:00.000Z" }), 30);
    process.env.B2B_DIGEST_SCORE_THRESHOLD = "500";
    expect(dailyDigestDateToSend(new Date("2026-09-02T02:00:00.000Z"))).toBe("2026-09-01");
    const rows = await repository.getDailyVisitors("2026-09-01", "2026-09-03T00:00:00.000Z");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.ipHash).toBe("day-1");
  });

  it("scores only behavior signals", () => {
    const result = scoreBehavior({
      eventSummary: { product_view: 2, contact_view: 1, form_start: 1 },
      productPages: ["/a", "/b"],
      totalVisits: 2,
      totalSessionSeconds: 70,
      uniquePageCount: 2,
      botStatus: "not_bot",
      repeatSessionEngaged: true,
    });
    expect(result.score).toBe(80);
    expect(result.reasons.map((reason) => reason.code)).not.toEqual(expect.arrayContaining([
      "business_network",
      "target_country",
      "low_confidence",
    ]));
  });

  it("uses Asia/Shanghai windows and keeps raw IP out of the public row fields", () => {
    const noon = new Date("2026-08-21T04:00:00.000Z");
    const evening = new Date("2026-08-21T10:00:00.000Z");
    expect(digestWindowToSend(noon, "noon")).toBe("2026-08-20-18-12");
    expect(digestWindowToSend(evening, "evening")).toBe("2026-08-21-12-18");
    expect(digestWindowForEvent(new Date("2026-08-21T05:00:00.000Z"))).toBe("2026-08-21-12-18");
    expect(buildVisitorDigestEmail([record()], "2026-08-21-12-18").text).toContain("8.8.8.8");
  });

  it("keeps reporting windows contiguous and renders an explicit empty digest", () => {
    const timestamps = [
      ["2026-08-20T09:59:00.000Z", "2026-08-20-12-18"],
      ["2026-08-20T10:00:00.000Z", "2026-08-20-18-12"],
      ["2026-08-21T03:59:00.000Z", "2026-08-20-18-12"],
      ["2026-08-21T04:00:00.000Z", "2026-08-21-12-18"],
      ["2026-08-21T09:59:00.000Z", "2026-08-21-12-18"],
      ["2026-08-21T10:00:00.000Z", "2026-08-21-18-12"],
    ] as const;
    for (const [timestamp, expected] of timestamps) {
      expect(digestWindowForEvent(new Date(timestamp))).toBe(expected);
    }
    expect(buildVisitorDigestEmail([], "2026-08-21-12-18").text).toContain("本统计日期暂无访客记录");
  });

  it("does not mark failed Resend delivery as sent, allowing retry", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.EMAIL_FROM = "info@example.com";
    process.env.EMAIL_TO = "admin@example.com";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("failed", { status: 500 }));
    const result = await sendVisitorDigest([], "2026-08-21-12-18");
    expect(result).toEqual({ sent: false, reason: "PROVIDER_FAILURE" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockRestore();
  });

  it("prefers the dedicated digest recipient without changing inquiry recipients", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.EMAIL_FROM = "info@example.com";
    process.env.EMAIL_TO = "customer@example.com";
    process.env.INQUIRY_TO_EMAIL = "inquiry@example.com";
    process.env.B2B_DIGEST_TO_EMAIL = "digest@example.com";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));
    const result = await sendVisitorDigest([], "2026-08-21-12-18");
    expect(result).toEqual({ sent: true });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).to).toEqual(["digest@example.com"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockRestore();
  });

  it("lets the visitor digest API consume an upgrade-era row", async () => {
    process.env.B2B_VISITOR_INTELLIGENCE_ENABLED = "true";
    process.env.B2B_DIGEST_EMAIL_TRANSPORT = "mock";
    process.env.CRON_SECRET = "unit-cron-secret";
    resetMemoryVisitorDigestStore();
    const store = getVisitorDigestStore();
    const state = Reflect.get(store, "state") as { rows: Map<string, unknown> };
    state.rows.set("legacy-window:legacy-api-hash", {
      id: "legacy-api-row",
      ipHash: "legacy-api-hash",
      sessionKey: "legacy-api-session",
      firstSeenAt: "2026-08-21T04:00:00.000Z",
      lastSeenAt: "2026-08-21T04:00:10.000Z",
      totalEvents: 1,
      totalVisits: 1,
      totalSessionSeconds: 0,
      visitedPages: ["/en"],
      productPages: [],
      eventSummary: { page_view: 1 },
      behaviorScore: 0,
      scoreReasons: [],
      digestWindow: "legacy-window",
      sentAt: null,
      expiresAt: "2099-08-23T04:00:00.000Z",
    });
    const response = await getVisitorDigest(new Request("http://localhost/api/visitor-digest?window=all", {
      headers: { authorization: "Bearer unit-cron-secret" },
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      status: "sent",
      uniqueVisitorCount: 1,
      sessionCount: 1,
    });
  });
});
