import { expect, test } from "@playwright/test";
import catalog from "@/data/catalog.normalized.json";
import { SOURCE_ONLY_RECORD_IDS } from "@/data/sourceOnlyRecords";

const targetSlug = "kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup";
const sourceSlugs = [
  "kh-fd-cupsheet-150350-pr-044-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-150350-pr-068-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-250-pe-221-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-280-pe-222-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-300-pe-223-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-320-pe-224-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-320-pr-225-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-350-pr-226-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-150-pr-227-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-170-pr-228-pe-coated-paper-sheet-for-paper-cup",
  "kh-fd-cupsheet-280-pe-229-pe-coated-paper-sheet-for-paper-cup",
];
const hiddenSourceOnlySlugs = SOURCE_ONLY_RECORD_IDS.map((id) => catalog.skus.find((sku) => sku.id === id)?.slug).filter((slug): slug is string => Boolean(slug));

test.describe("Stage 3B-2B-R paper-cup sheet center", () => {
  test("target renders the 11 currently public sheet identities without synthetic variants", async ({ page }) => {
    await page.goto(`/en/products/${targetSlug}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-paper-cup-sheet-center="true"]')).toHaveAttribute("data-paper-cup-sheet-source-records", "11");
    for (const slug of sourceSlugs) await expect(page.locator(`a[href="/en/products/${slug}"]`)).toHaveCount(1);
    await expect(page.getByText("KH-FD-CUPSHEET-150350-PR-044", { exact: true })).toBeVisible();
    await expect(page.getByText("KH-FD-CUPSHEET-150350-PR-068", { exact: true })).toBeVisible();
  });

  test("source pages canonicalize to pe-043 and the current sitemap excludes hidden source-only records", async ({ page, request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
    expect(new Set(locs).size).toBe(136);
    expect(xml).not.toContain("/en/products/families/paper-cup-materials");
    for (const slug of hiddenSourceOnlySlugs) expect(xml).not.toContain(`/en/products/${slug}`);
    expect(xml).toContain(`/en/products/${targetSlug}`);
    for (const slug of sourceSlugs.slice(0, 2)) {
      await page.goto(`/en/products/${slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${targetSlug}$`, "u"));
    }
  });
});
