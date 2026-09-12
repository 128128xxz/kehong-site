import { test, expect, type Page } from "@playwright/test";

const locales = ["en", "zh", "id", "vi", "th", "ms"] as const;
const pages = ["/", "/about", "/resources"] as const;

async function assertPageOk(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `${path} response`).toBe(200);
  await page.waitForLoadState("load");
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
}

test.describe("About / Resources / Homepage smoke", () => {
  test("all active locales render the three pages", async ({ page }) => {
    for (const locale of locales) {
      for (const p of pages) {
        await assertPageOk(page, `/${locale}${p}`);
      }
    }
  });

  test("about page structure and conservative claims", async ({ page }) => {
    await page.goto("/en/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("Paper materials, converting");
    await expect(page.locator("main").getByText("What Kehong does", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main").getByText("Who we work with", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main").getByText("How we support projects", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main").getByText("View Factory", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main").getByText("Explore Capabilities", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main").getByText("Request a quote", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/leading manufacturer|global leader|industry-leading|certified factory|trusted by thousands/i);

    await page.goto("/zh/about", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("纸材");
    await expect(page.locator("main")).not.toContainText(/20\+ 年|8,000\+|行业领先|认证工厂|全球领先/i);
  });

  test("resources page structure and routes", async ({ page }) => {
    await page.goto("/en/resources", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("Guides, buying resources");
    await expect(page.locator("main").getByText("Packaging industry insights", { exact: false }).first()).toBeVisible();
    await expect(page.locator("main").getByText("Structure reference tool", { exact: false }).first()).toBeVisible();
    await expect(page.locator("main").getByText("Send a Reference File", { exact: true }).first()).toBeVisible();
    const newsLink = page.locator("main a[href*='/en/news']:visible").first();
    await expect(newsLink).toBeVisible();
    const studioLink = page.locator("main a[href*='/en/model-preview']:visible").first();
    await expect(studioLink).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/leading manufacturer|global leader/i);
  });

  test("homepage industries cards have loaded images", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const imgs = page.locator("main .kh-industry-card img");
    const count = await imgs.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < count; i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect(imgs.nth(i)).toBeVisible();
      await expect.poll(() => imgs.nth(i).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 100)).toBe(true);
    }
  });

  test("homepage factory/capabilities trust block and hero", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    const factoryLink = page.locator("main a[href='/en/factory']:visible").first();
    await expect(factoryLink).toBeVisible();
    const capabilitiesLink = page.locator("main a[href='/en/capabilities']:visible").first();
    await expect(capabilitiesLink).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/leading manufacturer|global leader/i);
  });

  test("internal links resolve on the three pages (en)", async ({ page, request }) => {
    const checked = new Set<string>();
    for (const p of pages) {
      await page.goto(`/en${p}`, { waitUntil: "domcontentloaded" });
      const hrefs = await page.locator("main a[href]").evaluateAll((anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).getAttribute("href")).filter((h): h is string => !!h && h.startsWith("/") && !h.startsWith("//")),
      );
      for (const href of hrefs) {
        if (checked.has(href)) continue;
        checked.add(href);
        const target = new URL(href, "http://localhost");
        const response = await request.get(`${target.pathname}${target.search}`);
        expect(response.status(), `${href} should not 404`).toBeLessThan(400);
      }
    }
  });

  test("no horizontal overflow on mobile for all locales", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const locale of locales) {
      for (const p of pages) {
        await page.goto(`/${locale}${p}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${locale}${p} horizontal overflow`).toBe(false);
      }
    }
  });
});
