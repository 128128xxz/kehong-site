export const visitorEventTypes = [
  "page_view",
  "product_view",
  "contact_view",
  "quote_view",
  "email_click",
  "whatsapp_click",
  "form_start",
  "form_submit",
] as const;

export type VisitorEventType = (typeof visitorEventTypes)[number];
export type NetworkType = "business" | "education" | "government" | "isp" | "hosting" | "carrier" | "vpn" | "proxy" | "bot" | "unknown";
export type InquiryType = "customer_submitted" | "company_visitor_lead";

export type ScoreReason = { code: string; points: number; label: string };

export type VisitorEventInput = {
  eventId: string;
  eventType: VisitorEventType;
  path: string;
  pageTitle: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  durationSeconds: number | null;
};

export type ProviderCompanyResult = {
  provider: string;
  companyId: string | null;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  industry: string | null;
  employeeRange: string | null;
  revenueRange: string | null;
  headquarters: string | null;
  linkedinUrl: string | null;
  networkType: NetworkType;
  providerConfidence: number;
};

export type VisitorEventRecord = VisitorEventInput & {
  ipHash: string | null;
  companyIdentity: string | null;
  networkType: NetworkType | null;
  botCategory: string | null;
  occurredAt: string;
  expiresAt: string;
};

export type VisitorLeadDraft = ProviderCompanyResult & {
  companyIdentity: string;
  leadScore: number;
  scoreReasons: ScoreReason[];
  firstSeenAt: string;
  lastSeenAt: string;
  firstReferrer: string | null;
  latestReferrer: string | null;
  firstUtmSource: string | null;
  latestUtmSource: string | null;
  totalVisits: number;
  totalEvents: number;
  requiresManualLink: boolean;
};

export type VisitorLeadRecord = VisitorLeadDraft & {
  id: string;
  inquiryType: "company_visitor_lead";
  source: string;
  sourceLabel: string;
  status: string;
  linkedInquiryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInquiryDraft = {
  source: string;
  sourceLabel: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerMessage: string | null;
  companyName: string | null;
  companyDomain: string | null;
  companyWebsite: string | null;
  countryName: string | null;
  firstReferrer: string | null;
  latestReferrer: string | null;
  firstUtmSource: string | null;
  latestUtmSource: string | null;
  linkedInquiryId: string | null;
};

export type CustomerInquiryRecord = CustomerInquiryDraft & {
  id: string;
  inquiryType: "customer_submitted";
  createdAt: string;
  updatedAt: string;
};

export type UnifiedInquiry = VisitorLeadRecord | CustomerInquiryRecord;

export type InquiryFilter = {
  inquiryType?: InquiryType;
  status?: string;
  highScore?: boolean;
};

export interface InquiryRepository {
  saveVisitorEvent(event: VisitorEventRecord): Promise<boolean>;
  getVisitorEvents(companyIdentity: string): Promise<VisitorEventRecord[]>;
  findVisitorLead(companyIdentity: string, mergeSince: string): Promise<VisitorLeadRecord | null>;
  saveVisitorLead(draft: VisitorLeadDraft, existingId?: string): Promise<VisitorLeadRecord>;
  linkEventsToLead(companyIdentity: string, leadId: string): Promise<void>;
  findVisitorLeadForCustomer(companyDomain: string | null, companyName: string | null, countryName: string | null): Promise<VisitorLeadRecord | null>;
  saveCustomerInquiry(draft: CustomerInquiryDraft): Promise<CustomerInquiryRecord>;
  linkVisitorToCustomer(visitorId: string, customerId: string): Promise<void>;
  hasNotification(inquiryId: string, notificationKey: string): Promise<boolean>;
  recordNotification(inquiryId: string, notificationKey: string, status: "sent" | "failed"): Promise<void>;
  getLatestNotificationStatus(inquiryId: string): Promise<"sent" | "failed" | null>;
  listInquiries(filter?: InquiryFilter): Promise<UnifiedInquiry[]>;
  cleanupExpired(now: string): Promise<{ visitEvents: number; providerCache: number; activityLogs: number }>;
}
