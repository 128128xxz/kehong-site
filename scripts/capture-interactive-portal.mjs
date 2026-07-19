import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const baseURL = process.env.INTERACTIVE_PORTAL_BASE_URL || "http://127.0.0.1:3130";
const outputDir = process.env.INTERACTIVE_PORTAL_OUTPUT || path.resolve("reports/screenshots/interactive-portal-current");
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
];

const sha256 = async (filePath) => createHash("sha256").update(await readFile(filePath)).digest("hex");
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const screenshots = [];

for (const version of ["a", "b"]) {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    await page.goto(`${baseURL}/en/lab/interactive-portal?portal=materials`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    if (version === "b") await page.getByRole("button", { name: "B / editorial" }).click();
    const fileName = `${viewport.name}-version-${version}.png`;
    const filePath = path.join(outputDir, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
    screenshots.push({ viewport: viewport.name, version: version.toUpperCase(), path: fileName, sha256: await sha256(filePath) });
    await page.close();
  }
}

await browser.close();
await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify({
  gitCommit,
  branch,
  buildTimestamp: new Date().toISOString(),
  baseURL,
  screenshots,
}, null, 2)}\n`);

console.log(JSON.stringify({ outputDir, gitCommit, screenshots }, null, 2));
