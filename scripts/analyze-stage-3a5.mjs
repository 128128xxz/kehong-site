import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);
const docsRoot = path.join(projectRoot, "docs");
const catalog = JSON.parse(fs.readFileSync(path.join(projectRoot, "src/data/catalog.normalized.json"), "utf8"));
const stage3a = JSON.parse(fs.readFileSync(path.join(docsRoot, "stage-3a-product-family-map.json"), "utf8"));

const ACTIVE_LOCALES = ["en", "zh", "id", "vi", "th", "ms"];
const ARCHIVED_LOCALES = ["es"];
const CURRENT_SITEMAP_COUNT = 271;
const CURRENT_STATIC_COUNT = 277;
const FAMILY_DEFS = [
  { key: "corrugated", name: "Corrugated Board & Flute Materials", slug: "corrugated-board-flute-materials" },
  { key: "specialty", name: "Specialty & Decorative Paper", slug: "specialty-decorative-paper" },
  { key: "functional", name: "Functional & Food Paper", slug: "functional-food-paper" },
  { key: "cup", name: "Paper Cup Materials", slug: "paper-cup-materials" },
  { key: "converted", name: "Packaging Materials & Converted Components", slug: "packaging-materials-converted-components" },
  { key: "service", name: "OEM / ODM & Custom Paper Converting", slug: "oem-odm-custom-paper-converting" },
];
const EVIDENCE = [
  "src/data/catalog.normalized.json",
  "src/lib/catalog.ts",
  "src/app/[locale]/products/[slug]/page.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/proxy.ts",
  "docs/stage-3a-product-family-map.json",
  "docs/stage-3a-anchor-page-candidates.md",
];

function csvCell(value) {
  const raw = value === undefined || value === null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return /[",\n\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}
function writeCsv(file, columns, rows) {
  const body = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\n");
  fs.writeFileSync(path.join(docsRoot, file), `${body}\n`);
}
function write(file, content) {
  fs.writeFileSync(path.join(docsRoot, file), content.endsWith("\n") ? content : `${content}\n`);
}
function valueText(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(valueText).filter(Boolean).join("; ");
  if (typeof value === "object") return Object.values(value).map(valueText).filter(Boolean).join("; ");
  return String(value);
}
function unique(values) { return [...new Set(values.map(valueText).filter(Boolean))]; }
function mode(values) {
  const valuesByKey = new Map();
  for (const value of values) {
    const key = valueText(value);
    if (!key) continue;
    valuesByKey.set(key, (valuesByKey.get(key) || 0) + 1);
  }
  const sorted = [...valuesByKey.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted[0]?.[0] || "";
}
function ratio(values) { return values.length ? Math.round((values.filter((value) => value === mode(values)).length / values.length) * 100) / 100 : 0; }
function slugify(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function urlFor(slug) { return `/en/products/${slug}`; }
function localeRoutes(baseRoute) { return ACTIVE_LOCALES.map((locale) => `/${locale}${baseRoute}`); }
function arrayIncludes(value, needle) { return valueText(value).toLowerCase().includes(needle); }

const recordsById = new Map(catalog.skus.map((sku) => [sku.id, sku]));
const mapRows = stage3a.records;
if (mapRows.length !== catalog.skus.length) throw new Error(`Stage 3A mapping count mismatch: ${mapRows.length} vs ${catalog.skus.length}`);
const clusters = new Map();
for (const row of mapRows) {
  if (!clusters.has(row.variantClusterId)) clusters.set(row.variantClusterId, []);
  clusters.get(row.variantClusterId).push(row);
}
if (clusters.size !== 109) throw new Error(`Expected 109 clusters, found ${clusters.size}`);

const clusterForRow = new Map();
for (const [clusterId, rows] of clusters) for (const row of rows) clusterForRow.set(row.recordId, { clusterId, rows });

const fieldValues = (rows, field) => rows.map((row) => {
  const sku = recordsById.get(row.recordId) || {};
  if (field === "material") return (sku.materialIds || []).join("; ");
  if (field === "form") return row.materialForm;
  if (field === "application") return row.primaryApplication;
  if (field === "buyer") return row.primaryBuyerType;
  if (field === "process") {
    const processSteps = Array.isArray(sku.process)
      ? sku.process.filter((step) => !/(pe|pla|coating|淋膜|涂层)/i.test(valueText(step))).map(valueText)
      : [valueText(sku.process)];
    return [...processSteps, valueText(sku.finishingProcess)].filter(Boolean).join("; ");
  }
  if (field === "title") return row.currentTitleEn;
  if (field === "image") return row.currentImage;
  if (field === "gsm") return sku.gsmOrThickness;
  if (field === "size") return sku.commonSize;
  if (field === "width") return sku.size;
  if (field === "color") return sku.color;
  if (field === "coating") return sku.coating;
  if (field === "printing") return sku.process;
  if (field === "capacity") return sku.applications;
  if (field === "finishing") return sku.finishingProcess;
  return "";
});
const hasDistinct = (rows, field) => unique(fieldValues(rows, field)).length > 1;
const variables = (rows, field) => hasDistinct(rows, field);
const publishedRows = (rows) => rows.filter((row) => row.publishStatus === "published");
const pendingRows = (rows) => rows.filter((row) => row.publishStatus === "pending");

const clusterRows = [...clusters.entries()].map(([clusterId, rows]) => {
  const first = rows[0];
  const published = publishedRows(rows);
  const pending = pendingRows(rows);
  const pureSpec = rows.length > 1 && published.length > 0 && !["material", "form", "application", "buyer", "process"].some((field) => hasDistinct(rows, field));
  const foodTray = rows.length === 1 && arrayIncludes(first.currentTitleEn, "food tray");
  const anchor = published[0] || rows[0];
  const anchorRecord = recordsById.get(anchor.recordId) || {};
  const recommendedPublicTreatment = pending.length === rows.length
    ? "PENDING_ONLY"
    : foodTray
      ? "CORE_PRODUCT_PAGE"
      : pureSpec
        ? "PRODUCT_PAGE_WITH_VARIANTS"
        : "MANUAL_REVIEW";
  const recommendedSeoTreatment = pending.length === rows.length
    ? "KEEP_CURRENT_PENDING_REVIEW"
    : foodTray
      ? "INDEX_SELF"
      : pureSpec
        ? "CANONICAL_TO_ANCHOR"
        : "MANUAL_REVIEW";
  const confidence = recommendedPublicTreatment === "PRODUCT_PAGE_WITH_VARIANTS"
    ? Math.min(0.98, Math.max(...rows.map((row) => Number(row.mappingConfidence) || 0)))
    : foodTray ? 0.9 : Math.min(...rows.map((row) => Number(row.mappingConfidence) || 0));
  const manualReviewRequired = rows.some((row) => row.manualReviewRequired) || !pureSpec && !foodTray || pending.length > 0;
  const distinctFields = {
    material: hasDistinct(rows, "material"), form: hasDistinct(rows, "form"), application: hasDistinct(rows, "application"),
    buyer: hasDistinct(rows, "buyer"), process: hasDistinct(rows, "process"),
  };
  return {
    clusterId,
    memberCount: rows.length,
    publishedCount: published.length,
    pendingCount: pending.length,
    currentProductGroup: first.currentProductGroup,
    proposedFamily: first.proposedPublicFamily,
    proposedSubfamily: first.proposedSubfamily,
    sharedTitlePattern: mode(fieldValues(rows, "title")),
    sharedDescriptionRatio: ratio(fieldValues(rows, "title")),
    sharedImageRatio: ratio(fieldValues(rows, "image")),
    sharedMaterial: mode(fieldValues(rows, "material")),
    sharedForm: mode(fieldValues(rows, "form")),
    sharedApplication: mode(fieldValues(rows, "application")),
    sharedBuyerIntent: mode(fieldValues(rows, "buyer")),
    variableGsm: variables(rows, "gsm"),
    variableSize: variables(rows, "size"),
    variableWidth: variables(rows, "width"),
    variableColor: variables(rows, "color"),
    variableCoating: variables(rows, "coating"),
    variablePrinting: variables(rows, "printing"),
    variableCapacity: variables(rows, "capacity"),
    variableFinishing: variables(rows, "finishing"),
    hasDistinctCommercialIntent: distinctFields.application || distinctFields.buyer,
    hasDistinctMaterial: distinctFields.material,
    hasDistinctForm: distinctFields.form,
    hasDistinctApplication: distinctFields.application,
    hasDistinctBuyerType: distinctFields.buyer,
    hasDistinctProductionProcess: distinctFields.process,
    isPureSpecificationCluster: pureSpec,
    recommendedAnchorEntity: published.length ? `product-anchor:${anchor.slug}` : `pending-cluster:${clusterId}`,
    recommendedPublicTreatment,
    recommendedSeoTreatment,
    confidence: Math.round(confidence * 100) / 100,
    manualReviewRequired,
    evidence: EVIDENCE.join(";"),
    notes: `${rows.length} records; ${published.length} published and ${pending.length} pending. ${pureSpec ? "Commercial title/form/material/application are shared; differences are specification fields." : "Commercial independence or publication status requires owner review."} Anchor source: ${anchorRecord.sku || anchor.recordId}.`,
    rows,
  };
});
clusterRows.sort((a, b) => b.memberCount - a.memberCount || a.clusterId.localeCompare(b.clusterId));
const clusterReviewById = new Map(clusterRows.map((row) => [row.clusterId, row]));

const clusterColumns = [
  "clusterId", "memberCount", "publishedCount", "pendingCount", "currentProductGroup", "proposedFamily", "proposedSubfamily", "sharedTitlePattern", "sharedDescriptionRatio", "sharedImageRatio", "sharedMaterial", "sharedForm", "sharedApplication", "sharedBuyerIntent", "variableGsm", "variableSize", "variableWidth", "variableColor", "variableCoating", "variablePrinting", "variableCapacity", "variableFinishing", "hasDistinctCommercialIntent", "hasDistinctMaterial", "hasDistinctForm", "hasDistinctApplication", "hasDistinctBuyerType", "hasDistinctProductionProcess", "isPureSpecificationCluster", "recommendedAnchorEntity", "recommendedPublicTreatment", "recommendedSeoTreatment", "confidence", "manualReviewRequired", "evidence", "notes",
];
writeCsv("stage-3a5-cluster-commercial-review.csv", clusterColumns, clusterRows);

const validatorStatic = ["/en", "/en/products", "/en/contact", "/en/paper-cup-fan-manufacturer", "/en/paper-packaging-supplier", "/en/custom-paper-products", "/en/factory", "/en/process", "/en/procurement", "/en/privacy", "/en/terms", "/en/industries/bakery-packaging", "/en/capabilities", "/en/resources", "/en/industries"];
const validatorPackaging = ["paper-bags", "labels-stickers", "pillow-boxes", "takeout-boxes", "cake-boxes", "cake-boards-cake-drums", "corrugated-mailer-boxes"].map((slug) => `/en/packaging/${slug}`);
const validatorResources = ["artwork-guidelines", "materials-guide", "finishes-guide", "dielines-templates", "packaging-selection-guide", "proofing-samples"].map((slug) => `/en/resources/${slug}`);
const validatorBakery = ["cake-boxes", "cake-boards-and-drums"].map((slug) => `/en/products/${slug}`);
const validatorCategories = ["kraft-paper", "white-cardboard", "food-grade-paper", "corrugated-paper", "specialty-paper", "food-packaging-boxes", "paper-pads", "paper-inserts", "paper-boxes", "paper-packaging-materials"].map((slug) => `/en/products/${slug}`);
const publishedMap = mapRows.filter((row) => row.publishStatus === "published");
const pendingMap = mapRows.filter((row) => row.publishStatus === "pending");
const currentProductUrls = publishedMap.map((row) => urlFor(row.slug));
const currentSitemapUrls = [...validatorStatic, ...validatorPackaging, ...validatorResources, ...validatorBakery, ...validatorCategories, ...currentProductUrls];
if (currentSitemapUrls.length !== CURRENT_SITEMAP_COUNT) throw new Error(`Current sitemap arithmetic mismatch: ${currentSitemapUrls.length}`);
const familyUrls = FAMILY_DEFS.map((family) => `/en/products/families/${family.slug}`);
const productClusters = clusterRows.filter((cluster) => cluster.publishedCount > 0);
const clusterAnchors = new Map(productClusters.map((cluster) => [cluster.clusterId, cluster.rows.find((row) => row.publishStatus === "published")?.slug]));

function classifyPage(url) {
  if (url.includes("/products/") && publishedMap.some((row) => url === urlFor(row.slug))) return "product";
  if (url.includes("/packaging/")) return "packaging";
  if (url.includes("/resources/")) return "resource";
  if (validatorBakery.includes(url)) return "curated-product";
  if (validatorCategories.includes(url)) return "category";
  return "static";
}
function sourceFor(pageType) { return pageType === "product" ? "src/app/[locale]/products/[slug]/page.tsx" : "src/app/sitemap.ts"; }
function inventoryRow(url, extra = {}) {
  const match = publishedMap.find((row) => url === urlFor(row.slug)) || pendingMap.find((row) => url === urlFor(row.slug));
  const pageType = classifyPage(url);
  const isPending = Boolean(match && match.publishStatus === "pending");
  return {
    url,
    locale: "en",
    baseRoute: url.replace(/^\/en/, ""),
    pageType,
    recordId: match?.recordId || "",
    sku: match?.sku || "",
    slug: match?.slug || "",
    publishStatus: match?.publishStatus || (isPending ? "pending" : "route"),
    currentIndexability: isPending ? "KEEP_CURRENT" : match ? "INDEX" : "INDEX",
    currentCanonical: match && !isPending ? url : "",
    inCurrentSitemap: currentSitemapUrls.includes(url),
    httpExpectedStatus: isPending ? 404 : 200,
    sourceFile: sourceFor(pageType),
    notes: isPending ? "Pending records are excluded by getAllSkus and should remain out of public index until owner confirmation." : extra.notes || "Current validator URL or published product route.",
  };
}
const inventory = [...currentSitemapUrls.map((url) => inventoryRow(url)), ...pendingMap.map((row) => inventoryRow(urlFor(row.slug), { notes: "Pending product access URL; expected notFound because getSkuBySlug only returns published confirmed records." }))];
const inventoryUrls = new Set(inventory.map((row) => row.url));
if (inventory.length !== 377 || inventoryUrls.size !== 377) throw new Error(`URL inventory mismatch: ${inventory.length}/${inventoryUrls.size}`);
writeCsv("stage-3a5-current-url-inventory.csv", ["url", "locale", "baseRoute", "pageType", "recordId", "sku", "slug", "publishStatus", "currentIndexability", "currentCanonical", "inCurrentSitemap", "httpExpectedStatus", "sourceFile", "notes"], inventory);

const largest = clusterRows[0];
const largestFields = ["gsm", "size", "width", "color", "coating", "printing", "capacity", "finishing"].map((field) => ({ field, values: unique(fieldValues(largest.rows, field)), variable: variables(largest.rows, field) }));
const largestOutliers = largest.rows.filter((row) => ["material", "form", "application", "buyer", "process"].some((field) => hasDistinct([row], field))).map((row) => row.sku);
const largestAnchor = largest.rows.find((row) => row.publishStatus === "published");
write("stage-3a5-largest-cluster-review.md", [
  "# Stage 3A.5 largest-cluster commercial review",
  "",
  "> Analysis only. No product record, URL, metadata or indexability setting was changed.",
  "",
  `- Cluster: **${largest.clusterId}**` ,
  `- Product: **${largest.sharedTitlePattern}** (${largest.memberCount} records; ${largest.publishedCount} published; ${largest.pendingCount} pending).`,
  `- Current group: \`${largest.currentProductGroup}\`; current representative URL: \`${urlFor(largestAnchor.slug)}\`.`,
  `- Shared commercial evidence: title mode ${largest.sharedTitlePattern}; shared image ratio ${largest.sharedImageRatio}; shared material \`${largest.sharedMaterial}\`; shared form \`${largest.sharedForm}\`; shared application \`${largest.sharedApplication}\`.`,
  `- Distinct-material/form/application/buyer/process flags: ${largest.hasDistinctMaterial}/${largest.hasDistinctForm}/${largest.hasDistinctApplication}/${largest.hasDistinctBuyerType}/${largest.hasDistinctProductionProcess}.`,
  `- Pure specification cluster: **${largest.isPureSpecificationCluster}**. This supports one anchor with a variant selector, but does not by itself approve bulk canonicalization.`,
  "",
  "## Field review",
  "",
  "| Field | Variable | Observed values (truncated) |", "|---|---|---|",
  ...largestFields.map((entry) => `| ${entry.field} | ${entry.variable} | ${entry.values.slice(0, 20).join("; ")}${entry.values.length > 20 ? `; … (${entry.values.length} values)` : ""} |`),
  "",
  `- Apparent commercial outliers: ${largestOutliers.length ? largestOutliers.join(", ") : "none detected from the mapped material/form/application/buyer/process fields"}.`,
  "- Image evidence is representative and reused; the image map reports no exact SKU photography. It cannot be used as proof that every variant is visually identical.",
  "",
  "## Proposed anchor handling",
  "",
  `- Proposed anchor entity: \`product-anchor:${largestAnchor.slug}\` (${urlFor(largestAnchor.slug)}).`,
  "- Public anchor should expose only observed values for GSM/thickness, size/width, coating, color, printing/surface and finishing; quantity, unit and destination remain RFQ fields.",
  "- Commonly repeated values can be shown as quick filters; the complete observed set should be available in a controlled selector rather than hard-coded from this report.",
  "- Old URLs should remain 200 and user-accessible. Because this cluster has material/form conflicts and manual-review records, the staged scenario does not auto-remove its 140 non-anchor members. They remain current until the P0 decision is resolved; only an approved pure-specification cluster may receive INDEX + same-locale canonical and sitemap removal.",
  "- Do not redirect the 141 URLs as a group. A redirect requires a true one-to-one supersession decision.",
  "- Owner confirmation is still required for commercial availability, exact imagery, coating scope, MOQ and any food-contact or performance claims.",
  "",
  "## Decision",
  "",
  `Recommended treatment: **${largest.recommendedPublicTreatment}**; SEO review treatment: **${largest.recommendedSeoTreatment}**; confidence: **${largest.confidence}**; manual review required: **${largest.manualReviewRequired}**.`,
].join("\n"));

const anchorCandidates = [
  { id: "paper-cup-fan", title: "Paper Cup Fan", zh: "纸杯扇形片", family: "Paper Cup Materials", subfamily: "Cupstock Paper", clusters: ["cluster-paper-cup-fan-paper-cup-fan"], records: 141, intent: "Cupstock component procurement", buyer: "Paper cup / food packaging converter", app: "Hot drink, coffee, bowl and beverage cups", form: "fan blank", attrs: "Die-cut fan; representative image only", variants: "gsm, size, coating, color, surface, finishing", content: "group summary + current variant fields", image: "representative only", rfq: "paper-cup-fan", route: "/products/paper-cup-fan", rec: "FAMILY_PAGE", confidence: 0.96, owner: true, reason: "Family/configuration entry; not an independent product entity for every SKU." },
  { id: "paper-cup-roll", title: "PE Coated Paper Roll for Paper Cup", zh: "纸杯淋膜纸卷", family: "Paper Cup Materials", subfamily: "Paper Cup Material Roll", clusters: ["cluster-paper-cup-fan-pe-coated-paper-roll-for-paper-cup"], records: 44, intent: "Roll-stock procurement", buyer: "Paper cup / food packaging converter", app: "Cup and bowl converting", form: "roll", attrs: "PE-coated roll; scope requires owner confirmation", variants: "gsm, size, coating, color, surface, finishing", content: "group summary + current variant fields", image: "representative only", rfq: "pe-coated-paper-roll", route: "/products/pe-coated-paper-roll", rec: "FAMILY_PAGE", confidence: 0.95, owner: false, reason: "Subfamily under Paper Cup Materials; variants are specifications, not separate product anchors." },
  { id: "paper-cup-sheet", title: "PE Coated Paper Sheet for Paper Cup", zh: "纸杯淋膜片材", family: "Paper Cup Materials", subfamily: "Paper Cup Material Sheet", clusters: ["cluster-paper-cup-fan-pe-coated-paper-sheet-for-paper-cup"], records: 19, intent: "Sheet-stock procurement", buyer: "Paper cup / food packaging converter", app: "Converting and forming", form: "sheet", attrs: "PE-coated sheet; scope requires owner confirmation", variants: "gsm, size, coating, surface", content: "group summary + current variant fields", image: "representative only", rfq: "pe-coated-paper-sheet", route: "/products/pe-coated-paper-sheet", rec: "FAMILY_PAGE", confidence: 0.95, owner: false, reason: "Subfamily under Paper Cup Materials; no independent intent beyond sheet format." },
  { id: "paper-cup-bottom-roll", title: "Paper Cup Bottom Roll", zh: "杯底纸卷", family: "Paper Cup Materials", subfamily: "Paper Cup Bottom Roll", clusters: ["cluster-paper-cup-fan-paper-cup-bottom-roll"], records: 18, intent: "Bottom-roll procurement", buyer: "Paper cup converter", app: "Paper cup bottom forming", form: "roll", attrs: "Bottom-roll format", variants: "gsm, size, coating, surface, finishing", content: "group summary + current variant fields", image: "representative only", rfq: "paper-cup-bottom-roll", route: "/products/paper-cup-bottom-roll", rec: "FAMILY_PAGE", confidence: 0.95, owner: false, reason: "Subfamily under Paper Cup Materials; anchor candidate remains a family entry." },
  { id: "cupstock-paper", title: "Cupstock Paper", zh: "杯纸", family: "Paper Cup Materials", subfamily: "Cupstock Paper", clusters: ["cluster-paper-cup-fan-kraft-cupstock-paper"], records: 8, intent: "Cupstock paper procurement", buyer: "Paper cup converter", app: "Cup converting projects", form: "paper material", attrs: "Kraft/cupstock wording requires owner confirmation", variants: "title, gsm, size, coating, color, surface, finishing", content: "group summary + current variant fields", image: "representative only", rfq: "paper-cup-fan", route: "/products/cupstock-paper", rec: "FAMILY_PAGE", confidence: 0.91, owner: true, reason: "Subfamily under Paper Cup Materials; not a second independent anchor until material scope is confirmed." },
  { id: "food-tray-material", title: "Food Tray Paper Material", zh: "食品托盘纸料", family: "Paper Cup Materials", subfamily: "Food Tray Paper Material", clusters: ["cluster-paper-cup-fan-food-tray-paper-material"], records: 1, intent: "Tray material procurement", buyer: "Food packaging converter", app: "Food tray and insert forming", form: "paper material", attrs: "Singleton with distinct tray application", variants: "material, form, quantity", content: "single published record + group summary", image: "representative only", rfq: "structure-review", route: "/products/food-tray-paper-material", rec: "CORE_PRODUCT_PAGE", confidence: 0.9, owner: false, reason: "The only reviewed singleton with a distinct published tray application; retain as one product anchor candidate, not a reason to noindex all singletons." },
  { id: "corrugated-family", title: "Corrugated Board & Flute Materials", zh: "瓦楞纸板与坑型材料", family: "Corrugated Board & Flute Materials", subfamily: "Family landing", clusters: [], records: 0, intent: "Corrugated material discovery", buyer: "Packaging converter / e-commerce packaging buyer", app: "Mailer and protective structures", form: "family route", attrs: "Flute and board construction require owner confirmation", variants: "board construction, flute, dimensions, closure, print", content: "curated packaging route evidence only", image: "representative only", rfq: "structure-review", route: "/packaging/corrugated-mailer-boxes", rec: "FAMILY_PAGE", confidence: 0.72, owner: true, reason: "Curated family/application entry; no published normalized SKU evidence currently supports an independent product page." },
  { id: "oem-service", title: "OEM / ODM & Custom Paper Converting", zh: "OEM / ODM 与定制纸品加工", family: "OEM / ODM & Custom Paper Converting", subfamily: "Service entry", clusters: [], records: 0, intent: "Custom project review", buyer: "B2B packaging buyer", app: "Custom converting projects", form: "service", attrs: "Process ownership and lead time require owner confirmation", variants: "custom size, material, printing, coating, process", content: "capability/source-map evidence", image: "service imagery", rfq: "structure-review", route: "/custom-paper-products", rec: "SERVICE_ENTRY_NO_PRODUCT_INDEX", confidence: 0.86, owner: true, reason: "Service path, not a normalized product entity." },
  { id: "structure-review", title: "Packaging structure review", zh: "包装结构评估", family: "Packaging Materials & Converted Components", subfamily: "Inquiry entry", clusters: [], records: 0, intent: "Structure inquiry", buyer: "Packaging buyer", app: "Structure, sampling and custom review", form: "service", attrs: "Inquiry context only", variants: "dimensions, structure, material, quantity, destination", content: "interest/inquiry source evidence", image: "none required", rfq: "structure-review", route: "/contact?interest=structure-review", rec: "SERVICE_ENTRY_NO_PRODUCT_INDEX", confidence: 0.95, owner: false, reason: "Inquiry intent and route; not a product anchor." },
  { id: "directory", title: "Paper materials directory", zh: "纸材产品目录", family: "Paper Cup Materials", subfamily: "Directory", clusters: ["cluster-paper-cup-fan-paper-cup-fan"], records: 231, intent: "Catalog discovery", buyer: "B2B packaging buyer / converter", app: "Family and specification discovery", form: "directory", attrs: "Filter and selector UI", variants: "family, material, GSM, coating, form, size", content: "current directory route", image: "representative only", rfq: "paper-cup-fan", route: "/products", rec: "DIRECTORY_ENTRY_NO_PRODUCT_INDEX", confidence: 0.99, owner: false, reason: "Directory entry; it should not be counted as an independent product entity." },
];
const anchorRows = anchorCandidates.map((candidate) => {
  const currentUrls = candidate.clusters.flatMap((clusterId) => (clusters.get(clusterId) || []).filter((row) => row.publishStatus === "published").map((row) => urlFor(row.slug)));
  const proposedBaseRoute = candidate.rec === "CORE_PRODUCT_PAGE" ? candidate.route : candidate.rec === "FAMILY_PAGE" ? `/products/families/${slugify(candidate.family)}` : candidate.route.split("?")[0];
  return {
    anchorId: candidate.id,
    proposedTitleEn: candidate.title,
    proposedTitleZh: candidate.zh,
    family: candidate.family,
    subfamily: candidate.subfamily,
    sourceClusters: candidate.clusters.join("; "),
    sourceProductRecords: candidate.records,
    publishedMemberCount: candidate.clusters.flatMap((id) => clusters.get(id) || []).filter((row) => row.publishStatus === "published").length,
    commercialIntent: candidate.intent,
    primaryBuyer: candidate.buyer,
    primaryApplication: candidate.app,
    materialForm: candidate.form,
    distinctiveAttributes: candidate.attrs,
    variantFields: candidate.variants,
    contentAvailable: candidate.content,
    imageAvailable: candidate.image,
    rfqFields: candidate.rfq,
    currentUrls: currentUrls.join("; ") || candidate.route,
    recommendedBaseRoute: proposedBaseRoute,
    localizedRoutesExpected: localeRoutes(proposedBaseRoute).join("; "),
    indexRecommendation: candidate.rec,
    confidence: candidate.confidence,
    manualApprovalRequired: candidate.owner,
    reason: candidate.reason,
  };
});
writeCsv("stage-3a5-core-product-anchor-review.csv", ["anchorId", "proposedTitleEn", "proposedTitleZh", "family", "subfamily", "sourceClusters", "sourceProductRecords", "publishedMemberCount", "commercialIntent", "primaryBuyer", "primaryApplication", "materialForm", "distinctiveAttributes", "variantFields", "contentAvailable", "imageAvailable", "rfqFields", "currentUrls", "recommendedBaseRoute", "localizedRoutesExpected", "indexRecommendation", "confidence", "manualApprovalRequired", "reason"], anchorRows);
write("stage-3a5-core-product-anchor-review.md", [
  "# Stage 3A.5 core product anchor review",
  "",
  "> No anchor route was created. This review separates family entities, product entities and service/directory entries.",
  "",
  `- Reviewed candidates: **${anchorRows.length}** (the 10 Stage 3A candidates).`,
  "- Recommended family entities: **6**. A family entity is not the same as a SKU or localized URL.",
  "- Recommended independent product anchor entities: **1** — Food Tray Paper Material. It is a published singleton with a distinct tray application; it is not being auto-indexed or deployed in this stage.",
  "- The other nine candidates are not rejected because of thin content alone: five are Paper Cup Materials subfamily/configuration entries, one is a corrugated family/application entry without published normalized records, two are service/inquiry entries, and one is a directory.",
  "",
  "| Candidate | Recommendation | Base route | Localized URL count | Why not an independent product page |", "|---|---|---|---:|---|",
  ...anchorRows.map((row) => `| ${row.proposedTitleEn} | ${row.indexRecommendation} | \`${row.recommendedBaseRoute}\` | ${row.localizedRoutesExpected.split("; ").length} | ${row.reason} |`),
  "",
  "## Reversal rule",
  "",
  "A singleton or small cluster must remain current unless commercial evidence proves duplication or a true supersession. If owner evidence confirms distinct material, form, application, buyer or process, the recommendation must be reversed before any Stage 3B indexation action.",
].join("\n"));

const familyRowsByName = new Map(FAMILY_DEFS.map((family) => [family.name, family]));
const scenarioRows = [
  { scenario: "A_CONSERVATIVE_ADDITIVE", entityType: "family", entityCount: 6, baseRouteCount: 6, localizedUrlCount: 36, currentSitemapCount: CURRENT_SITEMAP_COUNT, removedCount: 0, addedCount: 6, projectedCount: 277, projectedLocalizedUrls: 36, pros: "Adds buyer-facing family paths without changing published product indexability.", cons: "Duplicate variants remain in sitemap until evidence and anchor content mature.", risks: "Short-term duplicate search results and crawl load.", recommended: false },
  { scenario: "A_CONSERVATIVE_ADDITIVE", entityType: "product-anchor", entityCount: 1, baseRouteCount: 1, localizedUrlCount: 6, currentSitemapCount: CURRENT_SITEMAP_COUNT, removedCount: 0, addedCount: 0, projectedCount: 277, projectedLocalizedUrls: 6, pros: "Keeps the reviewed singleton available as a future anchor.", cons: "No immediate consolidation.", risks: "Content completeness and owner evidence still required.", recommended: false },
  { scenario: "B_STAGED_CONSOLIDATION", entityType: "family", entityCount: 6, baseRouteCount: 6, localizedUrlCount: 36, currentSitemapCount: CURRENT_SITEMAP_COUNT, removedCount: 18, addedCount: 6, projectedCount: 259, projectedLocalizedUrls: 36, pros: "Removes only the one fully pure-specification published cluster with no manual-review flags; keeps material-conflict clusters current.", cons: "Most published groups remain pending commercial review before consolidation.", risks: "A future owner decision may expand or reverse the 18-row consolidation.", recommended: true },
  { scenario: "B_STAGED_CONSOLIDATION", entityType: "product-anchor", entityCount: 1, baseRouteCount: 1, localizedUrlCount: 6, currentSitemapCount: CURRENT_SITEMAP_COUNT, removedCount: 18, addedCount: 6, projectedCount: 259, projectedLocalizedUrls: 6, pros: "Retains the singleton product candidate and all unresolved published group anchors as separate concepts.", cons: "Only one independent product page is currently supported by published evidence.", risks: "Owner may later confirm more independent product intents.", recommended: true },
  { scenario: "C_AGGRESSIVE_CONSOLIDATION", entityType: "family", entityCount: 6, baseRouteCount: 6, localizedUrlCount: 36, currentSitemapCount: CURRENT_SITEMAP_COUNT, removedCount: 231, addedCount: 6, projectedCount: 46, projectedLocalizedUrls: 36, pros: "Smallest sitemap and strongest family-level consolidation.", cons: "Removes every published product row from sitemap, including the one product anchor entity.", risks: "High risk of losing independent procurement entry points; difficult rollback without owner decisions.", recommended: false },
  { scenario: "C_AGGRESSIVE_CONSOLIDATION", entityType: "product-anchor", entityCount: 1, baseRouteCount: 1, localizedUrlCount: 6, currentSitemapCount: CURRENT_SITEMAP_COUNT, removedCount: 231, addedCount: 6, projectedCount: 46, projectedLocalizedUrls: 6, pros: "The product entity can remain an implementation concept behind a family route.", cons: "It is not represented by a separate sitemap row in the original 46-row arithmetic.", risks: "If a self-indexable product URL is retained, the corrected count is 47, not 46.", recommended: false },
];
writeCsv("stage-3a5-indexation-scenarios.csv", ["scenario", "entityType", "entityCount", "baseRouteCount", "localizedUrlCount", "currentSitemapCount", "removedCount", "addedCount", "projectedCount", "projectedLocalizedUrls", "pros", "cons", "risks", "recommended"], scenarioRows);
write("stage-3a5-indexation-scenarios.md", [
  "# Stage 3A.5 indexation scenarios",
  "",
  "> All scenarios are planning models. None is implemented.",
  "",
  "## Count definitions",
  "",
  "- A commercial entity is a buyer-facing concept such as a family or a product anchor.",
  "- A base route omits locale, for example `/products/families/paper-cup-materials`.",
  "- A localized URL includes one active locale. Six family entities therefore imply 6 base routes and 36 localized URLs only if all six active locales are published.",
  "- The current validator sitemap has one English canonical row per route and hreflang alternatives in metadata; it does not contain six sitemap rows per localized route.",
  "",
  "## A — CONSERVATIVE_ADDITIVE",
  "",
  "Add six family routes and keep all currently published product rows indexed and in the sitemap. Current 271 − 0 + 6 = **277** validator-style sitemap rows. The family concepts represent 36 localized URLs, but only six English canonical rows would be added to the current sitemap implementation.",
  "",
  "## B — STAGED_CONSOLIDATION (recommended)",
  "",
  "Add six family rows, keep unresolved published groups current, and remove only the 18 rows in the one fully pure-specification cluster with no manual-review flags. Those 18 variants receive INDEX + same-locale canonical-to-product-anchor in the future implementation; they are not automatically noindex. Pending rows remain out of the sitemap with NOINDEX_FOLLOW + SELF/KEEP_CURRENT pending review. Arithmetic: 271 − 18 + 6 = **259**.",
  "",
  "## C — AGGRESSIVE_CONSOLIDATION",
  "",
  "Use the original Stage 3A comparison: remove all 231 published product sitemap rows and add six family rows: 271 − 231 + 6 = **46**. This 46-row arithmetic treats the one product anchor as an entity/implementation concept behind the family route, not as a separate sitemap row. If that product anchor must have its own self-indexable URL, the internally consistent count is 271 − 230 + 6 = **47**. This scenario is not recommended because it can erase independent purchasing paths before owner review.",
  "",
  "## Action separation",
  "",
  "| Case | robotsAction | canonicalAction | sitemapAction | redirectAction |",
  "|---|---|---|---|---|",
  "| High-confidence mechanical variant | INDEX | TO_PRODUCT_ANCHOR | REMOVE | NONE |",
  "| Pending/internal record | NOINDEX_FOLLOW | SELF or KEEP_CURRENT | REMOVE | NONE |",
  "| Independent product anchor | INDEX | SELF | KEEP | NONE |",
  "| Manual review | KEEP_CURRENT or MANUAL_REVIEW | KEEP_CURRENT or MANUAL_REVIEW | KEEP_UNTIL_REVIEW or MANUAL_REVIEW | MANUAL_REVIEW |",
  "",
  "No noindex + cross-page canonical combination is proposed; no canonical target is a noindex page; no cross-locale canonical is proposed.",
].join("\n"));

function scenarioAction(url, scenario) {
  const match = publishedMap.find((row) => url === urlFor(row.slug));
  if (!match) return { action: "KEEP", target: url, reason: "Non-product route remains in all scenarios." };
  const clusterRef = clusterForRow.get(match.recordId);
  const cluster = clusterRef ? clusterReviewById.get(clusterRef.clusterId) : undefined;
  if (scenario === "A") return { action: "KEEP", target: url, reason: "Conservative scenario preserves current published product sitemap row." };
  if (scenario === "B") {
    const anchorSlug = clusterAnchors.get(cluster.clusterId);
    if (cluster && cluster.isPureSpecificationCluster && !cluster.manualReviewRequired && anchorSlug && anchorSlug !== match.slug) return { action: "REMOVE", target: urlFor(anchorSlug), reason: "High-confidence pure specification variant; future INDEX + same-locale canonical to product anchor." };
    return { action: "KEEP", target: url, reason: "One representative anchor per published group is retained." };
  }
  return { action: "REMOVE", target: `/en/products/families/${familyRowsByName.get(match.proposedFamily)?.slug || "manual-review"}`, reason: "Aggressive comparison removes every published product sitemap row; the original 46-row arithmetic does not retain a separate product sitemap row." };
}
const sitemapReconRows = [];
for (const url of currentSitemapUrls) {
  const a = scenarioAction(url, "A"); const b = scenarioAction(url, "B"); const c = scenarioAction(url, "C");
  sitemapReconRows.push({ currentUrl: url, locale: "en", pageType: classifyPage(url), baseEntity: url.replace(/^\/en/, ""), currentInSitemap: true, scenarioAAction: a.action, scenarioBAction: b.action, scenarioCAction: c.action, scenarioATarget: a.target, scenarioBTarget: b.target, scenarioCTarget: c.target, reason: `${a.reason} ${b.reason} ${c.reason}` });
}
for (const row of pendingMap) {
  const url = urlFor(row.slug);
  sitemapReconRows.push({ currentUrl: url, locale: "en", pageType: "pending-product", baseEntity: `/products/${row.slug}`, currentInSitemap: false, scenarioAAction: "KEEP_UNTIL_REVIEW", scenarioBAction: "KEEP_UNTIL_REVIEW", scenarioCAction: "KEEP_UNTIL_REVIEW", scenarioATarget: "", scenarioBTarget: "", scenarioCTarget: "", reason: "Pending access URL is not in the current sitemap; do not expose it or canonicalize it to an unrelated family before owner review." });
}
for (const familyUrl of familyUrls) {
  sitemapReconRows.push({ currentUrl: familyUrl, locale: "en", pageType: "planned-family", baseEntity: familyUrl.replace(/^\/en/, ""), currentInSitemap: false, scenarioAAction: "ADD", scenarioBAction: "ADD", scenarioCAction: "ADD", scenarioATarget: familyUrl, scenarioBTarget: familyUrl, scenarioCTarget: familyUrl, reason: "Planned family route; one English canonical sitemap row, with six localized alternates only after content is complete." });
}
writeCsv("stage-3a5-sitemap-reconciliation.csv", ["currentUrl", "locale", "pageType", "baseEntity", "currentInSitemap", "scenarioAAction", "scenarioBAction", "scenarioCAction", "scenarioATarget", "scenarioBTarget", "scenarioCTarget", "reason"], sitemapReconRows);

const manualRows = mapRows.filter((row) => row.manualReviewRequired);
const singletonPublishedDecisionRows = mapRows.filter((row) => {
  const cluster = clusterForRow.get(row.recordId);
  return row.publishStatus === "published" && cluster?.rows.length === 1 && !row.manualReviewRequired;
});
const decisionGroups = new Map();
for (const row of [...manualRows, ...singletonPublishedDecisionRows]) {
  const isPublished = row.publishStatus === "published";
  const cluster = clusterForRow.get(row.recordId);
  const priority = isPublished ? cluster?.rows.length === 1 ? "P1" : "P0" : "P2";
  const key = `${priority}|${row.proposedPublicFamily}`;
  if (!decisionGroups.has(key)) decisionGroups.set(key, { decisionGroupId: `DG-${priority}-${slugify(row.proposedPublicFamily)}`, priority, affectedClusters: new Set(), affectedRows: [], family: row.proposedPublicFamily });
  const group = decisionGroups.get(key); group.affectedClusters.add(row.variantClusterId); group.affectedRows.push(row);
}
const decisionRows = [...decisionGroups.values()].map((group) => ({
  decisionGroupId: group.decisionGroupId,
  priority: group.priority,
  affectedClusters: [...group.affectedClusters].join("; "),
  affectedRecordCount: group.affectedRows.length,
  publishedCount: group.affectedRows.filter((row) => row.publishStatus === "published").length,
  pendingCount: group.affectedRows.filter((row) => row.publishStatus === "pending").length,
  questionForBusiness: group.priority === "P0" ? `Are the published ${group.family} records one commercial family/configuration, and are any members distinct enough for an independent buyer page?` : group.priority === "P1" ? `Does this published singleton ${group.family} record have a distinct commercial buyer intent that should remain independently indexable?` : `Which pending ${group.family} records are active, independently purchasable and supported by owner-approved material/form/application evidence?`,
  availableEvidence: EVIDENCE.join("; "),
  recommendedDefault: group.priority === "P0" ? "Keep current access; only high-confidence mechanical variants may later canonicalize to a same-locale anchor." : group.priority === "P1" ? "Keep current access and do not auto-noindex; add independent content only after owner evidence." : "Keep pending records out of sitemap with NOINDEX_FOLLOW and do not canonicalize to an unrelated family.",
  riskIfWrong: group.priority === "P0" ? "Incorrect consolidation could hide an independent procurement intent." : group.priority === "P1" ? "Auto-noindex could remove a valid product entry point." : "Publishing an unconfirmed claim or route could create inaccurate buyer expectations.",
  affectedRoutes: group.affectedRows.filter((row) => row.publishStatus === "published").map((row) => urlFor(row.slug)).join("; "),
  affectedSitemapUrls: group.affectedRows.filter((row) => row.publishStatus === "published").map((row) => urlFor(row.slug)).join("; "),
}));
writeCsv("stage-3a5-human-decision-sheet.csv", ["decisionGroupId", "priority", "affectedClusters", "affectedRecordCount", "publishedCount", "pendingCount", "questionForBusiness", "availableEvidence", "recommendedDefault", "riskIfWrong", "affectedRoutes", "affectedSitemapUrls"], decisionRows);

const dataEvidenceCandidates = [];
function scan(root, depth = 0) {
  if (depth > 3 || !fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "test-results", "playwright-report"].includes(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) scan(full, depth + 1);
    else if (/(search.?console|gsc|analytics|backlink|external.?links|indexed.?pages|performance)/i.test(entry.name)) dataEvidenceCandidates.push(full.replace(`${projectRoot}/`, ""));
  }
}
scan(path.join(projectRoot, "docs")); scan(path.join(projectRoot, "reports"));
write("stage-3a5-seo-evidence-availability.md", [
  "# Stage 3A.5 SEO evidence availability",
  "",
  "> This is an evidence inventory only. No external account was accessed and no credentials were requested.",
  "",
  `SEARCH_CONSOLE_DATA_AVAILABLE=false`,
  `ANALYTICS_LANDING_DATA_AVAILABLE=false`,
  `BACKLINK_DATA_AVAILABLE=false`,
  "",
  "No verified Search Console export, indexed-pages report, query performance export, analytics landing-page export or backlink dataset was found in the repository evidence scope. Filename matches found (not treated as verified data):",
  dataEvidenceCandidates.length ? dataEvidenceCandidates.map((file) => `- ${file}`).join("\n") : "- none",
  "",
  "Therefore this report makes no claim that any URL has zero traffic, zero impressions, zero clicks or zero SEO value. Mechanical-duplication recommendations rely only on current source data, URL mappings and field/image evidence.",
].join("\n"));

write("stage-3a5-count-reconciliation.md", [
  "# Stage 3A.5 count reconciliation",
  "",
  "> Analysis-only. Runtime, product data and SEO configuration were not changed.",
  "",
  "## Four independent count layers",
  "",
  `- PRODUCT_RECORD_COUNT: **${catalog.skus.length}** records = **${publishedMap.length}** published + **${pendingMap.length}** pending.`,
  `- COMMERCIAL_ENTITY_COUNT: **6** proposed family entities plus **1** recommended independent product anchor entity.`,
  `- BASE_ROUTE_COUNT: **6** family routes plus **1** product-anchor route if all are implemented.`,
  `- LOCALIZED_URL_COUNT: **36** family URLs + **6** product-anchor URLs if all six active locales are complete.`,
  "",
  "## Current sitemap scope",
  "",
  `- Validator-style current page sitemap: **${CURRENT_SITEMAP_COUNT}** English canonical rows = 40 non-product rows + ${publishedMap.length} published product rows.`,
  `- Active locales: ${ACTIVE_LOCALES.join(", ")}; archived locale: ${ARCHIVED_LOCALES.join(", ")}.`,
  "- The current sitemap generator emits one English URL per route and places localized alternatives in hreflang metadata. It does not emit six separate sitemap rows per localized URL. Archived `es` is not included in the active sitemap baseline and is redirected by proxy policy.",
  `- Static/build baseline is **${CURRENT_STATIC_COUNT}** pages; this is not the same metric as the validator's 271 URL list.`,
  "- `src/app/sitemap.ts` also maps news routes at runtime; the validator baseline intentionally reconciles the core 271-row set. The rendered-sitemap/news discrepancy is pre-existing and must be resolved before any migration arithmetic is implemented.",
  "",
  "## What the Stage 3A numbers mean",
  "",
  "- Six family pages = six commercial entities and six locale-free base routes. If all active locales are complete, they represent 36 localized URLs; the current English-canonical sitemap model adds six rows.",
  "- One indexable product page = one proposed product entity, one base route and six localized URLs if localized. It is not automatically six sitemap rows today.",
  "- 231 removed product URLs = 231 published product records with 231 current English base-route URLs in the validator list. The term does not include six-locale expansion.",
  "- `271 - 231 + 6 = 46` is arithmetically correct only when every published product sitemap row is removed and the product anchor is not represented by a separate sitemap row. Keeping the product anchor row makes the internally consistent figure 47 (`271 - 230 + 6`).",
  "",
  "## Recommended staged arithmetic",
  "",
  "- A conservative additive: 271 - 0 + 6 = 277.",
  "- B staged consolidation: 271 - 18 + 6 = 259; only the fully pure-specification sheet cluster is removed, while material-conflict clusters remain current pending review.",
  "- C aggressive comparison: 271 - 231 + 6 = 46; product-anchor self-indexing would correct this to 47.",
  "",
  "## SEO action separation",
  "",
  "`NOINDEX_CANONICAL` is not used as a combined conclusion here. Mechanical variants are proposed as `robotsAction=INDEX`, `canonicalAction=TO_PRODUCT_ANCHOR`, `sitemapAction=REMOVE`; pending rows are `NOINDEX_FOLLOW` + `SELF/KEEP_CURRENT` + `REMOVE`; manual-review and singleton rows remain current until evidence is confirmed.",
].join("\n"));

write("stage-3a5-stage3b-rollout-plan.md", [
  "# Stage 3A.5 Stage 3B rollout plan",
  "",
  "> Planning only. No batch is authorized or implemented by this stage.",
  "",
  "## Stage 3B-1 — Product families and directory UI",
  "",
  "- Build only source-backed family pages and the reviewed product-anchor content model.",
  "- Add family-level directory and RFQ context while keeping every old product URL accessible.",
  "- Do not batch noindex, canonical, remove sitemap rows or redirect old URLs.",
  "- Verify six active locale routes, same-locale canonical/hreflang, images, representative disclosure and RFQ fields before moving on.",
  "",
  "## Stage 3B-2 — High-confidence variant consolidation",
  "",
  "- Process only pure specification clusters with an explicit same-locale anchor, confidence high enough, no material/form/application/buyer/process conflict and no unresolved manual decision.",
  "- Keep old URLs 200; apply INDEX + canonical to the same-locale product anchor; remove only approved duplicate rows from sitemap.",
  "- Review the 141-row Paper Cup Fan cluster separately; do not treat size alone as proof of duplication if business evidence identifies a different procurement intent.",
  "",
  "## Stage 3B-3 — Low-confidence and legacy URLs",
  "",
  "- Resolve manual review groups, singleton published records, small clusters, pending records and owner-confirmation gaps.",
  "- Pending records remain out of sitemap and are not canonicalized to unrelated family pages.",
  "- Redirect only after a true one-to-one supersession decision; avoid chains and cross-locale canonicals.",
  "",
  "## Exit gates",
  "",
  "- Owner decisions recorded for family boundaries, commercial availability, exact imagery, material/coating/food-contact scope, flute/structure and RFQ fields.",
  "- URL-by-URL inventory, canonical targets and sitemap arithmetic pass in the implementation branch.",
  "- Full locale, unit, product selector, inquiry and production regression suites pass before any deployment.",
].join("\n"));

const pendingFamilyCounts = new Map();
for (const row of pendingMap) pendingFamilyCounts.set(row.proposedPublicFamily, (pendingFamilyCounts.get(row.proposedPublicFamily) || 0) + 1);
write("stage-3a5-unresolved-risks.md", [
  "# Stage 3A.5 unresolved risks",
  "",
  "1. **Sitemap metric mismatch:** validator baseline is 271 English canonical rows; runtime rendered output/build reports include news/static entries and are not interchangeable.",
  "2. **46 vs 47 arithmetic:** the original 46-row model removes all 231 product rows but still names one product entity. A separate self-indexable product route changes the count to 47.",
  "3. **Locale completeness:** six localized URLs per family/product are planning counts, not proof that every locale has complete copy. `es` is archived and must not be counted.",
  "4. **Largest cluster evidence:** the 141 Paper Cup Fan records share mapped commercial fields and representative images, but exact SKU imagery and owner-confirmed commercial scope are absent.",
  `5. **Pending records:** ${pendingMap.length} pending records are not current public detail pages; group-level source confirmation is still required.`,
  `6. **Manual decisions:** ${manualRows.length} record-level flags are compressed into ${decisionRows.length} business questions; this is not approval to auto-merge them.`,
  "7. **No performance data:** Search Console, analytics landing and backlink exports were not verified; no traffic or SEO-value conclusion is made.",
  "8. **Canonical safety:** no implementation should point a canonical at a noindex target, cross locales, or redirect without true one-to-one supersession.",
  "9. **Representative media:** current image mappings are representative rather than exact SKU photography; family pages need clear disclosure.",
  "10. **Owner facts:** food-contact, greaseproof/barrier, flute, capacity, MOQ, lead time and process-ownership claims remain blocked until written evidence exists.",
  "",
  "Pending family counts for prioritization:",
  ...[...pendingFamilyCounts.entries()].sort((a, b) => b[1] - a[1]).map(([family, count]) => `- ${family}: ${count}`),
].join("\n"));

const scenarioChecks = {
  A: { current: CURRENT_SITEMAP_COUNT, removed: 0, added: 6, projected: 277 },
  B: { current: CURRENT_SITEMAP_COUNT, removed: currentSitemapUrls.filter((url) => { const a = scenarioAction(url, "B"); return a.action === "REMOVE"; }).length, added: 6, projected: 259 },
  C: { current: CURRENT_SITEMAP_COUNT, removed: currentSitemapUrls.filter((url) => { const a = scenarioAction(url, "C"); return a.action === "REMOVE"; }).length, added: 6, projected: 46 },
};
for (const [key, check] of Object.entries(scenarioChecks)) {
  if (check.current - check.removed + check.added !== check.projected) throw new Error(`Scenario ${key} arithmetic failed`);
}
if (scenarioChecks.B.removed !== 18 || scenarioChecks.C.removed !== 231) throw new Error(`Scenario removal mismatch B=${scenarioChecks.B.removed} C=${scenarioChecks.C.removed}`);
if (inventory.filter((row) => row.inCurrentSitemap).length !== CURRENT_SITEMAP_COUNT) throw new Error("Inventory does not contain 271 current sitemap URLs");

write("stage-3a5-summary.md", [
  "# Stage 3A.5 summary — pre-implementation calibration",
  "",
  "Status: **COMPLETE_CALIBRATION_ONLY**. This stage stopped before Stage 3B.",
  "",
  "## Safety boundary",
  "",
  "No runtime code, product data, pages, metadata, canonical, robots, sitemap, redirects, navigation, locale configuration, hreflang, inquiry API, images, public files, commit, push, deploy or production setting was changed. New files are analysis scripts/tests/docs only.",
  "",
  `- Records: ${catalog.skus.length} total / ${publishedMap.length} published / ${pendingMap.length} pending.`,
  `- Clusters reviewed: ${clusterRows.length}; original manual-review records: ${manualRows.length}; low-confidence records: ${mapRows.filter((row) => Number(row.mappingConfidence) < 0.85).length}.`,
  `- Current validator sitemap: ${CURRENT_SITEMAP_COUNT} English canonical rows = 40 non-product + ${publishedMap.length} product rows.`,
  `- Active locales: ${ACTIVE_LOCALES.join(", ")}; archived: ${ARCHIVED_LOCALES.join(", ")}.`,
  "",
  "## Recommended calibration",
  "",
  "- Six family entities → six base routes → 36 localized URL concepts when all active locales are complete.",
  "- One independent product anchor entity → one base route → six localized URL concepts; the other nine Stage 3A candidates are family subentries, service/inquiry entries or a directory.",
  "- Recommended scenario: **B_STAGED_CONSOLIDATION**, but not implemented. It models 18 high-confidence pure-specification variant rows removed from the English-canonical sitemap and six family rows added: **259** rows; the remaining published clusters stay current until their material/form conflicts are decided.",
  "- Scenario A is additive: 277 rows. Scenario C reproduces the original 46-row comparison but explicitly records its product-anchor inconsistency; a separate self-indexable anchor would be 47.",
  "",
  "## Required owner decisions",
  "",
  "- Confirm which pending records are active and independently purchasable.",
  "- Confirm family boundaries, exact images, material/coating/food-contact scope, flute/structure, process ownership, MOQ/lead time and RFQ fields.",
  "- Decide whether any small or singleton cluster has a distinct commercial buyer intent before any canonical/noindex action.",
  "",
  "## Deliverables",
  "",
  "- `stage-3a5-count-reconciliation.md`",
  "- `stage-3a5-current-url-inventory.csv` (377 rows: 271 current sitemap URLs + 106 pending access URLs)",
  "- `stage-3a5-cluster-commercial-review.csv` (109 rows)",
  "- `stage-3a5-largest-cluster-review.md`",
  "- `stage-3a5-core-product-anchor-review.md/.csv`",
  "- `stage-3a5-indexation-scenarios.md/.csv`",
  "- `stage-3a5-sitemap-reconciliation.csv`",
  "- `stage-3a5-seo-evidence-availability.md`",
  "- `stage-3a5-human-decision-sheet.csv`",
  "- `stage-3a5-stage3b-rollout-plan.md`",
  "- `stage-3a5-unresolved-risks.md`",
].join("\n"));

console.log(JSON.stringify({
  records: catalog.skus.length,
  published: publishedMap.length,
  pending: pendingMap.length,
  clusters: clusterRows.length,
  singletonClusters: clusterRows.filter((row) => row.memberCount === 1).length,
  singletonPublished: clusterRows.filter((row) => row.memberCount === 1 && row.publishedCount > 0).length,
  singletonProposedNoindex: clusterRows.filter((row) => row.memberCount === 1 && row.recommendedSeoTreatment === "NOINDEX_FOLLOW").length,
  singletonReversalReview: clusterRows.filter((row) => row.memberCount === 1 && row.manualReviewRequired).length,
  manualRecords: manualRows.length,
  manualDecisionGroups: decisionRows.length,
  lowConfidence: mapRows.filter((row) => Number(row.mappingConfidence) < 0.85).length,
  currentSitemap: CURRENT_SITEMAP_COUNT,
  currentStatic: CURRENT_STATIC_COUNT,
  inventoryRows: inventory.length,
  clusterReviewRows: clusterRows.length,
  scenarioA: scenarioChecks.A,
  scenarioB: scenarioChecks.B,
  scenarioC: scenarioChecks.C,
  familyEntities: FAMILY_DEFS.length,
  familyBaseRoutes: FAMILY_DEFS.length,
  familyLocalizedUrls: FAMILY_DEFS.length * ACTIVE_LOCALES.length,
  productAnchorEntities: 1,
  productAnchorBaseRoutes: 1,
  productAnchorLocalizedUrls: ACTIVE_LOCALES.length,
}, null, 2));
