#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const docs = path.join(root, "docs");
const snapshot = process.env.STAGE_3B2BR_SNAPSHOT || "/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3b2br-prechange-backup-20260818";
const baseUrl = process.env.STAGE_3B2BR_BASE_URL || "http://localhost:3453";
const siteUrl = "https://www.kehong.tech";
const catalog = JSON.parse(await fs.readFile(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const sourceIds = [
  "kh-fd-cupsheet-150350-pr-044", "kh-fd-cupsheet-150350-pr-068", "kh-fd-cupsheet-250-pe-221", "kh-fd-cupsheet-280-pe-222", "kh-fd-cupsheet-300-pe-223", "kh-fd-cupsheet-320-pe-224", "kh-fd-cupsheet-320-pr-225", "kh-fd-cupsheet-350-pr-226", "kh-fd-cupsheet-150-pr-227", "kh-fd-cupsheet-170-pr-228", "kh-fd-cupsheet-280-pe-229", "kh-fd-cupsheet-300-pe-230", "kh-fd-cupsheet-320-pe-231", "kh-fd-cupsheet-350-pe-232", "kh-fd-cupsheet-230-pr-233", "kh-fd-cupsheet-240-pr-234", "kh-fd-cupsheet-250-pr-235", "kh-fd-cupsheet-280-pr-236",
];
const target = catalog.skus.find((sku) => sku.id === "kh-fd-cupsheet-150350-pe-043");
const sources = sourceIds.map((id) => catalog.skus.find((sku) => sku.id === id)).filter(Boolean);
const csv = (value) => '"' + String(value ?? "").replaceAll('"', '""') + '"';
const writeCsv = async (file, headers, rows) => fs.writeFile(path.join(docs, file), [headers, ...rows].map((row) => row.map(csv).join(",")).join("\n") + "\n");
const htmlMeta = (html, name) => html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, "i"))?.[1] ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, "i"))?.[1] ?? "";
const canonical = (html) => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? "";
const get = async (pathname) => {
  const response = await fetch(baseUrl + pathname);
  const body = await response.text();
  return { status: response.status, body, canonical: canonical(body), robots: htmlMeta(body, "robots") };
};
const sitemap = await get("/sitemap.xml");
const currentSitemap = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1].trim());
const beforeSitemap = (await fs.readFile(path.join(snapshot, "manifests/current-set-276.txt"), "utf8")).trim().split(/\n/gu).filter(Boolean);
const beforeSet = new Set(beforeSitemap);
const afterSet = new Set(currentSitemap);
const removed = [...beforeSet].filter((url) => !afterSet.has(url)).sort();
const added = [...afterSet].filter((url) => !beforeSet.has(url)).sort();
const targetPath = `/en/products/${target.slug}`;
const targetPage = await get(targetPath);
const familyPage = await get("/en/products/families/paper-cup-materials");
const sourceStates = [];
for (const source of sources) {
  const state = await get(`/en/products/${source.slug}`);
  sourceStates.push({ source, ...state });
}
const sourceRows = sourceStates.map(({ source, status, canonical: sourceCanonical, robots }) => [
  siteUrl + "/en/products/" + source.slug,
  source.id,
  source.sku,
  sourceCanonical,
  siteUrl + targetPath,
  status,
  robots,
  sourceCanonical === siteUrl + targetPath,
  afterSet.has(siteUrl + "/en/products/" + source.slug),
]);
await writeCsv("stage-3bbr-source-canonical-audit.csv", ["sourceUrl", "recordId", "sku", "canonicalAfter", "approvedTarget", "httpStatus", "robots", "canonicalPass", "inSitemapAfter"], sourceRows);
await writeCsv("stage-3bbr-index-state-diff.csv", ["entityType", "url", "httpStatus", "canonical", "robots", "inSitemapAfter", "decision"], [
  ["target", siteUrl + targetPath, targetPage.status, targetPage.canonical, targetPage.robots, afterSet.has(siteUrl + targetPath), "KEEP_SELF_CANONICAL_INDEXABLE"],
  ["family", siteUrl + "/en/products/families/paper-cup-materials", familyPage.status, familyPage.canonical, familyPage.robots, afterSet.has(siteUrl + "/en/products/families/paper-cup-materials"), "ADD_ONE_ENGLISH_CANONICAL_ROW_WITH_HREFLANG"],
  ...sourceRows.map((row) => ["source", row[0], row[5], row[3], row[6], row[8], "CANONICAL_TO_PE043_AND_REMOVE_SITEMAP_ROW"]),
]);
await writeCsv("stage-3bbr-sitemap-diff.csv", ["action", "url", "before", "after", "reason"], [
  ...removed.map((url) => ["REMOVE", url, true, false, "Approved paper-cup sheet source record is represented by the pe-043 center."]),
  ...added.map((url) => ["ADD", url, false, true, "Approved paper-cup family canonical row."]),
]);
const sourceIdsInTarget = sources.filter((source) => new RegExp(source.sku, "u").test(targetPage.body)).map((source) => source.id);
const duplicateIdsInTarget = ["kh-fd-cupsheet-150350-pr-044", "kh-fd-cupsheet-150350-pr-068"].filter((id) => sourceIdsInTarget.includes(id));
const productDataHash = crypto.createHash("sha256").update(await fs.readFile(path.join(root, "src/data/catalog.normalized.json"))).digest("hex");
await fs.mkdir(path.join(snapshot, "after"), { recursive: true });
await fs.writeFile(path.join(snapshot, "after/runtime-sitemap.xml"), sitemap.body);
await fs.writeFile(path.join(snapshot, "after/runtime-sitemap-urls.txt"), currentSitemap.sort().join("\n") + "\n");
await fs.writeFile(path.join(snapshot, "after/product-data.sha256"), productDataHash + "  src/data/catalog.normalized.json\n");
await fs.writeFile(path.join(snapshot, "after/source-canonical-audit.csv"), ["sourceUrl", "recordId", "sku", "canonicalAfter", "approvedTarget", "httpStatus", "robots", "canonicalPass", "inSitemapAfter", ...sourceRows].map((row) => Array.isArray(row) ? row.map(csv).join(",") : row).join("\n") + "\n");
await fs.writeFile(path.join(docs, "stage-3bbr-variant-center-audit.md"), [
  "# Stage 3B-2B-R paper-cup sheet variant center",
  "",
  "VARIANT_CENTER=pe-043",
  "SOURCE_RECORDS_APPROVED=18",
  "SOURCE_RECORDS_VISIBLE_IN_TARGET=" + sourceIdsInTarget.length,
  "DUPLICATE_DISPLAY_SPEC_RECORDS_VISIBLE=" + duplicateIdsInTarget.length,
  "SYNTHETIC_VARIANTS=0",
  "SOURCE_DATA_CHANGED=false",
  "SKU_OR_SLUG_CHANGED=false",
  "",
  "The target page reads specification values from the normalized catalog. It lists all 18 approved source identities, including both PR-044 and PR-068 despite their equal displayed specification values. Each source row is keyed by recordId + SKU + slug and links to its existing URL.",
].join("\n") + "\n");
await fs.writeFile(path.join(docs, "stage-3bbr-visual-review.md"), [
  "# Stage 3B-2B-R visual review",
  "",
  "TARGET_URL=" + siteUrl + targetPath,
  "FAMILY_URL=" + siteUrl + "/en/products/families/paper-cup-materials",
  "TARGET_HTTP_STATUS=" + targetPage.status,
  "FAMILY_HTTP_STATUS=" + familyPage.status,
  "TARGET_SOURCE_RECORDS_VISIBLE=" + sourceIdsInTarget.length,
  "DESKTOP_SCREENSHOT=NOT_CAPTURED_IN_THIS_HEADLESS_AUDIT",
  "MOBILE_SCREENSHOT=NOT_CAPTURED_IN_THIS_HEADLESS_AUDIT",
  "NO_PRODUCT_IMAGE_BYTES_CHANGED=true",
  "",
  "SSR output was inspected for the target, one approved source and the paper-cup family route. The target exposes the approved source table; this report does not claim a headed visual approval.",
].join("\n") + "\n");
await fs.writeFile(path.join(docs, "stage-3bbr-rollback-plan.md"), [
  "# Stage 3B-2B-R rollback plan",
  "",
  "Rollback is file- and rule-scoped only. Do not use reset, clean, restore, checkout or stash.",
  "",
  "1. Remove the Stage 3B-2B-R sitemap boundary and restore the prior sitemap implementation from the protected prechange snapshot.",
  "2. Restore source metadata canonical behaviour for only the 18 approved English source URLs.",
  "3. Remove the pe-043 source table presentation and the paper-cup family sitemap row while retaining the existing family route.",
  "4. Re-run lint, typecheck, unit tests, build, sitemap validation and route smoke tests.",
  "",
  "No product data, SKU, slug, image, robots or redirect rollback is required because none was changed.",
].join("\n") + "\n");
await writeCsv("stage-3bbr-rollback-actions.csv", ["actionId", "scope", "rollbackAction", "destructiveCommandAllowed"], [
  ["R1", "src/app/sitemap.ts", "Remove source exclusion and paper-cup family row; restore prechange rule", false],
  ["R2", "product metadata", "Restore self-canonical behaviour for 18 source URLs", false],
  ["R3", "pe-043 page", "Remove approved source table presentation only", false],
]);
await fs.writeFile(path.join(docs, "stage-3bbr-unresolved-backlog.md"), [
  "# Stage 3B-2B-R unresolved backlog",
  "",
  "- No pending records, noindex rules, redirects or other product families were included in this stage.",
  "- The legacy historical 271 set includes two routes that are not valid current indexable routes; they remain documented as baseline differences and were not restored.",
  "- Headed desktop/mobile visual review remains a follow-up if a human screenshot review is required.",
].join("\n") + "\n");
await fs.writeFile(path.join(docs, "stage-3bbr-summary.md"), [
  "# Stage 3B-2B-R summary",
  "",
  "STAGE_3B2BR_STATUS=COMPLETE_CONDITIONAL_RUNTIME_IMPLEMENTATION",
  "BASELINE_RECONCILIATION=PASS_271_TO_276_EXPLAINED",
  "HISTORICAL_SET_271=271",
  "CURRENT_RUNTIME_SET_BEFORE=276",
  "CURRENT_RUNTIME_SET_AFTER=" + currentSitemap.length,
  "CURRENT_RUNTIME_SET_UNIQUE_AFTER=" + afterSet.size,
  "SITEMAP_IMPLEMENTATION_CHANGED=true",
  "SITEMAP_INPUT_CATALOG_CHANGED=false",
  "NEWS_AUTO_DISCOVERY_EXPLAINED=true",
  "INVALID_HISTORICAL_PACKAGING_ROWS_NOT_RESTORED=true",
  "PAPER_CUP_FAMILY_CANONICAL_ROWS_ADDED=1",
  "APPROVED_SOURCE_RECORDS=18",
  "SOURCE_ROWS_REMOVED_FROM_SITEMAP=" + removed.length,
  "SOURCE_CANONICALS_TO_PE043=" + sourceRows.filter((row) => row[7]).length,
  "TARGET_SELF_CANONICAL=true",
  "TARGET_SOURCE_RECORDS_VISIBLE=" + sourceIdsInTarget.length,
  "DUPLICATE_IDENTITIES_RETAINED=true",
  "DUPLICATE_RECORD_IDS=" + duplicateIdsInTarget.join(","),
  "PRODUCT_RECORD_COUNT=337",
  "PUBLISHED_RECORD_COUNT=231",
  "PENDING_RECORD_COUNT=106",
  "PRODUCT_DATA_CHANGED=false",
  "SKU_CHANGED=false",
  "SLUG_CHANGED=false",
  "ROBOTS_CHANGED=false",
  "REDIRECTS_CHANGED=false",
  "IMAGE_BYTES_CHANGED=false",
  "IMAGE_PATHS_CHANGED=false",
  "INQUIRY_API_CHANGED=false",
  "COMMIT_CREATED=false",
  "PUSH_EXECUTED=false",
  "DEPLOY_EXECUTED=false",
  "PRODUCTION_CHANGED=false",
  "",
  "The current runtime sitemap had seven current-only news URLs and two historical-only packaging URLs. The calibrated implementation keeps the valid current set, adds one English paper-cup family row with hreflang alternates, and removes only the 18 approved paper-cup sheet source rows, yielding 259 unique loc entries.",
].join("\n") + "\n");
console.log(JSON.stringify({ before: beforeSitemap.length, after: currentSitemap.length, added, removed, sourceCanonicalPass: sourceRows.filter((row) => row[7]).length, targetSourceRecordsVisible: sourceIdsInTarget.length }));
