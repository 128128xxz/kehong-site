import { randomUUID } from "node:crypto";
import { visitorConfig } from "./config";
import type {
  CustomerInquiryDraft,
  CustomerInquiryRecord,
  InquiryFilter,
  InquiryRepository,
  UnifiedInquiry,
  VisitorEventRecord,
  VisitorLeadDraft,
  VisitorLeadRecord,
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function matchesFilter(inquiry: UnifiedInquiry, filter: InquiryFilter = {}) {
  if (filter.inquiryType && inquiry.inquiryType !== filter.inquiryType) return false;
  if (filter.status && inquiry.status !== filter.status) return false;
  if (filter.highScore && (!("leadScore" in inquiry) || ((inquiry as VisitorLeadRecord).leadScore ?? 0) < visitorConfig.leadScoreThreshold)) return false;
  return true;
}

export class MemoryInquiryRepository implements InquiryRepository {
  private readonly events = new Map<string, VisitorEventRecord>();
  private readonly leads = new Map<string, VisitorLeadRecord>();
  private readonly customers = new Map<string, CustomerInquiryRecord>();
  private readonly notifications = new Map<string, { status: "sent" | "failed"; createdAt: string }>();

  async saveVisitorEvent(event: VisitorEventRecord) {
    if (this.events.has(event.eventId)) return false;
    this.events.set(event.eventId, event);
    return true;
  }

  async getVisitorEvents(companyIdentity: string) {
    return [...this.events.values()].filter((event) => event.companyIdentity === companyIdentity).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  async findVisitorLead(companyIdentity: string, mergeSince: string) {
    return [...this.leads.values()].find((lead) => lead.companyIdentity === companyIdentity && lead.updatedAt >= mergeSince) ?? null;
  }

  async saveVisitorLead(draft: VisitorLeadDraft, existingId?: string) {
    const timestamp = nowIso();
    const current = existingId ? this.leads.get(existingId) : undefined;
    const record: VisitorLeadRecord = {
      ...(current ?? {}),
      ...draft,
      id: existingId ?? randomUUID(),
      inquiryType: "company_visitor_lead",
      source: "website_company_identification",
      sourceLabel: "独立站企业访客识别",
      status: current?.status ?? "待人工核实",
      linkedInquiryId: current?.linkedInquiryId ?? null,
      createdAt: current?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.leads.set(record.id, record);
    return record;
  }

  async linkEventsToLead(companyIdentity: string, leadId: string) {
    void leadId;
    for (const [eventId, event] of this.events) {
      if (event.companyIdentity === companyIdentity) this.events.set(eventId, event);
    }
  }

  async findVisitorLeadForCustomer(companyDomain: string | null, companyName: string | null, countryName: string | null) {
    return [...this.leads.values()].find((lead) => {
      const domainMatch = Boolean(companyDomain && lead.companyDomain && companyDomain === lead.companyDomain);
      const nameMatch = Boolean(companyName && lead.companyName && companyName.trim().toLowerCase() === lead.companyName.trim().toLowerCase() && (!countryName || !lead.countryName || countryName === lead.countryName));
      return domainMatch || nameMatch;
    }) ?? null;
  }

  async saveCustomerInquiry(draft: CustomerInquiryDraft) {
    const timestamp = nowIso();
    const record: CustomerInquiryRecord = { ...draft, id: randomUUID(), inquiryType: "customer_submitted", createdAt: timestamp, updatedAt: timestamp };
    this.customers.set(record.id, record);
    return record;
  }

  async linkVisitorToCustomer(visitorId: string, customerId: string) {
    const visitor = this.leads.get(visitorId);
    if (visitor) this.leads.set(visitorId, { ...visitor, linkedInquiryId: customerId, updatedAt: nowIso(), status: "converted_to_inquiry" });
  }

  async hasNotification(inquiryId: string, notificationKey: string) {
    return this.notifications.has(`${inquiryId}:${notificationKey}`);
  }

  async recordNotification(inquiryId: string, notificationKey: string, status: "sent" | "failed") {
    this.notifications.set(`${inquiryId}:${notificationKey}`, { status, createdAt: nowIso() });
  }

  async listInquiries(filter: InquiryFilter = {}) {
    return [...this.customers.values(), ...this.leads.values()].filter((inquiry) => matchesFilter(inquiry, filter)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async cleanupExpired(now: string) {
    let visitEvents = 0;
    for (const [eventId, event] of this.events) {
      if (event.expiresAt <= now) {
        this.events.delete(eventId);
        visitEvents += 1;
      }
    }
    let activityLogs = 0;
    const cutoff = Date.now() - visitorConfig.notificationDedupHours * 60 * 60 * 1000;
    for (const [key, notification] of this.notifications) {
      if (Date.parse(notification.createdAt) < cutoff) {
        this.notifications.delete(key);
        activityLogs += 1;
      }
    }
    return { visitEvents, providerCache: 0, activityLogs };
  }

  clear() {
    this.events.clear();
    this.leads.clear();
    this.customers.clear();
    this.notifications.clear();
  }
}

let memoryRepository: MemoryInquiryRepository | null = null;

export function getMemoryRepository() {
  memoryRepository ??= new MemoryInquiryRepository();
  return memoryRepository;
}

export function resetMemoryRepository() {
  memoryRepository?.clear();
}
