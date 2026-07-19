import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const baseURL = process.env.AUDIT_BASE_URL || "http://localhost:3100";
const outputDir = resolve("reports/screenshots/current-build");
mkdirSync(outputDir, { recursive: true });

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const buildInputFiles = git("ls-files", "-co", "--exclude-standard")
  .split("\n")
  .filter((path) => /^(src|public|dictionary)\//.test(path) || /^(package\.json|pnpm-lock\.yaml|next\.config\.|tsconfig\.json)/.test(path))
  .sort();
const sourceFingerprintSha256 = buildInputFiles.reduce((hash, path) => {
  hash.update(path);
  hash.update("\0");
  hash.update(readFileSync(path));
  hash.update("\0");
  return hash;
}, createHash("sha256")).digest("hex");
const screenshots = [];

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(320, Math.floor(innerHeight * 0.7));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolveStep) => requestAnimationFrame(() => requestAnimationFrame(resolveStep)));
    }
    await Promise.all(Array.from(document.images).map(async (image) => {
      if (!image.complete) {
        await new Promise((resolveImage) => {
          image.addEventListener("load", resolveImage, { once: true });
          image.addEventListener("error", resolveImage, { once: true });
        });
      }
      try { await image.decode(); } catch {}
    }));
    scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

async function save(page, name, viewport, options = {}) {
  const path = resolve(outputDir, name);
  mkdirSync(dirname(path), { recursive: true });
  await page.screenshot({ path, ...options });
  screenshots.push({
    viewport: `${viewport.width}x${viewport.height}`,
    path: relative(process.cwd(), path),
    sha256: sha256(path),
  });
}

async function saveLocator(locator, name, viewport) {
  const path = resolve(outputDir, name);
  mkdirSync(dirname(path), { recursive: true });
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path });
  screenshots.push({
    viewport: `${viewport.width}x${viewport.height}`,
    path: relative(process.cwd(), path),
    sha256: sha256(path),
  });
}

async function visualState(locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const x = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
    const y = Math.min(innerHeight - 1, Math.max(0, rect.top + Math.min(rect.height, innerHeight) / 2));
    const top = document.elementFromPoint(x, y);
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      display: style.display,
      opacity: Number(style.opacity),
      visibility: style.visibility,
      inViewport: rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth,
      centerCoveredBySelfOrDescendant: Boolean(top && (top === element || element.contains(top))),
    };
  });
}

const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 390, height: 844 },
  { width: 640, height: 960 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];
const pageAudits = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
  await settle(page);
  const hero = await visualState(page.locator(".kh-hero"));
  const equipment = await visualState(page.locator(".kh-hero__visual"));
  pageAudits.push({
    viewport: `${viewport.width}x${viewport.height}`,
    hero,
    equipment,
    noHorizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    errors,
  });
  await save(page, `home-${viewport.width}x${viewport.height}.png`, viewport, { fullPage: true });
  await page.close();
}

const assertions = {};
{
  const viewport = { width: 1024, height: 768 };
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
  await settle(page);
  assertions.title3D = (await page.locator("#studio h2").innerText()).trim();
  assertions.finalQuoteTitle = (await page.locator("#inquiry h2").innerText()).trim();
  assertions.navigation1024 = {
    desktop: await visualState(page.locator(".kh-desktop-nav")),
    compact: await visualState(page.locator(".kh-compact-nav")),
  };
  await saveLocator(page.locator("header"), "crops/header-1024.png", viewport);
  await page.close();
}

{
  const viewport = { width: 768, height: 1024 };
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
  await settle(page);
  assertions.hero768 = {
    hero: await visualState(page.locator(".kh-hero")),
    equipment: await visualState(page.locator(".kh-hero__visual")),
  };
  await saveLocator(page.locator(".kh-hero"), "crops/hero-768.png", viewport);
  await page.close();
}

{
  const viewport = { width: 390, height: 844 };
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
  await settle(page);
  assertions.mobileInquiryBar = {
    count: await page.locator(".mobile-sticky-action-bar").count(),
    floatingInquiryText: await page.getByText("Inquiry", { exact: true }).count(),
  };
  await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
  await settle(page);
  await saveLocator(page.locator(".kh-hero"), "crops/hero-390.png", viewport);
  await saveLocator(page.locator("#studio"), "crops/studio-390.png", viewport);
  await page.close();
}

{
  const viewport = { width: 1440, height: 900 };
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
  await settle(page);
  await saveLocator(page.locator(".kh-hero"), "crops/hero-1440.png", viewport);
  await saveLocator(page.locator("#studio"), "crops/studio-1440.png", viewport);
  await page.close();
}

await browser.close();

const manifest = {
  gitCommit: git("rev-parse", "HEAD"),
  branch: git("branch", "--show-current"),
  buildTimestamp: new Date().toISOString(),
  baseURL,
  nodeVersion: process.version,
  packageManager: `pnpm ${execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim()}`,
  workingTreeDirty: Boolean(git("status", "--porcelain")),
  sourceFingerprintSha256,
  screenshots,
  assertions,
  pageAudits,
};

writeFileSync(resolve(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
