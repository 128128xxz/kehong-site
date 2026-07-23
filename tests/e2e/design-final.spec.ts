import { expect, test } from "@playwright/test";

const viewports = [
  { width: 390, height: 844 },
  { width: 640, height: 960 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

test.describe("Version C production portal contract", () => {
  test("homepage is a single route-led gateway with seven SSR destinations", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    await expect(page.locator(".production-portal")).toHaveCount(1);
    await expect(page.locator("main > section").first()).toBeVisible();
    await expect(page.locator(".production-portal__routes > a")).toHaveCount(7);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.locator("main form")).toHaveCount(0);
    await expect(page.locator(".production-portal")).not.toContainText("Version A");
    await expect(page.locator(".production-portal")).not.toContainText("Version B");
    await expect(page.locator(".production-portal")).not.toContainText("Interaction Study");
    await expect(page.locator(".production-portal")).not.toContainText("0 products");
    await expect(page.locator(".production-portal__bottom-rail")).toContainText("Foshan");
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
      "/en/solutions",
      "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan",
    ]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).not.toContain('href="http://127.0.0.1');
      expect(html).not.toContain('content="http://127.0.0.1');
      expect(html).toContain("https://www.kehong.tech");
      expect((html.match(/rel="canonical"/g) ?? []).length).toBe(1);
    }
  });

  test("homepage has distinct route visuals and no desktop fixed inquiry widget", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="production-portal-stage"]')).toBeVisible();
    await expect(page.locator('[data-route-id="materials"]').first()).toHaveClass(/is-selected/);
    await expect(page.locator(".mobile-sticky-action-bar")).toHaveCount(0);
    await expect(page.locator(".production-portal__route-panel")).toBeVisible();
    await expect(page.locator(".production-portal__bottom-rail")).toBeVisible();

    const factory = page.locator('.production-portal__routes [data-route-id="factory"]');
    await factory.hover();
    await expect(page.locator('[data-testid="production-portal-stage"]')).toContainText("Production you can verify");
    await page.locator('.production-portal__routes [data-route-id="materials"]').hover();
    await expect(page.locator('[data-testid="production-portal-stage"]')).toContainText("Paper materials");
  });

  for (const viewport of viewports) {
    test(`homepage has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    });
  }

  test("tablet and mobile use the full-screen route panel instead of a long homepage", async ({ page }) => {
    for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.locator(".production-portal__route-panel")).toBeHidden();
      await expect(page.locator(".production-portal__mobile-actions")).toBeVisible();
      await expect(page.locator(".production-portal__explore-button")).toBeVisible();
      await expect(page.locator(".production-portal__quote-button")).toHaveAttribute("href", "/en/contact");
      await expect(page.locator(".production-portal__dialog")).toBeHidden();
      await page.getByRole("button", { name: "Explore Kehong" }).click();
      const dialog = page.getByRole("dialog", { name: "Explore Kehong" });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator(".production-portal__dialog-routes a")).toHaveCount(7);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });

  test("homepage preserves real route destinations and keeps 3D lazy", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const links = await page.locator(".production-portal__routes > a").evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
    expect(links).toEqual([
      "/en/products?system=materials",
      "/en/products?system=packaging",
      "/en/solutions",
      "/en/factory",
      "/en/model-preview",
      "/en/procurement",
      "/en/contact",
    ]);
    await expect(page.locator(".production-portal canvas")).toHaveCount(0);
    await expect(page.locator(".production-portal .interactive-portal__canvas")).toHaveCount(0);
  });
});
