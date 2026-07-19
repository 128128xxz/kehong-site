import { expect, test } from "@playwright/test";

const bannedHomeCopy = [
  "Interaction Study",
  "Interaction Direction",
  "Version A",
  "Version B",
  "A clearer way into the paper system",
  "Route clarity",
  "Progressive detail",
  "Quiet motion",
  "Buyer-ready",
  "Selected Destination",
];

test.describe("Version C production portal", () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })));
    });
    await expect.poll(() => errors).toEqual([]);
  });

  test("has one gateway, no lab content and seven SSR route links", async ({ page }) => {
    await expect(page.locator(".production-portal")).toHaveCount(1);
    await expect(page.locator(".production-portal__route")).toHaveCount(7);
    await expect(page.locator("footer")).toHaveCount(0);
    const body = await page.locator("body").innerText();
    for (const phrase of bannedHomeCopy) expect(body).not.toContain(phrase);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator('a[href="/en/products?system=materials"]').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('a[href="/en/products?system=packaging"]').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('a[href="/en/solutions"]').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('a[href="/en/factory"]').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('a[href="/en/model-preview"]').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('a[href="/en/procurement"]').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('a[href="/en/contact"]').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('.production-portal__routes a[href="/en/solutions"]')).toBeVisible();
  });

  test("desktop preview follows hover, focus and arrow navigation without auto navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const stage = page.locator('[data-testid="production-portal-stage"]');
    await expect(stage).toContainText("Paper materials");
    const factory = page.locator('[data-route-id="factory"]').first();
    await factory.hover();
    await expect(stage).toContainText("Production you can verify");
    await expect(page).toHaveURL(/\/en$/);
    await factory.focus();
    await expect(stage).toContainText("Production you can verify");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[data-route-id="studio"]').first()).toBeFocused();
    await expect(stage).toContainText("Review the structure before production");
  });

  test("click navigates to a real page and browser back restores the selected preview", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('[data-route-id="factory"]').first().click();
    await expect(page).toHaveURL(/\/en\/factory$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('[data-route-id="factory"]').first()).toHaveClass(/is-selected/);
    await expect(page.locator('[data-testid="production-portal-stage"]')).toContainText("Production you can verify");
  });

  test("mobile keeps the portal to one viewport and opens an accessible full-screen panel", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".production-portal__route-panel")).toBeHidden();
    await expect(page.locator(".production-portal__proofs")).toBeHidden();
    await expect(page.locator(".production-portal__mobile-actions")).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow-x", "clip");
    const trigger = page.getByRole("button", { name: "Explore Kehong" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Explore Kehong" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.width).toBe(390);
    expect(box?.height).toBe(844);
    await expect(dialog.locator(".production-portal__dialog-routes a")).toHaveCount(7);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("reduced motion uses direct state changes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator(".production-portal")).toHaveAttribute("data-reduced-motion", "true");
    await page.locator('[data-route-id="packaging"]').first().focus();
    await expect(page.locator('[data-testid="production-portal-stage"]')).toContainText("Finished packaging");
  });

  test("route links remain usable with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en");
    await page.locator('.production-portal__routes a[href="/en/products?system=materials"]').click();
    await expect(page).toHaveURL(/\/en\/products\?system=materials$/);
    await context.close();
  });
});
