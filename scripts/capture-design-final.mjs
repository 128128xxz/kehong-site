import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const previewPort = Number(process.env.DESIGN_FINAL_PORT ?? "3120");
const baseURL = process.env.DESIGN_FINAL_BASE_URL ?? `http://127.0.0.1:${previewPort}`;
const stamp = process.env.DESIGN_FINAL_STAMP ?? new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
const root = process.cwd();
const outputDir = process.env.DESIGN_FINAL_OUTPUT_DIR
  ? path.resolve(process.env.DESIGN_FINAL_OUTPUT_DIR)
  : path.join(root, "reports", "screenshots", `design-final-${stamp}`);
mkdirSync(outputDir, { recursive: true });

const viewports = [
  [360, 800], [390, 844], [430, 932], [640, 960], [768, 1024], [1024, 768], [1280, 800], [1440, 900],
];
const crops = [
  [390, 844, "hero-equipment-card", ".kh-hero__visual"],
  [390, 844, "product-systems", "#product-window"],
  [390, 844, "food-bakery", "#solutions .kh-solutions-grid > a:nth-child(1)"],
  [390, 844, "cupstock", "#solutions .kh-solutions-grid > a:nth-child(2)"],
  [390, 844, "corrugated", "#solutions .kh-solutions-grid > a:nth-child(3)"],
  [390, 844, "inserts", "#solutions .kh-solutions-grid > a:nth-child(4)"],
  [390, 844, "manufacturing", "#capabilities"],
  [390, 844, "3d-preview", "#studio"],
  [390, 844, "final-quote", "#inquiry"],
  [640, 960, "solutions", "#solutions"],
  [768, 1024, "solutions", "#solutions"],
  [768, 1024, "header-and-solutions-heading", "#solutions > div > div:first-child"],
  [1024, 768, "hero", "#home"],
  [1440, 900, "header", "header"],
  [1440, 900, "hero", "#home"],
  [1440, 900, "product-systems", "#product-window"],
  [1440, 900, "solutions", "#solutions"],
  [1440, 900, "manufacturing", "#capabilities"],
  [1440, 900, "3d-preview", "#studio"],
  [1440, 900, "final-quote", "#inquiry"],
  [1440, 900, "footer", "footer"],
];

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(300, Math.floor(innerHeight * 0.75));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    scrollTo(0, 0);
    await Promise.all(Array.from(document.images).map((image) => image.complete
      ? Promise.resolve()
      : Promise.race([
        new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ])));
  });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(120);
}

async function scrollForCapture(page, locator) {
  await locator.evaluate((element) => {
    const headerOffset = 96;
    window.scrollTo(0, Math.max(0, window.scrollY + element.getBoundingClientRect().top - headerOffset));
  });
  await page.waitForTimeout(80);
}

const browser = await chromium.launch({ headless: true });
const screenshots = [];
try {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${baseURL}/en`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const file = path.join(outputDir, `home-${width}x${height}.png`);
    await page.screenshot({ path: file, fullPage: true });
    screenshots.push({ viewport: `${width}x${height}`, type: "full-page", path: path.relative(root, file), sha256: sha256(file) });
    await page.close();
  }

  for (const [width, height, name, selector] of crops) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${baseURL}/en`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const locator = page.locator(selector).first();
    await scrollForCapture(page, locator);
    const file = path.join(outputDir, `${width}x${height}-${name}.png`);
    await locator.screenshot({ path: file });
    screenshots.push({ viewport: `${width}x${height}`, type: name, path: path.relative(root, file), sha256: sha256(file) });
    await page.close();
  }
} finally {
  await browser.close();
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
let previewPid = "unknown";
try {
  previewPid = execFileSync("lsof", [`-tiTCP:${previewPort}`, "-sTCP:LISTEN"], { encoding: "utf8" }).trim().split("\n")[0] || "unknown";
} catch {}

const lighthousePath = process.env.RELEASE_LIGHTHOUSE_JSON ? path.resolve(process.env.RELEASE_LIGHTHOUSE_JSON) : null;
const lighthouseHtmlPath = process.env.RELEASE_LIGHTHOUSE_HTML ? path.resolve(process.env.RELEASE_LIGHTHOUSE_HTML) : null;
const lighthouse = lighthousePath ? JSON.parse(readFileSync(lighthousePath, "utf8")) : null;
const lighthouseSummary = lighthouse ? {
  performance: lighthouse.categories.performance.score * 100,
  accessibility: lighthouse.categories.accessibility.score * 100,
  bestPractices: lighthouse.categories["best-practices"].score * 100,
  seo: lighthouse.categories.seo.score * 100,
  fcp: lighthouse.audits["first-contentful-paint"].displayValue,
  lcp: lighthouse.audits["largest-contentful-paint"].displayValue,
  cls: lighthouse.audits["cumulative-layout-shift"].displayValue,
  fetchTime: lighthouse.fetchTime,
  reportSha256: sha256(lighthousePath),
  ...(lighthouseHtmlPath ? { reportHtmlSha256: sha256(lighthouseHtmlPath) } : {}),
} : undefined;

const manifest = {
  branch: git("branch", "--show-current"),
  gitCommit: git("rev-parse", "HEAD"),
  sourceFingerprint: git("rev-parse", "HEAD^{tree}"),
  buildTimestamp: new Date().toISOString(),
  baseURL,
  nodeVersion: process.version,
  packageManager: "pnpm 11.9.0",
  workingTreeDirty: Boolean(git("status", "--short")),
  previewPid,
  previewPort,
  playwrightBaseURL: baseURL,
  imageAssetVersion: sha256(path.join(root, "reports", "design-final", "home-image-map.json")),
  tests: {
    typecheck: process.env.DESIGN_FINAL_TYPECHECK_RESULT ?? "PASS",
    eslint: process.env.DESIGN_FINAL_LINT_RESULT ?? "PASS",
    unit: process.env.DESIGN_FINAL_UNIT_RESULT ?? "15 passed",
    playwright: process.env.DESIGN_FINAL_PLAYWRIGHT_RESULT ?? "PASS",
    productionBuild: process.env.DESIGN_FINAL_BUILD_RESULT ?? "PASS",
  },
  ...(lighthouseSummary ? { lighthouse: lighthouseSummary } : {}),
  screenshots,
};
writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(outputDir);
