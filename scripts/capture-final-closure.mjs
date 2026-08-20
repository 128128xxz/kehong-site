import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3272";
const destination = path.join(process.cwd(), "reports/screenshots/final-closure-20260805");
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
];
const routes = [
  { name: "home-en", path: "/en" },
  { name: "home-zh", path: "/zh" },
  { name: "product-detail-en", path: "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan" },
  { name: "takeout-boxes-en", path: "/en/packaging/takeout-boxes" },
  { name: "labels-stickers-zh", path: "/zh/packaging/labels-stickers" },
  { name: "resources-zh", path: "/zh/resources" },
  { name: "contact-zh", path: "/zh/contact" },
];

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([
      Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }))),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
  });
  await page.waitForTimeout(300);
}

async function addScreenshot(screenshots, outputPath, details) {
  const file = await readFile(outputPath);
  screenshots.push({ ...details, path: path.relative(process.cwd(), outputPath), sha256: createHash("sha256").update(file).digest("hex") });
}

await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ headless: true });
const screenshots = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(`${baseURL}${route.path}`, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await settle(page);
    const filename = `${route.name}-${viewport.name}.png`;
    const outputPath = path.join(destination, filename);
    await page.screenshot({ path: outputPath, fullPage: true });
    await addScreenshot(screenshots, outputPath, { route: route.path, viewport: viewport.name, type: "full-page" });
  }

  await page.goto(`${baseURL}/en`, { waitUntil: "domcontentloaded", timeout: 25_000 });
  await settle(page);
  for (const [name, locator] of [["header", "header.kh-header"], ["footer", "footer"]]) {
    const target = page.locator(locator).first();
    if (await target.count()) {
      const filename = `${name}-en-${viewport.name}.png`;
      const outputPath = path.join(destination, filename);
      await target.screenshot({ path: outputPath });
      await addScreenshot(screenshots, outputPath, { route: "/en", viewport: viewport.name, type: name });
    }
  }
  await page.close();
}

const logoPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await logoPage.setContent(`<!doctype html><html><head><style>
  * { box-sizing: border-box; } body { margin: 0; padding: 48px; color: #171713; background: #f4f1e8; font-family: Arial, sans-serif; }
  h1 { margin: 0 0 28px; font-size: 24px; letter-spacing: .08em; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; } .card { min-height: 220px; padding: 24px; border: 1px solid #d9d3c8; background: #fffdfa; }
  .dark { background: #123d32; color: #fff; } .cream { background: #f4f1e8; } .white { background: #fff; } .label { display:block; margin-bottom: 28px; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; opacity: .75; }
  .logo-full { width: min(100%, 300px); height: auto; } .mark { width: 92px; height: 92px; object-fit: contain; } .sizes { display:flex; align-items:center; gap:22px; } .header { display:flex; align-items:center; gap:16px; padding:12px 0; border-bottom:1px solid currentColor; } .header img { width:44px; height:44px; } .header strong { display:block; font-size:17px; } .header span { font-size:12px; letter-spacing:.12em; text-transform:uppercase; }
</style></head><body><h1>Kehong official logo derivative visual check</h1><div class="grid">
  <div class="card dark"><span class="label">Full lockup · deep green</span><img class="logo-full" src="${baseURL}/media/brand/kehong-full-logo-transparent.png" alt="Kehong Paper Products official logo" /></div>
  <div class="card white"><span class="label">Full lockup · white</span><img class="logo-full" src="${baseURL}/media/brand/kehong-full-logo-transparent.png" alt="Kehong Paper Products official logo" /></div>
  <div class="card cream"><span class="label">Mark · paper background</span><img class="mark" src="${baseURL}/media/brand/kehong-brand-mark-transparent.png" alt="Kehong mark" /></div>
  <div class="card white"><span class="label">Header scale</span><div class="header"><img src="${baseURL}/media/brand/kehong-brand-mark-transparent.png" alt="" /><div><strong>Kehong Paper Products</strong><span>Paper materials &amp; custom packaging</span></div></div></div>
  <div class="card dark"><span class="label">Footer scale</span><img class="logo-full" style="width:220px" src="${baseURL}/media/brand/kehong-full-logo-transparent.png" alt="Kehong Paper Products official logo" /></div>
  <div class="card white"><span class="label">Favicon derivatives</span><div class="sizes"><img src="${baseURL}/media/brand/kehong-brand-mark-16.png" width="16" height="16" alt="16px Kehong mark" /><img src="${baseURL}/media/brand/kehong-brand-mark-32.png" width="32" height="32" alt="32px Kehong mark" /><img src="${baseURL}/media/brand/kehong-brand-mark-48.png" width="48" height="48" alt="48px Kehong mark" /><img src="${baseURL}/media/brand/kehong-brand-mark-180.png" width="72" height="72" alt="Apple touch Kehong mark" /></div></div>
</div></body></html>`);
await settle(logoPage);
const logoPath = path.join(destination, "brand-asset-visual-check.png");
await logoPage.screenshot({ path: logoPath, fullPage: true });
await addScreenshot(screenshots, logoPath, { route: "brand-assets", viewport: "1440x900", type: "brand-asset-check" });
await logoPage.close();
await browser.close();

const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
await writeFile(path.join(destination, "manifest.json"), `${JSON.stringify({ gitCommit, branch, baseURL, createdAt: new Date().toISOString(), screenshots }, null, 2)}\n`);
console.log(JSON.stringify({ destination, screenshotCount: screenshots.length, baseURL }, null, 2));
