import { expect, test } from "@playwright/test";

test.describe("interactive portal lab", () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/en/lab/interactive-portal", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })));
    });
    await expect(page.locator("h1")).toContainText("clearer way");
    await expect(page.locator('[data-testid="dynamic-visual-stage"]')).toBeVisible();
    await expect.poll(() => errors).toEqual([]);
  });

  test("desktop supports selection, focus preview, version switch and real destination", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const factoryRoute = page.locator('[data-route-id="factory"]');
    await factoryRoute.focus();
    await expect(page.locator('[data-testid="dynamic-visual-stage"]')).toContainText("Factory capability");
    await factoryRoute.click();
    await expect(page.locator('[data-route-id="factory"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/portal=factory/);
    await page.getByRole("button", { name: "B / editorial" }).click();
    await expect(page.locator(".interactive-portal")).toHaveClass(/interactive-portal--b/);
    await page.getByTestId("real-route-link").click();
    await expect(page).toHaveURL(/\/en\/factory$/);
  });

  test("browser back restores the previous route state", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.locator('[data-route-id="studio"]').click();
    await expect(page).toHaveURL(/portal=studio/);
    await page.locator('[data-route-id="quote"]').click();
    await expect(page).toHaveURL(/portal=quote/);
    await page.goBack();
    await expect(page).toHaveURL(/portal=studio/);
    await expect(page.locator('[data-route-id="studio"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("mobile uses a semantic full-screen dialog panel", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".interactive-portal__routes")).toBeHidden();
    const trigger = page.getByRole("button", { name: /Open route panel/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Mobile route panel" });
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    const viewport = await page.evaluate(() => ({ width: Math.min(document.documentElement.clientWidth, document.body.getBoundingClientRect().width), height: window.innerHeight }));
    expect(dialogBox?.width).toBe(viewport.width);
    expect(dialogBox?.height).toBe(viewport.height);
    await expect(dialog.getByRole("button", { name: /3D Studio/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("reduced motion keeps the route stage readable without animated displacement", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator(".interactive-portal")).toHaveAttribute("data-reduced-motion", "true");
    const stage = page.locator('[data-testid="dynamic-visual-stage"]');
    await page.locator('[data-route-id="packaging"]').focus();
    await expect(stage).toContainText("Finished packaging");
    const box = await stage.boundingBox();
    expect(box?.width).toBeGreaterThan(250);
    expect(box?.height).toBeGreaterThan(300);
  });
});
