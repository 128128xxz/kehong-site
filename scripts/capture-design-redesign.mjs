import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseURL = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000";
const root = process.cwd();
const outputDir = path.join(root, "screenshots", "design-redesign-20260725");
mkdirSync(outputDir, { recursive: true });

const shots = [
  ...["en", "zh"].flatMap((locale) =>
    [[390, 844], [768, 1024], [1366, 768], [1440, 900], [1920, 1080]].map(([w, h]) => ({
      file: `${locale}-${w}x${h}.png`, url: `/${locale}`, width: w, height: h,
    }))
  ),
  { file: "en_products-1440x900.png", url: "/en/products", width: 1440, height: 900 },
  { file: "en_products_cake-boxes-1440x900.png", url: "/en/packaging/cake-boxes", width: 1440, height: 900 },
  { file: "en_product_detail-1440x900.png", url: "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan", width: 1440, height: 900 },
  { file: "en_factory-1440x900.png", url: "/en/factory", width: 1440, height: 900 },
  { file: "en_contact-1440x900.png", url: "/en/contact", width: 1440, height: 900 },
];

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    // 全局 smooth scrolling 会让快速扫描滚不到位,懒加载图片永远不进入视口
    document.documentElement.style.scrollBehavior = "auto";
    await document.fonts.ready;
    const step = Math.max(300, Math.floor(innerHeight * 0.6));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 140));
    }
    // 逐张确认:仍未加载的图片滚进视口等它完成
    for (const image of Array.from(document.images)) {
      if (image.complete && image.naturalWidth > 0) continue;
      image.scrollIntoView({ block: "center", behavior: "auto" });
      await Promise.race([
        new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  const unloaded = await page.evaluate(() => Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src));
  if (unloaded.length) console.warn("images still unloaded:", unloaded.length, unloaded.slice(0, 3));
}

const browser = await chromium.launch();
const manifest = [];
for (const shot of shots) {
  const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height } });
  await page.goto(`${baseURL}${shot.url}`, { waitUntil: "domcontentloaded" });
  await settle(page);
  const filePath = path.join(outputDir, shot.file);
  await page.screenshot({ path: filePath, fullPage: true });
  manifest.push({ file: `screenshots/design-redesign-20260725/${shot.file}`, sha256: createHash("sha256").update(readFileSync(filePath)).digest("hex") });
  await page.close();
  console.log("captured", shot.file);
}
await browser.close();

const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root }).toString().trim();
const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root }).toString().trim();
writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify({
  gitCommit,
  branch,
  buildTimestamp: new Date().toISOString(),
  baseURL,
  nodeVersion: process.version,
  packageManager: "pnpm",
  note: "Captured after takeover fixes: full-page with lazy-image settle (scroll-through + image completion).",
  screenshots: manifest,
}, null, 2)}\n`);
console.log("manifest written:", manifest.length, "screenshots");
