import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildVisitorDigestEmail, sendVisitorDigest } from "@/server/b2b-intelligence/digest-email";
import { scoreBehavior } from "@/server/b2b-intelligence/behavior-scoring";
import { MemoryVisitorDigestStore } from "@/server/b2b-intelligence/redis-store";
import { digestWindowForEvent, digestWindowToSend } from "@/server/b2b-intelligence/service";
import { hashIp, isPublicRoutableIp, normalizeIp } from "@/server/b2b-intelligence/ip";
import { parseLeadEvent } from "@/server/b2b-intelligence/event-validation";
import type { DigestEventInput } from "@/server/b2b-intelligence/digest-types";

const originalEnv = { ...process.env };

function event(overrides: Partial<DigestEventInput> = {}): DigestEventInput {
  return {
    eventId: "event-1", eventType: "page_view", path: "/en", pageTitle: "Home", referrer: null,
    utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null,
    rawIp: "8.8.8.8", ipHash: "hash", occurredAt: "2026-08-21T04:00:00.000Z", digestWindow: "2026-08-21-12-18",
    expiresAt: "2026-08-23T04:00:00.000Z", ...overrides,
  };
}

describe("visitor digest behavior", () => {
  beforeEach(() => { process.env = { ...originalEnv, IP_HASH_SECRET: "unit-test-secret", B2B_DIGEST_SCORE_THRESHOLD: "0" }; delete process.env.B2B_DIGEST_EMAIL_TRANSPORT; });

  it("normalizes and filters public IPv4/IPv6 without accepting client body IP", () => {
    expect(normalizeIp("::ffff:8.8.8.8")).toBe("8.8.8.8");
    expect(isPublicRoutableIp("8.8.8.8")).toBe(true);
    expect(isPublicRoutableIp("192.168.1.4")).toBe(false);
    expect(hashIp("8.8.8.8")).toMatch(/^[a-f0-9]{64}$/u);
    expect(() => parseLeadEvent({ eventType: "page_view", path: "/en", ip: "8.8.8.8" })).toThrow("PII_NOT_ALLOWED");
  });

  it("merges one IP into one entry and counts inactivity sessions, not page views", async () => {
    const repository = new MemoryVisitorDigestStore();
    const first = await repository.upsertVisitor(event(), 30);
    const second = await repository.upsertVisitor(event({ eventId: "event-2", eventType: "product_view", path: "/en/products/a", occurredAt: "2026-08-21T04:02:00.000Z" }), 30);
    const third = await repository.upsertVisitor(event({ eventId: "event-3", eventType: "contact_view", path: "/en/contact", occurredAt: "2026-08-21T04:20:00.000Z" }), 30);
    const repeat = await repository.upsertVisitor(event({ eventId: "event-4", eventType: "page_view", occurredAt: "2026-08-21T05:00:00.000Z" }), 30);
    expect(first.totalVisits).toBe(1);
    expect(second.totalVisits).toBe(1);
    expect(third.totalVisits).toBe(1);
    expect(repeat.totalVisits).toBe(2);
    expect(repeat.totalEvents).toBe(4);
    expect((await repository.getWindowVisitors("2026-08-21-12-18", "2026-08-21T06:00:00.000Z"))).toHaveLength(1);
  });

  it("splits different IP hashes, removes expired rows, and deletes sent rows", async () => {
    const repository = new MemoryVisitorDigestStore();
    await repository.upsertVisitor(event({ ipHash: "hash-a", rawIp: "8.8.8.8", eventType: "contact_view" }), 30);
    await repository.upsertVisitor(event({ eventId: "event-2", ipHash: "hash-b", rawIp: "1.1.1.1", eventType: "contact_view" }), 30);
    expect(await repository.getWindowVisitors("2026-08-21-12-18", "2026-08-21T06:00:00.000Z")).toHaveLength(2);
    expect(await repository.markWindowSent("2026-08-21-12-18")).toBe(true);
    expect(await repository.markWindowSent("2026-08-21-12-18")).toBe(false);
    expect(await repository.getWindowVisitors("2026-08-21-12-18", "2026-08-21T06:00:00.000Z")).toHaveLength(2);
    await repository.upsertVisitor(event({ eventId: "expired", ipHash: "expired", eventType: "contact_view", expiresAt: "2026-08-21T05:00:00.000Z" }), 30);
    expect(await repository.cleanupExpired("2026-08-21T06:00:00.000Z")).toBe(1);
  });

  it("keeps digest locks exclusive and releases them for retry", async () => {
    const store = new MemoryVisitorDigestStore();
    const first = await store.acquireDigestLock("window", 90);
    expect(first).toBeTypeOf("string");
    expect(await store.acquireDigestLock("window", 90)).toBeNull();
    await store.releaseDigestLock("window", first!);
    expect(await store.acquireDigestLock("window", 90)).toBeTypeOf("string");
  });

  it("scores behavior only and never adds company or provider reasons", () => {
    const result = scoreBehavior({ eventSummary: { product_view: 2, contact_view: 1, form_start: 1 }, productPages: ["/a", "/b"], totalVisits: 2, totalSessionSeconds: 70 });
    expect(result.score).toBe(10 + 15 + 25 + 20 + 10 + 10);
    expect(result.reasons.map((reason) => reason.code)).not.toEqual(expect.arrayContaining(["business_network", "target_country", "low_confidence"]));
  });

  it("uses Asia/Shanghai noon and evening windows and sends raw IP only in digest email", () => {
    const noon = new Date("2026-08-21T04:00:00.000Z");
    const evening = new Date("2026-08-21T10:00:00.000Z");
    expect(digestWindowToSend(noon, "noon")).toBe("2026-08-20-18-12");
    expect(digestWindowToSend(evening, "evening")).toBe("2026-08-21-12-18");
    expect(digestWindowForEvent(new Date("2026-08-21T05:00:00.000Z"))).toBe("2026-08-21-12-18");
    const email = buildVisitorDigestEmail([{
      ...event(), id: "row-1", sessionKey: "hash", firstSeenAt: event().occurredAt, lastSeenAt: event().occurredAt,
      totalEvents: 1, totalVisits: 1, totalSessionSeconds: 0, visitedPages: ["/en"], productPages: [], eventSummary: { page_view: 1 },
      referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, behaviorScore: 0, scoreReasons: [], sentAt: null,
    }], "2026-08-21-12-18");
    expect(email.text).toContain("8.8.8.8");
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
    for (const [timestamp, expected] of timestamps) expect(digestWindowForEvent(new Date(timestamp))).toBe(expected);
    expect(buildVisitorDigestEmail([], "2026-08-21-12-18").text).toContain("本统计周期暂无达到汇报条件的访客");
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
});
