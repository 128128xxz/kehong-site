#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docs = path.join(root, "docs");
const map = JSON.parse(await fs.readFile(path.join(docs, "stage-3b2a-canonical-candidate-map.json"), "utf8"));
const catalog = JSON.parse(await fs.readFile(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const records = catalog.skus;
const byId = new Map(records.map((record) => [record.id, record]));
const targetId = "kh-fd-cupsheet-150350-pe-043";
const target = byId.get(targetId);
const source = map.records.map((candidate) => ({ ...candidate, record: byId.get(candidate.sourceRecordId) }));
const familyUrls = ["en", "zh", "id", "vi", "th", "ms"].map((locale) => "/" + locale + "/products/families/paper-cup-materials");
const csv = (rows) => rows.map((row) => row.map((value) => '"' + String(value ?? "").replaceAll('"', '""') + '"').join(",")).join("\n") + "\n";
const sourceHeaders = ["sourceUrl", "sourceRecordId", "sourceSku", "sourceSlug", "targetUrl", "canonicalDecision", "sitemapDecision", "status", "blockingReason"];
await fs.writeFile(path.join(docs, "stage-3b2b-approved-source-map.csv"), csv([
  sourceHeaders,
  ...source.map((candidate) => [candidate.sourceUrl, candidate.sourceRecordId, candidate.sourceSku, candidate.sourceSlug, candidate.targetUrl, candidate.canonicalDecision, candidate.sitemapDecision, "NOT_APPLIED", "duplicate displayed specification combination in approved set"]),
]));

const variantHeaders = ["role", "recordId", "sku", "slug", "gsmOrThickness", "structureOrFlute", "surfaceProcess", "finishingProcess", "commonSize", "material", "duplicateSpecKey", "selectorStatus"];
const variantKey = (record) => [record?.gsmOrThickness, record?.structureOrFlute, record?.surfaceProcess, record?.finishingProcess, record?.commonSize, record?.materialIds?.join("|")].join("|");
const keys = new Map();
for (const candidate of source) {
  const key = variantKey(candidate.record);
  const ids = keys.get(key) || [];
  ids.push(candidate.recordId);
  keys.set(key, ids);
}
await fs.writeFile(path.join(docs, "stage-3b2b-pe043-variant-map.csv"), csv([
  variantHeaders,
  ["target", target?.id, target?.sku, target?.slug, target?.gsmOrThickness, target?.structureOrFlute, target?.surfaceProcess, target?.finishingProcess, target?.commonSize, target?.material, variantKey(target), "NOT_IMPLEMENTED"],
  ...source.map((candidate) => [candidate.sourceRecordId, candidate.sourceRecordId, candidate.record?.sku, candidate.sourceSlug, candidate.record?.gsmOrThickness, candidate.record?.structureOrFlute, candidate.record?.surfaceProcess, candidate.record?.finishingProcess, candidate.record?.commonSize, candidate.record?.material, variantKey(candidate.record), (keys.get(variantKey(candidate.record)) || []).length > 1 ? "BLOCKED_DUPLICATE" : "NOT_IMPLEMENTED"]),
]));

await fs.writeFile(path.join(docs, "stage-3b2b-sitemap-diff.csv"), csv([
  ["url", "beforeInSitemap", "afterInSitemap", "change", "status", "reason"],
  ...familyUrls.map((url) => [url, "false", "false", "ADD", "NOT_APPLIED", "actual baseline is 276, not required 271"]),
  ...source.map((candidate) => [candidate.sourceUrl, "true", "true", "REMOVE", "NOT_APPLIED", "duplicate specification gate blocked canonical"]),
  [map.proposedTarget.url, "true", "true", "UNCHANGED", "NOT_APPLIED", "target page unchanged"],
]));

const affected = [
  ...source.map((candidate) => ({ url: candidate.sourceUrl, locale: "en", pageType: "product-source", recordId: candidate.sourceRecordId, beforeCanonical: candidate.sourceCurrentCanonical, reason: "canonical blocked by duplicate specification gate", action: "A3", rollback: "none" })),
  { url: map.proposedTarget.url, locale: "en", pageType: "product-target", recordId: targetId, beforeCanonical: map.proposedTarget.url, reason: "target unchanged because full mode blocked", action: "A1", rollback: "none" },
  ...familyUrls.map((url) => ({ url, locale: url.split("/")[1], pageType: "paper-cup-family", recordId: "", beforeCanonical: url, reason: "family-only addition blocked by actual sitemap baseline mismatch", action: "A2", rollback: "remove proposed sitemap row" })),
];
await fs.writeFile(path.join(docs, "stage-3b2b-index-state-diff.csv"), csv([
  ["url", "locale", "pageType", "recordId", "beforeHttpStatus", "afterHttpStatus", "beforeCanonical", "afterCanonical", "beforeRobots", "afterRobots", "beforeInSitemap", "afterInSitemap", "redirectBefore", "redirectAfter", "changeReason", "approvedActionId", "rollbackAction", "unexpectedChange"],
  ...affected.map((item) => [item.url, item.locale, item.pageType, item.recordId, "200", "200", item.beforeCanonical, item.beforeCanonical, "index,follow", "index,follow", "unchanged", "unchanged", "false", "false", item.reason, item.action, item.rollback, "false"]),
]));
await fs.writeFile(path.join(docs, "stage-3b2b-index-state-diff.md"), [
  "# Stage 3B-2B index-state diff",
  "",
  "No runtime index state was changed. The full 259 plan was blocked before implementation because the approved source set contains a duplicate displayed specification combination and the actual sitemap has 276 URLs rather than the required 271 baseline.",
  "",
  "Affected audit objects: 25 (18 source URLs, pe-043 target, 6 family URLs). All before/after states remain unchanged.",
  "",
].join("\n"));

await fs.writeFile(path.join(docs, "stage-3b2b-internal-link-diff.csv"), csv([
  ["location", "beforeTarget", "afterTarget", "status", "reason"],
  ["paper-cup-family", "existing family links", "existing family links", "NOT_APPLIED", "family-only sitemap addition blocked by baseline mismatch"],
  ["pe-043", "existing product detail links", "existing product detail links", "NOT_APPLIED", "variant center not implemented"],
  ["18 source pages", "self/detail links", "self/detail links", "NOT_APPLIED", "canonical implementation blocked"],
]));

await fs.writeFile(path.join(docs, "stage-3b2b-structured-data-review.md"), [
  "# Stage 3B-2B structured-data review",
  "",
  "PRODUCT_GROUP_STRUCTURED_DATA=DEFERRED_NOT_REQUIRED_FOR_CANONICAL",
  "No JSON-LD or product data was changed because the preflight did not permit the variant-center implementation.",
  "",
].join("\n"));
await fs.writeFile(path.join(docs, "stage-3b2b-visual-review.md"), [
  "# Stage 3B-2B visual review",
  "",
  "STATUS=NOT_CAPTURED_BLOCKED_PREIMPLEMENTATION",
  "",
  "No runtime page was changed, so implementation screenshots were not produced. Existing pages remain available for manual review. A new visual pass is required only after the duplicate-specification and sitemap-baseline blockers are resolved.",
  "",
].join("\n"));
await fs.writeFile(path.join(docs, "stage-3b2b-rollback-plan.md"), [
  "# Stage 3B-2B rollback plan",
  "",
  "No Stage 3B-2B runtime mutation was applied. There is therefore nothing to roll back.",
  "",
  "If a future approved run starts, rollback must be file/rule/URL scoped: remove only the six family sitemap rows, restore only the 18 source canonical decisions, and remove only the pe-043 variant-center presentation changes. Do not use reset, restore, checkout, clean, or stash.",
  "",
].join("\n"));
await fs.writeFile(path.join(docs, "stage-3b2b-rollback-actions.csv"), csv([
  ["actionId", "scope", "rollbackAction", "status"],
  ["A1", "pe-043 presentation", "remove only future variant-center presentation diff", "NOT_APPLIED"],
  ["A2", "six family sitemap rows", "remove only future six rows", "NOT_APPLIED"],
  ["A3", "18 source canonicals and removals", "restore only future source metadata/sitemap rules", "NOT_APPLIED"],
]));
await fs.writeFile(path.join(docs, "stage-3b2b-unresolved-backlog.md"), [
  "# Stage 3B-2B unresolved backlog",
  "",
  "1. Resolve the exact duplicate displayed specification combination for KH-FD-CUPSHEET-150350-PR-044 and KH-FD-CUPSHEET-150350-PR-068. The instruction forbids silently overwriting a duplicate, so full canonical implementation is blocked.",
  "2. Reconcile the stated SITEMAP_BEFORE=271 with the actual rendered sitemap count of 276. The existing validator also reports 271, while the current Next sitemap contains 276; no unrelated URL may be removed in this stage.",
  "3. After both blockers are resolved, rerun the complete preflight before changing pe-043, source canonicals, or sitemap.",
  "",
].join("\n"));
await fs.writeFile(path.join(docs, "stage-3b2b-summary.md"), [
  "# Stage 3B-2B summary",
  "",
  "STAGE_3B2B_STATUS=BLOCKED_PREIMPLEMENTATION",
  "STAGE_3B2B_PREFLIGHT=PASS_FAMILY_ONLY_CANONICAL_BLOCKED",
  "IMPLEMENTATION_MODE=NONE",
  "RUNTIME_CHANGED=false",
  "PRODUCT_DATA_CHANGED=false",
  "PRODUCT_RECORD_FIELDS_CHANGED=false",
  "PAGE_CHANGED=false",
  "SITEMAP_CHANGED=false",
  "CANONICAL_CHANGED=false",
  "ROBOTS_CHANGED=false",
  "REDIRECTS_CHANGED=false",
  "HREFLANG_CHANGED=false",
  "INQUIRY_API_CHANGED=false",
  "IMAGE_BYTES_CHANGED=false",
  "IMAGE_PATHS_CHANGED=false",
  "LOCALE_CHANGED=false",
  "",
  "PE043_EXISTS=true",
  "PE043_HTTP_STATUS=200",
  "PE043_PUBLISHED=true",
  "PE043_SELF_CANONICAL=true",
  "PE043_INDEXABLE=true",
  "PE043_CURRENTLY_IN_SITEMAP=true",
  "PE043_INCLUDED_IN_SOURCE_18=false",
  "PE043_VARIANT_HUB_IMPLEMENTED=false",
  "PE043_SOURCE_RECORDS_VISIBLE=0",
  "PE043_REAL_VARIANTS=0",
  "PE043_SYNTHETIC_VARIANTS=0",
  "PE043_FOOD_TRAY_CONTENT_PRESENT=false",
  "",
  "APPROVED_SOURCE_URL_COUNT=18",
  "SOURCE_CANONICAL_CHANGED=0",
  "SOURCE_HTTP_200_AFTER=18",
  "SOURCE_NOINDEX_ADDED=0",
  "SOURCE_ROBOTS_CHANGED=0",
  "SOURCE_REDIRECTS_ADDED=0",
  "SOURCE_REMOVED_FROM_SITEMAP=0",
  "SOURCE_CROSS_LOCALE_CANONICALS=0",
  "SOURCE_SKU_CHANGED=0",
  "SOURCE_SLUG_CHANGED=0",
  "",
  "PAPER_CUP_FAMILY_URLS_APPROVED=6",
  "PAPER_CUP_FAMILY_URLS_ADDED_TO_SITEMAP=0",
  "OTHER_FAMILY_URLS_ADDED_TO_SITEMAP=0",
  "ARCHIVED_ES_URLS_ADDED_TO_SITEMAP=0",
  "FOOD_TRAY_ANCHOR_ADDED_TO_SITEMAP=0",
  "SITEMAP_URLS_BEFORE=276",
  "SITEMAP_URLS_ADDED=0",
  "SITEMAP_URLS_REMOVED=0",
  "SITEMAP_TARGET_URLS_ADDED=0",
  "SITEMAP_URLS_AFTER=276",
  "SITEMAP_ARITHMETIC_PASS=false",
  "SITEMAP_UNEXPECTED_CHANGES=0",
  "SITEMAP_DUPLICATES=0",
  "",
  "IMAGE_SITEMAP_ENTRIES_BEFORE=380",
  "IMAGE_SITEMAP_ENTRIES_AFTER=380",
  "PRODUCT_COUNT=337",
  "PUBLISHED_PRODUCT_COUNT=231",
  "PENDING_PRODUCT_COUNT=106",
  "PRODUCT_GROUP_COUNT=6",
  "LOCALE_COUNT=6",
  "STATIC_PAGES_BEFORE=320",
  "STATIC_PAGES_AFTER=320",
  "",
  "PRODUCT_GROUP_STRUCTURED_DATA=DEFERRED_NOT_REQUIRED_FOR_CANONICAL",
  "COMMIT_CREATED=false",
  "PUSH_EXECUTED=false",
  "DEPLOY_EXECUTED=false",
  "PRODUCTION_CHANGED=false",
  "",
  "The family-only path was not applied because the actual sitemap baseline is 276, so adding six approved family URLs would yield 282 rather than the mandated 277. No unrelated sitemap rows were removed or altered.",
  "",
].join("\n"));
console.log("Generated Stage 3B-2B blocked reports");
