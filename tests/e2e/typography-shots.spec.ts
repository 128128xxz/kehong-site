import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";

const outDir = "test-results/shots-typography-refinement";
mkdirSync(outDir, { recursive: true });

test("typography refinement screenshots (~12)", async ({ page }) => {
  const targets = [
    { locale: "en", pagePath: "/", name: "home-en-desktop", width: 1440, height: 900 },
    { locale: "zh", pagePath: "/", name: "home-zh-desktop", width: 1440, height: 900 },
    { locale: "en", pagePath: "/", name: "home-en-mobile", width: 390, height: 844 },
    { locale: "zh", pagePath: "/", name: "home-zh-mobile", width: 390, height: 844 },
    { locale: "en", pagePath: "/about", name: "about-en-desktop", width: 1440, height: 900 },
    { locale: "zh", pagePath: "/about", name: "about-zh-desktop", width: 1440, height: 900 },
    { locale: "en", pagePath: "/factory", name: "factory-en-desktop", width: 1440, height: 900 },
    { locale: "zh", pagePath: "/factory", name: "factory-zh-desktop", width: 1440, height: 900 },
    { locale: "en", pagePath: "/capabilities", name: "capabilities-en-desktop", width: 1440, height: 900 },
    { locale: "zh", pagePath: "/capabilities", name: "capabilities-zh-desktop", width: 1440, height: 900 },
    { locale: "en", pagePath: "/resources", name: "resources-en-desktop", width: 1440, height: 900 },
    { locale: "zh", pagePath: "/resources", name: "resources-zh-desktop", width: 1440, height: 900 },
  ] as const;
  for (const t of targets) {
    await page.setViewportSize({ width: t.width, height: t.height });
    await page.goto(`/${t.locale}${t.pagePath}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/${t.name}.png`, fullPage: true });
  }
});

test("no font 404 / broken webfont requests", async ({ page }) => {
  const broken: string[] = [];
  page.on("response", (resp) => {
    if (resp.status() >= 400 && /\.(woff2?|ttf|otf)/i.test(resp.url())) {
      broken.push(`${resp.status()} ${resp.url()}`);
    }
  });
  for (const locale of ["en", "zh", "th", "vi"] as const) {
    await page.goto(`/${locale}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
  }
  expect(broken, `font 404s:\n${broken.join("\n")}`).toEqual([]);
});
