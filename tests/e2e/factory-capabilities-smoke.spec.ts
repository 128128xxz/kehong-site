import { test, expect, type Page } from "@playwright/test";

const locales = ["en", "zh", "id", "vi", "th", "ms"] as const;
const pagePaths = ["/factory", "/capabilities"] as const;

async function assertPageOk(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response?.status(), `${path} response`).toBe(200);
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
}

test.describe("Factory & Capabilities smoke", () => {
  test("all active locales render both pages", async ({ page }) => {
    for (const locale of locales) {
      for (const pagePath of pagePaths) {
        await assertPageOk(page, `/${locale}${pagePath}`);
      }
    }
  });

  test("en / zh pages surface the expected structure and conservative claims", async ({ page }) => {
    await page.goto("/en/factory", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Paper converting");
    await expect(page.locator("main")).toContainText("Request a Quote");
    await expect(page.locator("main")).not.toContainText(/leading manufacturer|global leader|top factory|advanced factory|certified factory/i);

    await page.goto("/zh/factory", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("纸品加工与包装生产");
    await expect(page.locator("main")).toContainText("提交询价");

    await page.goto("/en/capabilities", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Paper Converting & Packaging Material Capabilities");
    await expect(page.locator("main")).toContainText("Material processing");
    await expect(page.locator("main")).toContainText("Start a custom project");
    await expect(page.locator("main")).not.toContainText(/leading manufacturer|global leader|top factory|advanced factory|100% inspection/i);

    await page.goto("/zh/capabilities", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("纸品加工与包装材料制造能力");
  });

  test("factory and capabilities pages do not overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const locale of ["en", "zh"] as const) {
      for (const pagePath of pagePaths) {
        await page.goto(`/${locale}${pagePath}`, { waitUntil: "networkidle" });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow, `${locale}${pagePath} horizontal overflow`).toBe(false);
      }
    }
  });
});
