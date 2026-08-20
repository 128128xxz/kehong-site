import { test, expect } from "@playwright/test";

test.describe("B2B visitor intelligence mock", () => {
  test("accepts privacy-safe event payloads and rejects PII payloads", async ({ request, baseURL }) => {
    const headers = { Origin: baseURL ?? "http://127.0.0.1:3451", "x-vercel-id": "mock::iad1", "x-forwarded-for": "8.8.8.8" };
    const accepted = await request.post("/api/lead-event", { headers: { ...headers, "Content-Type": "application/json" }, data: { eventId: "e2e-product", eventType: "product_view", path: "/en/products/example", pageTitle: "Example Product", durationSeconds: 65 } });
    expect(accepted.status()).toBe(202);
    await expect(accepted.json()).resolves.toMatchObject({ ok: true, accepted: true });
    const rejected = await request.post("/api/lead-event", { headers: { ...headers, "Content-Type": "application/json" }, data: { eventType: "page_view", path: "/en", email: "person@example.com" } });
    expect(rejected.status()).toBe(400);
    await expect(rejected.json()).resolves.toMatchObject({ ok: false, code: "PII_NOT_ALLOWED" });
  });
});
