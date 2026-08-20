import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { hasLegacyImageStatus, isDisallowedPublicMediaPath, isNeutralMediaFilename } from "./lib/public-media-policy.mjs";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const mapPath = fs.existsSync(path.join(root, "docs/stage-1b-seo-media-name-map.json"))
  ? path.join(root, "docs/stage-1b-seo-media-name-map.json")
  : path.join(root, "docs/stage-1b-media-migration-map.json");
const map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, "utf8")) : { entries: [] };
const errors = [];
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const imageExt = /\.(?:png|jpe?g|webp|gif|avif|svg|ico)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const publicFiles = walk(publicRoot);
const mediaFiles = publicFiles.filter((file) => imageExt.test(file));
for (const file of mediaFiles) {
  const relative = `/${path.relative(publicRoot, file).split(path.sep).join("/")}`;
  if (isDisallowedPublicMediaPath(relative)) errors.push(`Disallowed public media path: ${relative}`);
  if (relative.startsWith("/media/") && !isNeutralMediaFilename(path.basename(file))) errors.push(`Non-neutral media filename: ${relative}`);
}

const targets = new Set();
for (const entry of map.entries || []) {
  if (targets.has(entry.newPath)) errors.push(`Duplicate migration target: ${entry.newPath}`);
  targets.add(entry.newPath);
  const target = path.join(publicRoot, entry.newPath.replace(/^\//, ""));
  if (!fs.existsSync(target)) errors.push(`Missing migrated media: ${entry.newPath}`);
  else if (sha256(target) !== entry.sha256) errors.push(`Migrated SHA-256 mismatch: ${entry.newPath}`);
}

const runtimeFiles = [
  ...walk(path.join(root, "src")),
  path.join(root, "public/site.webmanifest"),
].filter((file) => fs.existsSync(file) && /\.(?:ts|tsx|js|mjs|json|css|webmanifest)$/.test(file));
const oldPaths = new Set((map.entries || []).map((entry) => entry.oldPath));
for (const file of runtimeFiles) {
  if (path.relative(root, file) === path.join("src", "data", "seoMediaRedirects.ts")) continue;
  const text = fs.readFileSync(file, "utf8");
  const withoutCurrentPaths = [...targets].reduce((value, currentPath) => value.split(currentPath).join(""), text);
  for (const oldPath of oldPaths) if (withoutCurrentPaths.includes(oldPath)) errors.push(`Legacy runtime reference ${oldPath} in ${path.relative(root, file)}`);
  if (hasLegacyImageStatus(withoutCurrentPaths)) errors.push(`Legacy public image status in ${path.relative(root, file)}`);
}

const productImages = JSON.parse(fs.readFileSync(path.join(root, "src/data/productImages.json"), "utf8"));
for (const asset of productImages.assets || []) {
  if (hasLegacyImageStatus(asset.exactness) || hasLegacyImageStatus(asset.imageStatus)) errors.push(`Legacy asset status: ${asset.assetId}`);
}

const summary = { mediaFiles: mediaFiles.length, migrationEntries: (map.entries || []).length, legacyRuntimeReferences: errors.filter((item) => item.startsWith("Legacy runtime")).length, errors };
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exit(1);
