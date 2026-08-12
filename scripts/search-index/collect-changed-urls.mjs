import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { defaultManifestPath, SITE_URL, canonicalizeUrl, validatePublicPath, writeJson } from "./lib.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 ? path.resolve(args[outputIndex + 1]) : defaultManifestPath(root);
const baseRef = process.env.SEARCH_BASE_REF || process.env.GITHUB_EVENT_BEFORE || "HEAD^";
const headRef = process.env.SEARCH_HEAD_REF || "HEAD";

function git(args, fallback = "") {
  try { return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return fallback; }
}

function resolveBase() {
  if (/^0+$/.test(baseRef)) return "HEAD^";
  return git(["rev-parse", "--verify", `${baseRef}^{commit}`], "HEAD^").trim() || "HEAD^";
}

function changedFiles(base) {
  return git(["diff", "--name-status", "--find-renames", `${base}..${headRef}`, "--", "src", "public"], "")
    .trim().split("\n").filter(Boolean).map((line) => {
      const [status, ...parts] = line.split("\t");
      return { status: status[0], file: parts.at(-1) };
    });
}

function parseNews(source) {
  return [...source.matchAll(/slug:\s*"([^"]+)"[\s\S]*?updatedAt:\s*"([^"]+)"[\s\S]*?published:\s*(true|false)/gu)].filter((match) => match[3] === "true").map((match) => ({ slug: match[1], lastmod: match[2] }));
}

function readCurrentNews() {
  return parseNews(fs.readFileSync(path.join(root, "src/content/news/index.ts"), "utf8"));
}

function readBaseNews(base) {
  const source = git(["show", `${base}:src/content/news/index.ts`], "");
  return source ? parseNews(source) : [];
}

async function fetchSitemap() {
  const response = await fetch(`${SITE_URL}/sitemap.xml`, { redirect: "manual" });
  if (!response.ok || response.status >= 300) throw new Error(`production sitemap is not ready: ${response.status}`);
  const xml = await response.text();
  const lastmods = new Map();
  for (const match of xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gu)) lastmods.set(canonicalizeUrl(match[1]), match[2] ?? null);
  return lastmods;
}

async function validateProduction(url, changeType) {
  const response = await fetch(url, { redirect: "manual", headers: { accept: "text/html,application/xhtml+xml" } });
  const status = response.status;
  if (status >= 300 && status < 400) throw new Error(`production URL redirects: ${url}`);
  const body = status === 200 ? await response.text() : "";
  const canonical = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu)?.[1] ?? null;
  if (status === 200 && canonical && canonicalizeUrl(canonical) !== url) throw new Error(`canonical mismatch: ${url}`);
  if (status === 200 && /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/iu.test(body)) throw new Error(`noindex URL: ${url}`);
  if (status !== 200 && changeType !== "deleted") throw new Error(`production URL returned ${status}: ${url}`);
  return { http_status: status, indexable: status === 200, canonical };
}

function addUrl(items, url, changeType, lastmod) {
  const canonical = canonicalizeUrl(url);
  validatePublicPath(canonical, { allowDeleted: changeType === "deleted" });
  if (!items.some((item) => item.url === canonical)) items.push({ url: canonical, canonical_url: canonical, change_type: changeType, lastmod: lastmod ?? null });
}

const base = resolveBase();
const files = changedFiles(base);
const items = [];
const newsChanged = files.some((item) => item.file === "src/content/news/index.ts");
const sitemapChanged = files.some((item) => item.file === "src/app/sitemap.ts");
const catalogChanged = files.some((item) => item.file === "src/data/catalog.normalized.json" || item.file === "src/data/taxonomy.json");
const packagingChanged = files.some((item) => item.file === "src/data/packagingCategories.ts");
const currentNews = readCurrentNews();
const baseNews = readBaseNews(base);

if (newsChanged || sitemapChanged) {
  for (const article of currentNews) {
    addUrl(items, `${SITE_URL}/en/news/${article.slug}`, "updated", article.lastmod);
    addUrl(items, `${SITE_URL}/zh/news/${article.slug}`, "updated", article.lastmod);
  }
  addUrl(items, `${SITE_URL}/en/news`, "updated");
  addUrl(items, `${SITE_URL}/zh/news`, "updated");
  if (newsChanged) {
    const currentSlugs = new Set(currentNews.map((article) => article.slug));
    for (const article of baseNews.filter((item) => !currentSlugs.has(item.slug))) {
      addUrl(items, `${SITE_URL}/en/news/${article.slug}`, "deleted", article.lastmod);
      addUrl(items, `${SITE_URL}/zh/news/${article.slug}`, "deleted", article.lastmod);
    }
  }
}
if (sitemapChanged) {
  addUrl(items, `${SITE_URL}/en`, "updated");
  addUrl(items, `${SITE_URL}/zh`, "updated");
}
if (catalogChanged) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
  for (const sku of catalog.skus.filter((item) => item.published && item.sourceStatus === "confirmed")) for (const locale of ["en", "zh"]) addUrl(items, `${SITE_URL}/${locale}/products/${sku.slug}`, "updated");
}
if (packagingChanged) {
  const source = fs.readFileSync(path.join(root, "src/data/packagingCategories.ts"), "utf8");
  for (const slug of [...source.matchAll(/slug:\s*"([^"]+)"/gu)].map((match) => match[1])) for (const locale of ["en", "zh"]) addUrl(items, `${SITE_URL}/${locale}/packaging/${slug}`, "updated");
}

const sitemapLastmods = await fetchSitemap();
const checked = [];
for (const item of items) {
  const status = await validateProduction(item.url, item.change_type);
  checked.push({ ...item, ...status, lastmod: item.lastmod ?? sitemapLastmods.get(item.url) ?? null });
}
const manifest = { generated_at: new Date().toISOString(), base_ref: base, head_ref: headRef, production_url: SITE_URL, urls: checked };
writeJson(outputPath, manifest);
console.log(JSON.stringify({ status: "OK", manifest: outputPath, changed_url_count: checked.length, base_ref: base, head_ref: headRef }));
