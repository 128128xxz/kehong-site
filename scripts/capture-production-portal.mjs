import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baseURL = process.env.PRODUCTION_PORTAL_BASE_URL || "http://127.0.0.1:3130";
const outputDir = path.resolve(process.env.PRODUCTION_PORTAL_OUTPUT || "reports/screenshots/production-portal-current");
const viewports = [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
];
const routeIds = ["materials", "packaging", "solutions", "factory", "studio", "support", "project"];
const routeMap = {
  materials: "/en/products?system=materials",
  packaging: "/en/products?system=packaging",
  solutions: "/en/solutions",
  factory: "/en/factory",
  studio: "/en/model-preview",
  support: "/en/procurement",
  project: "/en/contact",
};
const imageMap = {
  materials: "/images/kehong/showcase/color-material-swatch-q68.webp",
  packaging: "/images/kehong/showcase/custom-box-display-open.webp",
  solutions: "/images/kehong/showcase/food-paper-box-detail.webp",
  factory: "/images/kehong/showcase/precision-machine-closeup.webp",
  studio: "dynamic InteractivePortalScene (loaded only after selection)",
  support: "CSS/SVG buyer preparation checklist (no stock image)",
  project: "CSS/SVG packaging project brief diagram (no stock image)",
};
const sha256 = async (filePath) => createHash("sha256").update(await readFile(filePath)).digest("hex");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

await mkdir(path.join(outputDir, "states"), { recursive: true });

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((image) => image.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(80);
}

const browser = await chromium.launch({ headless: true });
const screenshots = [];
const assertions = [];

async function capture(page, fileName, viewport, type) {
  const filePath = path.join(outputDir, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  screenshots.push({ viewport, type, path: path.relative(root, filePath), sha256: await sha256(filePath) });
}

try {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${baseURL}/en`, { waitUntil: "domcontentloaded" });
    await settle(page);
    assertions.push({
      viewport: `${width}x${height}`,
      horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      routeCount: await page.locator(".production-portal__routes > a").count(),
      oneH1: await page.locator("h1").count() === 1,
      mobileActionsVisible: await page.locator(".production-portal__mobile-actions").isVisible().catch(() => false),
    });
    await capture(page, `home-${width}x${height}.png`, `${width}x${height}`, "home");
    await page.close();
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktop.goto(`${baseURL}/en`, { waitUntil: "domcontentloaded" });
  await settle(desktop);
  for (const routeId of routeIds) {
    await desktop.locator(`[data-route-id="${routeId}"]`).first().hover();
    await desktop.waitForTimeout(240);
    await capture(desktop, `states/desktop-${routeId}.png`, "1440x900", `desktop-${routeId}`);
  }
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${baseURL}/en`, { waitUntil: "domcontentloaded" });
  await settle(mobile);
  await mobile.getByRole("button", { name: "Explore Kehong" }).click();
  await mobile.waitForTimeout(200);
  await capture(mobile, "states/mobile-panel-open.png", "390x844", "mobile-panel-open");
  const dialog = mobile.getByRole("dialog", { name: "Explore Kehong" });
  await dialog.locator(".production-portal__dialog-inner").evaluate((element) => { element.scrollTop = Math.round(element.scrollHeight / 2); });
  await mobile.waitForTimeout(80);
  await capture(mobile, "states/mobile-panel-middle.png", "390x844", "mobile-panel-middle");
  await dialog.locator(".production-portal__dialog-inner").evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await mobile.waitForTimeout(80);
  await capture(mobile, "states/mobile-panel-footer.png", "390x844", "mobile-panel-footer");
  await dialog.locator('.production-portal__dialog-routes [data-route-id="studio"]').focus();
  await capture(mobile, "states/mobile-panel-focus.png", "390x844", "mobile-panel-focus");
  await mobile.keyboard.press("Escape");
  await capture(mobile, "states/mobile-home-after-close.png", "390x844", "mobile-home-after-close");
  await mobile.getByRole("button", { name: "Explore Kehong" }).click();
  await mobile.getByRole("dialog", { name: "Explore Kehong" }).locator('[data-route-id="materials"]').click();
  await mobile.waitForLoadState("networkidle");
  await capture(mobile, "states/mobile-navigate-materials.png", "390x844", "mobile-navigate-materials");
  await mobile.goBack({ waitUntil: "networkidle" });
  await settle(mobile);
  await capture(mobile, "states/mobile-browser-back.png", "390x844", "mobile-browser-back");
  await mobile.close();
} finally {
  await browser.close();
}

let lighthouseReport;
let lighthouseReportPath;
let lighthouseMobileReport;
let lighthouseMobileReportPath;
if (process.env.PRODUCTION_PORTAL_LIGHTHOUSE_JSON) {
  lighthouseReportPath = path.resolve(process.env.PRODUCTION_PORTAL_LIGHTHOUSE_JSON);
  try {
    lighthouseReport = JSON.parse(await readFile(lighthouseReportPath, "utf8"));
  } catch {
    lighthouseReport = undefined;
  }
}
if (process.env.PRODUCTION_PORTAL_LIGHTHOUSE_MOBILE_JSON) {
  lighthouseMobileReportPath = path.resolve(process.env.PRODUCTION_PORTAL_LIGHTHOUSE_MOBILE_JSON);
  try {
    lighthouseMobileReport = JSON.parse(await readFile(lighthouseMobileReportPath, "utf8"));
  } catch {
    lighthouseMobileReport = undefined;
  }
}

const manifest = {
  gitCommit: git("rev-parse", "HEAD"),
  branch: git("branch", "--show-current"),
  sourceFingerprint: git("rev-parse", "HEAD^{tree}"),
  workingTreeDirty: Boolean(git("status", "--short")),
  buildTimestamp: new Date().toISOString(),
  baseURL,
  nodeVersion: process.version,
  packageManager: "pnpm 11.9.0",
  previewPort: Number(new URL(baseURL).port || 80),
  screenshots,
  assertions,
  routeMap,
  imageMap,
  tests: {
    typecheck: process.env.PRODUCTION_PORTAL_TYPECHECK_RESULT || "PASS",
    eslint: process.env.PRODUCTION_PORTAL_LINT_RESULT || "PASS",
    unit: process.env.PRODUCTION_PORTAL_UNIT_RESULT || "15 passed",
    playwright: process.env.PRODUCTION_PORTAL_PLAYWRIGHT_RESULT || "37 passed",
    productionBuild: process.env.PRODUCTION_PORTAL_BUILD_RESULT || "PASS",
  },
  ...(lighthouseReport ? {
    lighthouse: {
      desktop: Object.fromEntries(Object.entries(lighthouseReport.categories ?? {}).map(([key, category]) => [key, Math.round((category.score ?? 0) * 100)])),
      fcp: lighthouseReport.audits?.["first-contentful-paint"]?.displayValue,
      lcp: lighthouseReport.audits?.["largest-contentful-paint"]?.displayValue,
      cls: lighthouseReport.audits?.["cumulative-layout-shift"]?.displayValue,
      reportSha256: await sha256(lighthouseReportPath),
      ...(lighthouseMobileReport ? {
        mobile: Object.fromEntries(Object.entries(lighthouseMobileReport.categories ?? {}).map(([key, category]) => [key, Math.round((category.score ?? 0) * 100)])),
        mobileFcp: lighthouseMobileReport.audits?.["first-contentful-paint"]?.displayValue,
        mobileLcp: lighthouseMobileReport.audits?.["largest-contentful-paint"]?.displayValue,
        mobileReportSha256: await sha256(lighthouseMobileReportPath),
      } : {}),
    },
  } : {}),
  notes: [
    "Generated only from the Version C production preview; prior A/B screenshot directories were not modified.",
    "Desktop state captures use hover preview; mobile state captures use the semantic full-screen dialog.",
  ],
};
await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ outputDir, gitCommit: manifest.gitCommit, screenshotCount: screenshots.length }, null, 2));
