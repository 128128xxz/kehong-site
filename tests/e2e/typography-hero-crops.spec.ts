import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const outDir = "test-results/shots-typography-refinement/hero-crops";
mkdirSync(outDir, { recursive: true });

const targets = [
  { locale: "en", pagePath: "/", name: "home-en-hero", width: 1440, height: 900 },
  { locale: "zh", pagePath: "/", name: "home-zh-hero", width: 1440, height: 900 },
  { locale: "th", pagePath: "/", name: "home-th-hero", width: 1440, height: 900 },
  { locale: "vi", pagePath: "/", name: "home-vi-hero", width: 1440, height: 900 },
  { locale: "en", pagePath: "/about", name: "about-en-hero", width: 1440, height: 900 },
  { locale: "zh", pagePath: "/about", name: "about-zh-hero", width: 1440, height: 900 },
] as const;

test("hero font crops", async ({ page }) => {
  for (const t of targets) {
    await page.setViewportSize({ width: t.width, height: t.height });
    await page.goto(`/${t.locale}${t.pagePath}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    // 截取页面顶部 520px 高度的 hero 区域
    await page.screenshot({ path: `${outDir}/${t.name}.png`, clip: { x: 0, y: 0, width: t.width, height: 520 } });
  }
});
