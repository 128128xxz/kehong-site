import { randomUUID } from "node:crypto";
import { visitorConfig, companyIdentityFor, normalizeCompanyDomain, visitorIntelligenceEnabled } from "./config";
import { extractTrustedClientIp, hashIp } from "./ip";
import { hasMeaningfulBehavior, isEligibleNetwork, scoreLead } from "./lead-scoring";
import { lookupCompanyByIp, enrichCompany } from "./providers";
import { getInquiryRepository } from "./repository-factory";
import type { CustomerInquiryDraft, ProviderCompanyResult, VisitorEventInput, VisitorEventRecord, VisitorLeadRecord } from "./types";
import { countVisitSessions } from "./visit-session";

function expiry(days: number, nowMs: number) { return new Date(nowMs + days * 24 * 60 * 60 * 1000).toISOString(); }

function emptyProfile(): ProviderCompanyResult {
  return { provider: "none", companyId: null, companyName: null, companyDomain: null, companyWebsite: null, countryCode: null, countryName: null, region: null, city: null, industry: null, employeeRange: null, revenueRange: null, headquarters: null, linkedinUrl: null, networkType: "unknown", providerConfidence: 0 };
}

function mergeProfile(ipProfile: ProviderCompanyResult | null, enrichment: ProviderCompanyResult | null) {
  return enrichment ? { ...ipProfile, ...enrichment, provider: ipProfile?.provider ?? enrichment.provider } : ipProfile ?? emptyProfile();
}

export type VisitorEventProcessingOptions = { now?: () => Date };

export async function processVisitorEvent(request: Request, event: VisitorEventInput, options: VisitorEventProcessingOptions = {}) {
  if (!visitorIntelligenceEnabled()) return { accepted: true, deduplicated: false, leadId: null, disabled: true };
  // Page views are visit evidence and must share the same company identity as
  // later meaningful events. Only the HMAC hash is retained; raw IP handling
  // remains inside the existing trusted extraction/provider path.
  const shouldLookup = true;
  const rawIp = shouldLookup ? extractTrustedClientIp(request) : null;
  const ipHash = hashIp(rawIp);
  const ipProfile = rawIp && ipHash ? await lookupCompanyByIp(rawIp, ipHash) : null;
  const domain = normalizeCompanyDomain(ipProfile?.companyDomain);
  const enrichment = domain ? await enrichCompany(domain) : null;
  const profile = mergeProfile(ipProfile, enrichment);
  const companyIdentity = companyIdentityFor(profile);
  const now = options.now?.() ?? new Date();
  const occurredAt = now.toISOString();
  const repository = getInquiryRepository();
  const eventRecord: VisitorEventRecord = { ...event, ipHash, companyIdentity, networkType: profile.networkType, botCategory: profile.networkType === "unknown" ? "unknown" : null, occurredAt, expiresAt: expiry(visitorConfig.visitRetentionDays, now.getTime()) };
  const accounting = await repository.recordVisitorEvent(eventRecord);
  if (!accounting.inserted || !companyIdentity || !isEligibleNetwork(profile.networkType) || profile.providerConfidence < 0.75) return { accepted: true, deduplicated: !accounting.inserted, leadId: null };

  const events = await repository.getVisitorEvents(companyIdentity);
  const score = scoreLead(events, profile);
  if (!hasMeaningfulBehavior(events) || score.score < visitorConfig.leadScoreThreshold) return { accepted: true, deduplicated: false, leadId: null };
  const mergeSince = new Date(now.getTime() - visitorConfig.mergeDays * 24 * 60 * 60 * 1000).toISOString();
  const existing = await repository.findVisitorLead(companyIdentity, mergeSince);
  const first = events[0] ?? eventRecord;
  const last = events[events.length - 1] ?? eventRecord;
  const lead = await repository.saveVisitorLead({ ...profile, companyIdentity, leadScore: score.score, scoreReasons: score.reasons, firstSeenAt: first.occurredAt, lastSeenAt: last.occurredAt, firstReferrer: first.referrer, latestReferrer: last.referrer, firstUtmSource: first.utmSource, latestUtmSource: last.utmSource, totalVisits: countVisitSessions(events, visitorConfig.visitSessionTimeoutMinutes), totalEvents: events.length, requiresManualLink: false }, existing?.id);
  await repository.linkEventsToLead(companyIdentity, lead.id);
  const notificationKey = `score-${Math.floor(score.score / Math.max(1, visitorConfig.renotifyIncrement))}`;
  if (!existing || !(await repository.hasNotification(lead.id, notificationKey))) await notifyVisitorLead(lead, events, notificationKey);
  return { accepted: true, deduplicated: false, leadId: lead.id };
}

async function notifyVisitorLead(lead: VisitorLeadRecord, events: VisitorEventRecord[], notificationKey: string) {
  const config = await import("@/lib/emailConfig").then((module) => module.getInquiryEmailConfig());
  if (!config.valid) return;
  const escapeHtml = (value: string | null | undefined) => (value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const summary = [
    "该记录来自企业级 IP 识别和网站访问行为，并非客户主动填写的询盘，不能确定具体访问人员身份，请人工核实。",
    `公司：${lead.companyName ?? "未知"}`,
    `官网：${lead.companyDomain ?? "未知"}`,
    `国家：${lead.countryName ?? "未知"}`,
    `行业：${lead.industry ?? "未知"}`,
    `员工规模：${lead.employeeRange ?? "未知"}`,
    `网络类型：${lead.networkType}`,
    `识别置信度：${Math.round(lead.providerConfidence * 100)}%`,
    `线索评分：${lead.leadScore}`,
    `主要行为：${events.slice(-8).map((event) => `${event.eventType} ${event.path}`).join("；")}`,
    `来源：${lead.latestUtmSource ?? lead.latestReferrer ?? "直接访问"}`,
  ].join("\n");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: `Kehong Website <${config.from}>`, to: config.to, subject: "【企业访客线索】识别到新的高价值公司访问网站", text: summary, html: `<h2>企业访客线索</h2><p>${escapeHtml(summary).replaceAll("\n", "<br>")}</p>` }) }).catch(() => null);
  const repository = getInquiryRepository();
  await repository.recordNotification(lead.id, notificationKey, response?.ok ? "sent" : "failed");
}

export async function persistCustomerInquiry(input: CustomerInquiryDraft) {
  const repository = getInquiryRepository();
  const visitor = await repository.findVisitorLeadForCustomer(input.companyDomain, input.companyName, input.countryName);
  const customer = await repository.saveCustomerInquiry({ ...input, linkedInquiryId: visitor?.id ?? null });
  if (visitor) await repository.linkVisitorToCustomer(visitor.id, customer.id);
  return customer;
}

export async function cleanupVisitorIntelligence() {
  return getInquiryRepository().cleanupExpired(new Date().toISOString());
}

export function visitorDatabaseStatus() {
  return process.env.DATABASE_URL?.trim() ? "postgres_configured_migration_pending" : "NOT_CONFIGURED_MEMORY_MOCK";
}

export function newEventId() { return randomUUID(); }
