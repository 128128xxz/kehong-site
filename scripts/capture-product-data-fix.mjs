import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3221";
const output = resolve("screenshots/product-data-fix-20260803");
const captures = [
  { name: "products-en-1440x900", path: "/en/products?collection=materials", viewport: { width: 1440, height: 900 } },
  { name: "products-zh-1024x768", path: "/zh/products?productType=paper-cup-fan", viewport: { width: 1024, height: 768 } },
  { name: "products-en-390x844", path: "/en/products?productType=paper-cup-fan", viewport: { width: 390, height: 844 } },
  { name: "packaging-en-1440x900", path: "/en/packaging", viewport: { width: 1440, height: 900 } },
  { name: "contact-zh-interest-390x844", path: "/zh/contact?interest=pe-coated-paper-roll", viewport: { width: 390, height: 844 } },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const capture of captures) {
  const page = await browser.newPage({ viewport: capture.viewport });
  await page.goto(`${baseURL}${capture.path}`, { waitUntil: "networkidle" });
  await page.evaluate(async () => document.fonts.ready);
  await page.screenshot({ path: resolve(output, `${capture.name}.png`), fullPage: false });
  await page.close();
}
await browser.close();
