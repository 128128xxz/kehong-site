import { test, expect } from "@playwright/test";

test.describe("homepage manufacturing website", () => {
  test("shows a cinematic hero and the full section stack", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".kh-home-hero")).toBeVisible();
    await expect(page.getByRole("link", { name: "Paper materials & semi-finished components" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Finished packaging" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Request a quote/i }).first()).toBeVisible();
    await expect(page.locator(".production-portal")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Choose paper materials or finished packaging/i })).toBeVisible();
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
    await expect(page.locator("main > section")).toHaveCount(7);
  });

  test("homepage metrics keep a shared value baseline and label start", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const stats = page.locator(".kh-hero-stat");
    await expect(stats).toHaveCount(4);
    const boxes = await stats.locator(".kh-hero-stat-value").evaluateAll((values) => values.map((value) => {
      const valueBox = value.getBoundingClientRect();
      const labelBox = value.parentElement?.querySelector("span.kh-mono")?.getBoundingClientRect();
      return { valueBottom: valueBox.bottom, labelTop: labelBox?.top, whiteSpace: getComputedStyle(value).whiteSpace };
    }));
    expect(Math.max(...boxes.map((item) => item.valueBottom)) - Math.min(...boxes.map((item) => item.valueBottom))).toBeLessThanOrEqual(1);
    expect(Math.max(...boxes.map((item) => item.labelTop ?? 0)) - Math.min(...boxes.map((item) => item.labelTop ?? 0))).toBeLessThanOrEqual(1);
    expect(boxes.every((item) => item.whiteSpace === "nowrap")).toBe(true);
  });

  test("homepage process tabs change the matching fixed media panel", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const section = page.getByTestId("home-process");
    const tabs = section.getByRole("tab");
    const panel = section.getByRole("tabpanel");
    await expect(tabs).toHaveCount(4);
    await tabs.nth(1).hover();
    await expect(panel).toHaveAttribute("data-active-step", "paper-board-converting");
    await tabs.nth(2).focus();
    await expect(panel).toHaveAttribute("data-active-step", "printing-finishing");
    await tabs.nth(3).click();
    await expect(panel).toHaveAttribute("data-active-step", "forming-packing");
    await tabs.nth(3).press("ArrowUp");
    await expect(panel).toHaveAttribute("data-active-step", "printing-finishing");
    await expect(section.getByTestId("process-caption")).toContainText("Colour and material swatches");
  });

  test("homepage process remains tappable without a media layout shift on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const section = page.getByTestId("home-process");
    const panel = section.getByRole("tabpanel");
    const before = await panel.boundingBox();
    await section.getByRole("tab").nth(1).click();
    await expect(panel).toHaveAttribute("data-active-step", "paper-board-converting");
    const after = await panel.boundingBox();
    expect(after?.height).toBe(before?.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
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
    const card = page.locator('a[href*="group=paper-cup-fan-paper-cup-fan"]:visible').first();
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
