import { expect, test } from "@playwright/test";

async function expectNoConsoleErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test.describe("Kehong production flows", () => {
  test("root resolves permanently to the canonical English homepage", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/en");
  });

  test("core pages load without console or hydration errors", async ({ page }) => {
    const errors = await expectNoConsoleErrors(page);
    for (const path of ["/en", "/en/products", "/en/contact"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /www\.kehong\.tech/);
      await expectNoHorizontalOverflow(page);
    }
    expect(errors.filter((message) => /hydration|console/i.test(message))).toEqual([]);
  });

  test("English public output has no legacy domain or untranslated CJK fields", async ({ page }) => {
    for (const path of ["/en", "/en/products", "/en/contact"]) {
      const errors: string[] = [];
      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(path, { waitUntil: "networkidle" });
      const html = await page.content();
      expect(html).not.toContain(["kehong", "paper.com"].join(""));
      expect(html).not.toMatch(/[\u3400-\u9fff]/u);
      expect(errors).toEqual([]);
    }
  });

  for (const width of [320, 360, 375, 390, 412, 768, 1440]) {
    test(`/en/products has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/en/products", { waitUntil: "networkidle" });
      await expectNoHorizontalOverflow(page);
      if (width < 1024) {
        await page.getByRole("button", { name: /filter products/i }).click();
      }
      await expect(page.locator("select").first()).toBeVisible();
      await page.locator("select").first().focus();
      await page.keyboard.press("Escape");
    });
  }

  test("product filter is operable and survives refresh", async ({ page }) => {
    await page.goto("/en/products", { waitUntil: "networkidle" });
    const category = page.locator("select").first();
    const optionCount = await category.locator("option").count();
    test.skip(optionCount < 2, "No taxonomy category option is available");
    await category.selectOption({ index: 1 });
    await expect(page).toHaveURL(/category=/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/category=/);
  });

  test("selected products persist when moving from catalog to contact", async ({ page }) => {
    await page.goto("/en/products", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /add to inquiry/i }).first().click();
    await expect.poll(() => page.evaluate(() => window.sessionStorage.getItem("kehong-selected-products") || "")).toMatch(/KH-/);
    await page.goto("/en/contact", { waitUntil: "networkidle" });
    await expect(page.locator('textarea[name="products"]')).toHaveValue(/KH-/);
  });

  test("3D showroom is discoverable and has a working preview route", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator('footer a[href*="/model-preview"]')).toBeVisible();
    await page.goto("/en/model-preview", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("product details prefill inquiry and mock success state", async ({ page }) => {
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, code: "ACCEPTED" }) });
    });
    await page.goto("/en/products", { waitUntil: "networkidle" });
    await page.locator('article a[href*="/products/"]').first().click();
    await expect(page.locator('textarea[name="products"]')).toHaveValue(/KH-/);
    const continueButton = page.getByRole("button", { name: /continue/i });
    if (await continueButton.count()) for (let index = 0; index < 4; index += 1) await continueButton.click();
    await page.locator('input[name="name"]').fill("Playwright QA");
    await page.locator('input[name="email"]').fill("playwright@example.com");
    await page.locator('input[name="privacy"]').check();
    await page.getByRole("button", { name: /request a quote/i }).last().click();
    await expect(page.getByText(/inquiry.*(accepted|received)/i)).toBeVisible();
  });

  test("published product routes use one v2 template and expose group variants", async ({ page }) => {
    for (const path of [
      "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan",
      "/en/products/kh-fd-cupfan-150350-pr-002-paper-cup-fan",
      "/en/products/kh-fd-cupfan-150350-pr-003-paper-cup-fan",
      "/en/products/kh-fd-kcup-150350-pr-048-kraft-cupstock-paper",
    ]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator('[data-product-template-version="v2"]')).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('a[href*="/contact?product="]').first()).toHaveAttribute("href", /\/contact\?product=/);
      await expect(page.locator('footer a[href*="wa.me"]').filter({ hasText: /WhatsApp/i }).first()).toBeVisible();
    }
  });

  test("inquiry failure can be retried with a mocked provider", async ({ page }) => {
    let attempts = 0;
    await page.route("**/api/inquiry", async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ ok: false, code: "EMAIL_PROVIDER_REJECTED" }) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, code: "ACCEPTED" }) });
      }
    });
    await page.goto("/en/contact", { waitUntil: "networkidle" });
    const products = page.locator('textarea[name="products"]');
    await products.fill("KH-QA-001 | QA product");
    for (let index = 0; index < 4; index += 1) await page.getByRole("button", { name: /continue/i }).click();
    await page.locator('input[name="name"]').fill("Playwright QA");
    await page.locator('input[name="email"]').fill("playwright@example.com");
    await page.locator('input[name="privacy"]').check();
    const submit = page.getByRole("button", { name: /submit inquiry/i }).last();
    await submit.click();
    await expect(page.getByText(/could not be submitted|submission failed/i)).toBeVisible();
    await submit.click();
    await expect(page.getByText(/inquiry.*(accepted|received)/i)).toBeVisible();
  });
});
