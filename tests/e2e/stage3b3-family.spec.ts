import { test, expect } from "@playwright/test";
import catalog from "@/data/catalog.normalized.json";
import { SOURCE_ONLY_RECORD_IDS } from "@/data/sourceOnlyRecords";

const locales = ["en", "zh", "id", "vi", "th", "ms"];
const remainingFamilies = [
  "corrugated-board-flute-materials",
  "specialty-decorative-paper",
  "functional-food-paper",
  "packaging-materials-converted-components",
  "oem-odm-custom-paper-converting",
];
const sourceOnlySlugs = SOURCE_ONLY_RECORD_IDS.map((id) => catalog.skus.find((sku) => sku.id === id)?.slug).filter((slug): slug is string => Boolean(slug));

test.describe("Stage 3B-3 remaining-family safe admission", () => {
  for (const family of remainingFamilies) {
    for (const locale of locales) {
      test(`${locale}/${family} remains accessible but is not admitted`, async ({ page }) => {
        await page.goto(`/${locale}/products/families/${family}`);
        await expect(page).toHaveTitle(/.+/u);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator('a[href*="/contact?interest="]')).toHaveCount(1);
        const robots = await page.locator('meta[name="robots"]').getAttribute("content");
        expect(robots ?? "").not.toContain("noindex");
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        expect(canonical).toContain(`/${locale}/products/families/${family}`);
      });
    }
  }

  test("runtime sitemap remains the calibrated exact set", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
    expect(new Set(urls).size).toBe(136);
    expect(urls.some((url) => url.endsWith("/en/products/families/paper-cup-materials"))).toBe(false);
    for (const slug of sourceOnlySlugs) expect(urls).not.toContain(`https://www.kehong.tech/en/products/${slug}`);
    expect(urls.some((url) => url.includes("/es/"))).toBe(false);
  });
});
