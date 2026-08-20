import { readFile, unlink } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const map = JSON.parse(await readFile(path.join(root, "docs/stage-1b-seo-media-name-map.json"), "utf8"));
const renamed = map.entries.filter((entry) => entry.oldPath !== entry.newPath);
for (const entry of renamed) {
  await unlink(path.join(publicRoot, entry.oldPath.slice(1)));
}
console.log(JSON.stringify({ removed: renamed.length }, null, 2));
