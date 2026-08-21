import { Redis } from "@upstash/redis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildVisitorDigestEmail, sendVisitorDigest } from "@/server/b2b-intelligence/digest-email";
import { getVisitorDigestStore, isRedisConfigured } from "@/server/b2b-intelligence/redis-store";
import type { DigestEventInput } from "@/server/b2b-intelligence/digest-types";

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const windowId = `real-preview-${Date.now()}`;
const noonWindow = `${windowId}-noon`;
const eveningWindow = `${windowId}-evening`;

const event = (overrides: Partial<DigestEventInput> = {}): DigestEventInput => ({
  eventId: `event-${Math.random().toString(36).slice(2)}`, eventType: "contact_view", path: "/en/contact", pageTitle: "Contact", referrer: "https://example.com", utmSource: "test", utmMedium: "preview", utmCampaign: "redis", utmTerm: null, utmContent: null, durationSeconds: 75,
  rawIp: "8.8.8.8", ipHash: "real-preview-hash", occurredAt: "2026-08-21T04:00:00.000Z", digestWindow: noonWindow, expiresAt: "2026-08-23T04:00:00.000Z", ...overrides,
});

describe("real Upstash Preview digest queue", () => {
  beforeAll(() => { process.env.B2B_DIGEST_SCORE_THRESHOLD = "0"; });

  it("persists, merges sessions, splits IPs, locks, deduplicates and retains TTL", async () => {
    expect(isRedisConfigured()).toBe(true);
    expect(redis).not.toBeNull();
    const store = getVisitorDigestStore();
    const first = await store.upsertVisitor(event(), 30);
    await store.upsertVisitor(event({ eventType: "page_view", path: "/en", occurredAt: "2026-08-21T04:02:00.000Z" }), 30);
    const secondSession = await store.upsertVisitor(event({ occurredAt: "2026-08-21T05:00:00.000Z" }), 30);
    await store.upsertVisitor(event({ ipHash: "real-preview-other", rawIp: "1.1.1.1" }), 30);
    expect(first.totalVisits).toBe(1);
    expect(secondSession.totalVisits).toBe(2);
    const rows = await store.getWindowVisitors(noonWindow, "2026-08-21T06:00:00.000Z");
    expect(rows).toHaveLength(2);
    const persisted = rows.find((row) => row.ipHash === "real-preview-hash");
    expect(persisted?.totalEvents).toBe(3);

    const concurrent = await Promise.all([
      store.upsertVisitor(event({ eventType: "email_click", occurredAt: "2026-08-21T05:01:00.000Z" }), 30),
      store.upsertVisitor(event({ eventType: "whatsapp_click", occurredAt: "2026-08-21T05:01:00.000Z" }), 30),
    ]);
    expect(concurrent.at(-1)?.totalVisits).toBe(2);
    const lockResults = await Promise.all([store.acquireDigestLock(eveningWindow, 90), store.acquireDigestLock(eveningWindow, 90)]);
    expect(lockResults.filter(Boolean)).toHaveLength(1);
    const lock = lockResults.find(Boolean);
    if (lock) await store.releaseDigestLock(eveningWindow, lock);
    expect(await store.markWindowSent(noonWindow)).toBe(true);
    expect(await store.markWindowSent(noonWindow)).toBe(false);

    const key = `b2b:digest:visitor:${noonWindow}:real-preview-hash`;
    const keys = await redis!.keys(`b2b:digest:*${noonWindow}*`);
    expect(keys.some((value) => value.includes("8.8.8.8"))).toBe(false);
    expect(await redis!.ttl(key)).toBeGreaterThan(0);
    expect(await redis!.ttl(key)).toBeLessThanOrEqual(48 * 60 * 60);
  }, 30_000);

  it("renders both real Redis windows through captured transport without external mail", async () => {
    const store = getVisitorDigestStore();
    const noon = await store.upsertVisitor(event({ digestWindow: noonWindow }), 30);
    const evening = await store.upsertVisitor(event({ eventId: "evening", digestWindow: eveningWindow }), 30);
    expect(buildVisitorDigestEmail([noon], "2026-08-20-18-12").text).toContain("8.8.8.8");
    expect(buildVisitorDigestEmail([evening], "2026-08-21-12-18").text).toContain("8.8.8.8");
    process.env.B2B_DIGEST_EMAIL_TRANSPORT = "captured";
    const result = await sendVisitorDigest([noon, evening], "2026-08-21-12-18");
    expect(result.sent).toBe(true);
    if (result.sent && result.email) expect(result.email.text).toContain("行为评分");
  }, 30_000);
});

afterAll(async () => {
  if (!redis) return;
  const keys = await redis.keys(`b2b:digest:*${windowId}*`);
  if (keys.length) await redis.del(...keys);
});
