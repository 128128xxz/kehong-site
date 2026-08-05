import { getPackagingInquiryLabel } from "@/data/packagingCategories";

export type PackagingContactParams = Record<string, string | undefined>;

/**
 * Builds every category-specific contact route with URLSearchParams so labels
 * containing ampersands remain one product value. Unknown categories stay on
 * the generic contact route instead of being misrouted to another category.
 */
export function buildPackagingContactHref(locale: string, slug: string, extraParams: PackagingContactParams = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams)) {
    if (!value || key === "product" || key === "qa" || key.startsWith("__")) continue;
    params.set(key, value);
  }
  const inquiryLabel = getPackagingInquiryLabel(slug, locale);
  if (inquiryLabel) params.set("product", inquiryLabel);
  const query = params.toString();
  return query ? `/contact?${query}` : "/contact";
}
