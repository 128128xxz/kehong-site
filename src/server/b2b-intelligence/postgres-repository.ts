import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { visitorConfig } from "./config";
import type { CustomerInquiryDraft, CustomerInquiryRecord, InquiryFilter, InquiryRepository, UnifiedInquiry, VisitorEventRecord, VisitorLeadDraft, VisitorLeadRecord } from "./types";

type Row = Record<string, unknown>;

function stringValue(row: Row, key: string) { return typeof row[key] === "string" ? row[key] as string : null; }
function numberValue(row: Row, key: string) { return typeof row[key] === "number" ? row[key] as number : Number(row[key] ?? 0); }
function boolValue(row: Row, key: string) { return row[key] === true; }
function dateValue(row: Row, key: string) { return new Date(String(row[key])).toISOString(); }
function reasonsValue(row: Row) { return Array.isArray(row.score_reasons) ? row.score_reasons as VisitorLeadRecord["scoreReasons"] : []; }

function leadFromRow(row: Row): VisitorLeadRecord {
  return {
    id: String(row.id), inquiryType: "company_visitor_lead", source: String(row.source), sourceLabel: String(row.source_label), status: String(row.status),
    companyIdentity: String(row.company_identity), companyId: stringValue(row, "company_id"), companyName: stringValue(row, "company_name"), companyDomain: stringValue(row, "company_domain"), companyWebsite: stringValue(row, "company_website"), countryCode: stringValue(row, "country_code"), countryName: stringValue(row, "country_name"), region: stringValue(row, "region"), city: stringValue(row, "city"), industry: stringValue(row, "industry"), employeeRange: stringValue(row, "employee_range"), revenueRange: stringValue(row, "revenue_range"), headquarters: stringValue(row, "headquarters"), linkedinUrl: stringValue(row, "linkedin_url"),
    networkType: (stringValue(row, "network_type") ?? "unknown") as VisitorLeadRecord["networkType"], provider: stringValue(row, "provider_name") ?? "unknown", providerConfidence: Number(row.provider_confidence ?? 0), leadScore: numberValue(row, "lead_score"), scoreReasons: reasonsValue(row), firstSeenAt: dateValue(row, "first_seen_at"), lastSeenAt: dateValue(row, "last_seen_at"), totalVisits: numberValue(row, "total_visits"), totalEvents: numberValue(row, "total_events"), firstReferrer: stringValue(row, "first_referrer"), latestReferrer: stringValue(row, "latest_referrer"), firstUtmSource: stringValue(row, "first_utm_source"), latestUtmSource: stringValue(row, "latest_utm_source"), requiresManualLink: boolValue(row, "requires_manual_link"), linkedInquiryId: stringValue(row, "linked_inquiry_id"), createdAt: dateValue(row, "created_at"), updatedAt: dateValue(row, "updated_at"),
  };
}

function customerFromRow(row: Row): CustomerInquiryRecord {
  return {
    id: String(row.id), inquiryType: "customer_submitted", source: String(row.source), sourceLabel: String(row.source_label), status: String(row.status), customerName: stringValue(row, "customer_name"), customerEmail: stringValue(row, "customer_email"), customerPhone: stringValue(row, "customer_phone"), customerMessage: stringValue(row, "customer_message"), companyName: stringValue(row, "company_name"), companyDomain: stringValue(row, "company_domain"), companyWebsite: stringValue(row, "company_website"), countryName: stringValue(row, "country_name"), firstReferrer: stringValue(row, "first_referrer"), latestReferrer: stringValue(row, "latest_referrer"), firstUtmSource: stringValue(row, "first_utm_source"), latestUtmSource: stringValue(row, "latest_utm_source"), linkedInquiryId: stringValue(row, "linked_inquiry_id"), createdAt: dateValue(row, "created_at"), updatedAt: dateValue(row, "updated_at"),
  };
}

function matchesFilter(inquiry: UnifiedInquiry, filter: InquiryFilter = {}) {
  if (filter.inquiryType && inquiry.inquiryType !== filter.inquiryType) return false;
  if (filter.status && inquiry.status !== filter.status) return false;
  if (filter.highScore && (!("leadScore" in inquiry) || ((inquiry as VisitorLeadRecord).leadScore ?? 0) < visitorConfig.leadScoreThreshold)) return false;
  return true;
}

let pool: Pool | null = null;
function getPool() {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 2_000 });
  return pool;
}

export class PostgresInquiryRepository implements InquiryRepository {
  private async query<T extends Row = Row>(text: string, values: unknown[] = []) {
    return getPool().query<T>(text, values);
  }

  async saveVisitorEvent(event: VisitorEventRecord) {
    const result = await this.query(
      `INSERT INTO inquiry_visit_events (id, event_id, company_identity, ip_hash, event_type, path, page_title, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, duration_seconds, country_code, network_type, bot_category, occurred_at, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT (event_id) DO NOTHING`,
      [randomUUID(), event.eventId, event.companyIdentity, event.ipHash, event.eventType, event.path, event.pageTitle, event.referrer, event.utmSource, event.utmMedium, event.utmCampaign, event.utmTerm, event.utmContent, event.durationSeconds, null, event.networkType, event.botCategory, event.occurredAt, event.expiresAt],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getVisitorEvents(companyIdentity: string) {
    const result = await this.query(`SELECT event_id, company_identity, ip_hash, event_type, path, page_title, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, duration_seconds, network_type, bot_category, occurred_at, expires_at FROM inquiry_visit_events WHERE company_identity = $1 ORDER BY occurred_at ASC`, [companyIdentity]);
    return result.rows.map((row) => ({ eventId: String(row.event_id), companyIdentity: stringValue(row, "company_identity"), ipHash: stringValue(row, "ip_hash"), eventType: String(row.event_type) as VisitorEventRecord["eventType"], path: String(row.path), pageTitle: stringValue(row, "page_title"), referrer: stringValue(row, "referrer"), utmSource: stringValue(row, "utm_source"), utmMedium: stringValue(row, "utm_medium"), utmCampaign: stringValue(row, "utm_campaign"), utmTerm: stringValue(row, "utm_term"), utmContent: stringValue(row, "utm_content"), durationSeconds: row.duration_seconds == null ? null : Number(row.duration_seconds), networkType: stringValue(row, "network_type") as VisitorEventRecord["networkType"], botCategory: stringValue(row, "bot_category"), occurredAt: dateValue(row, "occurred_at"), expiresAt: dateValue(row, "expires_at") }));
  }

  async findVisitorLead(companyIdentity: string, mergeSince: string) {
    const result = await this.query(`SELECT * FROM inquiries WHERE inquiry_type = 'company_visitor_lead' AND company_identity = $1 AND updated_at >= $2 ORDER BY updated_at DESC LIMIT 1`, [companyIdentity, mergeSince]);
    return result.rows[0] ? leadFromRow(result.rows[0]) : null;
  }

  async saveVisitorLead(draft: VisitorLeadDraft, existingId?: string) {
    const id = existingId ?? randomUUID();
    const result = await this.query(`INSERT INTO inquiries (id, inquiry_type, source, source_label, status, company_identity, company_name, company_domain, company_website, country_code, country_name, region, city, industry, employee_range, revenue_range, headquarters, linkedin_url, network_type, provider_name, provider_confidence, lead_score, score_reasons, first_seen_at, last_seen_at, total_visits, total_events, first_referrer, latest_referrer, first_utm_source, latest_utm_source, requires_manual_link) VALUES ($1,'company_visitor_lead','website_company_identification','独立站企业访客识别','待人工核实',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) ON CONFLICT (id) DO UPDATE SET company_name=EXCLUDED.company_name, company_domain=EXCLUDED.company_domain, company_website=EXCLUDED.company_website, country_code=EXCLUDED.country_code, country_name=EXCLUDED.country_name, region=EXCLUDED.region, city=EXCLUDED.city, industry=EXCLUDED.industry, employee_range=EXCLUDED.employee_range, revenue_range=EXCLUDED.revenue_range, headquarters=EXCLUDED.headquarters, linkedin_url=EXCLUDED.linkedin_url, network_type=EXCLUDED.network_type, provider_name=EXCLUDED.provider_name, provider_confidence=EXCLUDED.provider_confidence, lead_score=EXCLUDED.lead_score, score_reasons=EXCLUDED.score_reasons, first_seen_at=EXCLUDED.first_seen_at, last_seen_at=EXCLUDED.last_seen_at, total_visits=EXCLUDED.total_visits, total_events=EXCLUDED.total_events, first_referrer=EXCLUDED.first_referrer, latest_referrer=EXCLUDED.latest_referrer, first_utm_source=EXCLUDED.first_utm_source, latest_utm_source=EXCLUDED.latest_utm_source, requires_manual_link=EXCLUDED.requires_manual_link, updated_at=NOW() RETURNING *`, [id, draft.companyIdentity, draft.companyName, draft.companyDomain, draft.companyWebsite, draft.countryCode, draft.countryName, draft.region, draft.city, draft.industry, draft.employeeRange, draft.revenueRange, draft.headquarters, draft.linkedinUrl, draft.networkType, draft.provider, draft.providerConfidence, draft.leadScore, JSON.stringify(draft.scoreReasons), draft.firstSeenAt, draft.lastSeenAt, draft.totalVisits, draft.totalEvents, draft.firstReferrer, draft.latestReferrer, draft.firstUtmSource, draft.latestUtmSource, draft.requiresManualLink]);
    await this.query(`INSERT INTO inquiry_company_profiles (inquiry_id, company_identity, provider_name, provider_confidence, network_type, company_domain, company_name, country_code, industry) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (inquiry_id) DO UPDATE SET provider_name=EXCLUDED.provider_name, provider_confidence=EXCLUDED.provider_confidence, network_type=EXCLUDED.network_type, company_domain=EXCLUDED.company_domain, company_name=EXCLUDED.company_name, country_code=EXCLUDED.country_code, industry=EXCLUDED.industry, updated_at=NOW()`, [id, draft.companyIdentity, draft.provider, draft.providerConfidence, draft.networkType, draft.companyDomain, draft.companyName, draft.countryCode, draft.industry]);
    return leadFromRow(result.rows[0]);
  }

  async linkEventsToLead(companyIdentity: string, leadId: string) {
    await this.query(`UPDATE inquiry_visit_events SET inquiry_id = $2 WHERE company_identity = $1 AND inquiry_id IS NULL`, [companyIdentity, leadId]);
  }

  async findVisitorLeadForCustomer(companyDomain: string | null, companyName: string | null, countryName: string | null) {
    const result = companyDomain ? await this.query(`SELECT * FROM inquiries WHERE inquiry_type = 'company_visitor_lead' AND company_domain = $1 ORDER BY updated_at DESC LIMIT 1`, [companyDomain]) : await this.query(`SELECT * FROM inquiries WHERE inquiry_type = 'company_visitor_lead' AND lower(company_name) = lower($1) AND ($2::text IS NULL OR country_name = $2) ORDER BY updated_at DESC LIMIT 1`, [companyName, countryName]);
    return result.rows[0] ? leadFromRow(result.rows[0]) : null;
  }

  async saveCustomerInquiry(draft: CustomerInquiryDraft) {
    const result = await this.query(`INSERT INTO inquiries (id, inquiry_type, source, source_label, status, customer_submitted, customer_name, customer_email, customer_phone, customer_message, company_name, company_domain, company_website, country_name, first_referrer, latest_referrer, first_utm_source, latest_utm_source, linked_inquiry_id) VALUES ($1,'customer_submitted',$2,$3,$4,TRUE,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`, [randomUUID(), draft.source, draft.sourceLabel, draft.status, draft.customerName, draft.customerEmail, draft.customerPhone, draft.customerMessage, draft.companyName, draft.companyDomain, draft.companyWebsite, draft.countryName, draft.firstReferrer, draft.latestReferrer, draft.firstUtmSource, draft.latestUtmSource, draft.linkedInquiryId]);
    return customerFromRow(result.rows[0]);
  }

  async linkVisitorToCustomer(visitorId: string, customerId: string) {
    await this.query(`UPDATE inquiries SET linked_inquiry_id = $2, status = 'converted_to_inquiry', updated_at = NOW() WHERE id = $1`, [visitorId, customerId]);
  }

  async hasNotification(inquiryId: string, notificationKey: string) {
    const result = await this.query(`SELECT 1 FROM inquiry_activity_logs WHERE inquiry_id = $1 AND activity_type = 'notification' AND notification_key = $2 AND created_at > NOW() - ($3 || ' hours')::interval LIMIT 1`, [inquiryId, notificationKey, visitorConfig.notificationDedupHours]);
    return (result.rowCount ?? 0) > 0;
  }

  async recordNotification(inquiryId: string, notificationKey: string, status: "sent" | "failed") {
    await this.query(`INSERT INTO inquiry_activity_logs (id, inquiry_id, activity_type, notification_key, status) VALUES ($1,$2,'notification',$3,$4) ON CONFLICT DO NOTHING`, [randomUUID(), inquiryId, notificationKey, status]);
  }

  async getLatestNotificationStatus(inquiryId: string) {
    const result = await this.query(`SELECT status FROM inquiry_activity_logs WHERE inquiry_id = $1 AND activity_type = 'notification' ORDER BY created_at DESC LIMIT 1`, [inquiryId]);
    const status = result.rows[0]?.status;
    return status === "sent" || status === "failed" ? status : null;
  }

  async listInquiries(filter: InquiryFilter = {}) {
    const result = await this.query(`SELECT * FROM inquiries ORDER BY updated_at DESC LIMIT 500`);
    return result.rows.map((row) => row.inquiry_type === "company_visitor_lead" ? leadFromRow(row) : customerFromRow(row)).filter((inquiry) => matchesFilter(inquiry, filter));
  }

  async cleanupExpired(now: string) {
    const events = await this.query(`DELETE FROM inquiry_visit_events WHERE expires_at <= $1`, [now]);
    const cache = await this.query(`DELETE FROM provider_cache WHERE expires_at <= $1`, [now]);
    const logs = await this.query(`DELETE FROM inquiry_activity_logs WHERE created_at <= NOW() - ($1 || ' days')::interval`, [visitorConfig.providerCacheRetentionDays]);
    return { visitEvents: events.rowCount ?? 0, providerCache: cache.rowCount ?? 0, activityLogs: logs.rowCount ?? 0 };
  }
}
