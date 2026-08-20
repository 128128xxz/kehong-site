import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const map = JSON.parse(await readFile(path.join(root, "docs/stage-1b-seo-media-name-map.json"), "utf8"));
const replacements = new Map(map.entries.filter((entry) => entry.oldPath !== entry.newPath).map((entry) => [entry.oldPath, entry.newPath]));
const roots = ["src", "scripts", "tests", "public"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css", ".md", ".xml", ".webmanifest"]);
const excluded = new Set([
  path.join(root, "scripts/stage-1b-update-seo-media-refs.mjs"),
  path.join(root, "scripts/build-stage-1b-seo-media-map.mjs"),
  path.join(root, "scripts/stage-1b-apply-seo-media-map.mjs"),
]);

async function filesIn(directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isDirectory()) result.push(...await filesIn(full));
    else if (extensions.has(path.extname(item.name).toLowerCase())) result.push(full);
  }
  return result;
}

let changedFiles = 0;
let replacementsApplied = 0;
for (const relativeRoot of roots) {
  const directory = path.join(root, relativeRoot);
  try { await stat(directory); } catch { continue; }
  for (const file of await filesIn(directory)) {
    if (excluded.has(file)) continue;
    let content = await readFile(file, "utf8");
    const original = content;
    for (const [oldPath, newPath] of replacements) {
      const occurrences = content.split(oldPath).length - 1;
      if (occurrences) {
        replacementsApplied += occurrences;
        content = content.replaceAll(oldPath, newPath);
      }
    }
    if (content !== original) {
      await writeFile(file, content);
      changedFiles += 1;
    }
  }
}

console.log(JSON.stringify({ changedFiles, replacementsApplied, mappedRenames: replacements.size }, null, 2));
