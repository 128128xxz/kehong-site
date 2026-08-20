import { visitorConfig, mockVisitorIntelligenceEnabled } from "./config";
import type { ProviderCompanyResult } from "./types";

export interface IpCompanyProvider {
  readonly name: string;
  lookup(ip: string): Promise<ProviderCompanyResult | null>;
}

export interface CompanyEnrichmentProvider {
  readonly name: string;
  enrich(domain: string): Promise<ProviderCompanyResult | null>;
}

type CacheEntry = { value: ProviderCompanyResult | null; expiresAt: number };
const ipCache = new Map<string, CacheEntry>();
const domainCache = new Map<string, CacheEntry>();
const ipInflight = new Map<string, Promise<ProviderCompanyResult | null>>();
const domainInflight = new Map<string, Promise<ProviderCompanyResult | null>>();

const scenarioProfiles: Record<string, ProviderCompanyResult> = {
  business: { provider: "mock", companyId: "mock-example-industrial", companyName: "Example Industrial GmbH", companyDomain: "example-industrial.test", companyWebsite: "https://example-industrial.test", countryCode: "DE", countryName: "Germany", region: "North Rhine-Westphalia", city: "Dusseldorf", industry: "Industrial Machinery", employeeRange: "51-200", revenueRange: null, headquarters: "Dusseldorf, Germany", linkedinUrl: null, networkType: "business", providerConfidence: 0.92 },
  education: { provider: "mock", companyId: "mock-example-university", companyName: "Example University", companyDomain: "example-university.test", companyWebsite: "https://example-university.test", countryCode: "DE", countryName: "Germany", region: null, city: null, industry: "Education", employeeRange: "201-500", revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "education", providerConfidence: 0.9 },
  government: { provider: "mock", companyId: "mock-example-government", companyName: "Example Public Works", companyDomain: "example-government.test", companyWebsite: "https://example-government.test", countryCode: "GB", countryName: "United Kingdom", region: null, city: null, industry: "Government", employeeRange: "51-200", revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "government", providerConfidence: 0.88 },
  isp: { provider: "mock", companyId: null, companyName: null, companyDomain: null, companyWebsite: null, countryCode: "DE", countryName: "Germany", region: null, city: null, industry: null, employeeRange: null, revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "isp", providerConfidence: 0.9 },
  hosting: { provider: "mock", companyId: null, companyName: null, companyDomain: null, companyWebsite: null, countryCode: "US", countryName: "United States", region: null, city: null, industry: null, employeeRange: null, revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "hosting", providerConfidence: 0.9 },
  vpn: { provider: "mock", companyId: null, companyName: null, companyDomain: null, companyWebsite: null, countryCode: null, countryName: null, region: null, city: null, industry: null, employeeRange: null, revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "vpn", providerConfidence: 0.9 },
  proxy: { provider: "mock", companyId: null, companyName: null, companyDomain: null, companyWebsite: null, countryCode: null, countryName: null, region: null, city: null, industry: null, employeeRange: null, revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "proxy", providerConfidence: 0.9 },
  bot: { provider: "mock", companyId: null, companyName: null, companyDomain: null, companyWebsite: null, countryCode: null, countryName: null, region: null, city: null, industry: null, employeeRange: null, revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "bot", providerConfidence: 0.99 },
};

function mockScenario() {
  const value = (process.env.B2B_MOCK_SCENARIO ?? "business").trim().toLowerCase();
  return ["business", "education", "government", "isp", "hosting", "vpn", "proxy", "bot", "no_match", "provider_timeout", "provider_429", "provider_500", "invalid_json"].includes(value) ? value : "business";
}

class MockIpCompanyProvider implements IpCompanyProvider {
  readonly name = "mock";
  async lookup(ip: string) {
    void ip;
    const scenario = mockScenario();
    if (scenario === "no_match") return null;
    if (scenario === "provider_timeout" || scenario === "provider_429" || scenario === "provider_500" || scenario === "invalid_json") throw new Error(`MOCK_${scenario.toUpperCase()}`);
    return scenarioProfiles[scenario] ?? null;
  }
}

class MockCompanyEnrichmentProvider implements CompanyEnrichmentProvider {
  readonly name = "mock";
  async enrich(domain: string) {
    const profile = Object.values(scenarioProfiles).find((value) => value.companyDomain === domain && value.companyName);
    return profile ? { ...profile } : null;
  }
}

class NotConfiguredProvider implements IpCompanyProvider, CompanyEnrichmentProvider {
  readonly name = "not-configured";
  async lookup(ip: string) { void ip; return null; }
  async enrich(domain: string) { void domain; return null; }
}

function getIpProvider(): IpCompanyProvider {
  if (process.env.IP_COMPANY_PROVIDER === "mock" || !process.env.IP_COMPANY_PROVIDER) return mockVisitorIntelligenceEnabled() ? new MockIpCompanyProvider() : new NotConfiguredProvider();
  return new NotConfiguredProvider();
}

function getEnrichmentProvider(): CompanyEnrichmentProvider {
  if (process.env.COMPANY_ENRICHMENT_PROVIDER === "mock" || !process.env.COMPANY_ENRICHMENT_PROVIDER) return mockVisitorIntelligenceEnabled() ? new MockCompanyEnrichmentProvider() : new NotConfiguredProvider();
  return new NotConfiguredProvider();
}

export async function lookupCompanyByIp(ip: string, ipHash: string) {
  const provider = getIpProvider();
  const key = `${provider.name}:${ipHash}`;
  const cached = ipCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const active = ipInflight.get(key);
  if (active) return active;
  const lookup = provider.lookup(ip).then((value) => {
    ipCache.set(key, { value, expiresAt: Date.now() + (value ? visitorConfig.ipLookupCacheHours : visitorConfig.negativeCacheHours) * 60 * 60 * 1000 });
    return value;
  }).catch(() => null).finally(() => { ipInflight.delete(key); });
  ipInflight.set(key, lookup);
  return lookup;
}

export async function enrichCompany(domain: string) {
  const provider = getEnrichmentProvider();
  const key = `${provider.name}:${domain}`;
  const cached = domainCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const active = domainInflight.get(key);
  if (active) return active;
  const lookup = provider.enrich(domain).then((value) => {
    domainCache.set(key, { value, expiresAt: Date.now() + (value ? visitorConfig.companyEnrichmentCacheDays : visitorConfig.negativeCacheHours / 24) * 24 * 60 * 60 * 1000 });
    return value;
  }).catch(() => null).finally(() => { domainInflight.delete(key); });
  domainInflight.set(key, lookup);
  return lookup;
}

export function providerStatus() {
  return {
    ip: process.env.IP_COMPANY_PROVIDER ?? "mock",
    enrichment: process.env.COMPANY_ENRICHMENT_PROVIDER ?? "mock",
    realConfigured: Boolean(process.env.IP_COMPANY_API_KEY || process.env.COMPANY_ENRICHMENT_API_KEY),
  };
}

export function clearProviderCaches() {
  ipCache.clear();
  domainCache.clear();
  ipInflight.clear();
  domainInflight.clear();
}
