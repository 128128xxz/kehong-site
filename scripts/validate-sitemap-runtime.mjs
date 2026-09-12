import catalog from "../src/data/catalog.normalized.json" with { type: "json" };

const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3453").replace(/\/$/u, "");
const expectedSiteOrigin = (process.env.EXPECTED_SITEMAP_ORIGIN || "https://www.kehong.tech").replace(/\/$/u, "");
const sourceIds = [
  "kh-fd-cupsheet-150350-pr-044",
  "kh-fd-cupsheet-150350-pr-068",
  "kh-fd-cupsheet-250-pe-221",
  "kh-fd-cupsheet-280-pe-222",
  "kh-fd-cupsheet-300-pe-223",
  "kh-fd-cupsheet-320-pe-224",
  "kh-fd-cupsheet-320-pr-225",
  "kh-fd-cupsheet-350-pr-226",
  "kh-fd-cupsheet-150-pr-227",
  "kh-fd-cupsheet-170-pr-228",
  "kh-fd-cupsheet-280-pe-229",
  "kh-fd-cupsheet-300-pe-230",
  "kh-fd-cupsheet-320-pe-231",
  "kh-fd-cupsheet-350-pe-232",
  "kh-fd-cupsheet-230-pr-233",
  "kh-fd-cupsheet-240-pr-234",
  "kh-fd-cupsheet-250-pr-235",
  "kh-fd-cupsheet-280-pr-236",
];
const targetSlug = "kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup";
const familySlugs = [
  "corrugated-board-flute-materials",
  "specialty-decorative-paper",
  "functional-food-paper",
  "packaging-materials-converted-components",
  "oem-odm-custom-paper-converting",
];
const locales = ["en", "zh", "id", "vi", "th", "ms"];

const staticPaths = [
  "/en", "/en/products", "/en/contact", "/en/paper-packaging-supplier", "/en/custom-paper-products",
  "/en/factory", "/en/process", "/en/procurement", "/en/privacy", "/en/terms", "/en/industries",
  "/en/industries/bakery-packaging", "/en/capabilities", "/en/resources", "/en/materials", "/en/news",
];
const categorySlugs = ["kraft-paper", "white-cardboard", "food-grade-paper", "corrugated-paper", "specialty-paper", "food-packaging-boxes", "paper-pads", "paper-inserts", "paper-boxes", "paper-packaging-materials"];
const packagingSlugs = ["paper-bags", "takeout-boxes", "cake-boxes", "cake-boards-cake-drums", "pizza-packaging", "food-packaging", "inserts-dividers", "cosmetic-packaging", "retail-packaging", "corrugated-mailer-boxes"];
const resourceSlugs = ["artwork-guidelines", "materials-guide", "finishes-guide", "dielines-templates", "packaging-selection-guide", "proofing-samples"];
const materialSlugs = ["corrugated-paper", "specialty-paper", "metallic-paper", "pearlescent-paper", "embossed-paper", "laser-paper"];
const newsSlugs = ["artwork-to-dielines-packaging-sampling", "cake-boxes-boards-drums-match", "corrugated-mailer-dimensions-board-inserts", "paper-bag-quotation-paper-handles-printing-quantity", "takeout-box-quotation-six-details"];
const sourceOnlyIds = new Set([
  "kh-fd-cupsheet-300-pe-230", "kh-fd-cupsheet-320-pe-231", "kh-fd-cupsheet-350-pe-232",
  "kh-fd-cupsheet-230-pr-233", "kh-fd-cupsheet-240-pr-234", "kh-fd-cupsheet-250-pr-235", "kh-fd-cupsheet-280-pr-236",
]);
const publicProductPaths = catalog.skus
  .filter((sku) => sku?.published === true && sku?.sourceStatus === "confirmed" && sku.slug
    && !sourceOnlyIds.has(sku.id)
    && !/^KH-FD-CUPFAN-/iu.test(sku.sku ?? "")
    && sku.groupId !== "paper-cup-fan-paper-cup-fan"
    && sku.canonicalGroupId !== "paper-cup-fan-paper-cup-fan")
  .map((sku) => `/en/products/${sku.slug}`);
const expected = new Set([
  ...staticPaths,
  ...packagingSlugs.map((slug) => `/en/packaging/${slug}`),
  ...resourceSlugs.map((slug) => `/en/resources/${slug}`),
  ...materialSlugs.map((slug) => `/en/materials/${slug}`),
  ...newsSlugs.map((slug) => `/en/news/${slug}`),
  ...categorySlugs.map((slug) => `/en/products/${slug}`),
  ...publicProductPaths,
].map((pathname) => `${expectedSiteOrigin}${pathname}`));

function absolute(url) { return new URL(url, baseUrl).toString(); }
function pathname(url) { return new URL(url, baseUrl).pathname; }
function canonicalFrom(html) { return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/iu)?.[1] ?? ""; }
function robotsFrom(html) { return html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/iu)?.[1] ?? ""; }
function hreflangLocalesFrom(html) { return [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)/giu)].map((m) => m[1]); }

async function request(pathname, init = {}) {
  const response = await fetch(absolute(pathname), { redirect: "manual", ...init });
  const body = await response.text();
  return { response, body };
}

const sitemap = await request("/sitemap.xml");
if (sitemap.response.status !== 200) throw new Error(`sitemap.xml returned ${sitemap.response.status}`);
const actual = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
const actualSet = new Set(actual);
const actualPathSet = new Set(actual.map((url) => new URL(url).pathname));
if (actual.length !== actualSet.size) throw new Error(`sitemap URL set is not unique: ${actual.length} rows / ${actualSet.size} unique`);
const missing = [...expected].filter((url) => !actualSet.has(url));
const unexpected = [...actualSet].filter((url) => !expected.has(url));
if (missing.length || unexpected.length) throw new Error(`runtime sitemap set mismatch; missing=${missing.length}; unexpected=${unexpected.length}`);

const imageSitemap = await request("/sitemap-images.xml");
const imageEntries = (imageSitemap.body.match(/<image:image>/gu) || []).length;
const expectedImageEntries = 341;
if (imageEntries !== expectedImageEntries) throw new Error(`image sitemap entries changed: ${imageEntries}; expected ${expectedImageEntries}`);

const pe043 = await request(`/en/products/${targetSlug}`);
if (pe043.response.status !== 200 || pathname(canonicalFrom(pe043.body)) !== `/en/products/${targetSlug}`) throw new Error("pe-043 is not a self-canonical 200 page");
if (!actualPathSet.has(`/en/products/${targetSlug}`)) throw new Error("pe-043 is missing from sitemap");

const sourceResults = [];
for (const sourceId of sourceIds) {
  const sourceRecord = catalog.skus.find((sku) => sku.id === sourceId);
  if (!sourceRecord) throw new Error(`source record not found: ${sourceId}`);
  const fallbackUrl = `/en/products/${sourceRecord.slug}`;
  const result = await request(fallbackUrl);
  const canonical = pathname(canonicalFrom(result.body));
  const inSitemap = actualPathSet.has(fallbackUrl);
  if (sourceOnlyIds.has(sourceId)) {
    if (result.response.status !== 404) throw new Error(`${sourceId} source-only route returned ${result.response.status}, expected 404`);
    if (inSitemap) throw new Error(`${sourceId} source-only route is in sitemap`);
    sourceResults.push({ sourceId, status: result.response.status, canonical, inSitemap, visibility: "source-only" });
    continue;
  }
  if (result.response.status !== 200) throw new Error(`${sourceId} returned ${result.response.status}`);
  if (canonical !== `/en/products/${targetSlug}`) throw new Error(`${sourceId} canonical mismatch: ${canonical}`);
  if (/noindex/iu.test(robotsFrom(result.body))) throw new Error(`${sourceId} has noindex`);
  if (!inSitemap) throw new Error(`${sourceId} public alias is missing from sitemap`);
  sourceResults.push({ sourceId, status: result.response.status, canonical, inSitemap, visibility: "public-alias" });
}

const familyResults = [];
for (const slug of familySlugs) {
  for (const locale of locales) {
    const routePath = `/${locale}/products/families/${slug}`;
    const result = await request(routePath);
    const canonical = pathname(canonicalFrom(result.body));
    const alternates = hreflangLocalesFrom(result.body);
    if (result.response.status !== 200) throw new Error(`${routePath} returned ${result.response.status}`);
    if (canonical !== routePath) throw new Error(`${routePath} is not self-canonical`);
    if (/noindex/iu.test(robotsFrom(result.body))) throw new Error(`${routePath} has noindex`);
    if (!locales.every((item) => alternates.includes(item))) throw new Error(`${routePath} is missing an active hreflang`);
    familyResults.push({ pathname: routePath, status: result.response.status, canonical, alternates: alternates.length });
  }
}

const summary = {
  baseUrl,
  runtimeSitemapCount: actual.length,
  runtimeSitemapUniqueUrls: actualSet.size,
  expectedSitemapCount: expected.size,
  expectedSitemapSource: "current route baseline + current catalog public visibility",
  missingCount: missing.length,
  unexpectedCount: unexpected.length,
  imageSitemapEntries: imageEntries,
  expectedImageSitemapEntries: expectedImageEntries,
  pe043InSitemap: actualPathSet.has(`/en/products/${targetSlug}`),
  sourceResults,
  familyResults,
  archivedEsAdded: [...actualSet].some((url) => /\/es\//u.test(url)),
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
