import { readFile, writeFile } from "node:fs/promises";
const map = JSON.parse(await readFile("docs/stage-1b-seo-media-name-map.json", "utf8"));
const redirects = Object.fromEntries(map.entries.filter((entry) => entry.oldPath !== entry.newPath && entry.redirectStrategy === "308").map((entry) => [entry.oldPath, entry.newPath]));
await writeFile("src/data/seoMediaRedirects.ts", `// Generated from the audited semantic media map.\nexport const seoMediaRedirects: Readonly<Record<string, string>> = ${JSON.stringify(redirects, null, 2)};\n`);
console.log(JSON.stringify({ redirects: Object.keys(redirects).length }, null, 2));
