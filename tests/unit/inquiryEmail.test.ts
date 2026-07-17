import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildInquiryEmail } from "@/lib/inquiryEmail";
import { getInquiryEmailConfig } from "@/lib/emailConfig";

describe("inquiry email contract", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes product, SKU, company, text and escaped HTML", () => {
    const email = buildInquiryEmail({
      name: "Buyer <script>",
      company: "ACME & Co.",
      email: "buyer@example.com",
      phone: "",
      whatsapp: "",
      country: "",
      products: ["KH-001 | Kraft Paper <sample> | https://www.kehong.tech/en/products/kh-001"],
      quantity: "1 ton",
      size: "Custom",
      material: "Kraft paper",
      gsm: "120gsm",
      printing: "",
      process: "",
      market: "UK",
      message: "<hello>",
      sourceUrl: "https://www.kehong.tech/en/products/kh-001",
      submittedAt: "2026-07-16T00:00:00.000Z",
      requestId: "qa-request",
    });
    expect(email.subject).toContain("Kraft Paper");
    expect(email.subject).toContain("KH-001");
    expect(email.subject).toContain("ACME & Co.");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("&amp; Co.");
    expect(email.html).toContain("Request ID");
    expect(email.text).toContain("Source URL: https://www.kehong.tech");
  });

  it("validates server-side email configuration without exposing the API key", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_secret");
    vi.stubEnv("EMAIL_FROM", "sales@kehong.tech");
    vi.stubEnv("EMAIL_TO", "info@kehong.tech,quotes@kehong.tech");
    vi.stubEnv("EMAIL_REPLY_TO_FALLBACK", "info@kehong.tech");
    const config = getInquiryEmailConfig();
    expect(config.valid).toBe(true);
    expect(config.to).toEqual(["info@kehong.tech", "quotes@kehong.tech"]);
    expect(config.apiKey).toBe("re_test_secret");
    expect(JSON.stringify({ missing: config.missing, invalid: config.invalid, fromConfigured: Boolean(config.from) })).not.toContain("re_test_secret");
  });
});
