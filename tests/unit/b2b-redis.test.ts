import { beforeEach, describe, expect, it } from "vitest";
import { buildVisitorDigestEmail } from "@/server/b2b-intelligence/digest-email";
import { MemoryVisitorDigestStore } from "@/server/b2b-intelligence/redis-store";
import { classifyBotSignals } from "@/server/b2b-intelligence/traffic-classification";
import type { DigestEventInput } from "@/server/b2b-intelligence/digest-types";

const base = (overrides: Partial<DigestEventInput> = {}): DigestEventInput => ({
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
  ipHash: "hash-a",
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
});

describe("Redis-compatible visitor digest store", () => {
  beforeEach(() => {
    process.env.B2B_DIGEST_SCORE_THRESHOLD = "0";
  });

  it("keeps two visitor cookies separate even when the IP hash is identical", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base({ visitorId: "visitor-a" }), 30);
    await store.upsertVisitor(base({ eventId: "event-2", visitorId: "visitor-b", sessionId: "session-b" }), 30);
    expect(await store.getAllVisitors("2026-08-21T06:00:00.000Z")).toHaveLength(2);
  });

  it("keeps one cookie visitor together when the IP changes", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base(), 30);
    const row = await store.upsertVisitor(base({
      eventId: "event-2",
      rawIp: "1.1.1.1",
      ipHash: "hash-b",
      occurredAt: "2026-08-21T04:05:00.000Z",
    }), 30);
    expect(row.visitorId).toBe("visitor-a");
    expect(row.rawIp).toBe("1.1.1.1");
    expect(row.totalVisits).toBe(1);
    expect(await store.getAllVisitors("2026-08-21T06:00:00.000Z")).toHaveLength(1);
  });

  it("counts three reloads in one explicit session as one visit", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base(), 30);
    await store.upsertVisitor(base({ eventId: "event-2", path: "/en/about" }), 30);
    const row = await store.upsertVisitor(base({ eventId: "event-3", path: "/en/contact" }), 30);
    expect(row.totalEvents).toBe(3);
    expect(row.totalVisits).toBe(1);
  });

  it("increments visits only when the explicit session changes", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base(), 30);
    const row = await store.upsertVisitor(base({
      eventId: "event-2",
      sessionId: "session-b",
      occurredAt: "2026-08-21T05:00:00.000Z",
    }), 30);
    expect(row.totalVisits).toBe(2);
  });

  it("does not award repeat score when the second session is a zero-second home visit", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base({ eventType: "product_view", path: "/en/products/a" }), 30);
    const row = await store.upsertVisitor(base({
      eventId: "event-2",
      sessionId: "session-b",
      occurredAt: "2026-08-21T05:00:00.000Z",
    }), 30);
    expect(row.totalVisits).toBe(2);
    expect(row.validRepeatVisit).toBe(false);
    expect(row.scoreReasons.some((reason) => reason.code === "repeat_visit")).toBe(false);
  });

  it("clamps engagement pings to 30 seconds and accumulates 60 seconds", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base({ eventType: "engagement_ping", durationSeconds: 45 }), 30);
    const row = await store.upsertVisitor(base({
      eventId: "event-2",
      eventType: "engagement_ping",
      durationSeconds: 45,
    }), 30);
    expect(row.engagementSeconds).toBe(60);
    expect(row.totalSessionSeconds).toBe(60);
    expect(row.behaviorScore).toBeGreaterThanOrEqual(10);
  });

  it("marks Googlebot as a probable bot and assigns BOT lead level", async () => {
    const classification = classifyBotSignals({
      userAgent: "Googlebot/2.1 (+http://www.google.com/bot.html)",
      automationHint: false,
      eventSeed: "googlebot",
    });
    expect(classification.botStatus).toBe("probable_bot");
    const store = new MemoryVisitorDigestStore();
    const row = await store.upsertVisitor(base({
      botStatus: classification.botStatus,
      botReasons: classification.botReasons,
    }), 30);
    expect(row.leadLevel).toBe("BOT");
    expect(row.humanStatus).toBe("probable_bot");
  });

  it("marks an engaged human visitor at HIGH or HOT", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base(), 30);
    await store.upsertVisitor(base({
      eventId: "event-2",
      eventType: "product_view",
      path: "/en/products/a",
    }), 30);
    await store.upsertVisitor(base({
      eventId: "event-3",
      eventType: "engagement_ping",
      durationSeconds: 30,
    }), 30);
    const row = await store.upsertVisitor(base({
      eventId: "event-4",
      eventType: "whatsapp_click",
      path: "/en/contact",
    }), 30);
    expect(row.humanStatus).toBe("engaged_human");
    expect(["HIGH", "HOT"]).toContain(row.leadLevel);
  });

  it("normalizes an upgrade-era row without inventing identity or enrichment", async () => {
    const store = new MemoryVisitorDigestStore();
    const state = Reflect.get(store, "state") as { rows: Map<string, unknown> };
    state.rows.set("2026-08-21-12-18:legacy-hash", {
      id: "legacy-row",
      rawIp: null,
      ipHash: "legacy-hash",
      sessionKey: "legacy-session",
      firstSeenAt: "2026-08-21T04:00:00.000Z",
      lastSeenAt: "2026-08-21T04:00:10.000Z",
      totalEvents: 1,
      totalVisits: 1,
      totalSessionSeconds: 10,
      visitedPages: ["/en"],
      productPages: [],
      eventSummary: { page_view: 1 },
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      behaviorScore: 0,
      scoreReasons: [],
      digestWindow: "2026-08-21-12-18",
      sentAt: null,
      expiresAt: "2026-08-23T04:00:00.000Z",
    });

    const rows = await store.getAllVisitors("2026-08-21T06:00:00.000Z");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      visitorId: "legacy-hash",
      sessionId: "legacy-session",
      browser: null,
      os: null,
      deviceType: "unknown",
      botStatus: "unknown",
      humanStatus: "unknown",
      leadLevel: "LOW",
      engagementSeconds: 10,
      validRepeatVisit: false,
    });
    const email = buildVisitorDigestEmail(rows, "2026-08-21-12-18");
    expect(email.text).toContain("Unknown");
    expect(email.text).not.toContain("undefined");

    const updated = await store.upsertVisitor(base({
      visitorId: undefined,
      sessionId: "new-session",
      ipHash: "legacy-hash",
      eventId: "event-legacy-2",
    }), 30);
    expect(updated.behaviorScore).toBeTypeOf("number");
  });

  it("keeps the requested five-event sequence at one session, then counts the new session", async () => {
    const store = new MemoryVisitorDigestStore();
    const sequence = [
      base({ eventId: "seq-1", eventType: "page_view" }),
      base({ eventId: "seq-2", eventType: "page_view" }),
      base({ eventId: "seq-3", eventType: "engagement_ping", durationSeconds: 15 }),
      base({ eventId: "seq-4", eventType: "product_view", path: "/en/products/a" }),
      base({ eventId: "seq-5", eventType: "engagement_ping", durationSeconds: 15 }),
    ];
    let row = sequence[0] && await store.upsertVisitor(sequence[0], 30);
    for (const current of sequence.slice(1)) row = await store.upsertVisitor(current, 30);
    expect(row?.totalVisits).toBe(1);
    expect(row?.totalEvents).toBe(5);
    row = await store.upsertVisitor(base({
      eventId: "seq-6",
      sessionId: "session-b",
    }), 30);
    expect(row.totalVisits).toBe(2);
  });

  it("accepts a genuinely engaged second session as a valid repeat visit", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base({ eventId: "repeat-1" }), 30);
    await store.upsertVisitor(base({
      eventId: "repeat-2",
      eventType: "engagement_ping",
      durationSeconds: 20,
    }), 30);
    await store.upsertVisitor(base({
      eventId: "repeat-3",
      sessionId: "session-b",
      eventType: "product_view",
      path: "/en/products/a",
    }), 30);
    const row = await store.upsertVisitor(base({
      eventId: "repeat-4",
      sessionId: "session-b",
      eventType: "engagement_ping",
      durationSeconds: 20,
    }), 30);
    expect(row.totalVisits).toBe(2);
    expect(row.validRepeatVisit).toBe(true);
    expect(row.scoreReasons).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "repeat_visit", points: 10 }),
    ]));
  });
});
