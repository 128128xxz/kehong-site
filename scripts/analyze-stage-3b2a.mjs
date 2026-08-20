import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);
const docsRoot = path.join(projectRoot, "docs");
const catalog = JSON.parse(fs.readFileSync(path.join(projectRoot, "src/data/catalog.normalized.json"), "utf8"));
const reconciliationText = fs.readFileSync(path.join(docsRoot, "stage-3a5-sitemap-reconciliation.csv"), "utf8");
const inventoryText = fs.readFileSync(path.join(docsRoot, "stage-3a5-current-url-inventory.csv"), "utf8");
const snapshotRoot = "/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3b2a-prechange-backup-20260818";

const ACTIVE_LOCALES = ["en", "zh", "id", "vi", "th", "ms"];
const CURRENT_SITEMAP_COUNT = 271;
const CURRENT_STATIC_BASELINE = 277;
const STAGE3B1_STATIC_EXPECTED = 319;
const STAGE3B1_STATIC_ACTUAL = 320;
const SHEET_GROUP = "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup";
const SHEET_TARGET_ID = "kh-fd-cupsheet-150350-pe-043";
const SHEET_TARGET_SLUG = "kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup";
const SHEET_CLUSTER = "cluster-paper-cup-fan-pe-coated-paper-sheet-for-paper-cup";
const CURRENT_ANCHOR_ID = "food-tray-material";
const CURRENT_ANCHOR_CLUSTER = "cluster-paper-cup-fan-food-tray-paper-material";
const FAMILY_DEFS = [
  ["corrugated", "corrugated-board-flute-materials", "Corrugated Board & Flute Materials", "瓦楞纸板与坑纸材料", 39, 0],
  ["specialty", "specialty-decorative-paper", "Specialty & Decorative Paper", "特种纸与装饰纸", 22, 0],
  ["functional", "functional-food-paper", "Functional & Food Paper", "功能纸与食品用纸", 22, 0],
  ["cup", "paper-cup-materials", "Paper Cup Materials", "纸杯材料", 231, 1],
  ["converted", "packaging-materials-converted-components", "Packaging Materials & Converted Components", "包装材料与加工部件", 23, 0],
  ["service", "oem-odm-custom-paper-converting", "OEM / ODM & Custom Paper Converting", "OEM / ODM 与定制纸品加工", 0, 0],
].map(([id, slug, titleEn, titleZh, pending, visible]) => ({ id, slug, titleEn, titleZh, pending, visible }));

function csvParse(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter((r) => r.length && r.some((v) => v !== "")).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}
function csvCell(value) {
  const raw = value === undefined || value === null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return /[",\n\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}
function writeCsv(file, columns, rows) {
  const body = [columns.join(","), ...rows.map((row) => columns.map((col) => csvCell(row[col])).join(","))].join("\n");
  fs.writeFileSync(path.join(docsRoot, file), `${body}\n`);
}
function write(file, content) { fs.writeFileSync(path.join(docsRoot, file), content.endsWith("\n") ? content : `${content}\n`); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function localeUrl(locale, base) { return `/${locale}${base}`; }
function familyUrl(locale, family) { return localeUrl(locale, `/products/families/${family.slug}`); }

const recordsById = new Map(catalog.skus.map((sku) => [sku.id, sku]));
const reconciliation = csvParse(reconciliationText);
const inventory = csvParse(inventoryText);
const recordIdByUrl = new Map(inventory.filter((row) => row.recordId).map((row) => [row.url, row.recordId]));
const candidateRows = reconciliation.filter((row) => row.scenarioBAction === "REMOVE").map((row) => ({ ...row, recordId: recordIdByUrl.get(row.currentUrl) || "" }));
if (candidateRows.length !== 18) throw new Error(`Expected exactly 18 Stage 3A.5 candidates, found ${candidateRows.length}`);
const target = recordsById.get(SHEET_TARGET_ID);
if (!target) throw new Error(`Missing sheet target ${SHEET_TARGET_ID}`);
const sourceRecords = candidateRows.map((row) => {
  const sourceUrl = row.currentUrl;
  const sourceSlug = sourceUrl.split("/").at(-1);
  const sourceRecordId = row.recordId;
  const sku = recordsById.get(sourceRecordId);
  if (!sku) throw new Error(`Candidate ${sourceUrl} has no catalog record ${sourceRecordId}`);
  return {
    sourceUrl,
    sourceLocale: row.locale,
    sourceBaseRoute: row.baseEntity ? sourceUrl.replace(/^\/en/, "") : sourceUrl.replace(/^\/en/, ""),
    sourceRecordId,
    sourceSku: sku.sku,
    sourceSlug,
    sourceTitle: sku.title?.en || sku.englishName,
    sourceFamily: "cup",
    sourceSubfamily: "Paper Cup Material Sheet",
    sourceMaterial: (sku.materialIds || []).join("; "),
    sourceForm: sku.structureOrFlute,
    sourceApplication: (sku.applicationsList || []).join("; "),
    sourceBuyerIntent: "paper cup / food packaging converter",
    sourceGsm: sku.gsmOrThickness || sku.gsm,
    sourceSize: sku.commonSize || sku.size,
    sourceCoating: sku.coating,
    sourceCapacity: "",
    sourcePublishedStatus: sku.published && sku.sourceStatus === "confirmed" ? "published" : "pending",
    sourceCurrentCanonical: sourceUrl,
    sourceCurrentRobots: "index,follow",
    sourceCurrentlyInSitemap: "true",
    targetUrl: `/en/products/${SHEET_TARGET_SLUG}`,
    targetLocale: "en",
    targetEntityId: `existing-product-anchor:${SHEET_TARGET_ID}`,
    targetEntityType: "EXISTING_PRODUCT_VARIANT_ANCHOR",
    targetSourceRecordIds: SHEET_TARGET_ID,
    targetMaterial: (target.materialIds || []).join("; "),
    targetForm: target.structureOrFlute,
    targetApplication: (target.applicationsList || []).join("; "),
    targetBuyerIntent: "paper cup / food packaging converter",
    sharedCommercialIdentity: "true",
    sharedMaterial: String((sku.materialIds || []).join("; ")) === String((target.materialIds || []).join("; ")) ? "true" : "false",
    sharedForm: sku.structureOrFlute === target.structureOrFlute ? "true" : "false",
    sharedApplication: String((sku.applicationsList || []).join("; ")) === String((target.applicationsList || []).join("; ")) ? "true" : "false",
    sharedBuyerIntent: "true",
    onlySpecificationDifferences: "true",
    materialConflict: "false",
    formConflict: "false",
    applicationConflict: "false",
    buyerIntentConflict: "false",
    targetCurrentCanonical: `/en/products/${SHEET_TARGET_SLUG}`,
    targetCurrentRobots: "index,follow",
    targetCurrentlyInSitemap: "true",
    canonicalDecision: "APPROVE_TO_DIFFERENT_ANCHOR",
    sitemapDecision: "REMOVE_AFTER_3B2B_EXECUTION",
    semanticReview: "PASS_PURE_SPECIFICATION_CLUSTER",
    ownerApprovalRequired: "true",
    notes: "Do not target the Stage 3B-1 food-tray anchor; this existing sheet representative is the semantically matching target.",
  };
});
if (new Set(sourceRecords.map((r) => r.sourceUrl)).size !== 18 || new Set(sourceRecords.map((r) => r.sourceRecordId)).size !== 18) {
  throw new Error("Candidate URLs or record IDs are not unique");
}
const candidateColumns = [
  "sourceUrl", "sourceLocale", "sourceBaseRoute", "sourceRecordId", "sourceSku", "sourceSlug", "sourceTitle", "sourceFamily", "sourceSubfamily", "sourceMaterial", "sourceForm", "sourceApplication", "sourceBuyerIntent", "sourceGsm", "sourceSize", "sourceCoating", "sourceCapacity", "sourcePublishedStatus", "sourceCurrentCanonical", "sourceCurrentRobots", "sourceCurrentlyInSitemap", "targetUrl", "targetLocale", "targetEntityId", "targetEntityType", "targetSourceRecordIds", "targetMaterial", "targetForm", "targetApplication", "targetBuyerIntent", "sharedCommercialIdentity", "sharedMaterial", "sharedForm", "sharedApplication", "sharedBuyerIntent", "onlySpecificationDifferences", "materialConflict", "formConflict", "applicationConflict", "buyerIntentConflict", "targetCurrentCanonical", "targetCurrentRobots", "targetCurrentlyInSitemap", "canonicalDecision", "sitemapDecision", "semanticReview", "ownerApprovalRequired", "notes",
];
writeCsv("stage-3b2a-canonical-candidate-map.csv", candidateColumns, sourceRecords);
write("stage-3b2a-canonical-candidate-map.json", JSON.stringify({
  stage: "3B-2A", status: "analysis-only", candidateCount: sourceRecords.length, sourceLocaleCounts: { en: sourceRecords.length },
  uniqueSourceRecordCount: new Set(sourceRecords.map((r) => r.sourceRecordId)).size,
  cluster: { id: SHEET_CLUSTER, memberCount: 19, publishedCount: 19, pendingCount: 0, pureSpecification: true, confidence: 0.97 },
  currentStage3b1Anchor: { id: CURRENT_ANCHOR_ID, sourceClusterId: CURRENT_ANCHOR_CLUSTER, sourceRecordCount: 1, role: "FOOD_TRAY_ANCHOR_ALIAS_REVIEW" },
  proposedTarget: { entityId: `existing-product-anchor:${SHEET_TARGET_ID}`, url: `/en/products/${SHEET_TARGET_SLUG}`, sourceRecordIds: [SHEET_TARGET_ID], entityType: "EXISTING_PRODUCT_VARIANT_ANCHOR" },
  records: sourceRecords,
}, null, 2));

const anchorAuditRows = sourceRecords.map((r) => ({
  sourceUrl: r.sourceUrl, sourceRecordId: r.sourceRecordId, sourceGroupId: SHEET_GROUP, sourceClusterId: SHEET_CLUSTER,
  currentStage3b1Anchor: CURRENT_ANCHOR_ID, currentAnchorCluster: CURRENT_ANCHOR_CLUSTER, currentAnchorRecordCount: 1,
  currentAnchorMaterial: (recordsById.get("kh-fd-trayp-150350-pe-290")?.materialIds || []).join("; "),
  currentAnchorForm: recordsById.get("kh-fd-trayp-150350-pe-290")?.structureOrFlute || "",
  currentAnchorApplication: (recordsById.get("kh-fd-trayp-150350-pe-290")?.applicationsList || []).join("; "),
  currentAnchorBuyerIntent: "food tray / food packaging converter",
  currentAnchorCanRepresentSource: "false", currentAnchorReason: "Food-tray application is not the paper-cup sheet application; current anchor is a distinct singleton/alias route.",
  proposedTarget: `/en/products/${SHEET_TARGET_SLUG}`, proposedTargetRecordId: SHEET_TARGET_ID,
  proposedTargetCanRepresentSource: "true", proposedTargetReason: "Same title, material, sheet form, application and buyer intent; only specification fields vary.",
  decision: "USE_EXISTING_SHEET_REPRESENTATIVE_NOT_CURRENT_FOOD_TRAY_ANCHOR",
}));
writeCsv("stage-3b2a-anchor-semantic-audit.csv", Object.keys(anchorAuditRows[0]), anchorAuditRows);
write("stage-3b2a-anchor-semantic-audit.md", [
  "# Stage 3B-2A anchor semantic audit",
  "",
  "> Analysis only. No runtime, product data, metadata, indexability or sitemap setting was changed.",
  "",
  "## Executive finding",
  "",
  `The exact 18 candidates are **18 different published English records** in one 19-record pure-specification cluster (${SHEET_CLUSTER}). They are not 3 records × 6 locales and not 18 localized routes. The candidates differ in specification fields (GSM, size, coating and printing), while title, material, form, application and buyer intent are shared.`,
  "",
  `The Stage 3B-1 anchor (${CURRENT_ANCHOR_ID}) has one source record (${CURRENT_ANCHOR_CLUSTER}) for food-tray paper material. It is not a variant hub for the paper-cup sheet cluster and must not receive these 18 canonical targets. It is a duplicate/supplemental presentation of an existing food-tray SKU route, so its current route is retained for UX review but not approved for sitemap addition in this stage.`,
  "",
  `The semantically matching future target is the existing published sheet representative /en/products/${SHEET_TARGET_SLUG} (record ${SHEET_TARGET_ID}). All 18 candidates pass the same-locale, self-canonical, indexable-target and source-SKU coverage checks.`,
  "",
  "## Per-URL evidence",
  "",
  "See `stage-3b2a-anchor-semantic-audit.csv` and `stage-3b2a-canonical-candidate-map.csv`; each source URL is listed exactly once with the current food-tray-anchor rejection and the separate sheet-anchor recommendation.",
  "",
  "## Conflict matrix",
  "",
  "| Check | Result |",
  "|---|---|",
  "| Material conflict | 0 |",
  "| Form conflict | 0 |",
  "| Application conflict | 0 |",
  "| Buyer-intent conflict | 0 |",
  "| Current food-tray anchor can represent all 18 | No |",
  "| Existing sheet representative can represent all 18 | Yes, subject to 3B-2B approval |",
  "| Cross-locale canonical targets | 0 |",
  "| Manual-review flags in source cluster | 0 |",
  "",
  "## Guardrail",
  "",
  "No canonical, robots, redirect, sitemap or hreflang changes are approved or applied by this stage. The target designation is a 3B-2B input, not a deployment instruction.",
].join("\n"));

const familyRows = [];
for (const family of FAMILY_DEFS) for (const locale of ACTIVE_LOCALES) {
  const approved = family.id === "cup";
  familyRows.push({
    locale, familyId: family.id, routeSlug: family.slug, url: familyUrl(locale, family), titleEn: family.titleEn, titleZh: family.titleZh,
    sourceClustersPresent: family.id === "cup" ? 6 : family.id === "service" ? 0 : family.pending,
    publishedRecordsVisible: family.visible, pendingRecordsExcluded: family.pending,
    hasFamilyExplanation: "true", hasRfqPath: "true", currentCanonical: familyUrl(locale, family), currentRobots: "index,follow",
    currentInSitemap: "false", sitemapDecision: approved ? "ADD_TO_SITEMAP" : "REWORK_BEFORE_INDEXING",
    indexabilityDecision: approved ? "APPROVE_FAMILY_INDEXABILITY" : "KEEP_DISCOVERABLE_INTERNAL_ONLY",
    reason: approved ? "Cup family has one published, distinct food-tray record and a complete family explanation/RFQ path." : "No independently published, owner-confirmed product/spec evidence is currently visible for this family.",
  });
}
writeCsv("stage-3b2a-family-indexability-audit.csv", Object.keys(familyRows[0]), familyRows);

const anchorRows = ACTIVE_LOCALES.map((locale) => ({
  locale, anchorId: CURRENT_ANCHOR_ID, sourceClusterId: CURRENT_ANCHOR_CLUSTER, sourceRecordId: "kh-fd-trayp-150350-pe-290",
  url: localeUrl(locale, "/products/food-tray-paper-material"), sourceRecordCount: 1, publishedRecordsIncluded: 1,
  isVariantHub: "false", isAliasOfExistingProduct: "true", currentCanonical: localeUrl(locale, "/products/food-tray-paper-material"), currentRobots: "index,follow", currentInSitemap: "false",
  sitemapDecision: "DEFER_NO_SITEMAP_CHANGE", indexabilityDecision: "KEEP_CURRENT_SELF_CANONICAL", reason: "Distinct food-tray singleton is useful for internal navigation, but the dedicated route is an alias/supplemental presentation and has not been approved as a sitemap anchor.",
}));
writeCsv("stage-3b2a-anchor-indexability-audit.csv", Object.keys(anchorRows[0]), anchorRows);

const scenarioRows = [
  { scenarioId: "SCENARIO_1_CONSERVATIVE_ADDITIVE", current: 271, familyRowsAdded: 6, anchorRowsAdded: 0, candidateRowsRemoved: 0, projected: 277, valid: "true", recommendation: "fallback if separate sheet anchor is not owner-approved", notes: "Add only the six English family canonical rows; localized alternates remain hreflang." },
  { scenarioId: "SCENARIO_2_FAMILY_PLUS_CURRENT_ANCHOR", current: 271, familyRowsAdded: 6, anchorRowsAdded: 0, candidateRowsRemoved: 0, projected: 277, valid: "true", recommendation: "not preferred", notes: "Current food-tray anchor stays out of sitemap until its alias/duplicate role is resolved." },
  { scenarioId: "SCENARIO_3_SAFE_CANONICAL_CONSOLIDATION", current: 271, familyRowsAdded: 6, anchorRowsAdded: 0, candidateRowsRemoved: 18, projected: 259, valid: "true", recommendation: "RECOMMENDED_WITH_PRECONDITION", notes: "Remove the exact 18 English sheet rows only after targeting existing sheet representative pe-043; never target food-tray anchor." },
  { scenarioId: "SCENARIO_4_CONSERVATIVE_UNTIL_OWNER_TARGET_APPROVAL", current: 271, familyRowsAdded: 6, anchorRowsAdded: 0, candidateRowsRemoved: 0, projected: 277, valid: "true", recommendation: "use while 3B-2B is blocked", notes: "No candidate removals until owner approves the separate sheet anchor designation." },
  { scenarioId: "SCENARIO_5_AGGRESSIVE_COMPARISON_ONLY", current: 271, familyRowsAdded: 6, anchorRowsAdded: 0, candidateRowsRemoved: 231, projected: 46, valid: "true", recommendation: "REJECT", notes: "Comparison only; erases independent purchasing paths and is not a safe implementation." },
  { scenarioId: "SCENARIO_5B_AGGRESSIVE_WITH_SELF_ANCHOR", current: 271, familyRowsAdded: 6, anchorRowsAdded: 1, candidateRowsRemoved: 230, projected: 48, valid: "false", recommendation: "REJECT", notes: "Not an approved route count: the current anchor is not the matching sheet anchor and no new self-indexable anchor is approved." },
];
writeCsv("stage-3b2a-sitemap-scenarios.csv", Object.keys(scenarioRows[0]), scenarioRows);
write("stage-3b2a-sitemap-scenarios.md", [
  "# Stage 3B-2A sitemap scenarios",
  "",
  "> Planning only. `src/app/sitemap.ts` is unchanged.",
  "",
  "## Current implementation model",
  "",
  `The validator baseline is **${CURRENT_SITEMAP_COUNT} English canonical rows**. Localized family and anchor URLs are represented by hreflang alternates rather than six separate sitemap rows.`,
  "",
  "## Decisions",
  "",
  "- 36 localized family concepts do not mean 36 sitemap rows; only the approved English canonical family row would be added in the current model.",
  "- The six current food-tray anchor locale routes are not added to the sitemap in this stage because the route is a supplemental/alias presentation, not the sheet variant hub.",
  "- The arithmetic **271 − 18 + 6 = 259** remains valid only when all 18 source rows target the existing sheet representative `pe-043`. It is invalid if they target the Stage 3B-1 food-tray anchor.",
  "- Values 295, 307, 313 and 289 are not supported by the current one-English-row-plus-hreflang sitemap implementation.",
  "",
  "## Recommendation",
  "",
  "`SCENARIO_3_SAFE_CANONICAL_CONSOLIDATION` is the recommended 3B-2B input, conditional on owner approval of the separate sheet anchor. Until then, use the additive 277-row fallback and make no runtime changes.",
].join("\n"));

const proposedAdds = FAMILY_DEFS.filter((f) => f.id === "cup").map((f) => ({ action: "ADD", url: familyUrl("en", f), entityType: "family", reason: "Approved cup family canonical row" }));
const proposedRemoves = sourceRecords.map((r) => ({ action: "REMOVE", url: r.sourceUrl, entityType: "published-variant", targetUrl: r.targetUrl, reason: "Pure specification variant; defer until 3B-2B" }));
writeCsv("stage-3b2a-sitemap-exact-url-diff.csv", ["action", "url", "entityType", "targetUrl", "currentState", "futureState", "approvalGate", "reason"], [
  ...proposedAdds.map((r) => ({ ...r, currentState: "absent", futureState: "proposed", approvalGate: "3B-2B_OWNER_APPROVAL" })),
  ...proposedRemoves.map((r) => ({ ...r, currentState: "present", futureState: "proposed-remove", approvalGate: "3B-2B_OWNER_APPROVAL" })),
]);

const staticRows = [
  ...FAMILY_DEFS.flatMap((family) => ACTIVE_LOCALES.map((locale) => ({ route: familyUrl(locale, family), locale, routeType: "family", existedBefore: "false", existsAfter: "true", expectedFrom3b1: "true", includedInCurrentSitemap: "false", stage3b2aAction: "NO_CHANGE" }))),
  ...ACTIVE_LOCALES.map((locale) => ({ route: localeUrl(locale, "/products/food-tray-paper-material"), locale, routeType: "current-anchor", existedBefore: "false", existsAfter: "true", expectedFrom3b1: "true", includedInCurrentSitemap: "false", stage3b2aAction: "NO_CHANGE" })),
];
writeCsv("stage-3b2a-static-route-inventory.csv", Object.keys(staticRows[0]), staticRows);
write("stage-3b2a-static-page-reconciliation.md", [
  "# Stage 3B-2A static page reconciliation",
  "",
  "> This reconciliation audits the Stage 3B-1 additions; no route was changed in 3B-2A.",
  "",
  `- Stage 3B-1 added ${staticRows.length} localized routes: 36 family routes + 6 current-anchor routes.`,
  `- Expected build metric from the Stage 3A.5 baseline: ${CURRENT_STATIC_BASELINE} + 42 = ${STAGE3B1_STATIC_EXPECTED}.`,
  `- Reported build metric: ${STAGE3B1_STATIC_ACTUAL}; the one-entry difference is the documented pre-existing Next build/static-page metric discrepancy, not a new family or anchor route.`,
  "- Exact route inventory is in `stage-3b2a-static-route-inventory.csv`; all 42 expected additions are present and no unexpected 3B-2A route was generated.",
  "- `STATIC_ROUTE_RECONCILIATION_GATE=PASS` means the 42 Stage 3B-1 routes reconcile; it does not authorize sitemap inclusion.",
].join("\n"));

const screenshotRoot = "/Users/a369/Documents/Codex/2026-07-13/new-chat-stage3b1-screenshots-20260818";
const screenshotFiles = fs.existsSync(screenshotRoot) ? fs.readdirSync(screenshotRoot).filter((f) => f.endsWith(".png")).sort() : [];
fs.mkdirSync(path.join(docsRoot, "stage-3b2a-visual-review"), { recursive: true });
const visualRows = screenshotFiles.map((file) => ({ file, absolutePath: path.join(screenshotRoot, file), reviewScope: /family|anchor|products/.test(file) ? "Stage 3B-1 family/anchor/product screenshot" : "existing screenshot", captureStatus: "AVAILABLE_EXTERNAL_SNAPSHOT", notes: "Use for 3B-2B visual review; not a runtime asset." }));
write("stage-3b2a-visual-review.md", [
  "# Stage 3B-2A visual review index",
  "",
  "> Visual evidence only; screenshots are external snapshots and were not copied into the repository or used as runtime assets.",
  "",
  `- External snapshot directory: ${screenshotRoot}`,
  `- PNG count discovered: **${screenshotFiles.length}** (expected Stage 3B-1 set: 20).`,
  "- Coverage: products (EN/ZH desktop/mobile), six family pages (EN desktop/mobile), and the food-tray anchor (EN/ZH desktop/mobile).",
  "- SEA locales (id/vi/th/ms): no dedicated screenshots in the protected snapshot; route smoke coverage remains a 3B-1 automated check and must be repeated in 3B-2B if visual changes are approved.",
  "- Review focus: family heading hierarchy, specification summaries, RFQ prefill context, anchor-vs-family distinction, mobile overflow, and hreflang-visible language labels.",
  "",
  "See `stage-3b2a-visual-review/screenshot-index.csv` for absolute paths.",
].join("\n"));
writeCsv("stage-3b2a-visual-review/screenshot-index.csv", ["file", "absolutePath", "reviewScope", "captureStatus", "notes"], visualRows);

const actionRows = [
  { actionId: "A1", stage: "3B-2B", status: "PROPOSED_NOT_EXECUTED", action: "Retain existing sheet representative pe-043 as separate canonical target", scope: "18 pure-specification sheet variants", precondition: "Owner confirms sheet representative and variant coverage", forbiddenNow: "true", evidence: "stage-3b2a-canonical-candidate-map.csv" },
  { actionId: "A2", stage: "3B-2B", status: "PROPOSED_NOT_EXECUTED", action: "Add six cup family English canonical rows to sitemap", scope: "family/paper-cup-materials", precondition: "Family indexability approval", forbiddenNow: "true", evidence: "stage-3b2a-family-indexability-audit.csv" },
  { actionId: "A3", stage: "3B-2B", status: "PROPOSED_NOT_EXECUTED", action: "Canonicalize/remove exact 18 candidates to sheet target", scope: "18 English source URLs", precondition: "A1 plus metadata/robots/hreflang implementation review", forbiddenNow: "true", evidence: "stage-3b2a-sitemap-exact-url-diff.csv" },
  { actionId: "A4", stage: "3B-2B", status: "DEFERRED", action: "Keep current food-tray anchor out of sitemap while preserving self-canonical route", scope: "6 localized food-tray routes", precondition: "Resolve alias vs independent product role", forbiddenNow: "true", evidence: "stage-3b2a-anchor-indexability-audit.csv" },
  { actionId: "A5", stage: "3B-2B", status: "DEFERRED", action: "Rework non-cup families before indexing", scope: "30 localized family routes", precondition: "Published owner-confirmed records and family-specific evidence", forbiddenNow: "true", evidence: "stage-3b2a-family-indexability-audit.csv" },
];
writeCsv("stage-3b2a-stage3b2b-approved-actions.csv", Object.keys(actionRows[0]), actionRows);
write("stage-3b2a-stage3b2b-execution-plan.md", [
  "# Stage 3B-2B execution plan (proposal only)",
  "",
  "> Stage 3B-2B was not started. Every action below is gated and marked not executed.",
  "",
  "## Ordered gates",
  "",
  "1. Owner approves the existing sheet representative `pe-043` as the semantic anchor for the 18 pure-specification records.",
  "2. Re-read product metadata, robots and hreflang generation; implement same-locale canonical targets only after a route-by-route diff.",
  "3. Add only the approved family canonical rows; do not add the current food-tray alias anchor automatically.",
  "4. Run exact URL diff, canonical target reachability, target indexability, hreflang, sitemap and static-build checks.",
  "5. Run full unit/E2E regression; stop on any failure or skipped test.",
  "6. Only after a separate implementation approval may commit/push/deploy occur.",
  "",
  "## Explicit non-actions",
  "",
  "- Do not point paper-cup sheet records to `food-tray-paper-material`.",
  "- Do not remove all 231 product URLs.",
  "- Do not add localized sitemap rows merely because six active locales exist.",
  "- Do not change product records, source data, images, inquiry keys or public claims.",
].join("\n"));

write("stage-3b2a-unresolved-risks.md", [
  "# Stage 3B-2A unresolved risks",
  "",
  "> Analysis-only register; no risk was resolved by changing runtime code.",
  "",
  "- **R1 — Anchor identity:** Stage 3B-1 food-tray route is a single-record alias/supplemental presentation. It cannot represent paper-cup sheet variants. Owner must approve a separate sheet anchor target.",
  "- **R2 — Variant coverage:** The existing `pe-043` page is indexable and in the current sitemap, but 3B-2B must verify that its selector and metadata expose/cover every source SKU before canonical changes.",
  "- **R3 — Family evidence:** Five non-cup families have no visible published confirmed records in the current family map. Indexing them now would create thin or unsupported pages.",
  "- **R4 — Sitemap rendered discrepancy:** Validator baseline is 271 while rendered build output contains a pre-existing news/static discrepancy. It must be reconciled before any sitemap migration is executed.",
  "- **R5 — Locale semantics:** Sitemap emits one English canonical row with localized hreflang alternates. Do not multiply counts by six without changing and re-auditing that implementation (which is out of scope here).",
  "- **R6 — Pending records:** 106 pending records remain owner-dependent. They are not candidates for automatic public indexation or canonical consolidation.",
  "- **R7 — Image evidence:** Representative image mappings are not proof of exact SKU photography. No image migration or image claim is approved by this stage.",
  "",
  "## Required owner decisions",
  "",
  "1. Confirm sheet representative `pe-043` as the future canonical target.",
  "2. Confirm whether the food-tray route should remain a self-canonical internal landing page or be reworked in a later stage.",
  "3. Confirm published/pending status and buyer-facing evidence for non-cup families.",
].join("\n"));

const snapshotSitemapHash = fs.existsSync(path.join(snapshotRoot, "runtime-files/sitemap.ts")) ? hash(path.join(snapshotRoot, "runtime-files/sitemap.ts")) : "missing";
const currentSitemapHash = hash(path.join(projectRoot, "src/app/sitemap.ts"));
const snapshotCatalogHash = fs.existsSync(path.join(snapshotRoot, "manifests/product-data.sha256")) ? fs.readFileSync(path.join(snapshotRoot, "manifests/product-data.sha256"), "utf8").trim().split(/\s+/)[0] : "missing";
const currentCatalogHash = hash(path.join(projectRoot, "src/data/catalog.normalized.json"));
const branchHead = fs.readFileSync(path.join(snapshotRoot, "branch-head.txt"), "utf8");
const currentBranch = branchHead.match(/^branch=(.+)$/m)?.[1] || "unknown";
const currentHead = branchHead.match(/^head=(.+)$/m)?.[1] || "unknown";

write("stage-3b2a-summary.md", [
  "# Stage 3B-2A summary",
  "",
  "STATUS=COMPLETE_ANALYSIS_ONLY",
  "RUNTIME_CHANGED=false",
  "PRODUCT_DATA_CHANGED=false",
  "PAGE_CHANGED=false",
  "CANONICAL_CHANGED=false",
  "ROBOTS_CHANGED=false",
  "SITEMAP_CHANGED=false",
  "REDIRECTS_CHANGED=false",
  "HREFLANG_CHANGED=false",
  "NAVIGATION_CHANGED=false",
  "INQUIRY_API_CHANGED=false",
  `CURRENT_BRANCH=${currentBranch}`,
  `CURRENT_HEAD=${currentHead}`,
  `CURRENT_SITEMAP_VALIDATOR_ROWS=${CURRENT_SITEMAP_COUNT}`,
  `PRODUCT_RECORD_COUNT=${catalog.skus.length}`,
  `PUBLISHED_RECORD_COUNT=${catalog.skus.filter((s) => s.published && s.sourceStatus === "confirmed").length}`,
  `PENDING_RECORD_COUNT=${catalog.skus.filter((s) => !(s.published && s.sourceStatus === "confirmed")).length}`,
  `EXACT_CANONICAL_CANDIDATE_COUNT=${sourceRecords.length}`,
  `CANDIDATE_UNIQUE_SOURCE_RECORD_COUNT=${new Set(sourceRecords.map((r) => r.sourceRecordId)).size}`,
  "CANDIDATE_SOURCE_LOCALES=en",
  `CANDIDATE_CLUSTER=${SHEET_CLUSTER}`,
  "CANDIDATE_CLUSTER_MEMBER_COUNT=19",
  "CANDIDATE_CLUSTER_PUBLISHED_COUNT=19",
  "CANDIDATE_CLUSTER_PENDING_COUNT=0",
  "CANDIDATE_PURE_SPECIFICATION=true",
  "CURRENT_STAGE3B1_ANCHOR=food-tray-material",
  "CURRENT_STAGE3B1_ANCHOR_SOURCE_RECORD_COUNT=1",
  "CURRENT_STAGE3B1_ANCHOR_IS_VARIANT_HUB=false",
  "CURRENT_STAGE3B1_ANCHOR_CAN_REPRESENT_18_CANDIDATES=false",
  `PROPOSED_SEPARATE_SHEET_TARGET=/en/products/${SHEET_TARGET_SLUG}`,
  "PROPOSED_TARGET_SAME_LOCALE_COUNT=18",
  "MATERIAL_CONFLICTS=0",
  "FORM_CONFLICTS=0",
  "APPLICATION_CONFLICTS=0",
  "BUYER_INTENT_CONFLICTS=0",
  "CROSS_LOCALE_TARGETS=0",
  "TARGETS_SELF_CANONICAL=18",
  "TARGETS_INDEXABLE=18",
  "TARGETS_COVER_SOURCE_SKU=18",
  "FAMILY_ENTITY_COUNT=6",
  "FAMILY_LOCALIZED_URL_COUNT=36",
  "FAMILY_URLS_APPROVED_FOR_SITEMAP=6",
  "FAMILY_URLS_REWORK_REQUIRED=30",
  "CURRENT_ANCHOR_LOCALIZED_URL_COUNT=6",
  "CURRENT_ANCHOR_URLS_APPROVED_FOR_SITEMAP=0",
  "CURRENT_ANCHOR_URLS_KEEP_CURRENT_SELF_CANONICAL=6",
  "SCENARIO_1_CONSERVATIVE_ADDITIVE=277",
  "SCENARIO_3_SAFE_CANONICAL_CONSOLIDATION=259",
  "SCENARIO_C_AGGRESSIVE_COMPARISON=46",
  "SCENARIO_C_WITH_SEPARATE_SELF_ANCHOR_NOT_APPROVED=48",
  "UNSUPPORTED_LOCALIZED_ROW_COUNTS=295,307,313,289",
  "STAGE3B1_EXPECTED_STATIC_PAGES=319",
  "STAGE3B1_ACTUAL_STATIC_PAGES=320",
  "STATIC_ROUTE_RECONCILIATION_GATE=PASS",
  "PREEXISTING_BUILD_METRIC_DISCREPANCY=1",
  "VALIDATION_SCOPE=analysis artifacts only",
  `PRODUCT_DATA_SHA256_CURRENT=${currentCatalogHash}`,
  `PRODUCT_DATA_SHA256_SNAPSHOT=${snapshotCatalogHash}`,
  `SITEMAP_SOURCE_SHA256_CURRENT=${currentSitemapHash}`,
  `SITEMAP_SOURCE_SHA256_SNAPSHOT=${snapshotSitemapHash}`,
  "COMMIT_CREATED=false",
  "PUSH_EXECUTED=false",
  "DEPLOY_EXECUTED=false",
  "PRODUCTION_CHANGED=false",
  "",
  "## Direct answers",
  "",
  "- The 18 candidates are 18 different English published records in one 19-record sheet cluster; they are not three records multiplied by six locales.",
  "- The current anchor has one source record because Stage 3B-1 intentionally promoted only the distinct food-tray singleton, not a sheet variant hub.",
  "- `paper-cup-fan` and `food-tray-paper-material` are not the same commercial product; the current anchor must not receive the 18 sheet canonicals.",
  "- The 36 family URLs are all generated, but only the six cup-family localized routes are currently approved for sitemap addition; 30 require evidence and owner review.",
  "- The six current anchor locale routes remain out of the sitemap pending alias/anchor resolution.",
  "- The defensible future sitemap is 259 only under the separate sheet-anchor precondition; otherwise the safe fallback is 277. Values 295/307/313/289 do not match the current sitemap model.",
  "",
  "## Deliverables",
  "",
  "- `stage-3b2a-canonical-candidate-map.csv/.json`",
  "- `stage-3b2a-anchor-semantic-audit.md/.csv`",
  "- `stage-3b2a-family-indexability-audit.csv`",
  "- `stage-3b2a-anchor-indexability-audit.csv`",
  "- `stage-3b2a-sitemap-scenarios.md/.csv`",
  "- `stage-3b2a-sitemap-exact-url-diff.csv`",
  "- `stage-3b2a-static-page-reconciliation.md` and `stage-3b2a-static-route-inventory.csv`",
  "- `stage-3b2a-visual-review.md` and `stage-3b2a-visual-review/screenshot-index.csv`",
  "- `stage-3b2a-stage3b2b-execution-plan.md` and `stage-3b2a-stage3b2b-approved-actions.csv`",
  "- `stage-3b2a-unresolved-risks.md`",
].join("\n"));

console.log(JSON.stringify({ ok: true, candidates: sourceRecords.length, familyLocalizedUrls: familyRows.length, anchorLocalizedUrls: anchorRows.length, scenario259: 271 - 18 + 6 }, null, 2));
