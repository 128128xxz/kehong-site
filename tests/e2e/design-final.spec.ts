import { expect, test } from "@playwright/test";

const homeSections = ["home", "product-window", "solutions", "capabilities", "studio", "inquiry"];

async function expectActuallyVisible(locator: import("@playwright/test").Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, "element must have a rendered box").not.toBeNull();
  expect(box!.width).toBeGreaterThan(1);
  expect(box!.height).toBeGreaterThan(1);
  await expect(locator).toHaveCSS("visibility", "visible");
  await expect(locator).not.toHaveCSS("opacity", "0");
}

test.describe("final design contract", () => {
  test("homepage keeps the approved six-section portal structure", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    await expect(page.locator("main > section")).toHaveCount(6);
    for (const id of homeSections) await expect(page.locator(`main > section#${id}`)).toHaveCount(1);
    await expect(page.locator("main form")).toHaveCount(0);
    await expect(page.locator('main a[href="#"], main a[href=""]')).toHaveCount(0);
    await expect(page.locator('[data-3d-loading="route-only"]')).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#studio h2")).toHaveText("Review the structure before production.");
    await expect(page.locator("#inquiry h2")).toHaveText("Move your packaging brief into production.");
  });

  test("production metadata stays on the canonical public origin", async ({ request }) => {
    for (const path of [
      "/en",
      "/en/products",
      "/en/contact",
      "/en/factory",
      "/en/process",
      "/en/procurement",
      "/en/model-preview",
      "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan",
    ]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).not.toContain('href="http://127.0.0.1');
      expect(html).not.toContain('content="http://127.0.0.1');
      expect(html).toContain("https://www.kehong.tech");
      expect((html.match(/rel=\"canonical\"/g) ?? []).length).toBe(1);
    }
  });

  test("hero and manufacturing use distinct verified local compositions", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const hero = await page.locator("#home img").first().getAttribute("src");
    const manufacturing = await page.locator("#capabilities img").evaluateAll((images) => images.map((image) => image.getAttribute("src")));
    expect(hero).toBeTruthy();
    expect(manufacturing).toHaveLength(2);
    expect(manufacturing).not.toContain(hero);
    expect(new Set(manufacturing).size).toBe(2);
  });

  test("homepage image semantics are unique and desktop inquiry widget is absent", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const imageSources = await page.locator("main img").evaluateAll((images) => images.map((image) => (image as HTMLImageElement).currentSrc || image.getAttribute("src")).filter(Boolean));
    expect(new Set(imageSources).size).toBe(imageSources.length);
    await expect(page.locator(".kh-solution-visual--cupstock")).toHaveCount(1);
    await expect(page.locator(".kh-solution-visual--corrugated")).toHaveCount(1);
    await expect(page.locator(".kh-solution-visual--inserts")).toHaveCount(1);
    await expect(page.locator("text=CONTACT US")).toHaveCount(0);
    await expect(page.locator(".kh-packaging-diagram")).toHaveCount(1);
    await expect(page.locator("html")).toHaveCSS("scroll-padding-top", "96px");
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 640, height: 960 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    test(`homepage has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    });
  }

  test("640-959 solutions grid has no empty final half-column", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 1024 });
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    for (const width of [640, 768, 959]) {
      await page.setViewportSize({ width, height: 1024 });
      const cards = page.locator("#solutions .kh-solution-card");
      await expect(cards).toHaveCount(4);
      const boxes = await cards.evaluateAll((items) => items.map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, width: rect.width, top: rect.top };
      }));
      expect(boxes[0].width).toBeGreaterThan(width * 0.85);
      expect(boxes[1].top).toBeCloseTo(boxes[2].top, 0);
      expect(boxes[3].width).toBeGreaterThan(width * 0.85);
      expect(boxes[3].left).toBeCloseTo(boxes[0].left, 0);
    }
  });

  test("responsive navigation and hero media remain visible", async ({ page }) => {
    for (const width of [768, 1024]) {
      await page.setViewportSize({ width, height: width === 768 ? 1024 : 768 });
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.locator(".kh-desktop-nav")).toBeHidden();
      await expectActuallyVisible(page.locator("details.kh-compact-nav > summary"));
      await expectActuallyVisible(page.locator("#home .kh-hero__visual"));
      await expect(page.locator(".mobile-sticky-action-bar")).toHaveCSS("display", "none");
    }
  });

  test("mobile inquiry bar follows the visibility contract", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en", { waitUntil: "networkidle" });
    const bar = page.locator(".mobile-sticky-action-bar");
    await expect(bar).toHaveAttribute("data-visible", "false");

    await page.locator("#product-window").scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("data-visible", "true");
    await expectActuallyVisible(bar);

    await page.locator("#inquiry").scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("data-visible", "false");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("data-visible", "false");

    await page.goto("/en/contact", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(bar).toHaveAttribute("data-visible", "false");
  });
});
