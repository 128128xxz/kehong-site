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

  if (/^\d+(?:\.\d+)?oz(?:\/\d+(?:\.\d+)?oz)*$/iu.test(trimmed)) {
    return trimmed.replaceAll(/(\d+(?:\.\d+)?)oz/giu, "$1 oz");
  }

  const maxWidth = trimmed.match(/^Max width\s+(\d+(?:\.\d+)?)mm$/iu);
  if (maxWidth) return locale === "zh" ? `最大宽度：${maxWidth[1]} mm` : `Max width: ${maxWidth[1]} mm`;

  if (trimmed === "Custom L*W") return locale === "zh" ? "按长 × 宽定制" : "Custom L × W";
  if (trimmed === "Custom by cup size / dimensions") return locale === "zh" ? "按杯型 / 尺寸定制" : trimmed;

  return trimmed;
}

/** Shared buyer-facing product context for forms and message summaries. */
export function formatProductSkuSummary(sku: string, locale: string) {
  return locale === "zh" ? `当前 SKU：${sku}` : `Current SKU: ${sku}`;
}
