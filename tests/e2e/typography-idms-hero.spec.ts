import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const outDir = "test-results/shots-typography-refinement/hero-crops";
mkdirSync(outDir, { recursive: true });

const targets = [
  { locale: "id", pagePath: "/", name: "home-id-hero", width: 1440, height: 900 },
  { locale: "ms", pagePath: "/", name: "home-ms-hero", width: 1440, height: 900 },
] as const;

test("id ms hero crops", async ({ page }) => {
  for (const t of targets) {
    await page.setViewportSize({ width: t.width, height: t.height });
    await page.goto(`/${t.locale}${t.pagePath}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/${t.name}.png`, clip: { x: 0, y: 0, width: t.width, height: 500 } });
  }
});
