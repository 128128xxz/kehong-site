import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const outDir = "test-results/shots-typography-refinement/hero-crops";
mkdirSync(outDir, { recursive: true });

const targets = [
  { locale: "en", pagePath: "/", name: "home-en-mobile-hero", width: 390, height: 844 },
  { locale: "zh", pagePath: "/", name: "home-zh-mobile-hero", width: 390, height: 844 },
  { locale: "th", pagePath: "/", name: "home-th-mobile-hero", width: 390, height: 844 },
  { locale: "vi", pagePath: "/", name: "home-vi-mobile-hero", width: 390, height: 844 },
] as const;

test("mobile hero crops", async ({ page }) => {
  for (const t of targets) {
    await page.setViewportSize({ width: t.width, height: t.height });
    await page.goto(`/${t.locale}${t.pagePath}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/${t.name}.png`, clip: { x: 0, y: 0, width: t.width, height: 560 } });
  }
});
