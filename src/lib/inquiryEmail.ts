export type InquiryEmailData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  products: string[];
  quantity: string;
  size: string;
  material: string;
  gsm: string;
  printing: string;
  process: string;
  market: string;
  message: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  firstLandingPath?: string;
  conversionPath?: string;
  referrer?: string;
  ctaLocation?: string;
  locale?: string;
  productGroupId?: string;
  productGroupTitle?: string;
  sku?: string;
  skuTitle?: string;
  firstTouchSource?: string;
  firstTouchMedium?: string;
  firstTouchCampaign?: string;
  firstTouchContent?: string;
  firstTouchTerm?: string;
  firstTouchPath?: string;
  latestTouchSource?: string;
  latestTouchMedium?: string;
  latestTouchCampaign?: string;
  latestTouchContent?: string;
  latestTouchTerm?: string;
  latestTouchPath?: string;
  inquiryType?: string;
  submittedAt?: string;
  requestId?: string;
  interestId?: string;
  interestLabel?: string;
  interestProductType?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]/gu, " ").slice(0, 180);
}

export function buildInquiryEmail(data: InquiryEmailData) {
  const firstProduct = data.products[0] ?? "Product specification to be confirmed";
  const [firstSku, firstName] = firstProduct.split("|").map((value) => value.trim());
  const productName = firstName || firstSku || "Product specification to be confirmed";
  const sku = firstName ? firstSku : "";
  const company = data.company || data.name;
  const subject = safeHeader(`New Kehong quote request — ${productName}${sku ? ` (${sku})` : ""} — ${company}`);
  const productList = data.products.map((product) => `<li>${escapeHtml(product)}</li>`).join("");
  const utm = [data.utmSource, data.utmMedium, data.utmCampaign, data.utmContent, data.utmTerm].filter(Boolean).join(" / ") || "-";
  const firstTouch = [data.firstTouchSource, data.firstTouchMedium, data.firstTouchCampaign, data.firstTouchContent, data.firstTouchTerm, data.firstTouchPath].filter(Boolean).join(" / ") || "-";
  const latestTouch = [data.latestTouchSource, data.latestTouchMedium, data.latestTouchCampaign, data.latestTouchContent, data.latestTouchTerm, data.latestTouchPath].filter(Boolean).join(" / ") || "-";
  const submittedAt = data.submittedAt || new Date().toISOString();
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#171713">
      <div style="border-bottom:2px solid #194735;padding:0 0 12px;margin:0 0 20px">
        <p style="margin:0;color:#194735;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase">Kehong Paper Products</p>
        <h2 style="margin:5px 0 0">New quote request</h2>
      </div>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Company:</strong> ${escapeHtml(data.company || "-")}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(data.phone || "-")}</p>
      <p><strong>WhatsApp:</strong> ${escapeHtml(data.whatsapp || "-")}</p>
      <p><strong>Country:</strong> ${escapeHtml(data.country || "-")}</p>
      <p><strong>Products / product code:</strong></p>
      <ul>${productList}</ul>
      <p><strong>Quantity:</strong> ${escapeHtml(data.quantity || "-")}</p>
      <p><strong>Size:</strong> ${escapeHtml(data.size || "-")}</p>
      <p><strong>Material:</strong> ${escapeHtml(data.material || "-")}</p>
      <p><strong>GSM / thickness:</strong> ${escapeHtml(data.gsm || "-")}</p>
      <p><strong>Printing:</strong> ${escapeHtml(data.printing || "-")}</p>
      <p><strong>Process / finishing:</strong> ${escapeHtml(data.process || "-")}</p>
      <p><strong>Target market:</strong> ${escapeHtml(data.market || "-")}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(data.message || "-").replaceAll("\n", "<br />")}</p>
      <hr />
      <p style="font-size:12px;color:#626156"><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}<br />
      <strong>Source URL:</strong> ${escapeHtml(data.sourceUrl || "-")}<br />
      <strong>UTM:</strong> ${escapeHtml(utm)}<br />
      <strong>First / latest touch:</strong> ${escapeHtml(firstTouch)} → ${escapeHtml(latestTouch)}<br />
      <strong>Landing / conversion:</strong> ${escapeHtml([data.firstLandingPath, data.conversionPath].filter(Boolean).join(" → ") || "-")}<br />
      <strong>CTA / locale:</strong> ${escapeHtml([data.ctaLocation, data.locale].filter(Boolean).join(" / ") || "-")}<br />
      <strong>Inquiry type:</strong> ${escapeHtml(data.inquiryType || "-")}<br />
      <strong>Product group / current SKU:</strong> ${escapeHtml([data.productGroupId, data.productGroupTitle, data.sku, data.skuTitle].filter(Boolean).join(" | ") || "-")}<br />
      <strong>Interest:</strong> ${escapeHtml([data.interestId, data.interestLabel, data.interestProductType].filter(Boolean).join(" | ") || "-")}<br />
      <strong>Request ID:</strong> ${escapeHtml(data.requestId || "-")}</p>
    </div>
  `;
  const text = [
    "New Kehong quote request",
    `Name: ${data.name}`,
    `Company: ${data.company || "-"}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "-"}`,
    `WhatsApp: ${data.whatsapp || "-"}`,
    `Country: ${data.country || "-"}`,
    `Products / product code: ${data.products.join("; ") || "-"}`,
    `Quantity: ${data.quantity || "-"}`,
    `Size: ${data.size || "-"}`,
    `Material: ${data.material || "-"}`,
    `GSM / thickness: ${data.gsm || "-"}`,
    `Printing: ${data.printing || "-"}`,
    `Process / finishing: ${data.process || "-"}`,
    `Target market: ${data.market || "-"}`,
    `Message: ${data.message || "-"}`,
    `Submitted at: ${submittedAt}`,
    `Source URL: ${data.sourceUrl || "-"}`,
    `UTM: ${utm}`,
    `First / latest touch: ${firstTouch} → ${latestTouch}`,
    `Landing / conversion: ${[data.firstLandingPath, data.conversionPath].filter(Boolean).join(" → ") || "-"}`,
    `CTA / locale: ${[data.ctaLocation, data.locale].filter(Boolean).join(" / ") || "-"}`,
    `Inquiry type: ${data.inquiryType || "-"}`,
    `Product group / current SKU: ${[data.productGroupId, data.productGroupTitle, data.sku, data.skuTitle].filter(Boolean).join(" | ") || "-"}`,
    `Interest: ${[data.interestId, data.interestLabel, data.interestProductType].filter(Boolean).join(" | ") || "-"}`,
    `Request ID: ${data.requestId || "-"}`,
  ].join("\n");

  return { subject, html, text, productName, sku };
}
