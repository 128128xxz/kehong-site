import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/inquiry/route";

function setEmailEnv() {
  vi.stubEnv("RESEND_API_KEY", "re_test_secret");
  vi.stubEnv("EMAIL_FROM", "sales@kehong.tech");
  vi.stubEnv("EMAIL_TO", "info@kehong.tech");
  vi.stubEnv("EMAIL_REPLY_TO_FALLBACK", "info@kehong.tech");
}

function requestFor(email: string, idempotencyKey: string, ip = idempotencyKey) {
  return new Request("https://www.kehong.tech/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": idempotencyKey, "x-forwarded-for": ip },
    body: JSON.stringify({
      name: "QA Buyer",
      company: "QA Company",
      email,
      products: ["KH-QA-001 | Kraft Paper | https://www.kehong.tech/en/products/kh-qa-001"],
      message: "<script>alert(1)</script>",
      sourceUrl: "https://www.kehong.tech/en/products/kh-qa-001",
      privacy: "on",
    }),
  });
}

describe("inquiry API provider contract", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    setEmailEnv();
    vi.restoreAllMocks();
  });

  it("sends server-configured from/to, customer reply_to, HTML and text, then deduplicates", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "email-qa-1" }), { status: 200, headers: { "content-type": "application/json" } }));
    const response = await POST(requestFor("buyer@example.com", "qa-success-1"));
    expect(response.status).toBe(200);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.from).toContain("sales@kehong.tech");
    expect(body.to).toEqual(["info@kehong.tech"]);
    expect(body.reply_to).toBe("buyer@example.com");
    expect(body.from).not.toContain("buyer@example.com");
    expect(body.html).toContain("&lt;script&gt;");
    expect(body.text).toContain("https://www.kehong.tech");
    const retiredDomain = ["kehong", "paper.com"].join("");
    expect(body.html).not.toContain(retiredDomain);
    expect(body.text).not.toContain(retiredDomain);
    const duplicate = await POST(requestFor("buyer@example.com", "qa-success-1", "qa-second-ip"));
    expect(duplicate.status).toBe(409);
  });

  for (const status of [401, 403, 429, 500]) {
    it(`normalizes provider ${status} to a safe API error`, async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("provider detail", { status }));
      const response = await POST(requestFor(`buyer-${status}@example.com`, `qa-provider-${status}`));
      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body).toEqual({ ok: false, code: "EMAIL_PROVIDER_REJECTED", error: "Email delivery failed" });
      expect(JSON.stringify(body)).not.toContain("provider detail");
    });
  }
});
