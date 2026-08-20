import fs from "node:fs";
import path from "node:path";
import {
  classifyPublicReference,
  extractPublicReferences,
  publicAssetPath,
} from "./lib/public-ref-utils.mjs";

const root = process.cwd();
const scanDirs = ["src", "dictionary", "tools"];
const scanFiles = ["next.config.ts", "README.md"];
const refs = new Map();
const dynamicRefs = new Map();
let errors = 0;

function addRef(ref, file, target) {
  if (!target.has(ref)) target.set(ref, new Set());
  target.get(ref).add(file);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    if (entry.isFile() && /\.(ts|tsx|js|jsx|json|md|mjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const files = [
  ...scanDirs.flatMap((dir) => walk(path.join(root, dir))),
  ...scanFiles.map((file) => path.join(root, file)).filter((file) => fs.existsSync(file)),
];

for (const file of files) {
  const rel = path.relative(root, file);
  if (rel === path.join("src", "data", "seoMediaRedirects.ts")) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const ref of extractPublicReferences(text)) {
    const classification = classifyPublicReference(ref);
    if (classification.kind === "dynamic") addRef(ref, rel, dynamicRefs);
    if (classification.kind === "physical") addRef(ref, rel, refs);
  }
}

for (const [ref, files] of [...refs.entries()].sort()) {
  if (!fs.existsSync(publicAssetPath(root, ref))) {
    console.error("Missing public asset: " + ref + " referenced by " + [...files].join(", "));
    errors += 1;
  }
}

console.log("Checked " + refs.size + " unique literal public asset references.");
console.log("Skipped " + dynamicRefs.size + " dynamic public route/template reference(s).");
console.log(errors + " missing public asset reference(s).");

if (errors) process.exit(1);
