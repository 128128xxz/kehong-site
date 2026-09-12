import { test, expect, type Page } from "@playwright/test";

const locales = ["en", "zh", "id", "vi", "th", "ms"];
const corePaths = [
  "/en/products",
  "/en/products/kh-fd-cuproll-150350-pr-032-pe-coated-paper-roll-for-paper-cup",
  "/en/factory",
  "/en/contact",
  "/en/resources",
  "/en/solutions",
  "/en/model-preview",
];

async function assertPageMedia(page: Page, path: string) {
  const imageFailures: string[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "image" && response.status() >= 400) imageFailures.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response?.status(), `${path} response`).toBe(200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const imageCount = await page.locator("img").count();
  const canvasCount = await page.locator("canvas").count();
  // The 3D Packaging Studio renders its primary visual in a WebGL canvas;
  // bitmap-only pages still require at least one image. Treat either as
  // valid public media while continuing to verify every bitmap response.
  expect(imageCount + canvasCount).toBeGreaterThan(0);
  for (let index = 0; index < imageCount; index += 1) {
    const image = page.locator("img").nth(index);
    if (await image.isVisible()) {
      await page.evaluate((imageIndex) => {
        const image = document.querySelectorAll("img")[imageIndex];
        image?.scrollIntoView({ block: "center", inline: "nearest" });
      }, index);
    }
  }
  await expect.poll(
    () => page.locator("img").evaluateAll((images) => images
      .map((image) => image as HTMLImageElement)
      .filter((image) => {
        const style = getComputedStyle(image);
        const box = image.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
      })
      // A visible image with a decoded natural width is usable even while the
      // browser is still finishing the decode/paint bookkeeping.
      .filter((image) => image.naturalWidth <= 0)
      .map((image) => image.getAttribute("src") || "unknown")),
    { timeout: 10_000 },
  ).toEqual([]);
  expect(imageFailures, `${path} image responses`).toEqual([]);
  const html = await page.content();
  expect(html).not.toMatch(/(?:\/images\/(?:ai|ai-generated)|ai-generated|generated-by-ai|generated_with_ai|chatgpt|ai-representative|gpt)/i);
}

test.describe("Stage 1B public media smoke", () => {
  test("all active locale homepages render neutral media", async ({ page }) => {
    for (const locale of locales) await assertPageMedia(page, `/${locale}`);
  });

  test("core pages render migrated media on desktop", async ({ page }) => {
    for (const path of corePaths) await assertPageMedia(page, path);
  });

  test("core homepage and contact media render on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ["/zh", "/en/contact"]) await assertPageMedia(page, path);
  });
});
