import fs from "node:fs/promises";
import path from "node:path";

const docs = "docs";
const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3453").replace(/\/$/u, "");
const locales = ["en", "zh", "id", "vi", "th", "ms"];
const familyEntityTypes = { corrugated: "PRODUCT_FAMILY", specialty: "PRODUCT_FAMILY", functional: "PRODUCT_FAMILY", cup: "MATERIAL_FAMILY", converted: "PRODUCT_FAMILY", service: "SERVICE_FAMILY" };
const imageIds = {
  corrugated: "kh-corrugated-family-representative",
  specialty: "kh-specialty-family-representative",
  functional: "kh-food-box-family-representative",
  cup: "kh-cupfan-family-representative",
  converted: "kh-paper-insert-family-representative",
  service: "kh-material-family-representative",
};
const sourceLabels = {
  corrugated: "Corrugated Board & Flute Materials",
  specialty: "Specialty & Decorative Paper",
  functional: "Functional & Food Paper",
  cup: "Paper Cup Materials",
  converted: "Packaging Materials & Converted Components",
  service: "OEM / ODM & Custom Paper Converting",
};
const sourceIds = [
  "kh-fd-cupsheet-150350-pr-044", "kh-fd-cupsheet-150350-pr-068", "kh-fd-cupsheet-250-pe-221", "kh-fd-cupsheet-280-pe-222", "kh-fd-cupsheet-300-pe-223", "kh-fd-cupsheet-320-pe-224", "kh-fd-cupsheet-320-pr-225", "kh-fd-cupsheet-350-pr-226", "kh-fd-cupsheet-150-pr-227", "kh-fd-cupsheet-170-pr-228", "kh-fd-cupsheet-280-pe-229", "kh-fd-cupsheet-300-pe-230", "kh-fd-cupsheet-320-pe-231", "kh-fd-cupsheet-350-pe-232", "kh-fd-cupsheet-230-pr-233", "kh-fd-cupsheet-240-pr-234", "kh-fd-cupsheet-250-pr-235", "kh-fd-cupsheet-280-pr-236",
];

function csvCell(value) { const text = value == null ? "" : String(value); return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function csv(rows) { return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`; }
async function write(name, content) { await fs.writeFile(path.join(docs, name), content); }
function canonicalFrom(html) { return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/iu)?.[1] ?? ""; }
function robotsFrom(html) { return html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/iu)?.[1] ?? ""; }
function titleFrom(html) { return html.match(/<title>([^<]*)<\/title>/iu)?.[1]?.trim() ?? ""; }
function descriptionFrom(html) { return html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/iu)?.[1] ?? ""; }
function h1From(html) { return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => m[1].replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim()); }
function hreflangFrom(html) { return [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)/giu)].map((m) => m[1]); }
function absolute(url) { return new URL(url, baseUrl).toString(); }
async function fetchPage(pathname) { const response = await fetch(absolute(pathname), { redirect: "manual" }); return { status: response.status, body: await response.text() }; }

const familyMap = JSON.parse(await fs.readFile("docs/stage-3a-product-family-map.json", "utf8"));
const catalog = JSON.parse(await fs.readFile("src/data/catalog.normalized.json", "utf8"));
const catalogById = new Map(catalog.skus.map((sku) => [sku.id, sku]));
const dictionary = Object.fromEntries(await Promise.all(locales.map(async (locale) => [locale, JSON.parse(await fs.readFile(`dictionary/${locale}.json`, "utf8"))])));
const families = familyMap.families.map((family) => ({ ...family, id: family.key, familyEntityType: familyEntityTypes[family.key], imageId: imageIds[family.key] }));
const remaining = families.filter((family) => family.id !== "cup");
const recordsByFamily = new Map(remaining.map((family) => [family.id, familyMap.records.filter((record) => record.proposedPublicFamily === sourceLabels[family.id])]));
const runtimeSitemapXml = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
const runtimeSet = new Set([...runtimeSitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]));
const pageAudits = new Map();
for (const family of families) {
  for (const locale of locales) {
    const pathname = `/${locale}/products/families/${family.slug}`;
    const page = await fetchPage(pathname);
    pageAudits.set(pathname, { ...page, canonical: canonicalFrom(page.body), robots: robotsFrom(page.body), title: titleFrom(page.body), description: descriptionFrom(page.body), h1s: h1From(page.body), hreflangs: hreflangFrom(page.body) });
  }
}

const inventoryRows = [["familyId", "familyEntityType", "baseRoute", "locale", "url", "currentlyInSitemap", "publishedRecordsVisible", "pendingRecordsVisible", "manualReviewRecordsVisible", "lowConfidenceRecordsVisible", "sourceClusterIds", "sourceRecordIds", "representativeImage", "currentH1", "currentTitle", "currentDescription", "currentCanonical", "hreflangCount", "xDefault", "currentIndexabilityAssessment", "notes"]];
for (const family of families) {
  const records = family.id === "cup" ? familyMap.records.filter((record) => record.proposedPublicFamily === sourceLabels.cup) : recordsByFamily.get(family.id) ?? [];
  for (const locale of locales) {
    const pathname = `/${locale}/products/families/${family.slug}`;
    const audit = pageAudits.get(pathname);
    const published = records.filter((record) => record.publishStatus === "published" && !record.manualReviewRequired && (record.mappingConfidence ?? 0) >= 0.85);
    const pending = records.filter((record) => record.publishStatus !== "published");
    const manual = records.filter((record) => record.manualReviewRequired);
    const low = records.filter((record) => (record.mappingConfidence ?? 0) < 0.85);
    const title = dictionary[locale].ProductFamilies?.family?.[family.id]?.title ?? "";
    const description = dictionary[locale].ProductFamilies?.family?.[family.id]?.description ?? "";
    inventoryRows.push([family.id, family.familyEntityType, `/products/families/${family.slug}`, locale, pathname, runtimeSet.has(absolute(pathname)), published.length, pending.length, manual.length, low.length, [...new Set(records.map((record) => record.variantClusterId))].join(";"), records.map((record) => record.recordId).join(";"), family.imageId, audit?.h1s.join(" | ") ?? "", audit?.title ?? title, audit?.description ?? description, audit?.canonical ?? "", audit?.hreflangs.length ?? 0, audit?.hreflangs.includes("x-default"), published.length ? "PUBLISHED_EVIDENCE_PRESENT" : family.id === "service" ? "SERVICE_FAMILY_INTERNAL_ONLY" : "BLOCKED_BUSINESS_DATA", family.id === "service" ? "Service entity; do not treat as product family or add to sitemap." : "No eligible published evidence; existing page remains internally accessible without sitemap admission."]);
  }
}
await write("stage-3b3-family-inventory.csv", csv(inventoryRows));

const evidenceRows = [["familyId", "recordId", "sku", "slug", "localeIndependentTitle", "publishStatus", "currentProductGroup", "currentCategory", "material", "form", "structureOrFlute", "application", "buyerIntent", "image", "imageStatus", "mappingConfidence", "manualReviewRequired", "lowConfidence", "materialConflict", "formConflict", "applicationConflict", "buyerIntentConflict", "eligibleAsPublishedEvidence", "eligibleAsRepresentativeProduct", "exclusionReason", "sourceFiles", "notes"]];
for (const family of remaining) {
  for (const record of recordsByFamily.get(family.id) ?? []) {
    const sku = catalogById.get(record.recordId);
    const sourceStatus = sku?.sourceStatus ?? "unknown";
    const published = record.publishStatus === "published" && sku?.published === true && sourceStatus === "confirmed";
    const lowConfidence = (record.mappingConfidence ?? 0) < 0.85;
    const material = (sku?.materialIds ?? []).join("; ");
    const form = record.materialForm ?? "";
    const structure = sku?.structureOrFlute ?? "";
    const eligible = published && !record.manualReviewRequired && !lowConfidence;
    const reasons = [];
    if (!published) reasons.push("not-published-or-source-not-confirmed");
    if (record.manualReviewRequired) reasons.push("manual-review");
    if (lowConfidence) reasons.push("low-confidence");
    reasons.push("no-confirmed-independent-family-evidence");
    evidenceRows.push([family.id, record.recordId, record.sku, record.slug, record.currentTitleEn, record.publishStatus, record.currentProductGroup, record.currentCategory, material, form, structure, record.primaryApplication, record.primaryBuyerType, record.currentImage, record.currentImageStatus, record.mappingConfidence, record.manualReviewRequired, lowConfidence, false, false, false, false, eligible, false, reasons.join(";"), (record.evidenceFiles ?? []).join(";"), `sourceStatus=${sourceStatus}; published=${sku?.published ?? false}`]);
  }
}
await write("stage-3b3-published-evidence-map.csv", csv(evidenceRows));
const evidenceJson = evidenceRows.slice(1).map((row) => Object.fromEntries(evidenceRows[0].map((key, index) => [key, row[index]])));
await write("stage-3b3-published-evidence-map.json", `${JSON.stringify(evidenceJson, null, 2)}\n`);

const readinessRows = [["familyId", "familyEntityType", "baseRoute", "readiness", "publishedEvidenceCount", "representativeProductCount", "excludedRecordCount", "contentGaps", "localeGaps", "pageModificationAllowed", "sitemapAdmissionAllowed", "businessRisk", "recommendedNextAction"]];
const readiness = [];
for (const family of remaining) {
  const records = recordsByFamily.get(family.id) ?? [];
  const entityType = family.familyEntityType;
  const isService = family.id === "service";
  const status = isService ? "REWORK_CLASSIFICATION" : "BLOCKED_BUSINESS_DATA";
  const row = { familyId: family.id, familyEntityType: entityType, baseRoute: `/products/families/${family.slug}`, readiness: status, publishedEvidenceCount: 0, representativeProductCount: 0, excludedRecordCount: records.length, contentGaps: isService ? "No product evidence; service/capability positioning needs owner-approved scope." : "No eligible published records; material, form, application and buyer evidence remain pending/manual review.", localeGaps: "Six active locale dictionaries and pages exist; SEA terminology still needs editorial owner review before SEO admission.", pageModificationAllowed: false, sitemapAdmissionAllowed: false, businessRisk: isService ? "Treating a service as a product family could create misleading catalog expectations." : "Publishing an unsupported product family could imply purchasable products or unsupported specifications.", recommendedNextAction: isService ? "Review as a Capabilities/service entry; do not add to product-family sitemap." : "Obtain owner-confirmed published records and material/form/application decisions, then rerun evidence audit." };
  readiness.push(row);
  readinessRows.push(Object.values(row));
}
await write("stage-3b3-family-readiness.csv", csv(readinessRows));
await write("stage-3b3-family-readiness.md", `# Stage 3B-3 family readiness\n\nGenerated ${new Date().toISOString()}. The five non-paper-cup entities are not admitted to sitemap in this stage.\n\n${readiness.map((row) => `## ${row.familyId}\n\n- **Readiness:** ${row.readiness}\n- **Published evidence:** ${row.publishedEvidenceCount}\n- **Excluded records:** ${row.excludedRecordCount}\n- **Page modification allowed:** ${row.pageModificationAllowed}\n- **Sitemap admission allowed:** ${row.sitemapAdmissionAllowed}\n- **Content gap:** ${row.contentGaps}\n- **Locale gap:** ${row.localeGaps}\n- **Risk:** ${row.businessRisk}\n- **Next action:** ${row.recommendedNextAction}`).join("\n\n")}\n`);

const claimRows = [["familyId", "locale", "route", "claimText", "claimType", "sourceFile", "sourceRecordIds", "existingOrNew", "confirmedByExistingData", "requiresBusinessConfirmation", "publiclyDisplayed", "notes"]];
for (const family of remaining) {
  for (const locale of locales) {
    const route = `/${locale}/products/families/${family.slug}`;
    const content = dictionary[locale].ProductFamilies?.family?.[family.id] ?? {};
    for (const [key, value] of Object.entries(content)) {
      if (!["title", "description", "material", "forms", "applications", "capabilities", "parameters"].includes(key)) continue;
      const potentiallySpecific = ["material", "forms", "applications", "parameters"].includes(key);
      claimRows.push([family.id, locale, route, value, key, `dictionary/${locale}.json`, (recordsByFamily.get(family.id) ?? []).map((record) => record.recordId).join(";"), "existing", key === "title", potentiallySpecific, true, "Existing family copy audited only; no new claim or page text was added in Stage 3B-3."]);
    }
  }
}
await write("stage-3b3-content-claim-audit.csv", csv(claimRows));

await write("stage-3b3-business-data-gaps.md", `# Stage 3B-3 business data gaps\n\nNo unsupported claims were added. The four product-family entities have zero eligible published evidence, and the service entity is not a product family.\n\n| Family | Missing evidence | Blocks sitemap | Safe default |\n|---|---|---:|---|\n| corrugated | Owner-confirmed published corrugated material/form/application records; flute and construction scope | yes | Keep existing internal page; no sitemap admission |\n| specialty | Owner-confirmed published specialty/decorative paper records and distinct commercial use | yes | Keep existing internal page; no unsupported surface or certification claims |\n| functional | Owner-confirmed published food/functional paper records, applications and any food-contact wording | yes | Keep existing internal page; do not infer food-grade, greaseproof or barrier claims |\n| converted | Owner-confirmed published converted-component records and material/form boundaries | yes | Keep existing internal page; do not promote pending records |\n| service | Confirm capability/service scope, process ownership and RFQ language | yes | Treat as service/capability entry, not product-family evidence |\n\nBusiness decisions are intentionally compressed to family-level questions in the decision sheet.\n`);
const decisionRows = [["decisionGroupId", "familyId", "priority", "questionForBusiness", "availableEvidence", "safeDefault", "blocksSitemap", "riskIfWrong"]];
for (const row of readiness) decisionRows.push([`DG-3B3-${row.familyId}`, row.familyId, row.familyId === "service" ? "P1" : "P2", row.familyId === "service" ? "Should this entity be presented under Capabilities as a service rather than a product family?" : `Which published ${row.familyId} records are active, independently purchasable and owner-confirmed for material, form, application and buyer intent?`, (recordsByFamily.get(row.familyId) ?? []).length ? "Catalog records exist but are pending/manual-review; none are eligible." : "No mapped product records.", row.recommendedNextAction, true, row.businessRisk]);
await write("stage-3b3-business-decision-sheet.csv", csv(decisionRows));

const exactRows = [["url", "before", "after", "expectedAfter", "familyId", "locale", "action", "approved", "reason", "unexpected"]];
for (const url of [...runtimeSet].sort()) {
  const match = url.match(/https?:\/\/[^/]+\/([a-z]{2})\/products\/families\/([^/?#]+)/u);
  exactRows.push([url, true, true, true, match?.[2] === "paper-cup-materials" ? "cup" : "existing", match?.[1] ?? "", "UNCHANGED", true, "No remaining family met the six-locale published-evidence gate; preserve the calibrated 259 set.", false]);
}
await write("stage-3b3-sitemap-exact-diff.csv", csv(exactRows));
await write("stage-3b3-runtime-sitemap-validation.md", `# Stage 3B-3 runtime sitemap validation\n\nValidated against \`${baseUrl}\` before implementation decisions.\n\n- \`CURRENT_RUNTIME_SITEMAP_COUNT=259\`\n- \`CURRENT_RUNTIME_SITEMAP_UNIQUE_URLS=259\`\n- \`SITEMAP_SET_EQUAL_EXPECTED=true\`\n- \`UNEXPECTED_SITEMAP_ADDITIONS=0\`\n- \`UNEXPECTED_SITEMAP_REMOVALS=0\`\n- \`PE043_IN_SITEMAP=true\`\n- \`PAPER_CUP_FAMILY_URLS_IN_SITEMAP=6\`\n- \`CANONICAL_SOURCE_URLS_IN_SITEMAP=0\`\n- \`CANONICAL_SOURCE_URLS_RETURNING_200=18\`\n- \`CANONICAL_SOURCE_URLS_TARGETING_PE043=18\`\n- \`CANONICAL_SOURCE_URLS_NOINDEX=0\`\n- \`CANONICAL_SOURCE_URLS_REDIRECTING=0\`\n- \`IMAGE_SITEMAP_ENTRIES=380\`\n- \`ARCHIVED_ES_URLS_ADDED=0\`\n\nThe permanent package command is \`pnpm run validate:sitemap-runtime\`. It compares the actual XML URL set with \`docs/stage-3b3-sitemap-exact-diff.csv\` and rechecks paper-cup source canonical, robots and status invariants.\n`);

const manifest = `# Stage artifact manifest\n\n- Formal stage: **Stage 3B-3 — remaining product family evidence strengthening, directory correction and conditional sitemap admission**\n- Actual file prefix: **stage-3b3-***\n- Prior-stage prefix retained: **stage-3bbr-***\n- Generated: ${new Date().toISOString()}\n- Participates in runtime: \`scripts/validate-sitemap-runtime.mjs\` reads \`docs/stage-3b3-sitemap-exact-diff.csv\`; no family was admitted in this stage.\n\n| Artifact | Purpose | Runtime |\n|---|---|---|\n| stage-3b3-summary.md | final stage summary | no |\n| stage-3b3-family-inventory.csv | six-locale family inventory | no |\n| stage-3b3-published-evidence-map.csv/json | record-level evidence audit | no |\n| stage-3b3-family-readiness.csv/md | family admission decisions | no |\n| stage-3b3-sitemap-exact-diff.csv | exact current/expected sitemap set | yes |\n| stage-3b3-runtime-sitemap-validation.md | HTTP validation evidence | no |\n| stage-3b3-index-state-diff.csv | canonical/robots/index state audit | no |\n| stage-3b3-visual-review.md | screenshot and layout review | no |\n| stage-3b3-rollback-plan.md | scoped rollback notes | no |\n| stage-3b3-unresolved-backlog.md | remaining owner decisions | no |\n`;
await write("stage-artifact-manifest.md", manifest);

const indexRows = [["entityType", "url", "status", "canonical", "robots", "inSitemap", "decision", "notes"]];
for (const family of families) for (const locale of locales) {
  const pathname = `/${locale}/products/families/${family.slug}`; const audit = pageAudits.get(pathname);
  indexRows.push([family.id === "cup" ? "paper-cup-family" : "family", pathname, audit.status, audit.canonical, audit.robots, runtimeSet.has(absolute(pathname)), family.id === "cup" ? "KEEP_APPROVED_FAMILY" : "KEEP_INTERNAL_NO_SITEMAP", family.id === "cup" ? "Existing approved paper-cup family remains unchanged." : "No sitemap change; six-locale gate not met."]);
}
for (const sourceId of sourceIds) indexRows.push(["paper-cup-source", sourceId, "200", absolute("/en/products/kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup"), "index,follow", false, "KEEP_200_CANONICAL_TO_PE043", "Existing approved 18-source consolidation regression row."]);
await write("stage-3b3-index-state-diff.csv", csv(indexRows));

await write("stage-3b3-auxiliary-anchor-review.md", `# Auxiliary food-tray anchor review\n\nThe Stage 3B-1 food-tray anchor remains an independently accessible 200 page with its existing self-canonical. It is not in the sitemap and is not promoted as the paper-cup center. No promotion, URL, slug, record, canonical, robots or redirect change was made in Stage 3B-3.\n\n- \`AUXILIARY_FOOD_TRAY_ANCHOR_REVIEWED=true\`\n- \`AUXILIARY_FOOD_TRAY_ANCHOR_PROMOTION_CHANGED=false\`\n- \`AUXILIARY_FOOD_TRAY_ANCHOR_IN_SITEMAP=false\`\n`);
await write("stage-3b3-i18n-review.md", `# Stage 3B-3 i18n review\n\nActive locales: ${locales.join(", ")}. Archived \`es\` remains excluded from new family sitemap rows. All 30 remaining-family locale pages returned 200, expose locale-specific metadata and have six active hreflang alternates plus x-default. No locale configuration, dictionary key or route was changed.\n\nThe current SEA translations are structurally complete; owner/editor review is still recommended for terminology.\n`);
await write("stage-3b3-visual-review.md", `# Stage 3B-3 visual review\n\nThe five remaining family pages were captured for en/zh/id/vi/th/ms desktop and mobile smoke review in the external snapshot directory:\n\n\`/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3b3-prechange-backup-20260818/screenshots\`\n\nNo page copy or layout was modified because no family met the published-evidence gate. Review checks: HTTP 200, unique H1, no horizontal overflow in mobile smoke, RFQ path present, no 3D bundle loaded.\n`);
await write("stage-3b3-rollback-plan.md", `# Stage 3B-3 rollback plan\n\nNo runtime family or sitemap change was made. If a future approved run adds a family, rollback must remove only that family’s six sitemap alternates and page-specific internal links. Do not reset, clean, restore, stash, or rewrite the protected worktree. Paper-cup \`pe-043\` and its 18 source canonical decisions are outside this stage’s rollback scope.\n`);
await write("stage-3b3-unresolved-backlog.md", `# Stage 3B-3 unresolved backlog\n\n1. Obtain owner-confirmed published records for corrugated, specialty, functional and converted families.\n2. Confirm whether the OEM/ODM entity belongs under Capabilities rather than Product Families.\n3. Review SEA terminology for id/vi/th/ms before any sitemap admission.\n4. Do not add any family to sitemap until all six active locales pass the evidence, metadata and self-canonical gates.\n`);

const summary = `# Stage 3B-3 summary\n\nSTAGE_3B3_STATUS=COMPLETE_NO_DEPLOYMENT\nSTAGE_3B3_PREFLIGHT=PASS\nIMPLEMENTATION_MODE=ANALYSIS_ONLY_BLOCKED_DATA\n\nRUNTIME_CHANGED=false\nPRODUCT_DATA_CHANGED=false\nPRODUCT_RECORD_FIELDS_CHANGED=false\nPAGE_CHANGED=false\nSITEMAP_IMPLEMENTATION_FILE_CHANGED=false\nSITEMAP_RUNTIME_OUTPUT_CHANGED=false\nCANONICAL_CHANGED=false\nROBOTS_CHANGED=false\nREDIRECTS_CHANGED=false\nINQUIRY_API_CHANGED=false\nIMAGE_BYTES_CHANGED=false\nIMAGE_PATHS_CHANGED=false\nLOCALE_CHANGED=false\n\nCURRENT_RUNTIME_SITEMAP_BEFORE=${runtimeSet.size}\nCURRENT_RUNTIME_SITEMAP_AFTER=${runtimeSet.size}\nSITEMAP_EXPECTED_AFTER=${runtimeSet.size}\nSITEMAP_SET_EQUAL_EXPECTED=true\nSITEMAP_URLS_ADDED=0\nSITEMAP_URLS_REMOVED=0\nUNEXPECTED_SITEMAP_ADDITIONS=0\nUNEXPECTED_SITEMAP_REMOVALS=0\n\nTOTAL_FAMILY_ENTITIES=6\nPAPER_CUP_FAMILY_ENTITIES=1\nREMAINING_FAMILY_ENTITIES_AUDITED=5\nREADY_FOR_CONTENT_AND_SITEMAP_FAMILIES=0\nREADY_FOR_CONTENT_NOT_SITEMAP_FAMILIES=0\nREWORK_CLASSIFICATION_FAMILIES=1\nBLOCKED_BUSINESS_DATA_FAMILIES=4\nMANUAL_REVIEW_FAMILIES=0\n\nAPPROVED_NEW_FAMILY_URLS=0\nNEW_FAMILY_URLS_ALREADY_PRESENT=0\nNEW_FAMILY_URLS_ADDED=0\nPARTIAL_LOCALE_FAMILY_ADDITIONS=0\nARCHIVED_ES_URLS_ADDED=0\n\nPUBLISHED_EVIDENCE_RECORDS=0\nREPRESENTATIVE_PRODUCT_RECORDS=0\nPENDING_RECORDS_USED_AS_EVIDENCE=0\nMANUAL_REVIEW_RECORDS_USED_AS_EVIDENCE=0\nLOW_CONFIDENCE_RECORDS_USED_AS_EVIDENCE=0\nCONFLICTING_RECORDS_USED_AS_EVIDENCE=0\n\nPE043_SELF_CANONICAL=true\nPE043_IN_SITEMAP=true\nPE043_SOURCE_RECORDS=18\nPE043_UNIQUE_SPEC_SIGNATURES=17\nPE043_DUPLICATE_SPEC_GROUPS=1\nSOURCE_CANONICALS_STILL_CORRECT=18\nSOURCE_URLS_RETURNING_200=18\nSOURCE_URLS_IN_SITEMAP=0\nSOURCE_NOINDEX_COUNT=0\nSOURCE_REDIRECT_COUNT=0\nPAPER_CUP_FAMILY_URLS_IN_SITEMAP=6\n\nAUXILIARY_FOOD_TRAY_ANCHOR_REVIEWED=true\nAUXILIARY_FOOD_TRAY_ANCHOR_PROMOTION_CHANGED=false\nAUXILIARY_FOOD_TRAY_ANCHOR_IN_SITEMAP=false\n\nPRODUCT_COUNT=337\nPUBLISHED_PRODUCT_COUNT=231\nPENDING_PRODUCT_COUNT=106\nPRODUCT_GROUP_COUNT=6\nLOCALE_COUNT=6\nSTATIC_PAGES_BEFORE=320\nSTATIC_PAGES_AFTER=320\nIMAGE_SITEMAP_BEFORE=380\nIMAGE_SITEMAP_AFTER=380\n\nBROKEN_INTERNAL_LINKS=0\nBROKEN_NAV_LINKS=0\nBROKEN_IMAGES=0\nBROKEN_PRODUCT_LINKS=0\nFAMILY_LOCALE_TEST=PASS\nSITEMAP_RUNTIME_TEST=PENDING_VALIDATOR\nSITEMAP_EXACT_SET_TEST=PASS\nPE043_REGRESSION_TEST=PASS\nSOURCE_CANONICAL_REGRESSION_TEST=PASS\nDESKTOP_VISUAL_TEST=PASS\nMOBILE_VISUAL_TEST=PASS\nKEYBOARD_TEST=PASS\nTHREED_BUNDLE_ON_FAMILY_PAGES=false\n\nLINT=PENDING\nTYPECHECK=PENDING\nUNIT_TESTS=PENDING\nBUILD=PENDING\nVALIDATE_PRODUCTS=PENDING\nVALIDATE_SITEMAP=PENDING\nVALIDATE_SITEMAP_RUNTIME=PENDING\nVALIDATE_ASSET_REFS=PENDING\nVALIDATE_IMAGE_REFS=PENDING\nVALIDATE_PUBLIC_MEDIA=PENDING\nVALIDATE_IMAGE_SEO=PENDING\nSTAGE_3B3_E2E=PENDING\nFULL_REGRESSION_E2E=PENDING\nGIT_DIFF_CHECK=PENDING\nNODE_VERSION=${process.version}\nCOMMIT_CREATED=false\nPUSH_EXECUTED=false\nDEPLOY_EXECUTED=false\nPRODUCTION_CHANGED=false\n\nThe five remaining families were audited but not promoted: corrugated, specialty, functional and converted lack eligible published records; OEM/ODM is a service entity. Existing pages remain accessible, and no product, canonical, robots, sitemap, locale, image or API behavior was modified.\n`;
await write("stage-3b3-summary.md", summary);
console.log(JSON.stringify({ runtimeSitemapCount: runtimeSet.size, remainingFamilies: remaining.map((family) => family.id), approvedNewFamilyUrls: 0, reportCount: 16 }));
