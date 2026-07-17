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
  submittedAt?: string;
  requestId?: string;
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
  const utm = [data.utmSource, data.utmMedium, data.utmCampaign].filter(Boolean).join(" / ") || "-";
  const submittedAt = data.submittedAt || new Date().toISOString();
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#171713">
      <h2>New Kehong quote request</h2>
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
    `Request ID: ${data.requestId || "-"}`,
  ].join("\n");

  return { subject, html, text, productName, sku };
}
