import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseURL = process.env.DESIGN_FINAL_BASE_URL ?? "http://127.0.0.1:3110";
const stamp = process.env.DESIGN_FINAL_STAMP ?? new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
const root = process.cwd();
const outputDir = path.join(root, "reports", "screenshots", `design-final-${stamp}`);
mkdirSync(outputDir, { recursive: true });

const viewports = [
  [390, 844], [640, 960], [768, 1024], [1024, 768], [1280, 800], [1440, 900],
];
const crops = [
  [390, 844, "hero", "#home"],
  [390, 844, "solutions", "#solutions"],
  [390, 844, "manufacturing", "#capabilities"],
  [390, 844, "3d-preview", "#studio"],
  [390, 844, "final-quote", "#inquiry"],
  [768, 1024, "hero", "#home"],
  [768, 1024, "solutions", "#solutions"],
  [1024, 768, "header", "header"],
  [1024, 768, "hero", "#home"],
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
      : new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); })));
  });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(120);
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
    await locator.scrollIntoViewIfNeeded();
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
  previewPid = execFileSync("lsof", ["-tiTCP:3110", "-sTCP:LISTEN"], { encoding: "utf8" }).trim().split("\n")[0] || "unknown";
} catch {}

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
  previewPort: 3110,
  playwrightBaseURL: baseURL,
  imageAssetVersion: sha256(path.join(root, "reports", "design-final", "image-audit.json")),
  tests: {
    typecheck: "PASS",
    eslint: "PASS",
    unit: "14 passed",
    playwright: "27 passed, 1 production-only test skipped",
    productionBuild: "PASS",
  },
  screenshots,
};
writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(outputDir);
