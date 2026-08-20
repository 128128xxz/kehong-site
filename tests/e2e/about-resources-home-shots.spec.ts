import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";

const outDir = "test-results/shots-about-resources-home";
mkdirSync(outDir, { recursive: true });

const locales = ["en", "zh", "id", "vi", "th", "ms"] as const;
const pages = ["/", "/about", "/resources"] as const;

test.describe("Image 404 + screenshots", () => {
  test("no image 404 on the three pages", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (resp) => {
      const url = resp.url();
      if (resp.status() >= 400 && /\.(png|jpe?g|webp|svg|avif|gif)/i.test(url)) {
        failed.push(`${resp.status()} ${url}`);
      }
    });
    for (const locale of locales) {
      for (const p of pages) {
        await page.goto(`/${locale}${p}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(400);
      }
    }
    expect(failed, `image 404s:\n${failed.join("\n")}`).toEqual([]);
  });

  test("capture 12 screenshots", async ({ page }) => {
    const targets = [
      { locale: "en", pagePath: "/", name: "home-en-desktop", width: 1440, height: 900, mobile: false },
      { locale: "en", pagePath: "/", name: "home-en-mobile", width: 390, height: 844, mobile: true },
      { locale: "zh", pagePath: "/", name: "home-zh-desktop", width: 1440, height: 900, mobile: false },
      { locale: "zh", pagePath: "/", name: "home-zh-mobile", width: 390, height: 844, mobile: true },
      { locale: "en", pagePath: "/about", name: "about-en-desktop", width: 1440, height: 900, mobile: false },
      { locale: "en", pagePath: "/about", name: "about-en-mobile", width: 390, height: 844, mobile: true },
      { locale: "zh", pagePath: "/about", name: "about-zh-desktop", width: 1440, height: 900, mobile: false },
      { locale: "zh", pagePath: "/about", name: "about-zh-mobile", width: 390, height: 844, mobile: true },
      { locale: "en", pagePath: "/resources", name: "resources-en-desktop", width: 1440, height: 900, mobile: false },
      { locale: "en", pagePath: "/resources", name: "resources-en-mobile", width: 390, height: 844, mobile: true },
      { locale: "zh", pagePath: "/resources", name: "resources-zh-desktop", width: 1440, height: 900, mobile: false },
      { locale: "zh", pagePath: "/resources", name: "resources-zh-mobile", width: 390, height: 844, mobile: true },
    ] as const;
    for (const t of targets) {
      await page.setViewportSize({ width: t.width, height: t.height });
      await page.goto(`/${t.locale}${t.pagePath}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${outDir}/${t.name}.png`, fullPage: true });
    }
  });
});
