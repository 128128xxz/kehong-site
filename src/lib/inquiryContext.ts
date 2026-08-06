import { getInterest, type InterestId } from "@/data/interests";

export type InquiryContactParams = Record<string, string | undefined>;

/** Keep valid product, intent and campaign context while rejecting unknown intent values. */
export function buildInquiryContactHref(params: InquiryContactParams = {}) {
  const query = new URLSearchParams();
  const allowed = new Set(["product", "sku", "url", "interest", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]);
  for (const [key, value] of Object.entries(params)) {
    if (!value || !allowed.has(key) || key.startsWith("__")) continue;
    if (key === "interest" && !getInterest(value)) continue;
    query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `/contact?${serialized}` : "/contact";
}

export function isInquiryInterest(value: string | undefined): value is InterestId {
  return Boolean(value && getInterest(value));
}
