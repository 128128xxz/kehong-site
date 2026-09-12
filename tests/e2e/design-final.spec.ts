import { test, expect } from "@playwright/test";

test("production metadata stays on the canonical public origin", async ({ request }) => {
  for (const path of [
    "/en",
    "/en/products",
    "/en/contact",
    "/en/factory",
    "/en/process",
    "/en/procurement",
    "/en/model-preview",
    "/en/solutions",
    "/en/products/kh-fd-cuproll-150350-pr-032-pe-coated-paper-roll-for-paper-cup",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).not.toContain('href="http://127.0.0.1');
    expect(html).not.toContain('content="http://127.0.0.1');
    expect(html).toContain("https://www.kehong.tech");
    expect((html.match(/rel="canonical"/g) ?? []).length).toBe(1);
  }
});

test("core routes use the shared visual language", async ({ page }) => {
  for (const path of ["/en/products", "/en/solutions", "/en/capabilities", "/en/factory", "/en/contact"]) {
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    expect(errors).toEqual([]);
  }
});
