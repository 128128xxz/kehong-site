import { expect, test } from "@playwright/test";

const locales = ["en", "zh", "id", "vi", "th", "ms"] as const;

test.describe("Stage 2 homepage positioning and B2B navigation", () => {
  test("active locale homepages expose localized positioning and valid language metadata", async ({ page }) => {
    for (const locale of locales) {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).not.toContainText("231 个产品");
      await expect(page.locator('a[href="#"]')).toHaveCount(0);
    }
  });

  test("desktop navigation uses the procurement hierarchy and keeps 3D under resources", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "Applications", exact: true })).toHaveAttribute("href", "/en/solutions");
    await expect(page.getByRole("link", { name: "Factory & Quality", exact: true })).toHaveAttribute("href", "/en/factory");
    await expect(page.getByRole("link", { name: "About Kehong", exact: true })).toHaveAttribute("href", "/en/custom-paper-products");
    await expect(page.getByTestId("header-model-preview-link")).toHaveCount(0);
    const resources = page.getByRole("button", { name: "Resources", exact: true });
    await resources.hover();
    const panel = page.getByTestId("header-resources-menu");
    await expect(panel).toBeVisible();
    await expect(panel.locator('a[href="/en/model-preview"]')).toHaveCount(1);
    await expect(panel.getByText("Tools", { exact: true })).toBeVisible();
  });

  test("mobile navigation keeps touch targets and exposes the same resource routes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/zh", { waitUntil: "networkidle" });
    await page.locator('button[aria-controls="kh-mobile-menu"]').click();
    const drawer = page.locator("#kh-mobile-menu");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "应用场景", exact: true })).toHaveAttribute("href", "/zh/solutions");
    await expect(drawer.getByRole("link", { name: "工厂与质量", exact: true })).toHaveAttribute("href", "/zh/factory");
    await expect(drawer.getByTestId("mobile-model-preview-link")).toHaveCount(0);
    await drawer.locator(".kh-mobile-resource-directory > summary").click();
    await expect(drawer.getByRole("link", { name: "3D结构展厅", exact: true })).toHaveAttribute("href", "/zh/model-preview");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("products and quote routes remain distinct B2B entry points", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByTestId("homepage-product-systems")).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a Quote", exact: true }).first()).toHaveAttribute("href", "/en/contact");
    await expect(page.getByRole("link", { name: "Explore Products", exact: true })).toHaveAttribute("href", /\/en\/products(?:#|$)/);
    await page.getByRole("link", { name: "Request a Quote", exact: true }).first().click();
    await expect(page).toHaveURL(/\/en\/contact$/);
  });
});
