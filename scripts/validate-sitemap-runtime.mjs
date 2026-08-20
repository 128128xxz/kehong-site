import fs from "node:fs/promises";
import catalog from "../src/data/catalog.normalized.json" with { type: "json" };

const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3453").replace(/\/$/u, "");
const expectedDiffPath = "docs/stage-3b3-sitemap-exact-diff.csv";
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
  "paper-cup-materials",
  "corrugated-board-flute-materials",
  "specialty-decorative-paper",
  "functional-food-paper",
  "packaging-materials-converted-components",
  "oem-odm-custom-paper-converting",
];
const locales = ["en", "zh", "id", "vi", "th", "ms"];

function csvRow(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
}

function expectedUrlsFromDiff(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/u);
  const keys = csvRow(header);
  const urlIndex = keys.indexOf("url");
  const afterIndex = keys.indexOf("after");
  if (urlIndex < 0 || afterIndex < 0) throw new Error(`Invalid ${expectedDiffPath}: missing url/after columns`);
  return new Set(lines.filter(Boolean).map(csvRow).filter((row) => row[afterIndex] === "true").map((row) => row[urlIndex]));
}

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

const expectedDiff = await fs.readFile(expectedDiffPath, "utf8");
const expected = expectedUrlsFromDiff(expectedDiff);
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
if (imageEntries !== 380) throw new Error(`image sitemap entries changed: ${imageEntries}`);

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
  if (result.response.status !== 200) throw new Error(`${sourceId} returned ${result.response.status}`);
  if (canonical !== `/en/products/${targetSlug}`) throw new Error(`${sourceId} canonical mismatch: ${canonical}`);
  if (/noindex/iu.test(robotsFrom(result.body))) throw new Error(`${sourceId} has noindex`);
  sourceResults.push({ sourceId, status: result.response.status, canonical, inSitemap: actualPathSet.has(fallbackUrl) });
}
if (sourceResults.some((row) => row.inSitemap)) throw new Error("a paper-cup source URL was restored to sitemap");

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
  missingCount: missing.length,
  unexpectedCount: unexpected.length,
  imageSitemapEntries: imageEntries,
  pe043InSitemap: actualPathSet.has(`/en/products/${targetSlug}`),
  sourceResults,
  familyResults,
  archivedEsAdded: [...actualSet].some((url) => /\/es\//u.test(url)),
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
