import { readFile, writeFile } from "node:fs/promises";

const map = JSON.parse(await readFile("docs/stage-1b-seo-media-name-map.json", "utf8"));
const entries = map.entries
  .filter((entry) => entry.indexInImageSitemap && entry.newPath !== "/media/shared/wechat-qr.png")
  .map(({ newPath, landingPage, altKey }) => ({ newPath, landingPage: landingPage || "/en", altKey }))
  .sort((a, b) => a.newPath.localeCompare(b.newPath));
const body = `// Generated from docs/stage-1b-seo-media-name-map.json; do not edit manually.\nexport type SeoMediaEntry = { newPath: string; landingPage: string; altKey: string };\nexport const seoMediaEntries: readonly SeoMediaEntry[] = ${JSON.stringify(entries, null, 2)} as const;\n`;
await writeFile("src/data/seoMediaEntries.ts", body);
console.log(JSON.stringify({ entries: entries.length }, null, 2));
