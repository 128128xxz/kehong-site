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
