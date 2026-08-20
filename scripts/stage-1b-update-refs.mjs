import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const map = JSON.parse(fs.readFileSync(path.join(root, "docs/stage-1b-media-migration-map.json"), "utf8"));
const roots = ["src", "scripts", "tests", "public"];
const excluded = new Set(["node_modules", ".next", "test-results", "playwright-report", "reports", "screenshots"]);
const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".md", ".mdx", ".html", ".xml", ".webmanifest"]);
const replacements = new Map(map.entries.map((entry) => [entry.oldPath, entry.newPath]));

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

const files = roots.flatMap((name) => walk(path.join(root, name)));
const changed = [];
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [oldPath, newPath] of replacements) text = text.split(oldPath).join(newPath);
  if (text !== before) {
    fs.writeFileSync(file, text);
    changed.push(path.relative(root, file));
  }
}

const productImagesPath = path.join(root, "src/data/productImages.json");
const productImages = JSON.parse(fs.readFileSync(productImagesPath, "utf8"));
for (const asset of productImages.assets || []) {
  if (asset.exactness === "ai-representative") asset.exactness = "representative";
  if (asset.imageStatus === "ai-representative") asset.imageStatus = "representative";
}
fs.writeFileSync(productImagesPath, `${JSON.stringify(productImages, null, 2)}\n`);
if (!changed.includes("src/data/productImages.json")) changed.push("src/data/productImages.json");

const sourceMoves = [
  ["public/images/ai/20260727-gpt/README.md", "docs/stage-1b-media-source-notes/representative-set-20260727.md"],
  ["public/images/ai/SOURCES.md", "docs/stage-1b-media-source-notes/representative-renders.md"],
  ["public/images/products/SOURCES.md", "docs/stage-1b-media-source-notes/product-image-sources.md"],
  ["public/images/web/README.md", "docs/stage-1b-media-source-notes/web-image-readme.md"],
  ["public/images/web/SOURCES.md", "docs/stage-1b-media-source-notes/web-image-sources.md"]
];
for (const [sourceRelative, targetRelative] of sourceMoves) {
  const source = path.join(root, sourceRelative);
  const target = path.join(root, targetRelative);
  if (!fs.existsSync(source)) continue;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}
const productBuilder = path.join(root, "scripts/build-product-data.mjs");
if (fs.existsSync(productBuilder)) {
  const before = fs.readFileSync(productBuilder, "utf8");
  const after = before.replace('path.join(root, "public/images/products/SOURCES.md")', 'path.join(root, "docs/stage-1b-media-source-notes/product-image-sources.md")');
  if (after !== before) {
    fs.writeFileSync(productBuilder, after);
    changed.push("scripts/build-product-data.mjs");
  }
}
console.log(JSON.stringify({ changedFiles: changed.length, changedFilesList: changed.sort(), copiedSourceNotes: sourceMoves.length }, null, 2));
