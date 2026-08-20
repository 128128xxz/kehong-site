import { test, expect } from "@playwright/test";

const viewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1440, height: 1000 },
];

test.describe("English hero static title and UI material preview", () => {
  test("keeps one semantic H1 with the clear two-line buyer-facing title", async ({ page }) => {
    await page.goto("/en?uiMaterial=glass-b");
    const heading = page.locator("h1");
    await expect(heading).toHaveCount(1);
    await expect(heading).toContainText("Specialty Paper and Corrugated Board for Custom Packaging");
    await expect(page.locator(".hero-liquid-title")).toHaveCount(0);
    await expect(page.locator(".kh-hero-static-accent")).toHaveCount(0);
  });

  test("keeps the title static and the Chinese homepage free of the English accent", async ({ page }) => {
    await page.goto("/en?heroMotion=glass-b");
    await expect(page.locator("h1")).toContainText("Specialty Paper and Corrugated Board");
    await expect(page.locator("h1")).not.toHaveAttribute("data-motion-state", /.+/);
    await page.goto("/zh?uiMaterial=glass-b");
    await expect(page.locator(".kh-home-hero h1")).toContainText("面向定制包装的特种纸材与瓦楞纸板");
  });

  test("keeps the static title readable with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.goto("/en?uiMaterial=glass-b");
    await expect(page.locator("h1")).toContainText("Specialty Paper and Corrugated Board for Custom Packaging");
    await context.close();
  });

  for (const viewport of viewports) {
    test(`fits ${viewport.width}x${viewport.height} without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en?uiMaterial=glass-b");
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        headingRight: document.querySelector("h1")!.getBoundingClientRect().right,
      }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
      expect(metrics.headingRight).toBeLessThanOrEqual(metrics.clientWidth + 1);
    });
  }

  test("uses a single local DOM title and no animation renderer", async ({ page }) => {
    await page.goto("/en?uiMaterial=glass-b");
    const audit = await page.evaluate(() => ({
      heroTitleSvg: document.querySelectorAll("h1 svg").length,
      heroTitleCanvas: document.querySelectorAll("h1 canvas").length,
      heroTitleWebgl: [...document.scripts].some((script) => /three|webgl/i.test(script.src || script.textContent || "")),
    }));
    expect(audit.heroTitleSvg).toBe(0);
    expect(audit.heroTitleCanvas).toBe(0);
    expect(audit.heroTitleWebgl).toBe(false);
  });

  test("preserves Hero CTAs and applies the local UI material query only", async ({ page }) => {
    await page.goto("/en?uiMaterial=glass-a");
    await expect(page.locator("html")).toHaveAttribute("data-ui-material", "glass-a");
    await expect(page.locator(".kh-home-hero .kh-actions a").first()).toBeVisible();
    await expect(page.locator(".kh-home-hero .kh-actions a").first()).toHaveAttribute("href", /\/en\/products/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).not.toContain("uiMaterial");
  });
});
