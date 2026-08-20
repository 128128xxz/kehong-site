import { visitorConfig } from "./config";
import type { ProviderCompanyResult, ScoreReason, VisitorEventRecord } from "./types";

const meaningfulEventTypes = new Set(["product_view", "contact_view", "quote_view", "email_click", "whatsapp_click", "form_start", "form_submit"]);

export function hasMeaningfulBehavior(events: VisitorEventRecord[]) {
  return events.some((event) => meaningfulEventTypes.has(event.eventType));
}

export function isEligibleNetwork(networkType: ProviderCompanyResult["networkType"]) {
  return networkType === "business" || networkType === "education" || networkType === "government";
}

export function scoreLead(events: VisitorEventRecord[], profile: ProviderCompanyResult) {
  const reasons: ScoreReason[] = [];
  const add = (code: string, points: number, label: string) => reasons.push({ code, points, label });
  if (profile.networkType === "business") add("business_network", 30, "Business network");
  if (profile.networkType === "education") add("education_network", 20, "Education network");
  if (profile.networkType === "government") add("government_network", 20, "Government network");
  if (profile.countryCode && visitorConfig.targetCountryCodes.has(profile.countryCode.toUpperCase())) add("target_country", 15, "Target country");

  const products = new Set(events.filter((event) => event.eventType === "product_view").map((event) => event.path));
  const typeCounts = new Map<string, number>();
  for (const event of events) typeCounts.set(event.eventType, (typeCounts.get(event.eventType) ?? 0) + 1);
  if (products.size > 0) add("product_detail", 10, "Product detail viewed");
  if (products.size >= 2) add("multiple_products", 15, "Multiple products viewed");
  if (typeCounts.has("contact_view")) add("contact_view", 25, "Contact viewed");
  if (typeCounts.has("quote_view")) add("quote_view", 25, "Quote path viewed");
  if (typeCounts.has("email_click")) add("email_click", 30, "Email contact clicked");
  if (typeCounts.has("whatsapp_click")) add("whatsapp_click", 30, "WhatsApp contact clicked");
  if (typeCounts.has("form_start")) add("form_start", 20, "Inquiry form started");
  if (typeCounts.has("form_submit")) add("form_submit", 50, "Inquiry form submitted");
  if ((typeCounts.get("page_view") ?? 0) >= 2) add("repeat_visit", 10, "Repeated website visit");
  if (events.some((event) => (event.durationSeconds ?? 0) > 60)) add("engaged_duration", 10, "Session duration exceeded 60 seconds");
  if (!isEligibleNetwork(profile.networkType)) add("excluded_network", -60, "Excluded network type");
  if (profile.providerConfidence < 0.75) add("low_confidence", -20, "Low provider confidence");
  return { score: reasons.reduce((total, reason) => total + reason.points, 0), reasons };
}
