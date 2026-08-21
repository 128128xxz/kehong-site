import { beforeEach, describe, expect, it } from "vitest";
import { MemoryVisitorDigestStore } from "@/server/b2b-intelligence/redis-store";
import type { DigestEventInput } from "@/server/b2b-intelligence/digest-types";

const base = (overrides: Partial<DigestEventInput> = {}): DigestEventInput => ({
  eventId: "event-1", eventType: "page_view", path: "/en", pageTitle: "Home", referrer: null,
  utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null,
  rawIp: "8.8.8.8", ipHash: "hash", occurredAt: "2026-08-21T04:00:00.000Z", digestWindow: "2026-08-21-12-18",
  expiresAt: "2026-08-23T04:00:00.000Z", ...overrides,
});

describe("Redis-compatible visitor digest store", () => {
  beforeEach(() => { process.env.B2B_DIGEST_SCORE_THRESHOLD = "0"; });

  it("merges same-IP behavior in one window and splits after inactivity", async () => {
    const store = new MemoryVisitorDigestStore();
    expect((await store.upsertVisitor(base(), 30)).totalVisits).toBe(1);
    expect((await store.upsertVisitor(base({ eventId: "2", eventType: "product_view", path: "/en/products/a", occurredAt: "2026-08-21T04:05:00.000Z" }), 30)).totalVisits).toBe(1);
    expect((await store.upsertVisitor(base({ eventId: "3", eventType: "contact_view", path: "/en/contact", occurredAt: "2026-08-21T04:10:00.000Z" }), 30)).totalVisits).toBe(1);
    expect((await store.upsertVisitor(base({ eventId: "4", eventType: "page_view", occurredAt: "2026-08-21T05:00:00.000Z" }), 30)).totalVisits).toBe(2);
  });

  it("keeps different IPs as separate entries and supports retry after failure", async () => {
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base({ eventType: "contact_view" }), 30);
    await store.upsertVisitor(base({ eventId: "2", ipHash: "other", rawIp: "1.1.1.1", eventType: "contact_view" }), 30);
    expect(await store.getWindowVisitors("2026-08-21-12-18", "2026-08-21T06:00:00.000Z")).toHaveLength(2);
    expect(await store.markWindowSent("2026-08-21-12-18")).toBe(true);
    expect(await store.markWindowSent("2026-08-21-12-18")).toBe(false);
  });

  it("excludes low-score visitors from a digest window without deleting their TTL record", async () => {
    process.env.B2B_DIGEST_SCORE_THRESHOLD = "50";
    const store = new MemoryVisitorDigestStore();
    await store.upsertVisitor(base(), 30);
    expect(await store.getWindowVisitors("2026-08-21-12-18", "2026-08-21T06:00:00.000Z")).toHaveLength(0);
  });
});
