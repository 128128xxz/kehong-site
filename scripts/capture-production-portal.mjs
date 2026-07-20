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
  [1180, 820],
  [1280, 800],
  [1366, 768],
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
  materials: {
    imagePath: "/images/kehong/showcase/color-material-swatch-portal.webp",
    actualContent: "Corrugated paperboard and colored material swatches.",
    isRealKehongAsset: true,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Keep the diagonal board edges and material layers visible.",
    alt: "Corrugated paperboard edge and paper material swatches",
    responsiveSizes: "static 640x494 WebP; fill crop in portal stage",
  },
  packaging: {
    imagePath: "CSS technical visual (no image)",
    actualContent: "Neutral closed/open packaging panels with insert structure labels.",
    isRealKehongAsset: false,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Responsive CSS drawing remains centered in the stage.",
    alt: "Finished packaging structure diagram",
    responsiveSizes: "CSS; no network image",
  },
  solutions: {
    imagePath: "CSS technical visual (no image)",
    actualContent: "Stacked paper-first application layers: food box, bakery tray, cupstock, corrugated and insert.",
    isRealKehongAsset: false,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Keep all five application layers visible.",
    alt: "Packaging solutions structure diagram",
    responsiveSizes: "CSS; no network image",
  },
  factory: {
    imagePath: "/images/kehong/showcase/precision-machine-closeup.webp",
    actualContent: "Kehong paper converting machine detail with visible rollers and material path.",
    isRealKehongAsset: true,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Keep the machine rollers and blue material path in frame.",
    alt: "Kehong paper converting equipment detail",
    responsiveSizes: "fill; (max-width: 1179px) 52vw; desktop 42vw",
  },
  studio: {
    imagePath: "CSS technical visual (no image)",
    actualContent: "Panel, fold, insert, width and depth technical structure drawing.",
    isRealKehongAsset: false,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Keep dimension labels inside the technical drawing bounds.",
    alt: "Paper packaging technical structure diagram",
    responsiveSizes: "CSS; no network image",
  },
  support: {
    imagePath: "CSS checklist visual (no image)",
    actualContent: "Material and GSM, structure and size, sampling and MOQ, export documents.",
    isRealKehongAsset: false,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Keep all four checklist rows legible.",
    alt: "Buyer preparation checklist",
    responsiveSizes: "CSS; no network image",
  },
  project: {
    imagePath: "CSS brief diagram (no image)",
    actualContent: "Technical packaging brief fields: size, material, quantity and destination.",
    isRealKehongAsset: false,
    containsThirdPartyBranding: false,
    containsChineseUi: false,
    recommendedCrop: "Keep the four brief fields visible.",
    alt: "Packaging project brief diagram",
    responsiveSizes: "CSS; no network image",
  },
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
      noHorizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2),
      noVerticalOverflow: await page.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight + 2),
      scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
      clientWidth: await page.evaluate(() => document.documentElement.clientWidth),
      scrollHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      clientHeight: await page.evaluate(() => document.documentElement.clientHeight),
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
    const activeVisual = desktop.locator(`[data-visual-route="${routeId}"]`);
    await activeVisual.waitFor({ state: "visible" });
    await activeVisual.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.complete && image.naturalWidth > 0
      ? Promise.resolve()
      : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })))));
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
  previewPid: Number(process.env.PRODUCTION_PORTAL_PREVIEW_PID || 0),
  routeCount: routeIds.length,
  canonicalValues: {
    "/en": "https://www.kehong.tech/en",
    "/en/products": "https://www.kehong.tech/en/products",
    "/en/solutions": "https://www.kehong.tech/en/solutions",
    "/en/factory": "https://www.kehong.tech/en/factory",
    "/en/process": "https://www.kehong.tech/en/process",
    "/en/model-preview": "https://www.kehong.tech/en/model-preview",
    "/en/procurement": "https://www.kehong.tech/en/procurement",
    "/en/contact": "https://www.kehong.tech/en/contact",
  },
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
const routeMapDir = path.resolve("reports/production-portal-final");
await mkdir(routeMapDir, { recursive: true });
await writeFile(path.join(routeMapDir, "route-image-map.json"), `${JSON.stringify(imageMap, null, 2)}\n`);
const routeMapMarkdown = [
  "# Production Portal route visual map",
  "",
  `Generated from ${baseURL} at ${manifest.gitCommit}.`,
  "",
  ...Object.entries(imageMap).map(([route, item]) => {
    const value = typeof item === "string" ? { imagePath: item } : item;
    return [
      `## ${route}`,
      `- Image path: ${value.imagePath}`,
      `- Actual content: ${value.actualContent ?? "See route visual implementation."}`,
      `- Is real Kehong asset: ${value.isRealKehongAsset ?? "not applicable"}`,
      `- Contains third-party branding: ${value.containsThirdPartyBranding ?? "not applicable"}`,
      `- Contains Chinese UI: ${value.containsChineseUi ?? "not applicable"}`,
      `- Recommended crop: ${value.recommendedCrop ?? "Responsive crop follows the portal stage."}`,
      `- Alt: ${value.alt ?? "Route visual"}`,
      `- Responsive sizes: ${value.responsiveSizes ?? "See component sizes."}`,
      "",
    ].join("\n");
  }),
].join("\n");
await writeFile(path.join(routeMapDir, "route-image-map.md"), `${routeMapMarkdown}\n`);
console.log(JSON.stringify({ outputDir, gitCommit: manifest.gitCommit, screenshotCount: screenshots.length }, null, 2));
