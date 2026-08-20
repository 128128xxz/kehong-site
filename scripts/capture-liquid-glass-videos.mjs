import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3434";
const videoRoot = path.resolve("reports/liquid-glass-ui-preview/videos");
await mkdir(videoRoot, { recursive: true });
const runs = [
  { id: "header-scroll-en-glass-a", viewport: { width: 1440, height: 1000 }, run: async (page) => { await page.goto(`${baseURL}/en?uiMaterial=glass-a`); await page.mouse.wheel(0, 700); await page.mouse.wheel(0, -700); } },
  { id: "products-popover-en-glass-a", viewport: { width: 1440, height: 1000 }, run: async (page) => { await page.goto(`${baseURL}/en?uiMaterial=glass-a`); await page.getByRole("button", { name: "Products" }).click(); await page.keyboard.press("Escape"); } },
  { id: "mobile-drawer-zh-glass-b", viewport: { width: 390, height: 844 }, run: async (page) => { await page.goto(`${baseURL}/zh?uiMaterial=glass-b`); await page.getByRole("button", { name: "打开导航菜单" }).click(); await page.keyboard.press("Escape"); } },
  { id: "contact-location-en-glass-b", viewport: { width: 1440, height: 1000 }, run: async (page) => { await page.goto(`${baseURL}/en/contact?uiMaterial=glass-b`); await page.locator("[data-location-card]").first().scrollIntoViewIfNeeded(); } },
  { id: "cta-en-glass-a", viewport: { width: 390, height: 844 }, run: async (page) => { await page.goto(`${baseURL}/en?uiMaterial=glass-a`); await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.getByTestId("mobile-sticky-actions").getByRole("link").first().click(); } },
];
const browser = await chromium.launch({ headless: true });
const failures = [];
for (const item of runs) {
  const context = await browser.newContext({ viewport: item.viewport, recordVideo: { dir: videoRoot, size: item.viewport } });
  const page = await context.newPage();
  try { await item.run(page); } catch (error) { failures.push({ id: item.id, error: String(error) }); }
  await context.close();
}
await browser.close();
console.log(JSON.stringify({ videos: runs.length, failures }, null, 2));
