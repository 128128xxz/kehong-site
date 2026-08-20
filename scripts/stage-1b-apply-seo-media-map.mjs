import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const map = JSON.parse(await readFile(path.join(root, "docs/stage-1b-seo-media-name-map.json"), "utf8"));
const sha256 = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const copied = [];

for (const entry of map.entries) {
  const source = path.join(publicRoot, entry.oldPath.slice(1));
  const target = path.join(publicRoot, entry.newPath.slice(1));
  await stat(source);
  await mkdir(path.dirname(target), { recursive: true });
  if (source !== target) await copyFile(source, target);
  const sourceHash = await sha256(source);
  const targetHash = await sha256(target);
  if (sourceHash !== targetHash || sourceHash !== entry.sha256) {
    throw new Error(`Hash mismatch for ${entry.oldPath} -> ${entry.newPath}`);
  }
  copied.push({ oldPath: entry.oldPath, newPath: entry.newPath, sha256: targetHash, copied: source !== target });
}

await writeFile(
  path.join(root, "docs/stage-1b-seo-media-copy-check.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), copied, copiedCount: copied.filter((entry) => entry.copied).length }, null, 2)}\n`,
);
console.log(JSON.stringify({ entries: copied.length, copied: copied.filter((entry) => entry.copied).length, hashMismatches: 0 }, null, 2));
