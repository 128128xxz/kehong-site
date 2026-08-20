import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const mapPath = path.join(root, "docs/stage-1b-media-migration-map.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const errors = [];
const copied = [];
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

for (const entry of map.entries) {
  const source = path.join(publicRoot, entry.oldPath.replace(/^\//, ""));
  const target = path.join(publicRoot, entry.newPath.replace(/^\//, ""));
  if (!fs.existsSync(source)) {
    errors.push(`Missing source: ${entry.oldPath}`);
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) {
    if (sha256(target) !== entry.sha256) errors.push(`Target conflict with different bytes: ${entry.newPath}`);
  } else {
    fs.copyFileSync(source, target);
  }
  const copiedHash = sha256(target);
  if (copiedHash !== entry.sha256) errors.push(`SHA-256 mismatch: ${entry.oldPath} -> ${entry.newPath}`);
  copied.push({ oldPath: entry.oldPath, newPath: entry.newPath, sha256: copiedHash, bytesEqual: copiedHash === entry.sha256 });
}

const report = { generatedAt: new Date().toISOString(), copiedCount: copied.length, errors, copied };
fs.writeFileSync(path.join(root, "docs/stage-1b-copy-check.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ copiedCount: copied.length, errors: errors.length }, null, 2));
if (errors.length) process.exitCode = 1;
