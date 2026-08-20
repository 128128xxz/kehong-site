import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3230";
const outputDir = new URL("../screenshots/next-optimization-20260804/", import.meta.url);
const targets = [
  { name: "home-1440x900", path: "/en", viewport: { width: 1440, height: 900 } },
  { name: "home-1024x768", path: "/en", viewport: { width: 1024, height: 768 } },
  { name: "home-390x844", path: "/en", viewport: { width: 390, height: 844 } },
  { name: "contact-1440x900", path: "/en/contact", viewport: { width: 1440, height: 900 } },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const manifest = [];
try {
  for (const target of targets) {
    const page = await browser.newPage({ viewport: target.viewport, deviceScaleFactor: 1 });
    await page.goto(`${baseURL}${target.path}`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const bottom = document.documentElement.scrollHeight;
      for (let y = 0; y < bottom; y += Math.max(window.innerHeight * 0.8, 300)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => window.setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
      // A full-page screenshot captures all sections at once, unlike a real
      // viewport. Mark the completed scroll-reveal state so off-screen blocks
      // are represented as they are after a buyer scrolls through the page.
      document.querySelectorAll(".kh-reveal-armed, .kh-reveal-watch").forEach((element) => element.classList.add("kh-reveal-in"));
      await Promise.all([...document.images].filter((image) => !image.complete).map((image) => Promise.race([
        new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ])));
    });
    const path = new URL(`${target.name}.png`, outputDir);
    await page.screenshot({ path: path.pathname, fullPage: true });
    const data = await readFile(path);
    manifest.push({ ...target, file: path.pathname, sha256: createHash("sha256").update(data).digest("hex") });
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(new URL("manifest.json", outputDir), `${JSON.stringify({ baseURL, generatedAt: new Date().toISOString(), screenshots: manifest }, null, 2)}\n`);
