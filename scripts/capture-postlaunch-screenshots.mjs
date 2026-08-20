import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3192";
const output = resolve("screenshots/kehong-postlaunch-fix-20260802");
const captures = [
  { name: "home-en-390x844", path: "/en", viewport: { width: 390, height: 844 } },
  { name: "home-en-1366x768", path: "/en", viewport: { width: 1366, height: 768 } },
  { name: "home-en-1920x1080", path: "/en", viewport: { width: 1920, height: 1080 } },
  { name: "home-zh-390x844", path: "/zh", viewport: { width: 390, height: 844 } },
  { name: "home-zh-1366x768", path: "/zh", viewport: { width: 1366, height: 768 } },
  { name: "products-en-1366x768", path: "/en/products", viewport: { width: 1366, height: 768 } },
  { name: "contact-zh-390x844", path: "/zh/contact", viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "contact-zh-1366x768", path: "/zh/contact", viewport: { width: 1366, height: 768 }, fullPage: true },
  { name: "structure-preview-en-1366x768", path: "/en/model-preview", viewport: { width: 1366, height: 768 } },
  { name: "retail-industry-en-1366x768", path: "/en/industries/retail-lifestyle", viewport: { width: 1366, height: 768 } },
  { name: "ecommerce-industry-en-1366x768", path: "/en/industries/ecommerce-industrial-professional", viewport: { width: 1366, height: 768 } },
  { name: "takeout-category-en-1366x768", path: "/en/packaging/takeout-boxes", viewport: { width: 1366, height: 768 } },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const manifest = { baseURL, capturedAt: new Date().toISOString(), screenshots: [] };

for (const capture of captures) {
  const page = await browser.newPage({ viewport: capture.viewport, deviceScaleFactor: 1 });
  await page.goto(`${baseURL}${capture.path}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(350);
  const path = resolve(output, `${capture.name}.png`);
  await page.screenshot({ path, fullPage: capture.fullPage ?? false });
  const contents = await readFile(path);
  manifest.screenshots.push({ ...capture, file: `${capture.name}.png`, sha256: createHash("sha256").update(contents).digest("hex") });
  await page.close();
}

await browser.close();
await writeFile(resolve(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
