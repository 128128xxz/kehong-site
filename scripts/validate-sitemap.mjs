import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);
const catalogPath = path.join(projectRoot, "src", "data", "catalog.normalized.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://www.kehong.tech").replace(/\/+$/, "");
const parsedSiteUrl = new URL(siteUrl);
const oldDomains = ["kehong" + "paper.com", "www." + "kehong" + "paper.com"];
const staticRoutes = [
  "/",
  "/products",
  "/contact",
  "/paper-cup-fan-manufacturer",
  "/paper-packaging-supplier",
  "/custom-paper-products",
  "/factory",
  "/process",
  "/procurement",
  "/privacy",
  "/terms",
];
const categoryRoutes = [
  "kraft-paper",
  "white-cardboard",
  "food-grade-paper",
  "corrugated-paper",
  "specialty-paper",
  "food-packaging-boxes",
  "paper-pads",
  "paper-inserts",
  "paper-boxes",
  "paper-packaging-materials",
];

const errors = [];
const seen = new Set();
const expected = [];

function addRoute(pathname, label) {
  const url = new URL(pathname, `${siteUrl}/`);
  const normalized = url.toString().replace(/\/$/, "") || url.origin;
  if (url.protocol !== "https:") errors.push(`${label}: sitemap URL must use HTTPS`);
  if (url.origin !== parsedSiteUrl.origin) errors.push(`${label}: sitemap URL uses a non-canonical origin`);
  if (url.search || url.hash) errors.push(`${label}: sitemap URL contains a query or hash`);
  if (oldDomains.some((domain) => url.hostname === domain)) errors.push(`${label}: sitemap URL uses an old domain`);
  if (seen.has(normalized)) errors.push(`${label}: duplicate sitemap URL`);
  seen.add(normalized);
  expected.push(normalized);
}

const locale = "en";
for (const route of staticRoutes) addRoute(`/${locale}${route === "/" ? "" : route}`, `${locale}${route}`);
for (const slug of categoryRoutes) addRoute(`/${locale}/products/${slug}`, `${locale}/products/${slug}`);
for (const sku of catalog.skus.filter((item) => item?.published === true && item?.sourceStatus === "confirmed")) {
  if (!sku?.slug || typeof sku.slug !== "string") errors.push("catalog SKU is missing a valid slug");
  else addRoute(`/${locale}/products/${sku.slug}`, `${locale}/products/${sku.slug}`);
}

if (!catalog?.skus || !Array.isArray(catalog.skus) || catalog.skus.length === 0) {
  errors.push("catalog contains no published SKUs");
}
if ((catalog.skus || []).some((sku) => sku.sourceStatus !== "confirmed" && sku.published)) {
  errors.push("pending source SKU is marked published");
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, siteUrl, expectedUrlCount: expected.length, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, siteUrl, expectedUrlCount: expected.length, duplicateCount: 0 }));
}
