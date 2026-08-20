import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { hashIp, isPublicRoutableIp, normalizeIp } from "@/server/b2b-intelligence/ip";
import { scoreLead } from "@/server/b2b-intelligence/lead-scoring";
import { resetMemoryRepository } from "@/server/b2b-intelligence/repository";
import { persistCustomerInquiry, processVisitorEvent } from "@/server/b2b-intelligence/service";
import { parseLeadEvent } from "@/server/b2b-intelligence/event-validation";
import { clearProviderCaches } from "@/server/b2b-intelligence/providers";
import type { ProviderCompanyResult, VisitorEventRecord } from "@/server/b2b-intelligence/types";
import { getInquiryRepository } from "@/server/b2b-intelligence/repository-factory";
import { shouldSendLeadEvent } from "@/lib/leadEvent";

const originalEnv = { ...process.env };

function event(eventType: VisitorEventRecord["eventType"], path: string, eventId: string): VisitorEventRecord {
  return { eventId, eventType, path, pageTitle: null, referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null, durationSeconds: null, ipHash: "hash", companyIdentity: "provider:mock-example", networkType: "business", botCategory: null, occurredAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
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
