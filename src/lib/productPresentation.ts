/**
 * Buyer-facing product specification formatting. Source catalog values stay
 * untouched so filters, SKU codes, URLs and import payloads remain stable.
 */
export function formatProductDisplayValue(value: string, locale: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (trimmed === "1–5 metric tons (typical)") return "1–5 metric tons";

  const gsm = trimmed.match(/^(\d+(?:\.\d+)?)(?:-|–)(\d+(?:\.\d+)?)gsm$/iu);
  if (gsm) return `${gsm[1]}–${gsm[2]} GSM`;

  const singleGsm = trimmed.match(/^(\d+(?:\.\d+)?)gsm$/iu);
  if (singleGsm) return `${singleGsm[1]} GSM`;

  if (/^\d+(?:\.\d+)?\s*oz(?:\/\d+(?:\.\d+)?\s*oz)*$/iu.test(trimmed)) {
    return trimmed.split("/").map((token) => token.trim().replace(/^(\d+(?:\.\d+)?)\s*oz$/iu, "$1 oz")).join(" / ");
  }

  const maxWidth = trimmed.match(/^Max width\s+(\d+(?:\.\d+)?)mm$/iu);
  if (maxWidth) return locale === "zh" ? `最大宽度：${maxWidth[1]} mm` : `Max width: ${maxWidth[1]} mm`;

  if (trimmed === "Custom L*W") return locale === "zh" ? "按长 × 宽定制" : "Custom L × W";
  if (trimmed === "Custom by cup size / dimensions") return locale === "zh" ? "按杯型 / 尺寸定制" : trimmed;
  if (locale === "zh") {
    const chineseValues: Record<string, string> = {
      "Custom width": "定制宽度",
      "Jumbo roll": "大卷规格",
      "Cupstock roll": "杯纸卷",
      "Sheet for flexo": "柔印用平张纸",
      "Sheet for digital": "数码印刷用平张纸",
    };
    return chineseValues[trimmed] ?? trimmed;
  }

  return trimmed;
}

export type ProductDisplayField = "application" | "finishing" | "surface" | "structure" | "size" | "material";

/** Field-aware display pass. It deliberately operates after catalogue
 * localization so buyer text is normalized without changing source records. */
export function formatProductFieldValue(value: string, field: ProductDisplayField, locale: string) {
  const display = formatProductDisplayValue(value, locale);
  if (display.trim().toLocaleLowerCase() === "custom paper packaging specification") return "";
  if (!display) return "";

  if (field === "size" && display === "Custom L*W") return locale === "zh" ? "按长 × 宽定制" : "Custom L × W";
  if (field === "application" && display === "Foodservice packaging") return locale === "zh" ? "餐饮食品包装" : display;
  return display;
}

/** Locale-aware display list formatting without changing the source arrays. */
export function formatProductDisplayList(values: readonly string[], locale: string) {
  const items = values.map((value) => value.trim()).filter(Boolean);
  if (locale === "zh") return items.join("、");
  return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(items);
}

/** Shared buyer-facing product context for forms and message summaries. */
export function formatProductSkuSummary(sku: string, locale: string) {
  return locale === "zh" ? `当前 SKU：${sku}` : `Current SKU: ${sku}`;
}
