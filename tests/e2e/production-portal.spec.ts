import { test, expect } from "@playwright/test";

test.describe("homepage manufacturing website", () => {
  test("shows a cinematic hero and the full section stack", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".kh-home-hero")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paper materials & semi-finished components" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Finished packaging" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Submit a brief/i }).first()).toBeVisible();
    await expect(page.locator(".production-portal")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Choose a product system/i })).toBeVisible();
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
    await expect(page.getByTestId("home-latest-insights")).toBeVisible();
    await expect(page.locator('[data-testid="homepage-product-entry"]')).toHaveCount(6);
    await expect(page.locator('[data-testid="home-buyer-support"]')).toHaveCount(0);
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

  test("homepage metrics use locale-correct values, units and labels", async ({ page }) => {
    for (const [locale, values, labels, unit] of [
      ["en", ["20+", "8,000+", "OEM / ODM", "MOQ"], ["Years in paper converting", "Production floor area", "Custom development", "Flexible order quantities"], "m²"],
      ["zh", ["20+", "8,000+", "OEM / ODM", "MOQ"], ["纸品加工经验", "生产场地", "定制开发", "灵活起订"], "㎡"],
    ] as const) {
      await page.goto(`/${locale}`);
      const stats = page.locator(".kh-hero-stat");
      await expect(stats).toHaveCount(4);
      for (let index = 0; index < values.length; index += 1) {
        await expect(stats.nth(index).locator(".kh-hero-stat-value")).toHaveAttribute("aria-label", index === 1 ? `${values[index]} ${unit}` : values[index]);
        await expect(stats.nth(index).locator(".kh-hero-stat-label")).toHaveText(labels[index]);
      }
      await expect(page.locator(".kh-home-hero")).toContainText("8,000+");
      if (locale === "en") await expect(page.locator(".kh-home-hero")).not.toContainText("㎡");
      await expect(page.locator(".kh-hero-stat-value").nth(1)).toContainText(unit);
      const nowrap = await stats.locator(".kh-hero-stat-value").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).whiteSpace === "nowrap"));
      expect(nowrap).toBe(true);
    }
  });

  test("homepage metrics reveal and count up once without layout shift", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const stats = page.locator(".kh-hero-stat");
    await expect(stats.first()).toHaveClass(/kh-metric-motion-in/, { timeout: 3000 });
    await expect(stats.nth(0).locator(".kh-hero-stat-value")).toHaveText("20+");
    await expect(stats.nth(1).locator(".kh-hero-stat-value")).toContainText("8,000+");
    const before = await stats.evaluateAll((nodes) => nodes.map((node) => ({ top: (node as HTMLElement).offsetTop, height: node.getBoundingClientRect().height })));
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    const after = await stats.evaluateAll((nodes) => nodes.map((node) => ({ top: (node as HTMLElement).offsetTop, height: node.getBoundingClientRect().height })));
    expect(after).toEqual(before);
    await expect(stats.nth(0).locator(".kh-hero-stat-value")).toHaveText("20+");
    await expect(stats.nth(1).locator(".kh-hero-stat-value")).toContainText("8,000+");
  });

  test("homepage metrics honor reduced motion and remain final immediately", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/zh");
    const stats = page.locator(".kh-hero-stat");
    await expect(stats.nth(0).locator(".kh-hero-stat-value")).toHaveText("20+");
    await expect(stats.nth(1).locator(".kh-hero-stat-value")).toContainText("8,000+");
    const styles = await stats.evaluateAll((nodes) => nodes.map((node) => {
      const value = node.querySelector(".kh-hero-stat-value")!;
      return { transition: getComputedStyle(node).transitionDuration, transform: getComputedStyle(node).transform, valueTransition: getComputedStyle(value).transitionDuration };
    }));
    expect(styles.every((style) => parseFloat(style.transition) <= 0.01 && parseFloat(style.valueTransition) <= 0.01 && style.transform === "none")).toBe(true);
  });

  test("homepage metric grid stays aligned at desktop widths and fits mobile", async ({ page }) => {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 1440, height: 1000 }, { width: 1850, height: 1000 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/en");
      const stats = page.locator(".kh-hero-stat");
      const boxes = await stats.evaluateAll((nodes) => nodes.map((node) => {
        const value = node.querySelector(".kh-hero-stat-value")!.getBoundingClientRect();
        const label = node.querySelector(".kh-hero-stat-label")!.getBoundingClientRect();
        return { valueBottom: value.bottom, labelTop: label.top };
      }));
      expect(Math.max(...boxes.map((item) => item.valueBottom)) - Math.min(...boxes.map((item) => item.valueBottom))).toBeLessThanOrEqual(1);
      expect(Math.max(...boxes.map((item) => item.labelTop)) - Math.min(...boxes.map((item) => item.labelTop))).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await expect(page.locator(".kh-hero-stat")).toHaveCount(4);
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
    await expect(ctas).toHaveCount(2);
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
