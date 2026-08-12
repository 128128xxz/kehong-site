import fs from "node:fs";
import path from "node:path";

export const SITE_URL = (process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.kehong.tech").replace(/\/+$/u, "");
export const INDEXNOW_KEY = "1e2355a1eb736793a342e4b8e2c503cf";
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

export function canonicalizeUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.origin !== SITE_URL) throw new Error(`non-canonical origin: ${value}`);
  if (url.search || url.hash) throw new Error(`query/hash URL is not public: ${value}`);
  url.pathname = url.pathname.replace(/\/{2,}/gu, "/");
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/u, "");
  return url.toString();
}

export function validatePublicPath(url, { allowDeleted = false } = {}) {
  const parsed = new URL(url);
  const pathName = parsed.pathname;
  if (/^\/api(?:\/|$)/u.test(pathName) || /^\/_next(?:\/|$)/u.test(pathName)) throw new Error(`private route: ${url}`);
  if (/(?:vercel\.app|\.vercel\.sh)$/iu.test(parsed.hostname)) throw new Error(`preview host: ${url}`);
  if (!allowDeleted && pathName === "/") throw new Error("root redirect is not a submission URL");
  return true;
}

export function validateManifest(manifest) {
  if (!manifest || !Array.isArray(manifest.urls)) throw new Error("manifest.urls must be an array");
  const seen = new Set();
  for (const item of manifest.urls) {
    const canonical = canonicalizeUrl(item.url ?? item.canonical_url);
    validatePublicPath(canonical, { allowDeleted: item.change_type === "deleted" });
    if (seen.has(canonical)) throw new Error(`duplicate URL: ${canonical}`);
    seen.add(canonical);
    if (!["new", "updated", "deleted"].includes(item.change_type)) throw new Error(`invalid change_type for ${canonical}`);
    if (item.http_status === 3 || (item.http_status >= 300 && item.http_status < 400)) throw new Error(`redirect URL: ${canonical}`);
  }
  return true;
}

export function readManifest(filePath) {
  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  validateManifest(manifest);
  return manifest;
}

export function defaultManifestPath(root = process.cwd()) {
  return path.join(root, "reports", "search-submission-runs", "changed-urls-latest.json");
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/gu, "-");
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
