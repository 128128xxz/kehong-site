import { test, expect } from "@playwright/test";

test.describe("homepage manufacturing website", () => {
  test("shows a cinematic hero and the full section stack", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".kh-home-hero")).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse materials/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse packaging/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Request a quote/i }).first()).toBeVisible();
    await expect(page.locator(".production-portal")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Source materials and finished packaging/i })).toBeVisible();
    await expect(page.locator(".kh-section-forest")).toBeVisible();
    await expect(page.locator(".kh-spec-panel")).toBeVisible();
  });

  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    test(`is readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en");
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    });
  }

  test("keeps localized homepage copy", async ({ page }) => {
    await page.goto("/zh");
    await expect(page.locator("h1")).toContainText("纸材");
    await expect(page.getByRole("link", { name: "提交询盘" }).first()).toBeVisible();
  });

  test("homepage keeps a compact procurement-focused section stack", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main > section")).toHaveCount(6);
  });

  test("cinema header starts transparent and turns solid after the hero", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header.kh-header");
    await expect(header).toHaveAttribute("data-variant", "cinema");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).toHaveAttribute("data-scrolled", "false");
  });

  test("hero CTAs stay fully above the fold at 1366x768", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/en");
    const ctas = page.locator(".kh-home-hero .kh-actions a");
    await expect(ctas).toHaveCount(3);
    for (const cta of await ctas.all()) {
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(768);
    }
  });

  test("reduced motion disables product card transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await expect(page.locator("h1")).toBeVisible();
    const card = page.locator('a[href*="productType=paper-cup-fan"]').first();
    await expect(card).toBeVisible();
    const transitionDuration = await card.evaluate((element) => getComputedStyle(element).transitionDuration);
    for (const duration of transitionDuration.split(",")) {
      expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
    }
  });

  test("mobile menu opens with focus inside and Escape returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const toggle = page.locator('button[aria-controls="kh-mobile-menu"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    const panel = page.locator("#kh-mobile-menu");
    await expect(panel).toBeVisible();
    await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest("#kh-mobile-menu")))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });

  test("keyboard focus on the first link shows a visible outline", async ({ page }) => {
    await page.goto("/en");
    let linkFocused = false;
    for (let index = 0; index < 5 && !linkFocused; index += 1) {
      await page.keyboard.press("Tab");
      linkFocused = await page.evaluate(() => document.activeElement?.tagName === "A");
    }
    expect(linkFocused).toBe(true);
    const outlineWidth = await page.evaluate(() => parseFloat(getComputedStyle(document.activeElement as Element).outlineWidth));
    expect(outlineWidth).toBeGreaterThan(0);
  });
});
