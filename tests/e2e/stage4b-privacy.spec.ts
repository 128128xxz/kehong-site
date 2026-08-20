import { expect, test } from "@playwright/test";

const activeLocales = ["en", "zh", "id", "vi", "th", "ms"];

test.describe("Stage 4B privacy and terms surfaces", () => {
  test("privacy and terms are public, localized and single-headed", async ({ page }) => {
    for (const locale of activeLocales) {
      for (const route of ["privacy", "terms"]) {
        const response = await page.goto(`/${locale}/${route}`, { waitUntil: "domcontentloaded" });
        expect(response?.status(), `${locale}/${route}`).toBe(200);
        await expect(page.locator("main h1")).toHaveCount(1);
        await expect(page.locator("main h2")).not.toHaveCount(0);
      }
    }
  });

  test("contact privacy notice links to the current locale", async ({ page }) => {
    for (const locale of activeLocales) {
      await page.goto(`/${locale}/contact`, { waitUntil: "domcontentloaded" });
      const notice = page.getByTestId("contact-privacy-notice");
      await expect(notice).toBeVisible();
      await expect(notice.locator("a")).toHaveAttribute("href", `/${locale}/privacy`);
    }
  });

  test("archived Spanish keeps its existing consolidation behavior", async ({ request }) => {
    const response = await request.get("/es/privacy", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/en/privacy");
  });

  test("uses a lightweight analytics preference instead of a blocking consent banner", async ({ page }) => {
    await page.goto("/en/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("analytics-consent")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Privacy settings" })).toBeVisible();
  });
});
