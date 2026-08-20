import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const docsRoot = path.join(root, "docs");
const imageExts = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg", ".ico"]);
const sourceRoots = ["src", "scripts", "tests", "public"];
const excludedDirs = new Set(["node_modules", ".next", "test-results", "playwright-report", "reports", "screenshots"]);

function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function ext(file) {
  return path.extname(file).toLowerCase();
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/ai-generated/g, "")
    .replace(/generated-by-ai/g, "")
    .replace(/generated_with_ai/g, "")
    .replace(/chatgpt|gpt/g, "")
    .replace(/^ai[-_]/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function targetFor(relative) {
  const parts = relative.split(path.sep);
  const name = path.basename(relative);
  const extension = ext(name);
  const rawStem = path.basename(name, extension);
  if (parts[0] === "brand") return `/media/brand/${slug(rawStem)}${extension}`;
  const underImages = parts.slice(1);
  if (underImages[0] === "3d-preview") return `/media/shared/3d-preview-${slug(rawStem)}${extension}`;
  if (underImages[0] === "contact") return `/media/shared/${slug(rawStem)}${extension}`;
  if (underImages[0] === "textures") return `/media/materials/textures/${slug(rawStem)}${extension}`;
  if (underImages[0] === "ai-generated" || underImages[0] === "ai") {
    const stem = slug(rawStem);
    if (/artwork|dieline|guide|exhibition|backdrop/.test(stem)) return `/media/resources/${stem}-reference${extension}`;
    if (/box|bag|packaging|pizza|burger|meal|cake|cosmetics|electronics|eyewear|jewelry|pharma|pillow|seafood|sports|stationery|toy|apparel|pet|gift/.test(stem)) return `/media/packaging/${stem}-reference${extension}`;
    if (/flute|specialty|paper|cup|coated|insert|diecut|material|kraft/.test(stem)) return `/media/materials/${stem}-reference${extension}`;
    return `/media/packaging/${stem}-reference${extension}`;
  }
  if (underImages[0] === "kehong") {
    if (underImages[1] === "factory") return `/media/factory/${slug(rawStem)}${extension}`;
    if (underImages[1] === "process") return `/media/factory/${slug(rawStem)}${extension}`;
    if (underImages[1] === "products") return `/media/products/${slug(rawStem)}${extension}`;
    const stem = slug(rawStem);
    if (/food-paper-box|kraft-boxes|paper-bag|structural-box|cake-board|food-box|carton|display|retail|wooden/.test(stem)) return `/media/packaging/${stem}${extension}`;
    if (/machine|feeder|precision|factory|operator|team|booth|exhibition|textile|worktable|interior/.test(stem)) return `/media/factory/${stem}${extension}`;
    if (/paper|material|swatch|gold|honeycomb|structure-material/.test(stem)) return `/media/materials/${stem}${extension}`;
    if (/^(factory|process|products)$/.test(stem)) return `/media/shared/kehong-${stem}-reference${extension}`;
    return `/media/packaging/${stem}${extension}`;
  }
  if (underImages[0] === "web") {
    const stem = slug(rawStem).replace(/^pexels-/, "").replace(/^unsplash-/, "");
    return `/media/applications/${stem}-reference${extension}`;
  }
  return `/media/shared/${slug(rawStem)}${extension}`;
}

function usageFor(relative) {
  const target = targetFor(relative);
  const category = target.split("/")[2];
  return ["product", "products"].includes(category) ? "product" : category === "materials" ? "material" : ["packaging", "applications"].includes(category) ? category === "packaging" ? "packaging" : "application" : category === "factory" ? "factory" : category === "resources" ? "resource" : "shared";
}

const assets = walk(path.join(publicRoot, "images")).concat(walk(path.join(publicRoot, "brand"))).filter((file) => imageExts.has(ext(file))).sort();
const relativeAssets = assets.map((file) => path.relative(publicRoot, file));
const textFiles = sourceRoots.flatMap((rootName) => walk(path.join(root, rootName))).filter((file) => {
  const extension = ext(file);
  return [".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".md", ".mdx", ".html", ".xml", ".webmanifest"].includes(extension);
});
const referenceText = new Map(textFiles.map((file) => [file, fs.readFileSync(file, "utf8")]));

const dimensionsInput = JSON.stringify(assets);
const dimensionsScript = `import json, sys\nfrom PIL import Image\nresult={}\nfor filename in json.loads(sys.argv[1]):\n    try:\n        with Image.open(filename) as image:\n            result[filename]={'width':image.width,'height':image.height,'format':image.format or ''}\n    except Exception:\n        result[filename]={'width':None,'height':None,'format':''}\nprint(json.dumps(result))`;
let dimensions = {};
try {
  dimensions = JSON.parse(execFileSync("python3", ["-c", dimensionsScript, dimensionsInput], { encoding: "utf8" }));
} catch {
  dimensions = {};
}

const entries = relativeAssets.map((relative) => {
  const absolute = path.join(publicRoot, relative);
  const oldPath = `/${relative.split(path.sep).join("/")}`;
  const newPath = targetFor(relative);
  const refs = [];
  for (const [file, text] of referenceText.entries()) {
    if (text.includes(oldPath)) refs.push(path.relative(root, file));
  }
  const metadata = dimensions[absolute] || {};
  const targetCategory = newPath.split("/")[2] || "shared";
  return {
    oldPath,
    newPath,
    originalFilename: path.basename(relative),
    newFilename: path.basename(newPath),
    sha256: hash(absolute),
    fileSize: fs.statSync(absolute).size,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    format: (metadata.format || ext(relative).slice(1)).toLowerCase(),
    currentReferences: refs,
    usageType: usageFor(relative),
    targetCategory,
    isCurrentlyReferenced: refs.length > 0,
    isTemporaryReuse: false,
    reuseSourcePath: null,
    targetEntities: [],
    replacementPriority: refs.length > 0 ? "P1" : "P3",
    notes: refs.length > 0 ? "Deterministic neutral path migration; bytes preserved." : "Unreferenced asset retained for controlled future use; business subject not inferred."
  };
});

const targetGroups = new Map();
for (const entry of entries) {
  const list = targetGroups.get(entry.newPath) || [];
  list.push(entry.oldPath);
  targetGroups.set(entry.newPath, list);
}
const conflicts = [...targetGroups.entries()].filter(([, oldPaths]) => oldPaths.length > 1);
const oldMarkers = /(^|\/)(ai|ai-generated|generated-by-ai|generated_with_ai|gpt|chatgpt)(\/|$)|ai-generated|generated-by-ai|generated_with_ai|chatgpt|gpt|ai-representative/i;
const invalidTargets = entries.filter((entry) => oldMarkers.test(entry.newPath) || !/^\/media\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\.[a-z0-9]+$/.test(entry.newPath));
const existingConflicts = entries.filter((entry) => fs.existsSync(path.join(publicRoot, entry.newPath.replace(/^\//, ""))) && entry.oldPath !== entry.newPath);
const result = {
  generatedAt: new Date().toISOString(),
  root,
  sourceCount: entries.length,
  migrationCount: entries.filter((entry) => entry.oldPath !== entry.newPath).length,
  entries,
  preflight: {
    duplicateTargetPaths: conflicts,
    invalidTargetPaths: invalidTargets.map((entry) => entry.newPath),
    existingTargetConflicts: existingConflicts.map((entry) => ({ oldPath: entry.oldPath, newPath: entry.newPath })),
    unresolvedUsageCount: entries.filter((entry) => entry.usageType === "shared" && entry.currentReferences.length === 0).length,
    dynamicReferenceNote: "Dynamic route/template references must be checked separately; literal references are listed per entry."
  }
};

fs.mkdirSync(docsRoot, { recursive: true });
fs.writeFileSync(path.join(docsRoot, "stage-1b-media-migration-map.json"), `${JSON.stringify(result, null, 2)}\n`);
const columns = ["oldPath", "newPath", "originalFilename", "newFilename", "sha256", "fileSize", "width", "height", "format", "currentReferences", "usageType", "targetCategory", "isCurrentlyReferenced", "isTemporaryReuse", "reuseSourcePath", "targetEntities", "replacementPriority", "notes"];
const csvEscape = (value) => { const text = Array.isArray(value) ? value.join(" | ") : value == null ? "" : String(value); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const csv = [columns.join(","), ...entries.map((entry) => columns.map((column) => csvEscape(entry[column])).join(","))].join("\n") + "\n";
fs.writeFileSync(path.join(docsRoot, "stage-1b-media-migration-map.csv"), csv);
console.log(JSON.stringify({ sourceCount: entries.length, migrationCount: result.migrationCount, duplicateTargetPaths: conflicts.length, invalidTargetPaths: invalidTargets.length, existingTargetConflicts: existingConflicts.length }, null, 2));
if (conflicts.length || invalidTargets.length || existingConflicts.length) process.exitCode = 2;
