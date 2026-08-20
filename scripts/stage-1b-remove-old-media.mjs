import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const map = JSON.parse(fs.readFileSync(path.join(root, "docs/stage-1b-media-migration-map.json"), "utf8"));
const removed = [];
for (const entry of map.entries) {
  const oldFile = path.join(publicRoot, entry.oldPath.replace(/^\//, ""));
  if (fs.existsSync(oldFile)) {
    fs.unlinkSync(oldFile);
    removed.push(entry.oldPath);
  }
}
const sourceNotes = [
  "public/images/ai/20260727-gpt/README.md",
  "public/images/ai/SOURCES.md",
  "public/images/products/SOURCES.md",
  "public/images/web/README.md",
  "public/images/web/SOURCES.md"
];
for (const relative of sourceNotes) {
  const file = path.join(root, relative);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    removed.push(relative);
  }
}
const candidateDirs = [
  "public/images/ai/20260727-gpt",
  "public/images/ai-generated/category",
  "public/images/ai-generated/hero",
  "public/images/ai-generated/product-family",
  "public/images/ai-generated/technical",
  "public/images/ai",
  "public/images/ai-generated",
  "public/images/3d-preview",
  "public/images/contact",
  "public/images/products",
  "public/images/textures",
  "public/images/web/unsplash",
  "public/images/web",
  "public/images/kehong/showcase/optimized",
  "public/images/kehong/showcase",
  "public/images/kehong",
  "public/images",
  "public/brand"
];
const removedDirs = [];
for (const relative of candidateDirs) {
  const directory = path.join(root, relative);
  if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) {
    fs.rmdirSync(directory);
    removedDirs.push(relative);
  }
}
fs.writeFileSync(path.join(root, "docs/stage-1b-old-path-removal.json"), `${JSON.stringify({ removedAt: new Date().toISOString(), removed, removedDirs }, null, 2)}\n`);
console.log(JSON.stringify({ removedFiles: removed.length, removedDirs: removedDirs.length }, null, 2));
