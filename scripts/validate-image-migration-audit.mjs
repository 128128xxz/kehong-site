import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { filenameForbidden } from "./lib/image-seo-policy.mjs";

const root = process.cwd();
const mapPath = path.join(root, "docs/stage-1b-media-migration-map.json");
let map;
try {
  map = JSON.parse(await readFile(mapPath, "utf8"));
} catch (error) {
  console.error(`BLOCKED BY MISSING HISTORICAL FIXTURE: docs/stage-1b-media-migration-map.json (${error.code ?? "read error"})`);
  process.exit(2);
}

const redirectsSource = await readFile(path.join(root, "src/data/seoMediaRedirects.ts"), "utf8");
const redirects = Object.keys(JSON.parse(redirectsSource.match(/\{[\s\S]*\}/u)?.[0] ?? "{}"));
const oldAiEntries = map.entries.filter((entry) => filenameForbidden.test(entry.oldPath) || entry.oldPath.includes("/images/ai-generated/"));
const redirected = oldAiEntries.filter((entry) => redirects.includes(entry.oldPath)).map((entry) => entry.oldPath);
const stillPresent = [];
for (const entry of oldAiEntries) {
  try {
    await stat(path.join(root, "public", entry.oldPath.replace(/^\//u, "")));
    stillPresent.push(entry.oldPath);
  } catch {
    // Historical source absence is the expected migration outcome.
  }
}

const errors = [
  ...redirected.map((oldPath) => `AI old path redirected: ${oldPath}`),
  ...stillPresent.map((oldPath) => `AI old path still present: ${oldPath}`),
];
const report = {
  fixture: "docs/stage-1b-media-migration-map.json",
  entries: map.entries.length,
  oldAiUrlsRedirected: redirected.length,
  oldAiUrls404Or410: oldAiEntries.length - redirected.length - stillPresent.length,
  status: errors.length ? "FAIL" : "PASS",
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
