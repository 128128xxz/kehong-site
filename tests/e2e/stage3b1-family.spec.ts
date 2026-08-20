import { expect, test } from "@playwright/test";

const locales = ["en", "zh", "id", "vi", "th", "ms"];
const families = [
  "corrugated-board-flute-materials",
  "specialty-decorative-paper",
  "functional-food-paper",
  "paper-cup-materials",
  "packaging-materials-converted-components",
  "oem-odm-custom-paper-converting",
];

test.describe("Stage 3B-1 family and anchor routes", () => {
  test("family pages render in every active locale with local SEO metadata", async ({ page }) => {
    for (const locale of locales) {
      for (const family of families) {
        const response = await page.goto(`/${locale}/products/families/${family}`, { waitUntil: "domcontentloaded" });
        expect(response?.status(), `${locale}/${family} status`).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        expect(canonical).toContain(`/${locale}/products/families/${family}`);
        const hreflang = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) => links.map((link) => link.getAttribute("hreflang")));
        for (const activeLocale of locales) expect(hreflang).toContain(activeLocale);
        expect(await page.locator("body").innerText()).not.toContain("ProductFamilies.");
      }
    }
  });

  test("anchor page exposes one real published selection and no horizontal overflow", async ({ page }) => {
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}/products/food-tray-paper-material`, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("select")).toHaveCount(6);
      await expect(page.getByText("KH-FD-TRAYP-150350-PE-290")).toBeVisible();
      const width = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      expect(width.document, `${locale} overflow`).toBeLessThanOrEqual(width.viewport + 1);
      const image = page.locator("main img").first();
      await expect(image).toHaveAttribute("src", /.+/u);
    }
  });

  test("products directory and navigation expose family routes while old catalog remains linked", async ({ page }) => {
    await page.goto("/en/products", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#product-families")).toBeVisible();
    for (const family of families) await expect(page.locator(`a[href="/en/products/families/${family}"]`)).toHaveCount(1);
    await expect(page.locator('a[href="/en/products/food-tray-paper-material"]')).toHaveCount(1);
    await expect(page.locator("#catalog-list")).toBeVisible();
    await page.getByRole("button", { name: /Products|产品/u }).first().press("Enter").catch(() => undefined);
    const resources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
    expect(resources.some((name) => /three|@react-three/iu.test(name))).toBe(false);
  });

  test("archived Spanish does not get a new family page", async ({ page }) => {
    await page.goto("/es/products/families/paper-cup-materials", { waitUntil: "domcontentloaded" });
    expect(page.url()).not.toContain("/es/products/families/");
    expect(page.url()).toContain("/en/products");
  });
});
