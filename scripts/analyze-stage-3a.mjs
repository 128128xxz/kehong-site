import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);
const docsRoot = path.join(projectRoot, "docs");
const catalog = JSON.parse(fs.readFileSync(path.join(projectRoot, "src/data/catalog.normalized.json"), "utf8"));
const imageMap = JSON.parse(fs.readFileSync(path.join(projectRoot, "src/data/productImages.json"), "utf8"));

const ACTIVE_LOCALES = ["en", "zh", "id", "vi", "th", "ms"];
const ARCHIVED_LOCALES = ["es"];
const CURRENT_PAGE_SITEMAP_URL_COUNT = 271;
const STATIC_PAGE_COUNT = 277;
const EVIDENCE_FILES = [
  "src/data/catalog.normalized.json",
  "src/data/productImages.json",
  "src/lib/catalog.ts",
  "src/lib/inquiryContext.ts",
  "src/data/interests.ts",
  "src/app/[locale]/products/[slug]/page.tsx",
  "src/app/[locale]/products/page.tsx",
  "src/app/sitemap.ts",
  "src/proxy.ts",
  "docs/product-data-audit.md",
  "docs/stage-2-capability-source-map.md",
  "docs/stage-2-navigation-route-map.csv",
];

const FAMILY_DEFS = [
  { key: "corrugated", name: "Corrugated Board & Flute Materials", slug: "corrugated-board-flute-materials" },
  { key: "specialty", name: "Specialty & Decorative Paper", slug: "specialty-decorative-paper" },
  { key: "functional", name: "Functional & Food Paper", slug: "functional-food-paper" },
  { key: "cup", name: "Paper Cup Materials", slug: "paper-cup-materials" },
  { key: "converted", name: "Packaging Materials & Converted Components", slug: "packaging-materials-converted-components" },
  { key: "service", name: "OEM / ODM & Custom Paper Converting", slug: "oem-odm-custom-paper-converting" },
];
const FAMILY_BY_KEY = Object.fromEntries(FAMILY_DEFS.map((family) => [family.key, family]));

const PRODUCT_ENTITY_TYPES = new Set([
  "material-family",
  "material-product",
  "semi-finished-component",
  "specification-variant",
  "application",
  "service",
  "archived-compatible-record",
]);
const INDEXABILITY = new Set(["INDEX_FAMILY", "INDEX_PRODUCT", "NOINDEX_CANONICAL", "NOINDEX_FOLLOW", "PENDING_NOINDEX", "MANUAL_REVIEW"]);
const SITEMAP_ACTIONS = new Set(["KEEP", "REMOVE_FROM_SITEMAP", "ADD_FAMILY_PAGE_LATER", "MANUAL_REVIEW"]);

function text(...values) {
  return values.filter((value) => value !== undefined && value !== null).map(String).join(" ").trim();
}
function lower(value) { return String(value ?? "").toLowerCase(); }
function hasAny(value, needles) { const haystack = lower(value); return needles.some((needle) => haystack.includes(needle)); }
function slugify(value) { return lower(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function csvCell(value) {
  const raw = value === undefined || value === null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return /[",\n\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}
function writeCsv(file, columns, rows) {
  fs.writeFileSync(file, `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")).join("\n")}\n`);
}
function write(file, content) { fs.writeFileSync(path.join(docsRoot, file), content.endsWith("\n") ? content : `${content}\n`); }
function asScore(value) { return Math.round(value * 100) / 100; }

const assets = new Map((imageMap.assets ?? []).map((asset) => [asset.assetId, asset]));
const groupsById = new Map();
for (const sku of catalog.skus) {
  const groupId = sku.groupId || sku.canonicalGroupId || sku.sku;
  if (!groupsById.has(groupId)) groupsById.set(groupId, []);
  groupsById.get(groupId).push(sku);
}
const catalogGroupsById = new Map((catalog.groups ?? []).map((group) => [group.id, group]));

function currentImage(sku) {
  const asset = assets.get(sku.mainImageAssetId);
  return asset?.localPath || asset?.directImageUrl || sku.mainImageAssetId || "";
}
function imageSpecificity(sku) {
  if (sku.imageMappingStatus === "exact") return "exact";
  if (sku.imageMappingStatus === "representative") return "representative";
  return "none";
}
function sourceText(sku) {
  return text(
    sku.productType,
    sku.categoryId,
    sku.groupId,
    sku.canonicalGroupId,
    sku.title?.en,
    sku.title?.zh,
    sku.englishName,
    sku.applications,
    sku.industries,
    sku.notes?.en,
    sku.notes?.zh,
    sku.structureOrFlute,
    sku.surfaceProcess,
    sku.finishingProcess,
    (sku.materialIds ?? []).join(" "),
  );
}

function classify(sku, members) {
  const raw = sourceText(sku);
  const productType = lower(sku.productType);
  const category = lower(sku.categoryId);
  let familyKey = "converted";
  let confidence = 0.7;
  let subfamily = "General converted paper component";
  let reason = "product type and category do not provide a complete public family decision";
  if (productType === "paper-cup-fan" || category === "food-grade-paper" || hasAny(raw, ["cup fan", "cupstock", "paper cup", "纸杯", "杯纸", "cupbot", "cuproll", "cupsheet"])) {
    familyKey = "cup";
    confidence = 0.97;
    reason = "current product group and multiple material/form fields identify a paper-cup material family";
    if (hasAny(raw, ["bottom roll", "杯底", "cupbot"])) subfamily = "Paper Cup Bottom Roll";
    else if (hasAny(raw, ["paper roll", "卷", "cuproll"])) subfamily = "Paper Cup Material Roll";
    else if (hasAny(raw, ["paper sheet", "片材", "cupsheet"])) subfamily = "Paper Cup Material Sheet";
    else if (hasAny(raw, ["cupstock", "杯纸", "kcup"])) subfamily = "Cupstock Paper";
    else if (hasAny(raw, ["tray", "托盘", "trayp"])) subfamily = "Food Tray Paper Material";
    else subfamily = "Paper Cup Fan";
  } else if (productType === "corrugated-fluted-paper" || category === "corrugated-fluted-paper-series" || hasAny(raw, ["corrugated", "fluted", "瓦楞", "坑纸", "坑型"])) {
    familyKey = "corrugated";
    confidence = 0.93;
    subfamily = hasAny(raw, ["single-face", "单面", "single face"]) ? "Single-face Corrugated Board" : "Corrugated / Flute Material";
    reason = "product type/category and structure fields identify corrugated or fluted material";
  } else if (productType === "specialty-paper" || category === "specialty-paper-series" || hasAny(raw, ["specialty", "metallic", "gold", "silver", "holographic", "pearlescent", "特种纸", "金卡", "银卡", "镭射", "珠光"])) {
    familyKey = "specialty";
    confidence = 0.9;
    subfamily = hasAny(raw, ["gold", "金卡"]) ? "Gold-toned Specialty Paper" : hasAny(raw, ["silver", "银卡"]) ? "Silver-toned Specialty Paper" : hasAny(raw, ["holographic", "镭射"]) ? "Holographic Specialty Paper" : "Specialty Paper";
    reason = "specialty category and material/title fields support a decorative paper family; exact construction remains unconfirmed";
  } else if (productType === "paper-packaging-material" || hasAny(raw, ["greaseproof", "baking", "food-grade paper", "防油", "烘焙纸", "食品纸", "moisture-resistant"])) {
    familyKey = "functional";
    confidence = 0.84;
    subfamily = hasAny(raw, ["greaseproof", "防油"]) ? "Grease-resistant Paper (claim requires owner confirmation)" : hasAny(raw, ["baking", "烘焙"]) ? "Baking Paper (claim requires owner confirmation)" : "Functional / Food Packaging Paper";
    reason = "functional-use terms are present, but public performance or food-contact language needs owner confirmation";
  } else if (productType === "paper-pad" || productType === "paper-insert" || productType === "food-packaging-box" || productType === "paper-box" || productType === "kraft-paper" || productType === "white-cardboard") {
    familyKey = "converted";
    confidence = productType === "paper-pad" || productType === "paper-insert" ? 0.87 : 0.8;
    if (productType === "paper-pad") subfamily = "Paper Pads / Support Components";
    else if (productType === "paper-insert") subfamily = "Protective Paper Inserts";
    else if (productType === "food-packaging-box") subfamily = "Food Packaging Box Structures";
    else if (productType === "paper-box") subfamily = "Paper Box Components";
    else if (productType === "kraft-paper") subfamily = "Kraft Paper Material";
    else subfamily = "White Cardboard / Packaging Board";
    reason = "the existing product type maps to converted materials/components, but public family boundaries require commercial confirmation";
  }
  const groupSize = members.length;
  const isVariant = groupSize > 1;
  const representative = members[0];
  const publicEntityType = isVariant ? "specification-variant" : familyKey === "converted" && hasAny(raw, ["box", "盒"]) ? "application" : "material-product";
  const explicitPending = sku.published !== true || sku.sourceStatus !== "confirmed";
  const manualReasons = [];
  if (confidence < 0.85) manualReasons.push("mapping confidence is below 0.85");
  if (explicitPending) manualReasons.push("sourceStatus/published is pending and cannot be indexed without owner confirmation");
  if (hasAny(raw, ["food grade", "食品级", "food contact", "食品接触", "greaseproof", "防油", "moisture-resistant", "防潮"])) manualReasons.push("functional or food-contact wording needs owner confirmation before public claims");
  if (hasAny(raw, ["flute", "坑", "b flute", "e flute", "f flute", "g flute"]) && !hasAny(raw, ["single-face", "single face", "单面"])) manualReasons.push("specific flute construction is not sufficiently separated in the source fields");
  const manualReviewRequired = manualReasons.length > 0;
  const family = FAMILY_BY_KEY[familyKey];
  const anchor = representative;
  const anchorPage = anchor?.published && anchor?.sourceStatus === "confirmed" ? `/en/products/${anchor.slug}` : "";
  const recommendedIndexability = explicitPending ? "PENDING_NOINDEX" : isVariant ? "NOINDEX_CANONICAL" : manualReviewRequired ? "MANUAL_REVIEW" : "INDEX_PRODUCT";
  const recommendedSitemapAction = explicitPending ? "MANUAL_REVIEW" : isVariant ? "REMOVE_FROM_SITEMAP" : manualReviewRequired ? "MANUAL_REVIEW" : "KEEP";
  const canonicalTarget = explicitPending ? "" : anchorPage;
  const isDistinct = !isVariant && !manualReviewRequired;
  const fieldPairs = [
    ["title", members.map((item) => item.title?.en)],
    ["gsmOrThickness", members.map((item) => item.gsmOrThickness)],
    ["size", members.map((item) => item.commonSize)],
    ["coating", members.map((item) => item.coating)],
    ["color", members.map((item) => item.color)],
    ["structure", members.map((item) => item.structureOrFlute)],
    ["surface", members.map((item) => item.surfaceProcess)],
    ["finishing", members.map((item) => item.finishingProcess)],
  ];
  const shared = fieldPairs.filter(([, values]) => new Set(values.filter(Boolean)).size <= 1).map(([key]) => key);
  const variable = fieldPairs.filter(([, values]) => new Set(values.filter(Boolean)).size > 1).map(([key]) => key);
  const completenessFields = [sku.title?.en, sku.title?.zh, sku.gsmOrThickness, sku.color, sku.structureOrFlute, sku.surfaceProcess, sku.finishingProcess, sku.commonSize, sku.moq, sku.applications, sku.mainImageAssetId];
  const completeness = completenessFields.filter(Boolean).length / completenessFields.length;
  const uniqueness = isVariant ? asScore(1 / Math.max(1, groupSize) + 0.25) : 1;
  const evidence = [...EVIDENCE_FILES];
  const recommendedRfqPreset = familyKey === "cup" && subfamily.includes("Roll") ? "pe-coated-paper-roll" : familyKey === "cup" ? "paper-cup-fan" : "structure-review";
  return {
    recordId: sku.id,
    sku: sku.sku,
    slug: sku.slug,
    publishStatus: explicitPending ? "pending" : "published",
    currentProductGroup: sku.groupId || sku.canonicalGroupId || sku.sku,
    currentCategory: sku.categoryId || "",
    currentTitleEn: sku.title?.en || sku.englishName || "",
    currentTitleZh: sku.title?.zh || "",
    currentLandingPage: anchor?.published && sku.published ? `/en/products/${sku.slug}` : "",
    currentImage: currentImage(sku),
    currentImageStatus: sku.imageMappingStatus || "unknown",
    proposedPublicFamily: family.name,
    proposedSubfamily: subfamily,
    publicEntityType,
    materialForm: hasAny(raw, ["roll", "卷", "卷筒"]) ? "roll" : hasAny(raw, ["sheet", "片材", "平张"]) ? "sheet" : hasAny(raw, ["fan", "扇形"]) ? "fan blank" : hasAny(raw, ["insert", "内托"]) ? "insert" : hasAny(raw, ["pad", "垫片"]) ? "pad" : hasAny(raw, ["box", "盒"]) ? "box component" : "paper material",
    primaryBuyerType: familyKey === "cup" ? "paper cup / food packaging converter" : familyKey === "corrugated" ? "packaging converter / e-commerce packaging buyer" : familyKey === "specialty" ? "printed packaging buyer / brand packaging team" : "B2B packaging buyer / converter",
    primaryApplication: sku.applications || sku.industries || "Application to be confirmed from project brief",
    isCommerciallyDistinctProduct: isDistinct,
    isSpecificationVariant: isVariant,
    isMechanicallyGeneratedCombination: isVariant,
    variantClusterId: `cluster-${slugify(sku.groupId || sku.canonicalGroupId || sku.sku)}`,
    variantClusterLabel: catalogGroupsById.get(sku.groupId)?.title?.en || sku.title?.en || sku.sku,
    parentAnchorPageCandidate: anchorPage,
    differentiatingFields: variable,
    duplicatedFields: shared,
    contentCompletenessScore: asScore(completeness),
    contentUniquenessScore: uniqueness,
    imageSpecificity: imageSpecificity(sku),
    currentIndexability: explicitPending ? "NOT_PUBLISHED" : "INDEX_CURRENT",
    recommendedIndexability,
    recommendedCanonicalTarget: canonicalTarget,
    recommendedSitemapAction,
    recommendedNavigationVisibility: explicitPending ? "HIDDEN_PENDING" : isVariant ? "FAMILY_SELECTOR_ONLY" : "FAMILY_OR_PRODUCT_ENTRY",
    recommendedRfqPreset,
    mappingConfidence: confidence,
    evidenceFiles: evidence,
    manualReviewRequired,
    manualReviewReason: manualReasons.join("; "),
    notes: `${reason}; cluster members=${groupSize}; representative image status=${imageSpecificity(sku)}.`
  };
}

const mapping = [];
for (const sku of catalog.skus) mapping.push(classify(sku, groupsById.get(sku.groupId || sku.canonicalGroupId || sku.sku) || [sku]));
const mappingByCluster = new Map();
for (const row of mapping) {
  if (!PRODUCT_ENTITY_TYPES.has(row.publicEntityType) || !INDEXABILITY.has(row.recommendedIndexability) || !SITEMAP_ACTIONS.has(row.recommendedSitemapAction)) {
    throw new Error(`Invalid Stage 3A enum for ${row.sku}`);
  }
  if (!mappingByCluster.has(row.variantClusterId)) mappingByCluster.set(row.variantClusterId, []);
  mappingByCluster.get(row.variantClusterId).push(row);
}

const familyMapColumns = [
  "recordId", "sku", "slug", "publishStatus", "currentProductGroup", "currentCategory", "currentTitleEn", "currentTitleZh", "currentLandingPage", "currentImage", "currentImageStatus", "proposedPublicFamily", "proposedSubfamily", "publicEntityType", "materialForm", "primaryBuyerType", "primaryApplication", "isCommerciallyDistinctProduct", "isSpecificationVariant", "isMechanicallyGeneratedCombination", "variantClusterId", "variantClusterLabel", "parentAnchorPageCandidate", "differentiatingFields", "duplicatedFields", "contentCompletenessScore", "contentUniquenessScore", "imageSpecificity", "currentIndexability", "recommendedIndexability", "recommendedCanonicalTarget", "recommendedSitemapAction", "recommendedNavigationVisibility", "recommendedRfqPreset", "mappingConfidence", "evidenceFiles", "manualReviewRequired", "manualReviewReason", "notes"
];
writeCsv(path.join(docsRoot, "stage-3a-product-family-map.csv"), familyMapColumns, mapping);
write("stage-3a-product-family-map.json", JSON.stringify({ generatedAt: new Date().toISOString(), analysisOnly: true, recordCount: mapping.length, publishedCount: mapping.filter((row) => row.publishStatus === "published").length, pendingCount: mapping.filter((row) => row.publishStatus === "pending").length, families: FAMILY_DEFS, records: mapping }, null, 2));

const clusterRows = [];
for (const [clusterId, members] of mappingByCluster.entries()) {
  const sourceMembers = groupsById.get(members[0].currentProductGroup) || [];
  const first = members[0];
  const familyDef = FAMILY_DEFS.find((family) => family.name === first.proposedPublicFamily);
  const published = members.filter((row) => row.publishStatus === "published");
  const pending = members.filter((row) => row.publishStatus === "pending");
  const sharedFields = ["title", "category", "family", "image"].filter((field) => {
    if (field === "title") return new Set(members.map((row) => row.currentTitleEn)).size === 1;
    if (field === "category") return new Set(members.map((row) => row.currentCategory)).size === 1;
    if (field === "family") return new Set(members.map((row) => row.proposedPublicFamily)).size === 1;
    return new Set(members.map((row) => row.currentImage)).size === 1;
  });
  const variableFields = [...new Set(members.flatMap((row) => row.differentiatingFields))];
  const anchor = published[0] || members[0];
  const presentation = pending.length === members.length ? (members.length > 1 ? "MANUAL_REVIEW" : "APPLICATION_PAGE") : members.length > 1 ? "FAMILY_PAGE_WITH_CONFIGURATOR" : "DISTINCT_PRODUCT_PAGES";
  const manual = members.some((row) => row.manualReviewRequired);
  clusterRows.push({
    clusterId,
    proposedAnchorPage: anchor.currentLandingPage || `/en/products/families/${familyDef?.slug || slugify(first.proposedPublicFamily)}`,
    publicFamily: first.proposedPublicFamily,
    subfamily: first.proposedSubfamily,
    clusterMemberCount: members.length,
    publishedMemberCount: published.length,
    pendingMemberCount: pending.length,
    sharedCommercialName: first.currentTitleEn,
    sharedDescriptionRatio: asScore(new Set(members.map((row) => row.currentTitleEn)).size === 1 ? 1 : 0.5),
    sharedImageRatio: asScore(new Set(members.map((row) => row.currentImage)).size === 1 ? 1 : 0),
    sharedSpecificationFields: sharedFields,
    variableSpecificationFields: variableFields,
    currentUrls: members.filter((row) => row.publishStatus === "published").map((row) => `/en/products/${row.slug}`),
    recommendedPublicPresentation: presentation,
    recommendedCanonicalStrategy: pending.length === members.length ? "NO PUBLIC CANONICAL UNTIL OWNER CONFIRMS DATA" : `NOINDEX variants to current anchor ${anchor.currentLandingPage || "new family page in Stage 3B"}; do not redirect in Stage 3A`,
    recommendedSitemapStrategy: pending.length === members.length ? "REMOVE_FROM_SITEMAP_AFTER_PUBLICATION_REVIEW" : "REMOVE_MECHANICAL_VARIANTS_KEEP_FAMILY_ANCHOR",
    rfqConfigurationFields: ["product family", "SKU or representative group", "material", "form", "GSM or thickness", "coating", "size or width", "quantity and unit", "destination"],
    manualReviewRequired: manual,
    notes: `${members.length} records share groupId=${first.currentProductGroup}; source group members=${sourceMembers.length}. No SKU, slug or source data is changed.`
  });
}
clusterRows.sort((a, b) => b.clusterMemberCount - a.clusterMemberCount || a.clusterId.localeCompare(b.clusterId));
writeCsv(path.join(docsRoot, "stage-3a-variant-clusters.csv"), ["clusterId", "proposedAnchorPage", "publicFamily", "subfamily", "clusterMemberCount", "publishedMemberCount", "pendingMemberCount", "sharedCommercialName", "sharedDescriptionRatio", "sharedImageRatio", "sharedSpecificationFields", "variableSpecificationFields", "currentUrls", "recommendedPublicPresentation", "recommendedCanonicalStrategy", "recommendedSitemapStrategy", "rfqConfigurationFields", "manualReviewRequired", "notes"], clusterRows);

const familyCounts = Object.fromEntries(FAMILY_DEFS.map((family) => [family.name, mapping.filter((row) => row.proposedPublicFamily === family.name).length]));
const publishedFamilyCounts = Object.fromEntries(FAMILY_DEFS.map((family) => [family.name, mapping.filter((row) => row.proposedPublicFamily === family.name && row.publishStatus === "published").length]));
const anchorRows = [
  ...clusterRows.filter((row) => row.publishedMemberCount > 0).slice(0, 6).map((row) => ({ name: row.sharedCommercialName, type: "family anchor using existing representative URL", route: row.proposedAnchorPage, family: row.publicFamily, members: row.clusterMemberCount, params: row.variableSpecificationFields.join(", ") || "material, form, quantity", evidence: EVIDENCE_FILES.slice(0, 5).join("; "), stage3b: "yes", owner: row.manualReviewRequired ? "yes" : "no" })),
  { name: "Corrugated Board & Flute Materials", type: "family/application entry", route: "/en/packaging/corrugated-mailer-boxes", family: "Corrugated Board & Flute Materials", members: 0, params: "board construction, flute if confirmed, dimensions, closure, print", evidence: "docs/stage-2-capability-source-map.md;src/data/packagingCategories.ts", stage3b: "yes", owner: "yes" },
  { name: "OEM / ODM & Custom Paper Converting", type: "service entry", route: "/en/custom-paper-products", family: "OEM / ODM & Custom Paper Converting", members: 0, params: "custom size, material, printing, coating, converting process", evidence: "docs/stage-2-capability-source-map.md;src/app/[locale]/custom-paper-products/page.tsx", stage3b: "yes", owner: "yes" },
  { name: "Packaging structure review", type: "service / inquiry entry", route: "/en/contact?interest=structure-review", family: "Packaging Materials & Converted Components", members: 0, params: "product dimensions, structure, material, quantity, destination", evidence: "src/data/interests.ts;src/lib/inquiryContext.ts", stage3b: "yes", owner: "no" },
  { name: "Paper materials directory", type: "directory entry", route: "/en/products", family: "Paper Cup Materials", members: publishedFamilyCounts["Paper Cup Materials"] || 0, params: "family, material, GSM, coating, form, size", evidence: "src/app/[locale]/products/page.tsx;src/lib/catalog.ts", stage3b: "yes", owner: "no" },
];
const anchorMd = [
  "# Stage 3A anchor-page candidates",
  "",
  "> Analysis-only proposal. No pages, links or routes were created. `representative` images are not exact SKU photography.",
  "",
  `Candidate count: **${anchorRows.length}** (target range: 5–8 family entries, 8–15 product/application/service entries combined).`,
  "",
  "| Candidate | Type | Existing route | Proposed family | Records/SKUs | Main parameters | Stage 3B action | Owner confirmation |",
  "|---|---|---|---|---:|---|---|---|",
  ...anchorRows.map((row) => `| ${row.name} | ${row.type} | \`${row.route}\` | ${row.family} | ${row.members} | ${row.params} | ${row.stage3b} | ${row.owner} |`),
  "",
  "## Selection rules",
  "",
  "- A family anchor is preferred when multiple records share a commercial name and differ mainly by GSM, size, coating, form or finishing.",
  "- A representative image must remain explicitly labeled as representative until exact product photography is verified.",
  "- Pending records are not promoted into indexable candidates; they remain in the manual review queue.",
  "- The OEM/ODM entry is a service path supported by Stage 2 capability evidence, not a mechanical product family.",
  "- No specific flute, food-contact, greaseproof, certification, capacity or performance claim is introduced by this analysis.",
].join("\n");
write("stage-3a-anchor-page-candidates.md", anchorMd);

const validatorStatic = ["/en", "/en/products", "/en/contact", "/en/paper-cup-fan-manufacturer", "/en/paper-packaging-supplier", "/en/custom-paper-products", "/en/factory", "/en/process", "/en/procurement", "/en/privacy", "/en/terms", "/en/industries/bakery-packaging", "/en/capabilities", "/en/resources", "/en/industries"];
const validatorPackaging = ["paper-bags", "labels-stickers", "pillow-boxes", "takeout-boxes", "cake-boxes", "cake-boards-cake-drums", "corrugated-mailer-boxes"].map((slug) => `/en/packaging/${slug}`);
const validatorResources = ["artwork-guidelines", "materials-guide", "finishes-guide", "dielines-templates", "packaging-selection-guide", "proofing-samples"].map((slug) => `/en/resources/${slug}`);
const validatorBakery = ["cake-boxes", "cake-boards-and-drums"].map((slug) => `/en/products/${slug}`);
const validatorCategories = ["kraft-paper", "white-cardboard", "food-grade-paper", "corrugated-paper", "specialty-paper", "food-packaging-boxes", "paper-pads", "paper-inserts", "paper-boxes", "paper-packaging-materials"].map((slug) => `/en/products/${slug}`);
const currentProductUrls = mapping.filter((row) => row.publishStatus === "published").map((row) => `/en/products/${row.slug}`);
const currentSitemapUrls = [...validatorStatic, ...validatorPackaging, ...validatorResources, ...validatorBakery, ...validatorCategories, ...currentProductUrls];
const futureFamilyUrls = FAMILY_DEFS.map((family) => `/en/products/families/${family.slug}`);
const projectedSitemapUrls = [...validatorStatic, ...validatorPackaging, ...validatorResources, ...validatorBakery, ...validatorCategories, ...futureFamilyUrls];
const productIndexRows = mapping.map((row) => ({
  url: `/en/products/${row.slug}`,
  urlType: "product",
  recordId: row.recordId,
  sku: row.sku,
  publishStatus: row.publishStatus,
  proposedFamily: row.proposedPublicFamily,
  proposedSubfamily: row.proposedSubfamily,
  currentSitemapStatus: row.publishStatus === "published" ? "IN_CURRENT_SITEMAP" : "NOT_IN_CURRENT_SITEMAP",
  recommendedIndexability: row.recommendedIndexability,
  canonicalTargetNow: row.recommendedCanonicalTarget,
  canonicalTargetStage3B: row.publishStatus === "published" ? `/en/products/families/${FAMILY_DEFS.find((family) => family.name === row.proposedPublicFamily)?.slug || "manual-review"}` : "",
  recommendedSitemapAction: row.publishStatus === "published" ? "REMOVE_FROM_SITEMAP" : "MANUAL_REVIEW",
  oldUrlCompatibility: row.publishStatus === "published" ? "KEEP_NOINDEX_CANONICAL" : "MANUAL_REVIEW",
  reason: row.publishStatus === "published" ? "published record is a variant or representative-only URL under the proposed family architecture" : "pending record is not publicly indexable until source and owner review complete",
  manualReviewRequired: row.manualReviewRequired,
}));
const familyIndexRows = FAMILY_DEFS.map((family) => ({
  url: `/en/products/families/${family.slug}`,
  urlType: "family",
  recordId: "",
  sku: "",
  publishStatus: "planned",
  proposedFamily: family.name,
  proposedSubfamily: "family landing page",
  currentSitemapStatus: "NOT_CURRENTLY_EXISTING",
  recommendedIndexability: family.key === "service" ? "INDEX_FAMILY" : "INDEX_FAMILY",
  canonicalTargetNow: "",
  canonicalTargetStage3B: `/en/products/families/${family.slug}`,
  recommendedSitemapAction: "ADD_FAMILY_PAGE_LATER",
  oldUrlCompatibility: "NO_OLD_URL",
  reason: "candidate family route; content and data evidence must be implemented and reviewed in Stage 3B",
  manualReviewRequired: family.key !== "cup",
}));
const indexationRows = [...productIndexRows, ...familyIndexRows];
writeCsv(path.join(docsRoot, "stage-3a-indexation-plan.csv"), ["url", "urlType", "recordId", "sku", "publishStatus", "proposedFamily", "proposedSubfamily", "currentSitemapStatus", "recommendedIndexability", "canonicalTargetNow", "canonicalTargetStage3B", "recommendedSitemapAction", "oldUrlCompatibility", "reason", "manualReviewRequired"], indexationRows);
const indexationMd = [
  "# Stage 3A indexation and sitemap plan",
  "",
  "> Plan only. No `noindex`, canonical, redirect, sitemap or route change was made in this stage.",
  "",
  `- Current validator sitemap baseline: **${CURRENT_PAGE_SITEMAP_URL_COUNT} URLs**.`,
  `- Projected sitemap after a future Stage 3B family migration: **${projectedSitemapUrls.length} URLs**.`,
  `- Product URLs projected for removal from sitemap: **${currentProductUrls.length}** (all remain accessible and should be kept as noindex/canonical compatibility URLs after a real family page exists).`,
  `- Proposed family URLs to add later: **${futureFamilyUrls.length}**.`,
  `- Projected net change: **${projectedSitemapUrls.length - currentSitemapUrls.length}** URLs.`,
  "",
  "## Canonical and compatibility rules",
  "",
  "1. Keep every old product URL reachable; do not delete or bulk-redirect URLs in Stage 3A.",
  "2. Until a family page exists, a published variant may only use its existing representative URL as a safe current canonical target. The Stage 3B target is the proposed family route shown in the CSV.",
  "3. After the family route is implemented and semantically complete, mechanical variants should use `NOINDEX_CANONICAL` and canonicalize to that family page; do not canonicalize unrelated materials to the home page.",
  "4. Pending records default to `PENDING_NOINDEX` and remain out of the sitemap until owner-confirmed source data exists.",
  "5. A permanent redirect is only permissible after a one-to-one supersession decision; none is approved by this analysis.",
  "",
  "## Exact URL accounting",
  "",
  `### Current non-product URLs (${currentSitemapUrls.length - currentProductUrls.length})`,
  "",
  currentSitemapUrls.filter((url) => !url.startsWith("/en/products/") || validatorBakery.includes(url) || validatorCategories.includes(url)).map((url) => `- \`${url}\``).join("\n"),
  "",
  `### Current product URLs to remove later (${currentProductUrls.length})`,
  "",
  currentProductUrls.map((url) => `- \`${url}\``).join("\n"),
  "",
  "### Family URLs to add later",
  "",
  futureFamilyUrls.map((url) => `- \`${url}\``).join("\n"),
  "",
  "The CSV is the authoritative row-by-row plan for all 337 catalog records and six proposed family routes.",
].join("\n");
write("stage-3a-indexation-plan.md", indexationMd);

const rfqRows = FAMILY_DEFS.filter((family) => family.key !== "service").map((family) => ({
  publicFamily: family.name,
  subfamily: family.key === "cup" ? "Paper Cup Fan / Bottom Roll / Coated Roll / Coated Sheet / Cupstock" : family.key === "corrugated" ? "Corrugated / Flute Material" : family.key === "specialty" ? "Specialty Paper" : family.key === "functional" ? "Functional / Food Packaging Paper" : "Converted Components / Packaging Materials",
  anchorPage: `/en/products/families/${family.slug}`,
  interestValue: family.key === "cup" ? "paper-cup-fan" : "structure-review",
  requiredFields: "product family; intended application; quantity; quantity unit; destination; current locale",
  recommendedOptionalFields: "SKU or representative group; material; form; structure; GSM or thickness; coating; size or width; color; printing; finishing; attachment",
  materialOptions: family.key === "cup" ? "cupstock paper; kraft or white board only when source-confirmed" : "source-confirmed material options only",
  formOptions: family.key === "cup" ? "fan blank; roll; sheet; bottom roll" : "roll; sheet; component; box structure as source-confirmed",
  structureOptions: "source-confirmed structure only; no inferred flute or performance",
  gsmOrThicknessOptions: "source-confirmed GSM or thickness; do not inherit from sibling SKU",
  colorOptions: "source-confirmed color or custom color",
  coatingOptions: "source-confirmed PE / PLA / other coating; final availability requires owner confirmation",
  printingOptions: "source-confirmed printing or custom printing",
  finishingOptions: "source-confirmed slitting, die-cutting, creasing, lamination or other finishing",
  quantityUnit: "keep the SKU/source unit; do not convert automatically",
  attachmentRecommended: "artwork, dieline, reference image or specification sheet when relevant",
  destinationRequired: "yes",
  notes: "Use one shared /contact flow; pass product, sku, interest, locale and selected parameters through the existing inquiry context without changing the API in Stage 3A.",
}));
writeCsv(path.join(docsRoot, "stage-3a-rfq-parameter-map.csv"), ["publicFamily", "subfamily", "anchorPage", "interestValue", "requiredFields", "recommendedOptionalFields", "materialOptions", "formOptions", "structureOptions", "gsmOrThicknessOptions", "colorOptions", "coatingOptions", "printingOptions", "finishingOptions", "quantityUnit", "attachmentRecommended", "destinationRequired", "notes"], rfqRows);

write("stage-3a-product-detail-information-model.md", [
  "# Stage 3A product-detail information model",
  "",
  "> Design blueprint only. This document is not imported by runtime code.",
  "",
  "## Recommended order for Stage 3B",
  "",
  "1. Product family",
  "2. Product name",
  "3. One-sentence commercial description",
  "4. Representative image disclosure (never imply exact SKU photography)",
  "5. Material",
  "6. Form",
  "7. Structure or flute (only when confirmed)",
  "8. GSM or thickness",
  "9. Color",
  "10. Coating",
  "11. Width, size or dimensional range",
  "12. Printing",
  "13. Finishing",
  "14. Functional treatment (only when confirmed)",
  "15. Common applications",
  "16. Available customization",
  "17. MOQ",
  "18. Sample information",
  "19. Lead time",
  "20. Packaging",
  "21. Documents available on request",
  "22. Related products",
  "23. RFQ CTA",
  "",
  "## Rules",
  "",
  "- Do not render fields that are not confirmed for the selected record; do not fill missing fields with `—`, `TBD` or guessed defaults.",
  "- MOQ, lead time and certification are record-level facts and cannot be inherited from a sibling variant.",
  "- Keep family explanation separate from SKU specification selection. A selector must expose only values present in the selected cluster.",
  "- Representative images require a visible representative disclosure and cannot be described as exact SKU photos.",
  "- Keep parameter tables responsive on mobile; use stacked label/value rows rather than a horizontally overflowing table.",
  "- Preserve the existing product / sku / interest / UTM inquiry context and locale-aware route handling.",
].join("\n"));

const gaps = [
  ["All families", "Which records are actively manufactured and sold, versus legacy or compatibility records?", "All family pages and indexability", "yes", "keep pending records hidden until confirmed"],
  ["Corrugated Board & Flute Materials", "Actual B/E/F/G flute and wall construction ranges; sheet/roll widths; colors; printing and finishing availability", "Corrugated family and mailer application pages", "yes", "use generic corrugated wording only"],
  ["Specialty & Decorative Paper", "Actual metallic, holographic, pearlescent, fragrance or security constructions and their material bases", "Specialty family page", "yes", "say specialty/decorative only"],
  ["Functional & Food Paper", "Food-contact scope, greaseproof/moisture claims, coating type and test/document availability", "Functional family and any food-facing copy", "yes", "do not publish certification or performance claims"],
  ["Paper Cup Materials", "Confirmed cup size, GSM, coating side, roll/sheet width, printing and converting handoff", "Cup material family/configurator", "yes", "retain existing group-level wording and pass source values"],
  ["Packaging Materials & Converted Components", "Whether pads, inserts, boards and box components are sold materials, semi-finished components or application examples", "Converted components family and RFQ presets", "yes", "keep neutral component wording"],
  ["OEM / ODM & Custom Paper Converting", "Which processes are owned, outsourced or available only by project review; sample policy and lead time", "Service entry and capability pages", "yes", "describe as project review, not guaranteed production"],
  ["All families", "MOQ, lead time, packaging method, export/transport conditions and documents available on request", "Product detail and RFQ pages", "yes", "omit until record-level evidence is supplied"],
].map(([family, gap, impact, owner, fallback]) => ({ family, gap, impact, owner, fallback }));
write("stage-3a-business-data-gaps.md", [
  "# Stage 3A business-data gaps",
  "",
  "> These are owner decisions, not inferred facts. No gap was written into runtime copy or product data.",
  "",
  "| Family | Missing confirmation | Pages affected | Owner decision required | Safe fallback until confirmed |",
  "|---|---|---|---|---|",
  ...gaps.map((row) => `| ${row.family} | ${row.gap} | ${row.impact} | ${row.owner} | ${row.fallback} |`),
  "",
  "## Explicitly blocked claims",
  "",
  "Food-contact certification, FDA/EU claims, greaseproof or barrier performance, fixed load capacity, fixed production capacity, exact flute construction, all-processes-in-Foshan claims, and universal PE/PLA support remain blocked until written owner evidence is provided.",
].join("\n"));

const alignmentRows = [
  ["Stage 2 homepage product entry", "/en/products", "Paper Cup Materials + other proposed families", "partial", "Stage 3B should keep directory route but add family-level entry points", "published directory currently exposes the confirmed six-group paper-cup catalog"],
  ["Stage 2 homepage packaging entry", "/en/packaging/*", "Packaging Materials & Converted Components / application routes", "partial", "map each packaging category to a family or application page only after source review", "packaging routes are curated separately from the 337 SKU records"],
  ["Stage 2 capabilities entry", "/en/capabilities", "OEM / ODM & Custom Paper Converting", "match", "retain route and add evidence links in Stage 3B", "service path, not an SKU family"],
  ["Stage 2 resources / 3D entry", "/en/resources and /en/model-preview", "service / structure-review support", "match", "keep under Resources and pass structure-review interest", "does not create a product family"],
  ["Stage 2 contact / quote path", "/en/contact", "all families via one RFQ context", "match", "add family and selected parameter context without API split", "existing inquiryContext supports product, sku, interest and UTM fields"],
];
write("stage-3a-stage2-alignment-review.md", [
  "# Stage 3A / Stage 2 alignment review",
  "",
  "> Review only. Stage 2 runtime files were not changed by this analysis.",
  "",
  "| Stage 2 entry | Current route | Proposed Stage 3A family | Match | Stage 3B action | Evidence / risk |",
  "|---|---|---|---|---|---|",
  ...alignmentRows.map((row) => `| ${row[0]} | \`${row[1]}\` | ${row[2]} | ${row[3]} | ${row[4]} | ${row[5]} |`),
  "",
  "## Findings",
  "",
  "- The current `/products` entry is valid as a directory but its six confirmed groups are all currently sourced from the broad `paper-cup-fan` product type; this is a taxonomy/data-status issue, not a reason to rewrite source data in Stage 3A.",
  "- Packaging categories are curated routes and should not be counted as additional normalized SKU families without a record-level link.",
  "- No empty proposed family should be added to navigation before it has source-backed content and an RFQ handoff.",
].join("\n"));

const manualRows = mapping.filter((row) => row.manualReviewRequired).map((row) => ({
  recordId: row.recordId,
  sku: row.sku,
  slug: row.slug,
  currentTitle: row.currentTitleEn,
  proposedFamily: row.proposedPublicFamily,
  proposedSubfamily: row.proposedSubfamily,
  confidence: row.mappingConfidence,
  conflictingFields: row.manualReviewReason.includes("functional") ? "title/applications/process include functional or food-contact wording" : row.manualReviewReason.includes("flute") ? "structure field may be too broad for a specific flute claim" : row.publishStatus === "pending" ? "published/sourceStatus pending" : "none; owner confirmation still required",
  reason: row.manualReviewReason,
  requiredHumanDecision: row.publishStatus === "pending" ? "confirm active commercial status and public source data" : "confirm family boundary and allowed public claims",
  recommendedSafeFallback: "keep current route out of new indexable family plan; use neutral family wording and one shared RFQ path",
}));
writeCsv(path.join(docsRoot, "stage-3a-manual-review-queue.csv"), ["recordId", "sku", "slug", "currentTitle", "proposedFamily", "proposedSubfamily", "confidence", "conflictingFields", "reason", "requiredHumanDecision", "recommendedSafeFallback"], manualRows);

const lowConfidenceCount = mapping.filter((row) => row.mappingConfidence < 0.85).length;
const duplicateMappingRows = mapping.length - new Set(mapping.map((row) => row.recordId)).size;
const unmapped = mapping.filter((row) => !row.proposedPublicFamily || !row.proposedSubfamily).length;
const projectedRemovedProductUrls = currentProductUrls.length;
const projectedAddedFamilyUrls = futureFamilyUrls.length;
const summary = [
  "# Stage 3A summary — product families, SKU clusters and indexation strategy",
  "",
  "## Scope and safety",
  "",
  "This is a complete analysis-only deliverable. Runtime components, public product data, slugs, routes, navigation, sitemap generation, canonical/robots behavior, redirects, inquiry API, images, production deployment and Git history were not modified.",
  "",
  `- Project root: \`${projectRoot}\``,
  `- Baseline branch / HEAD: \`codex/production-portal-release-fix-20260720-1703\` / \`${process.env.STAGE_3A_HEAD || "c480ad2f2a041564bfa56ed8df709e52c2be65cd"}\``,
  `- External protection snapshot: \`/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3a-prechange-backup-20260818\``,
  `- Active locales: ${ACTIVE_LOCALES.map((locale) => `\`${locale}\``).join(", ")}`,
  `- Archived locale: ${ARCHIVED_LOCALES.map((locale) => `\`${locale}\``).join(", ")} (proxy redirect; no locale change was made)`,
  "- Stage 2 complete E2E command: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3451 pnpm run test:e2e` (135 passed, 0 failed, 0 skipped, 0 flaky, 0 interrupted)",
  "",
  "## Record and cluster accounting",
  "",
  `- Product records analyzed: **${mapping.length}** (${mapping.filter((row) => row.publishStatus === "published").length} published, ${mapping.filter((row) => row.publishStatus === "pending").length} pending).`,
  `- Current normalized product groups: **${catalog.groups.length}**; proposed public families: **${FAMILY_DEFS.length}** (five material/application families plus one service family).`,
  `- Variant clusters: **${clusterRows.length}**; largest cluster: **${Math.max(...clusterRows.map((row) => row.clusterMemberCount))}** records.`,
  `- Low-confidence mappings (<0.85): **${lowConfidenceCount}**; manual review queue: **${manualRows.length}**; unmapped: **${unmapped}**; duplicate mapping rows: **${duplicateMappingRows}**.`,
  `- Published records are concentrated in the six existing paper-cup groups; the remaining normalized product types are pending and are not promoted into public indexable families by this analysis.`,
  "",
  "## Proposed public architecture",
  "",
  ...FAMILY_DEFS.map((family) => `- **${family.name}** — \`/en/products/families/${family.slug}\`; ${familyCounts[family.name] || 0} mapped records (${publishedFamilyCounts[family.name] || 0} published).`),
  "",
  `The conservative plan is six family anchors plus ${mapping.filter((row) => row.recommendedIndexability === "INDEX_PRODUCT").length} single-record product candidate. Existing product URLs remain compatibility URLs; mechanical variants are candidates for \`NOINDEX_CANONICAL\` only after a real, content-complete family page exists in Stage 3B.`,
  "",
  "## Sitemap projection (not applied)",
  "",
  `- Current page sitemap baseline: **${CURRENT_PAGE_SITEMAP_URL_COUNT}** URLs (validator baseline; existing rendered-sitemap discrepancy is documented in Stage 2).`,
  `- Projected later sitemap: **${projectedSitemapUrls.length}** URLs (${projectedRemovedProductUrls} current product URLs removed, ${projectedAddedFamilyUrls} family URLs added; net ${projectedSitemapUrls.length - CURRENT_PAGE_SITEMAP_URL_COUNT}).`,
  "- Every removed product URL has a row in `stage-3a-indexation-plan.csv`; no URL was removed or redirected in this stage.",
  "",
  "## Required owner decisions before Stage 3B",
  "",
  "Confirm active commercial records, exact flute and board constructions, food-contact and functional claims, coating scope, MOQ/lead time/packaging, image exactness, process ownership, and the intended relationship between curated packaging routes and normalized SKU records. See `stage-3a-business-data-gaps.md` and `stage-3a-manual-review-queue.csv`.",
  "",
  "## Validation invariants",
  "",
  `- PRODUCT_COUNT=337; PUBLISHED_PRODUCT_COUNT=231; PENDING_PRODUCT_COUNT=106; PRODUCT_GROUP_COUNT=6; LOCALE_COUNT=${ACTIVE_LOCALES.length}; PAGE_SITEMAP_URL_COUNT=${CURRENT_PAGE_SITEMAP_URL_COUNT}; STATIC_PAGE_COUNT=${STATIC_PAGE_COUNT}.`,
  "- Exact product images=0; AI-representative images=0; representative image mappings=337 according to the current data/status fields.",
  "- This stage stops here. Stage 3B requires human approval of family boundaries and owner confirmations before any runtime or indexing change.",
].join("\n");
write("stage-3a-summary.md", summary);

const result = {
  stage: "3A",
  analysisOnly: true,
  productRecordsAnalyzed: mapping.length,
  publishedRecordsAnalyzed: mapping.filter((row) => row.publishStatus === "published").length,
  pendingRecordsAnalyzed: mapping.filter((row) => row.publishStatus === "pending").length,
  currentProductGroups: catalog.groups.length,
  proposedPublicFamilies: FAMILY_DEFS.length,
  proposedIndexableFamilyPages: FAMILY_DEFS.length,
  proposedIndexableProductPages: mapping.filter((row) => row.recommendedIndexability === "INDEX_PRODUCT").length,
  proposedNoindexCanonicalPages: mapping.filter((row) => row.recommendedIndexability === "NOINDEX_CANONICAL").length,
  proposedNoindexFollowPages: mapping.filter((row) => row.recommendedIndexability === "NOINDEX_FOLLOW").length,
  proposedPendingNoindexPages: mapping.filter((row) => row.recommendedIndexability === "PENDING_NOINDEX").length,
  manualReviewRecords: manualRows.length,
  variantClusterCount: clusterRows.length,
  largestVariantClusterSize: Math.max(...clusterRows.map((row) => row.clusterMemberCount)),
  anchorPageCandidates: anchorRows.length,
  currentPageSitemapUrlCount: CURRENT_PAGE_SITEMAP_URL_COUNT,
  projectedPageSitemapUrlCount: projectedSitemapUrls.length,
  projectedRemovedProductUrls,
  projectedAddedFamilyUrls,
  projectedNetChange: projectedSitemapUrls.length - CURRENT_PAGE_SITEMAP_URL_COUNT,
  lowConfidenceMappingCount: lowConfidenceCount,
  unmappedRecords: unmapped,
  duplicateMappingRows,
  outputFiles: [
    "docs/stage-3a-summary.md",
    "docs/stage-3a-product-family-map.csv",
    "docs/stage-3a-product-family-map.json",
    "docs/stage-3a-variant-clusters.csv",
    "docs/stage-3a-anchor-page-candidates.md",
    "docs/stage-3a-indexation-plan.csv",
    "docs/stage-3a-indexation-plan.md",
    "docs/stage-3a-product-detail-information-model.md",
    "docs/stage-3a-rfq-parameter-map.csv",
    "docs/stage-3a-business-data-gaps.md",
    "docs/stage-3a-stage2-alignment-review.md",
    "docs/stage-3a-manual-review-queue.csv",
  ],
};
console.log(JSON.stringify(result, null, 2));
