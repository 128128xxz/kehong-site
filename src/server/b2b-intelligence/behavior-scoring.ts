import type { DigestScoreReason, VisitorDigestRecord } from "./digest-types";

const add = (reasons: DigestScoreReason[], code: string, points: number, label: string) => reasons.push({ code, points, label });

export function scoreBehavior(input: Pick<VisitorDigestRecord, "eventSummary" | "productPages" | "totalVisits" | "totalSessionSeconds">) {
  const reasons: DigestScoreReason[] = [];
  const events = input.eventSummary;
  if (input.productPages.length > 0) add(reasons, "product_view", 10, "Product view");
  if (input.productPages.length >= 2) add(reasons, "multiple_product_views", 15, "Multiple product views");
  if (events.contact_view) add(reasons, "contact_view", 25, "Contact view");
  if (events.quote_view) add(reasons, "quote_view", 25, "Quote path");
  if (events.email_click) add(reasons, "email_click", 30, "Email click");
  if (events.whatsapp_click) add(reasons, "whatsapp_click", 30, "WhatsApp click");
  if (events.form_start) add(reasons, "form_start", 20, "Form start");
  if (events.form_submit) add(reasons, "form_submit", 50, "Form submit");
  if (input.totalVisits >= 2) add(reasons, "repeat_visit", 10, "Repeat visit");
  if (input.totalSessionSeconds >= 60) add(reasons, "engaged_duration", 10, "Engaged duration");
  return { score: reasons.reduce((total, reason) => total + reason.points, 0), reasons };
}
