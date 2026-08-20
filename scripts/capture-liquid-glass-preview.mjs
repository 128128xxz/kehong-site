import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3434";
const root = path.resolve("reports/liquid-glass-ui-preview");
const screenshotRoot = path.join(root, "screenshots");
const videoRoot = path.join(root, "videos");
const materials = ["current", "glass-a", "glass-b"];
const viewports = [
  { name: "desktop-1440x1000", width: 1440, height: 1000 },
  { name: "desktop-1920x1080", width: 1920, height: 1080 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-430x932", width: 430, height: 932 },
];
const routes = [
  { id: "home", path: "" },
  { id: "products", path: "/products" },
  { id: "capabilities", path: "/capabilities" },
  { id: "resources", path: "/resources" },
  { id: "contact", path: "/contact" },
  { id: "final-inquiry", path: "/contact?intent=quote" },
  { id: "factory", path: "/factory" },
  { id: "model-preview", path: "/model-preview" },
];

const waitForHeroMetrics = async (page) => {
  await page.waitForFunction(() => {
    const values = [...document.querySelectorAll(".kh-home-hero .kh-hero-stat-number")].map((node) => node.textContent ?? "");
    if (!values.length) return true;
    const normalized = values.map((value) => value.replace(/,/g, ""));
    return normalized.some((value) => value.includes("20")) && normalized.some((value) => value.includes("8000"));
  }, { timeout: 5000 }).catch(() => {});
};

await mkdir(screenshotRoot, { recursive: true });
await mkdir(videoRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const screenshots = [];
const failures = [];

for (const material of materials) {
  for (const locale of ["en", "zh"]) {
    for (const route of routes) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
        const page = await context.newPage();
        const file = `${material}-${locale}-${route.id}-${viewport.name}.jpg`;
        try {
          const queryJoiner = route.path.includes("?") ? "&" : "?";
          const response = await page.goto(`${baseURL}/${locale}${route.path}${queryJoiner}uiMaterial=${material}`, { waitUntil: "domcontentloaded", timeout: 30000 });
          await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
          await waitForHeroMetrics(page);
          await page.screenshot({ path: path.join(screenshotRoot, file), type: "jpeg", quality: 78 });
          screenshots.push({ file: `screenshots/${file}`, material, locale, route: route.id, viewport: viewport.name, status: response?.status() ?? null });
        } catch (error) {
          failures.push({ material, locale, route: route.id, viewport: viewport.name, error: String(error) });
        } finally {
          await context.close();
        }
      }
    }
  }
}

// Dedicated menu/drawer/footer states make the interaction affordances auditable.
for (const material of materials) {
  for (const locale of ["en", "zh"]) {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const desktopPage = await desktop.newPage();
    try {
      await desktopPage.goto(`${baseURL}/${locale}?uiMaterial=${material}`, { waitUntil: "networkidle", timeout: 30000 });
      await waitForHeroMetrics(desktopPage);
      await desktopPage.getByRole("button", { name: locale === "zh" ? "产品" : "Products" }).click();
      const file = `${material}-${locale}-mega-menu-desktop-1440x1000.jpg`;
      await desktopPage.screenshot({ path: path.join(screenshotRoot, file), type: "jpeg", quality: 82 });
      screenshots.push({ file: `screenshots/${file}`, material, locale, route: "mega-menu", viewport: "desktop-1440x1000", status: 200 });
      await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const footerFile = `${material}-${locale}-footer-desktop-1440x1000.jpg`;
      await desktopPage.screenshot({ path: path.join(screenshotRoot, footerFile), type: "jpeg", quality: 82 });
      screenshots.push({ file: `screenshots/${footerFile}`, material, locale, route: "footer", viewport: "desktop-1440x1000", status: 200 });
    } catch (error) {
      failures.push({ material, locale, route: "mega-menu/footer", viewport: "desktop-1440x1000", error: String(error) });
    } finally {
      await desktop.close();
    }

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobile.newPage();
    try {
      await mobilePage.goto(`${baseURL}/${locale}?uiMaterial=${material}`, { waitUntil: "networkidle", timeout: 30000 });
      await waitForHeroMetrics(mobilePage);
      await mobilePage.getByRole("button", { name: locale === "zh" ? "打开导航菜单" : "Open navigation menu" }).click();
      const file = `${material}-${locale}-mobile-drawer-390x844.jpg`;
      await mobilePage.screenshot({ path: path.join(screenshotRoot, file), type: "jpeg", quality: 82 });
      screenshots.push({ file: `screenshots/${file}`, material, locale, route: "mobile-drawer", viewport: "mobile-390x844", status: 200 });
    } catch (error) {
      failures.push({ material, locale, route: "mobile-drawer", viewport: "mobile-390x844", error: String(error) });
    } finally {
      await mobile.close();
    }
  }
}

const videoRuns = [
  { id: "header-scroll-en-glass-a", material: "glass-a", locale: "en", viewport: { width: 1440, height: 1000 }, run: async (page) => { await page.goto(`${baseURL}/en?uiMaterial=glass-a`); await page.mouse.wheel(0, 700); await page.mouse.wheel(0, -700); } },
  { id: "products-popover-en-glass-a", material: "glass-a", locale: "en", viewport: { width: 1440, height: 1000 }, run: async (page) => { await page.goto(`${baseURL}/en?uiMaterial=glass-a`); await page.getByRole("button", { name: "Products" }).click(); await page.keyboard.press("Escape"); } },
  { id: "mobile-drawer-zh-glass-b", material: "glass-b", locale: "zh", viewport: { width: 390, height: 844 }, run: async (page) => { await page.goto(`${baseURL}/zh?uiMaterial=glass-b`); await page.getByRole("button", { name: "打开导航菜单" }).click(); await page.keyboard.press("Escape"); } },
  { id: "contact-location-en-glass-b", material: "glass-b", locale: "en", viewport: { width: 1440, height: 1000 }, run: async (page) => { await page.goto(`${baseURL}/en/contact?uiMaterial=glass-b`); await page.locator("[data-location-card]").first().scrollIntoViewIfNeeded(); } },
  { id: "cta-en-glass-a", material: "glass-a", locale: "en", viewport: { width: 390, height: 844 }, run: async (page) => { await page.goto(`${baseURL}/en?uiMaterial=glass-a`); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.getByTestId("mobile-sticky-actions").getByRole("link").first().click(); } },
];

for (const video of videoRuns) {
  const context = await browser.newContext({ viewport: video.viewport, recordVideo: { dir: videoRoot, size: video.viewport } });
  const page = await context.newPage();
  try {
    await video.run(page);
  } catch (error) {
    failures.push({ material: video.material, locale: video.locale, route: `video:${video.id}`, viewport: `${video.viewport.width}x${video.viewport.height}`, error: String(error) });
  } finally {
    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify({ baseURL, screenshots: screenshots.length, videos: videoRuns.length, failures }, null, 2));
