import fs from "node:fs";
import process from "node:process";
import { readManifest, INDEXNOW_KEY, SITE_URL, INDEXNOW_KEY_LOCATION } from "./lib.mjs";

const manifestPath = process.argv[2] || process.env.SEARCH_URL_MANIFEST;
if (!manifestPath || !fs.existsSync(manifestPath)) {
  console.error("SEARCH_MANIFEST_MISSING");
  process.exit(1);
}
const manifest = readManifest(manifestPath);
if (manifest.production_url !== SITE_URL) throw new Error(`manifest production origin mismatch: ${manifest.production_url}`);
if (manifest.urls.some((item) => item.canonical_url !== item.url)) throw new Error("manifest contains non-canonical URL");
console.log(JSON.stringify({ status: "VALID", url_count: manifest.urls.length, key_location: INDEXNOW_KEY_LOCATION, key_configured: Boolean(INDEXNOW_KEY) }));
