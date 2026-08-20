import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3261";
const destination = path.join(process.cwd(), "reports/screenshots/final-data-consistency-20260804");
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
];
const routes = [
  { name: "home", path: "/en" },
  { name: "products", path: "/en/products" },
  { name: "product-detail", path: "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan" },
  { name: "takeout-boxes", path: "/en/packaging/takeout-boxes" },
  { name: "contact", path: "/en/contact" },
];

await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ headless: true });
const screenshots = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(`${baseURL}${route.path}`, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.race([Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }))), new Promise((resolve) => setTimeout(resolve, 5_000))]);
    });
    await page.waitForTimeout(250);
    const filename = `${route.name}-${viewport.name}.png`;
    const outputPath = path.join(destination, filename);
    await page.screenshot({ path: outputPath, fullPage: true });
    const file = await readFile(outputPath);
    screenshots.push({ route: route.path, viewport: viewport.name, path: `reports/screenshots/final-data-consistency-20260804/${filename}`, sha256: createHash("sha256").update(file).digest("hex") });
  }
  await page.close();
}

await browser.close();
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
await writeFile(path.join(destination, "manifest.json"), `${JSON.stringify({ gitCommit, branch, baseURL, createdAt: new Date().toISOString(), screenshots }, null, 2)}\n`);
console.log(JSON.stringify({ destination, screenshotCount: screenshots.length, baseURL }, null, 2));
