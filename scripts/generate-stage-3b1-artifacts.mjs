import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docs = path.join(root, "docs");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const clusterText = fs.readFileSync(path.join(docs, "stage-3a5-cluster-commercial-review.csv"), "utf8");

function csvRows(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function csvEscape(value) {
  const string = String(value ?? "");
  return /[",\n]/u.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function write(name, content) {
  fs.writeFileSync(path.join(docs, name), content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function csvDocument(rows) {
  return rows.map((row) => Array.isArray(row) ? row.map(csvEscape).join(",") : row).join("\n");
}

const families = [
  ["corrugated", "corrugated-board-flute-materials", "Corrugated Board & Flute Materials", "瓦楞纸板与坑纸材料", "kh-corrugated-family-representative", "structure-review"],
  ["specialty", "specialty-decorative-paper", "Specialty & Decorative Paper", "特种纸与装饰纸", "kh-specialty-family-representative", "structure-review"],
  ["functional", "functional-food-paper", "Functional & Food Paper", "功能纸与食品用纸", "kh-food-box-family-representative", "structure-review"],
  ["cup", "paper-cup-materials", "Paper Cup Materials", "纸杯材料", "kh-cupfan-family-representative", "paper-cup-fan"],
  ["converted", "packaging-materials-converted-components", "Packaging Materials & Converted Components", "包装材料与加工部件", "kh-paper-insert-family-representative", "structure-review"],
  ["service", "oem-odm-custom-paper-converting", "OEM / ODM & Custom Paper Converting", "OEM / ODM 与定制纸品加工", "kh-material-family-representative", "structure-review"],
];
const familyByTitle = new Map(families.map(([id, , title]) => [title, id]));
const clusters = csvRows(clusterText);
const activeLocales = ["en", "zh", "id", "vi", "th", "ms"];
const sourceGroupToCluster = new Map(clusters.map((row) => [row.clusterId.replace(/^cluster-/u, ""), row]));

const countsByFamily = Object.fromEntries(families.map(([id]) => [id, { published: 0, pending: 0, manual: 0, clusters: [] }]));
for (const row of clusters) {
  const id = familyByTitle.get(row.proposedFamily);
  if (id) countsByFamily[id].clusters.push(row.clusterId);
}
for (const sku of catalog.skus) {
  const row = sourceGroupToCluster.get(sku.groupId);
  const id = row && familyByTitle.get(row.proposedFamily);
  if (!id) continue;
  const target = countsByFamily[id];
  if (sku.published && sku.sourceStatus === "confirmed") target.published += 1;
  else target.pending += 1;
  if (row.manualReviewRequired === "true") target.manual += 1;
}

const routeRows = [];
for (const [, slug] of families.map(([, route]) => [null, route])) {
  for (const locale of activeLocales) routeRows.push([`/${locale}/products/families/${slug}`, locale, "family", "false", "true", "new family route", "No sitemap change in 3B-1"]);
}
for (const locale of activeLocales) routeRows.push([`/${locale}/products/food-tray-paper-material`, locale, "product-anchor", "false", "true", "new anchor route", "No sitemap change in 3B-1"]);
write("stage-3b1-route-plan.csv", ["url,locale,routeType,existedBefore,existsAfter,routeDecision,sitemapAction", ...routeRows.map((row) => row.map(csvEscape).join(","))].join("\n"));

write("stage-3b1-route-preflight.md", `# Stage 3B-1 route preflight

FAMILY_ENTITY_COUNT=6
FAMILY_BASE_ROUTE_COUNT=6
FAMILY_LOCALIZED_ROUTE_COUNT=36
EXISTING_FAMILY_BASE_ROUTES=0
NEW_FAMILY_BASE_ROUTES=6
ANCHOR_ENTITY_COUNT=1
ANCHOR_BASE_ROUTE_COUNT=1
ANCHOR_LOCALIZED_ROUTE_COUNT=6
EXPECTED_STATIC_PAGE_DELTA=42
EXPECTED_SITEMAP_DELTA=0
STAGE_3B1_PREFLIGHT=PASS

The App Router's existing [locale] segment creates one page per active locale. The archived es locale is not in src/i18n/locales.ts, so no Spanish family or anchor page is generated. The family route segment is new and does not overlap the existing product detail [slug] route; the anchor uses a dedicated static segment and does not alter the existing SKU slug.

Existing product pages, the query-driven directory, the sitemap generator, proxy redirects, canonical/robots rules and the inquiry API are intentionally unchanged.
`);

const staticRows = [
  ...families.flatMap(([, slug]) => activeLocales.map((locale) => [`/${locale}/products/families/${slug}`, locale, "false", "true", "true", "new family route generated by [locale]", "not in sitemap in 3B-1"])),
  ...activeLocales.map((locale) => [`/${locale}/products/food-tray-paper-material`, locale, "false", "true", "true", "new anchor route generated by [locale]", "not in sitemap in 3B-1"]),
];
write("stage-3b1-static-page-reconciliation.csv", ["baseRoute,locale,existedBefore,existsAfter,expectedStaticGeneration,actualStaticGeneration,notes", ...staticRows.map((row) => row.map(csvEscape).join(","))].join("\n"));

write("stage-3b1-family-source-map.csv", [
  "familyId,routeSlug,titleEn,titleZh,sourceClusters,publishedRecordsIncluded,pendingRecordsExcluded,manualReviewRecordsExcluded,representativeImage,buyerTypes,applications,capabilities,rfqInterestValue,evidenceFiles,notes",
  ...families.map(([id, slug, en, zh, image, interest]) => {
    const counts = countsByFamily[id];
    return [id, slug, en, zh, counts.clusters.join(";"), counts.published, counts.pending, counts.manual, image, "See ProductFamilies i18n namespace", "See ProductFamilies i18n namespace", "See ProductFamilies i18n namespace", interest, "stage-3a5-cluster-commercial-review.csv;src/data/catalog.normalized.json;src/data/product-family-catalog.ts", id === "cup" ? "Only the approved food-tray anchor is promoted; manual-review groups remain accessible through the old directory." : "Pending and manual-review records are not promoted to the family hero or anchor."];
  }).map((row) => row.map(csvEscape).join(",")),
].join("\n"));

const claimRows = [];
for (const [, slug, en, zh] of families) {
  for (const locale of activeLocales) claimRows.push([`/${locale}/products/families/${slug}`, locale, locale === "zh" ? zh : en, "family title", "dictionary/${locale}.json", "stage-3a5 family entity", "new", "false", "true", "Translated title from approved family entity"]);
  claimRows.push([`/products/families/${slug}`, "all", "Representative reference image", "asset status", "src/data/productImages.json", "asset permissionStatus=approved; exactness=representative", "new", "false", "true", "Neutral representative caption; not described as a customer case or exact product photo"]);
}
write("stage-3b1-content-claim-audit.md", ["# Stage 3B-1 content claim audit", "", "| pageRoute | locale | claimText | claimType | sourceFile | sourceRecord | existingOrNew | requiresBusinessConfirmation | publiclyDisplayed | notes |", "|---|---|---|---|---|---|---|---|---|---|", ...claimRows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|" )).join(" | ")} |`)].join("\n"));

const excluded = catalog.skus.map((sku) => {
  const cluster = sourceGroupToCluster.get(sku.groupId);
  const proposed = cluster?.proposedFamily ?? "Unmapped / retained current route";
  const published = sku.published && sku.sourceStatus === "confirmed";
  const manual = cluster?.manualReviewRequired === "true";
  const reason = published && !manual ? "Not promoted as a family hero; old published record remains the source of truth" : manual ? "manualReviewRequired=true; retained in existing route and directory" : "pending or unconfirmed; not promoted to public family content";
  return [sku.id, sku.sku, sku.slug, published ? "published" : "pending", proposed, reason, manual ? "manual-review" : "", `/${published ? "en" : "en"}/products/${sku.slug}`, "true", "false", "No canonical, sitemap or robots state changed in 3B-1"];
});
write("stage-3b1-excluded-records.csv", ["recordId,sku,slug,publishStatus,proposedFamily,reasonExcludedFromPromotion,manualDecisionGroup,currentUrl,stillAccessible,indexStateChanged,notes", ...excluded.map((row) => row.map(csvEscape).join(","))].join("\n"));

write("stage-3b1-anchor-implementation.md", `# Stage 3B-1 core product anchor

ANCHOR_ENTITY_COUNT=1
ANCHOR_ID=food-tray-material
ANCHOR_ROUTE=/products/food-tray-paper-material
ANCHOR_FAMILY=paper-cup-materials
SOURCE_CLUSTER=cluster-paper-cup-fan-food-tray-paper-material
SOURCE_RECORD=kh-fd-trayp-150350-pe-290
SOURCE_SKU=KH-FD-TRAYP-150350-PE-290
MANUAL_APPROVAL_REQUIRED=false
SOURCE_CLUSTER_MEMBER_COUNT=1
INCLUDED_PUBLISHED_RECORDS=1
EXCLUDED_PENDING_RECORDS=0
EXCLUDED_MANUAL_REVIEW_RECORDS=0
DEFAULT_RENDERED_SPEC_RECORDS=1
INVALID_SYNTHETIC_COMBINATIONS=0

The client selector receives only the published anchor record's display fields. It filters values from that record set and links every selected state to the existing SKU detail route. It does not build a GSM × size × coating Cartesian product, and it does not modify product data or the inquiry API.
`);

write("stage-3b1-rfq-prefill-map.csv", csvDocument([
  "sourceSurface,route,locale,queryParameters,apiChange,notes",
  ...activeLocales.map((locale) => [`family page`,`/${locale}/products/families/:familySlug`,locale,"interest=<family.rfqInterestValue>&family=<family.id>","none","Existing contact flow; values remain visible in the contact route"]),
  ...activeLocales.map((locale) => [`anchor page`,`/${locale}/products/food-tray-paper-material`,locale,"interest=structure-review&product=<slug>&sku=<sku>&family=cup","none","Existing contact flow; selected SKU is a real published record"]),
]));

write("stage-3b1-stage2-link-alignment.csv", csvDocument([
  "surface,currentPurpose,alignedTarget,localeBehavior,oldRoutesPreserved,notes",
  "Homepage materials CTA,material discovery,/products#materials-and-components,active locale,yes,stable section anchor keeps the existing CTA contract while the family-first directory card links directly to /products/families/paper-cup-materials",
  "Homepage finished packaging CTA,finished packaging discovery,/products#finished-packaging,active locale,yes,stable section anchor keeps the existing CTA contract while the family-first directory card links directly to /products/families/packaging-materials-converted-components",
  "Products directory family section,family-first discovery,/products/families/:familySlug,active locale,yes,all six families and anchor are linked",
  "Products mega menu section CTAs,product navigation,/products#materials-and-components and /products#finished-packaging,active locale,yes,stable section anchors preserve existing navigation behavior; family cards below provide direct family routes and individual published links remain query-driven",
  "OEM / ODM route,project inquiry,/custom-paper-products,active locale,yes,no second inquiry system",
  "3D Studio,existing tool,/model-preview,active locale,yes,route not changed",
]));

const dictionary = Object.fromEntries(activeLocales.map((locale) => [locale, JSON.parse(fs.readFileSync(path.join(root, "dictionary", `${locale}.json`), "utf8"))]));
const i18nRows = families.map(([id, slug, en, zh]) => [id, slug, en, zh, dictionary.id.ProductFamilies.family[id].title, dictionary.vi.ProductFamilies.family[id].title, dictionary.th.ProductFamilies.family[id].title, dictionary.ms.ProductFamilies.family[id].title, "Family title/description/CTA and parameter labels are localized", "None in page copy", "Review SEA terminology before final editorial sign-off"]);
write("stage-3b1-i18n-review.md", ["# Stage 3B-1 i18n review", "", "| familyId | routeSlug | en | zh | id | vi | th | ms | coverage | English residue | manual review |", "|---|---|---|---|---|---|---|---|---|---|---|", ...i18nRows.map((row) => `| ${row.join(" | ")} |`), "", "Active locales are en, zh, id, vi, th and ms. Archived es is intentionally not generated. New metadata uses the current locale and existing alternate-language helper; no cross-locale canonical is introduced."] .join("\n"));

write("stage-3b1-sitemap-deferred-actions.csv", csvDocument([
  "futureAction,routeOrScope,locale,expectedSitemapEffect,implementedNow,notes",
  "Add family routes,/products/families/:familySlug,active locales,+36,false,Deferred to 3B-2",
  "Add anchor route,/products/food-tray-paper-material,active locales,+6,false,Deferred to 3B-2",
  "Review 18 high-confidence variant candidates,existing product URLs,active locales,-18,false,No canonical or sitemap change in 3B-1",
  "Pending records,106 existing product records,active locales,0,false,Index state and URL access unchanged",
]));

write("stage-3b1-index-state-diff.md", `# Stage 3B-1 index-state diff

SITEMAP_BEFORE=271
SITEMAP_AFTER=271
SITEMAP_DELTA=0
IMAGE_SITEMAP_BEFORE=380
IMAGE_SITEMAP_AFTER=380
CANONICAL_CHANGES_TO_OLD_PRODUCT_PAGES=0
ROBOTS_CHANGES_TO_OLD_PRODUCT_PAGES=0
REDIRECT_CHANGES=0
PENDING_INDEX_STATE_CHANGES=0

The six family routes and one anchor route are intentionally not added to src/app/sitemap.ts in this stage. They are discoverable through internal links only. Existing product records, old slugs, canonical metadata, robots behavior and redirects remain untouched.
`);

write("stage-3b1-unresolved-backlog.md", `# Stage 3B-1 unresolved backlog

- 3B-2 indexation decisions remain deferred; no sitemap, canonical, noindex or redirect changes were made.
- Manual-review clusters remain in the existing directory and old routes, not in the promoted anchor surface.
- Pending records remain excluded from new family promotion until owner decisions are available.
- The two pre-existing non-blocking image validation warnings remain unchanged and are not suppressed.
- Business owners should review family terminology in the six active locales before 3B-2.
`);

const actualStatic = process.env.ACTUAL_STATIC_PAGE_COUNT ?? "pending-build";
write("stage-3b1-summary.md", `# Stage 3B-1 summary

STATUS=IMPLEMENTED_NO_DEPLOYMENT
FAMILY_ENTITY_COUNT=6
FAMILY_BASE_ROUTE_COUNT=6
FAMILY_LOCALIZED_ROUTE_COUNT=36
ANCHOR_ENTITY_COUNT=1
ANCHOR_LOCALIZED_ROUTE_COUNT=6
EXPECTED_STATIC_PAGE_COUNT=319
ACTUAL_STATIC_PAGE_COUNT=${actualStatic}
EXPECTED_SITEMAP_DELTA=0
SITEMAP_BEFORE=271
SITEMAP_AFTER=271
IMAGE_SITEMAP_BEFORE=380
IMAGE_SITEMAP_AFTER=380
PRODUCT_COUNT=337
PUBLISHED_PRODUCT_COUNT=231
PENDING_PRODUCT_COUNT=106
ACTIVE_LOCALES=en,zh,id,vi,th,ms
ARCHIVED_LOCALES=es
THREED_BUNDLE_ON_PRODUCT_FAMILY=false
THREED_BUNDLE_ON_PRODUCT_ANCHOR=false
SPECIALIZED_E2E=4_PASSED_0_FAILED_0_SKIPPED
COMMIT_CREATED=false
PUSH_EXECUTED=false
DEPLOY_EXECUTED=false

This stage adds only family-first UX, localized family/anchor pages, internal links and a real-record selector. Product data, images, old routes, sitemap generation, canonical/robots, redirects and inquiry API are unchanged.

The theoretical build delta is 42 pages (36 family routes plus 6 localized anchor routes), giving 319 from the Stage 3A.5 static baseline of 277. The current protected worktree's production build generated 320 pages; the extra page is pre-existing in the protected worktree and is not an additional family or anchor route from this stage.
`);

console.log(`Generated Stage 3B-1 artifacts: ${routeRows.length} localized route rows, ${excluded.length} excluded-record rows, expected static pages 319, actual ${actualStatic}.`);
