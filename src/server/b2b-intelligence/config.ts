export function isProductionEnvironment() {
  return process.env.VERCEL_ENV === "production";
}

export function visitorIntelligenceEnabled() {
  return process.env.B2B_VISITOR_INTELLIGENCE_ENABLED === "true";
}

export function mockVisitorIntelligenceEnabled() {
  return visitorIntelligenceEnabled() && !isProductionEnvironment();
}

export function integerEnv(name: string, fallback: number, min: number, max: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export const visitorConfig = {
  leadScoreThreshold: integerEnv("LEAD_SCORE_THRESHOLD", 50, 1, 500),
  targetCountryCodes: new Set((process.env.TARGET_COUNTRY_CODES ?? "US,DE,GB,FR,IT,ES,NL,CA,AU").split(",").map((value) => value.trim().toUpperCase()).filter(Boolean)),
  ipLookupCacheHours: integerEnv("IP_LOOKUP_CACHE_HOURS", 24, 1, 168),
  companyEnrichmentCacheDays: integerEnv("COMPANY_ENRICHMENT_CACHE_DAYS", 30, 1, 365),
  negativeCacheHours: integerEnv("NEGATIVE_CACHE_HOURS", 6, 1, 72),
  notificationDedupHours: integerEnv("NOTIFICATION_DEDUP_HOURS", 24, 1, 168),
  renotifyIncrement: integerEnv("LEAD_SCORE_RENOTIFY_INCREMENT", 30, 1, 200),
  mergeDays: integerEnv("COMPANY_LEAD_MERGE_DAYS", 30, 1, 365),
  visitSessionTimeoutMinutes: integerEnv("VISIT_SESSION_TIMEOUT_MINUTES", 30, 1, 240),
  visitRetentionDays: integerEnv("VISIT_EVENT_RETENTION_DAYS", 90, 1, 730),
  providerCacheRetentionDays: integerEnv("PROVIDER_CACHE_RETENTION_DAYS", 90, 1, 730),
};

export function normalizeCompanyDomain(value: string | null | undefined) {
  const candidate = value?.trim().toLowerCase();
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./u, "");
    if (!hostname || hostname.includes("..") || hostname.length > 253 || !hostname.includes(".")) return null;
    return hostname;
  } catch {
    return null;
  }
}

export function companyIdentityFor(profile: { companyId: string | null; companyDomain: string | null; companyName: string | null; countryName: string | null }) {
  if (profile.companyId) return `provider:${profile.companyId}`;
  const domain = normalizeCompanyDomain(profile.companyDomain);
  if (domain) return `domain:${domain}`;
  return null;
}
