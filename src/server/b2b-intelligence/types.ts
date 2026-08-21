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
