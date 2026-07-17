import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanDirs = ["src", "dictionary"];
const scanFiles = ["next.config.ts"];
const imageRefPattern = /["'`]((?:\/images\/)[^"'`)>\s]+)/g;
const refs = new Map();
let errors = 0;

function addRef(ref, file) {
  if (!refs.has(ref)) refs.set(ref, new Set());
  refs.get(ref).add(file);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    if (entry.isFile() && /\.(ts|tsx|js|jsx|json|md)$/.test(entry.name)) files.push(full);
  }

  return files;
}

const files = [
  ...scanDirs.flatMap((dir) => walk(path.join(root, dir))),
  ...scanFiles.map((file) => path.join(root, file)).filter((file) => fs.existsSync(file)),
];

for (const file of files) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  let match;

  while ((match = imageRefPattern.exec(text))) addRef(match[1], rel);
}

for (const [ref, files] of [...refs.entries()].sort()) {
  const imagePath = path.join(root, "public", ref.replace(/^\//, ""));
  if (!fs.existsSync(imagePath)) {
    console.error(`Missing public image: ${ref} referenced by ${[...files].join(", ")}`);
    errors += 1;
  }
}

console.log(`Checked ${refs.size} unique /images references.`);
console.log(`${errors} missing image reference(s).`);

if (errors) process.exit(1);
