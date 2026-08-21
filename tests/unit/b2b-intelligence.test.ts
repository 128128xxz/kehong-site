import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { hashIp, isPublicRoutableIp, normalizeIp } from "@/server/b2b-intelligence/ip";
import { scoreLead } from "@/server/b2b-intelligence/lead-scoring";
import { resetMemoryRepository } from "@/server/b2b-intelligence/repository";
import { MemoryInquiryRepository } from "@/server/b2b-intelligence/repository";
import { persistCustomerInquiry, processVisitorEvent } from "@/server/b2b-intelligence/service";
import { parseLeadEvent } from "@/server/b2b-intelligence/event-validation";
import { clearProviderCaches } from "@/server/b2b-intelligence/providers";
import type { ProviderCompanyResult, VisitorEventRecord } from "@/server/b2b-intelligence/types";
import { getInquiryRepository } from "@/server/b2b-intelligence/repository-factory";
import { shouldSendLeadEvent } from "@/lib/leadEvent";
import { countVisitSessions } from "@/server/b2b-intelligence/visit-session";
import { PostgresInquiryRepository } from "@/server/b2b-intelligence/postgres-repository";

const originalEnv = { ...process.env };

function event(eventType: VisitorEventRecord["eventType"], path: string, eventId: string): VisitorEventRecord {
  return { eventId, eventType, path, pageTitle: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null, ipHash: "hash", companyIdentity: "provider:mock-example", networkType: "business", botCategory: null, occurredAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
}

function timedEvent(eventType: VisitorEventRecord["eventType"], path: string, eventId: string, occurredAt: string, ipHash = "hash") {
  return { ...event(eventType, path, eventId), ipHash, occurredAt, expiresAt: new Date(Date.parse(occurredAt) + 86_400_000).toISOString() };
}

function input(eventId: string, eventType: VisitorEventRecord["eventType"], path: string) {
  return { eventId, eventType, path, pageTitle: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null };
}

function clock(value: string) {
  return () => new Date(value);
}

class FakePostgresPool {
  readonly events: VisitorEventRecord[] = [];
  advisoryLocks = 0;
  private lock = Promise.resolve();

  async connect() {
    let release: (() => void) | undefined;
    return {
      query: async (text: string, values: unknown[] = []) => {
        if (text === "BEGIN" || text === "COMMIT" || text === "ROLLBACK") return { rowCount: 0, rows: [] };
        if (text.includes("pg_advisory_xact_lock")) {
          this.advisoryLocks += 1;
          const previous = this.lock;
          this.lock = new Promise<void>((resolve) => { release = resolve; });
          await previous;
          return { rowCount: 0, rows: [] };
        }
        if (text.includes("SELECT occurred_at FROM inquiry_visit_events")) {
          const [companyIdentity, ipHash] = values;
          const matching = this.events.filter((event) => event.companyIdentity === companyIdentity && event.ipHash === ipHash).sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
          return { rowCount: matching.length ? 1 : 0, rows: matching.length ? [{ occurred_at: matching[0].occurredAt }] : [] };
        }
        if (text.includes("INSERT INTO inquiry_visit_events")) {
          const event: VisitorEventRecord = { eventId: String(values[1]), companyIdentity: values[2] as string | null, ipHash: values[3] as string | null, eventType: values[4] as VisitorEventRecord["eventType"], path: String(values[5]), pageTitle: values[6] as string | null, referrer: values[7] as string | null, utmSource: values[8] as string | null, utmMedium: values[9] as string | null, utmCampaign: values[10] as string | null, utmTerm: values[11] as string | null, utmContent: values[12] as string | null, durationSeconds: values[13] as number | null, networkType: values[15] as VisitorEventRecord["networkType"], botCategory: values[16] as string | null, occurredAt: String(values[17]), expiresAt: String(values[18]) };
          if (this.events.some((candidate) => candidate.eventId === event.eventId)) return { rowCount: 0, rows: [] };
          this.events.push(event);
          return { rowCount: 1, rows: [{ event_id: event.eventId }] };
        }
        throw new Error(`Unexpected SQL in fake pool: ${text}`);
      },
      release: () => release?.(),
    };
  }
}

const business: ProviderCompanyResult = { provider: "mock", companyId: "mock-example", companyName: "Example Industrial GmbH", companyDomain: "example-industrial.test", companyWebsite: "https://example-industrial.test", countryCode: "DE", countryName: "Germany", region: null, city: null, industry: "Industrial Machinery", employeeRange: "51-200", revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "business", providerConfidence: 0.92 };

describe("B2B visitor intelligence", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, B2B_VISITOR_INTELLIGENCE_ENABLED: "true", IP_HASH_SECRET: "unit-test-secret", IP_COMPANY_PROVIDER: "mock", COMPANY_ENRICHMENT_PROVIDER: "mock" };
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    resetMemoryRepository();
    clearProviderCaches();
  });
  afterEach(() => { process.env = { ...originalEnv }; });

  it("normalizes and filters public IPv4/IPv6 without accepting client body IP", () => {
    expect(normalizeIp("8.8.8.8")).toBe("8.8.8.8");
    expect(normalizeIp("::ffff:8.8.8.8")).toBe("8.8.8.8");
    expect(isPublicRoutableIp("8.8.8.8")).toBe(true);
    expect(isPublicRoutableIp("192.168.1.4")).toBe(false);
    expect(isPublicRoutableIp("::1")).toBe(false);
    expect(hashIp("8.8.8.8")).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("produces explainable score reasons", () => {
    const result = scoreLead([event("product_view", "/products/a", "1"), event("product_view", "/products/b", "2"), event("contact_view", "/contact", "3")], business);
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.reasons.map((reason) => reason.code)).toEqual(expect.arrayContaining(["business_network", "multiple_products", "contact_view"]));
  });

  it("rejects PII and unknown fields from the event contract", () => {
    expect(() => parseLeadEvent({ eventType: "page_view", path: "/en", email: "person@example.com" })).toThrow("PII_NOT_ALLOWED");
    expect(() => parseLeadEvent({ eventType: "page_view", path: "/en", cookie: "x" })).toThrow("PII_NOT_ALLOWED");
    expect(() => parseLeadEvent({ eventType: "page_view", path: "/en", extra: "x" })).toThrow("UNKNOWN_FIELD");
  });

  it("creates one merged visitor inquiry and links a later customer inquiry", async () => {
    const request = new Request("https://www.kehong.tech/api/lead-event", { headers: { origin: "https://www.kehong.tech", "x-vercel-id": "smoke::iad1", "x-forwarded-for": "8.8.8.8" } });
    await processVisitorEvent(request, { eventId: "visitor-product", eventType: "product_view", path: "/en/products/example", pageTitle: "Example", referrer: null, utmSource: "google", utmMedium: "cpc", utmCampaign: "machine-a", utmTerm: null, utmContent: null, durationSeconds: 70 });
    await processVisitorEvent(request, { eventId: "visitor-contact", eventType: "contact_view", path: "/en/contact", pageTitle: "Contact", referrer: null, utmSource: "google", utmMedium: "cpc", utmCampaign: "machine-a", utmTerm: null, utmContent: null, durationSeconds: null });
    const before = await getInquiryRepository().listInquiries({ inquiryType: "company_visitor_lead" });
    expect(before).toHaveLength(1);
    expect(before[0].inquiryType).toBe("company_visitor_lead");
    expect("customerEmail" in before[0]).toBe(false);
    const customer = await persistCustomerInquiry({ source: "website_contact", sourceLabel: "客户主动提交询盘", status: "new", customerName: "Real Buyer", customerEmail: "buyer@example-industrial.test", customerPhone: null, customerMessage: "Please quote", companyName: "Example Industrial GmbH", companyDomain: "example-industrial.test", companyWebsite: null, countryName: "Germany", firstReferrer: null, latestReferrer: null, firstUtmSource: "google", latestUtmSource: "google", linkedInquiryId: null });
    expect(customer.inquiryType).toBe("customer_submitted");
    const after = await getInquiryRepository().listInquiries();
    expect(after.find((item) => item.id === before[0].id)).toMatchObject({ status: "converted_to_inquiry", linkedInquiryId: customer.id });
  });

  it("counts inactivity sessions instead of page views", async () => {
    const request = new Request("https://www.kehong.tech/api/lead-event", { headers: { origin: "https://www.kehong.tech", "x-vercel-id": "smoke::iad1", "x-forwarded-for": "8.8.8.8" } });
    await processVisitorEvent(request, input("visit-a", "page_view", "/en"), { now: clock("2026-08-21T10:00:00.000Z") });
    await processVisitorEvent(request, input("visit-b", "page_view", "/en/products"), { now: clock("2026-08-21T10:02:00.000Z") });
    await processVisitorEvent(request, input("visit-product", "product_view", "/en/products/example"), { now: clock("2026-08-21T10:04:00.000Z") });
    await processVisitorEvent(request, input("visit-contact", "contact_view", "/en/contact"), { now: clock("2026-08-21T10:06:00.000Z") });
    const first = await getInquiryRepository().listInquiries({ inquiryType: "company_visitor_lead" });
    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({ totalVisits: 1, totalEvents: 4 });
    await processVisitorEvent(request, input("same-session-whatsapp", "whatsapp_click", "/en/contact"), { now: clock("2026-08-21T10:20:00.000Z") });
    expect((await getInquiryRepository().listInquiries({ inquiryType: "company_visitor_lead" }))[0]).toMatchObject({ totalVisits: 1, totalEvents: 5 });
    await processVisitorEvent(request, input("visit-c", "page_view", "/en/products"), { now: clock("2026-08-21T11:00:00.000Z") });
    expect((await getInquiryRepository().listInquiries({ inquiryType: "company_visitor_lead" }))[0]).toMatchObject({ totalVisits: 2, totalEvents: 6 });
    await processVisitorEvent(request, input("visit-d", "page_view", "/en/products"), { now: clock("2026-08-21T11:02:00.000Z") });
    await processVisitorEvent(request, input("visit-d-product", "product_view", "/en/products/example"), { now: clock("2026-08-21T11:05:00.000Z") });
    await processVisitorEvent(request, input("visit-d-form", "form_start", "/en/contact"), { now: clock("2026-08-21T11:08:00.000Z") });
    expect((await getInquiryRepository().listInquiries({ inquiryType: "company_visitor_lead" }))[0]).toMatchObject({ totalVisits: 2, totalEvents: 9 });
  });

  it("keeps visit semantics consistent across same-session events and IP boundaries", () => {
    const base = "2026-08-21T10:00:00.000Z";
    const events = [
      timedEvent("page_view", "/en", "a", base),
      timedEvent("page_view", "/en/products", "b", "2026-08-21T10:02:00.000Z"),
      timedEvent("product_view", "/en/products/example", "c", "2026-08-21T10:04:00.000Z"),
      timedEvent("contact_view", "/en/contact", "d", "2026-08-21T10:06:00.000Z"),
      timedEvent("whatsapp_click", "/en/contact", "e", "2026-08-21T10:20:00.000Z"),
      timedEvent("page_view", "/en", "f", "2026-08-21T11:00:00.000Z"),
      timedEvent("page_view", "/en/products", "g", "2026-08-21T11:02:00.000Z"),
      timedEvent("product_view", "/en/products/example", "h", "2026-08-21T11:05:00.000Z"),
      timedEvent("form_start", "/en/contact", "i", "2026-08-21T11:08:00.000Z"),
    ];
    expect(countVisitSessions(events, 30)).toBe(2);
    expect(countVisitSessions(events.slice(0, 5), 30)).toBe(1);
    expect(countVisitSessions([...events, timedEvent("page_view", "/en", "j", "2026-08-21T11:10:00.000Z", "other-hash")], 30)).toBe(3);
  });

  it("counts one visit for concurrent first events in memory", async () => {
    const repository = new MemoryInquiryRepository();
    const first = timedEvent("product_view", "/en/products/a", "concurrent-a", "2026-08-21T10:00:00.000Z");
    const second = timedEvent("contact_view", "/en/contact", "concurrent-b", "2026-08-21T10:00:00.001Z");
    const results = await Promise.all([repository.recordVisitorEvent(first), repository.recordVisitorEvent(second)]);
    expect(results.filter((result) => result.isNewVisit)).toHaveLength(1);
    expect((await repository.getVisitorEvents("provider:mock-example"))).toHaveLength(2);
  });

  it("uses the same session boundary and advisory lock in the PostgreSQL adapter", async () => {
    const pool = new FakePostgresPool();
    const repository = new PostgresInquiryRepository(pool as never);
    const sameSession = await repository.recordVisitorEvent(timedEvent("product_view", "/en/products/a", "postgres-a", "2026-08-21T10:00:00.000Z"));
    const sameSessionFollowup = await repository.recordVisitorEvent(timedEvent("contact_view", "/en/contact", "postgres-b", "2026-08-21T10:02:00.000Z"));
    const nextSession = await repository.recordVisitorEvent(timedEvent("page_view", "/en", "postgres-c", "2026-08-21T10:40:00.000Z"));
    expect(sameSession.isNewVisit).toBe(true);
    expect(sameSessionFollowup.isNewVisit).toBe(false);
    expect(nextSession.isNewVisit).toBe(true);
    const concurrent = await Promise.all([
      repository.recordVisitorEvent(timedEvent("page_view", "/en", "postgres-d", "2026-08-21T11:20:00.000Z")),
      repository.recordVisitorEvent(timedEvent("product_view", "/en/products/b", "postgres-e", "2026-08-21T11:20:00.001Z")),
    ]);
    expect(concurrent.filter((result) => result.isNewVisit)).toHaveLength(1);
    expect(pool.advisoryLocks).toBe(5);
    expect(countVisitSessions(pool.events, 30)).toBe(3);
  });

  it("only awards repeat visit score after a second session", () => {
    const sameSession = [timedEvent("page_view", "/en", "score-a", "2026-08-21T10:00:00.000Z"), timedEvent("page_view", "/en/products", "score-b", "2026-08-21T10:02:00.000Z"), timedEvent("product_view", "/en/products/a", "score-c", "2026-08-21T10:04:00.000Z")];
    const repeated = [...sameSession, timedEvent("page_view", "/en", "score-d", "2026-08-21T11:00:00.000Z")];
    expect(scoreLead(sameSession, business).reasons.some((reason) => reason.code === "repeat_visit")).toBe(false);
    expect(scoreLead(repeated, business).reasons.filter((reason) => reason.code === "repeat_visit")).toHaveLength(1);
  });

  it("does not create a visitor lead for ISP traffic or provider failure", async () => {
    process.env.B2B_MOCK_SCENARIO = "isp";
    const request = new Request("https://www.kehong.tech/api/lead-event", { headers: { origin: "https://www.kehong.tech", "x-vercel-id": "smoke::iad1", "x-forwarded-for": "1.1.1.1" } });
    await processVisitorEvent(request, { eventId: "isp-contact", eventType: "contact_view", path: "/en/contact", pageTitle: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null });
    expect(await getInquiryRepository().listInquiries({ inquiryType: "company_visitor_lead" })).toHaveLength(0);
    process.env.B2B_MOCK_SCENARIO = "provider_timeout";
    await expect(processVisitorEvent(request, { eventId: "timeout-contact", eventType: "contact_view", path: "/en/contact", pageTitle: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null })).resolves.toMatchObject({ accepted: true });
  });

  it("is disabled by default in production and never uses the mock provider there", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.B2B_VISITOR_INTELLIGENCE_ENABLED = "false";
    const request = new Request("https://www.kehong.tech/api/lead-event", { headers: { origin: "https://www.kehong.tech", "x-forwarded-for": "8.8.8.8" } });
    await expect(processVisitorEvent(request, { eventId: "production-disabled", eventType: "product_view", path: "/en/products/example", pageTitle: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null })).resolves.toMatchObject({ accepted: true, disabled: true });
    expect(await getInquiryRepository().listInquiries()).toHaveLength(0);
  });

  it("does not send browser telemetry when visitor intelligence is disabled or opted out", () => {
    expect(shouldSendLeadEvent(false, false)).toBe(false);
    expect(shouldSendLeadEvent(true, true)).toBe(false);
    expect(shouldSendLeadEvent(true, false)).toBe(true);
  });
});
