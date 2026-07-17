import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/catalog.normalized.json");
const taxonomyPath = path.join(root, "src/data/taxonomy.json");
const reportPath = path.join(root, "docs/product-data-cleaning-report.md");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));
const skus = Array.isArray(catalog.skus) ? catalog.skus : [];
const groups = Array.isArray(catalog.groups) ? catalog.groups : [];
const errors = [];
const warnings = [];
const categoryIds = new Set((taxonomy.categories || []).map((category) => category.id));
const materialIds = new Set((taxonomy.materials || []).map((material) => material.id));

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
}

function collectEnglishCjk(value, pathParts, output) {
  if (typeof value === "string") {
    const key = pathParts.at(-1) || "";
    if ((key === "en" || key === "englishName") && /[\u3400-\u9fff]/u.test(value)) {
      output.push({ path: pathParts.join("."), value });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectEnglishCjk(item, [...pathParts, String(index)], output));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) collectEnglishCjk(child, [...pathParts, key], output);
  }
}

const skuIds = new Set(skus.map((sku) => sku.sku));
const groupIds = new Set(groups.map((group) => group.id || group.groupId || group.canonicalGroupId));
const publishedSkus = skus.filter((sku) => sku.published === true && sku.sourceStatus === "confirmed");
const publishedGroupCounts = new Map();
for (const sku of publishedSkus) {
  const groupId = sku.groupId || sku.canonicalGroupId || sku.sku;
  publishedGroupCounts.set(groupId, (publishedGroupCounts.get(groupId) || 0) + 1);
}
const duplicateSkus = duplicateValues(skus.map((sku) => sku.sku));
const duplicateSlugs = duplicateValues(skus.map((sku) => sku.slug));
const englishCjk = [];
collectEnglishCjk(skus, ["skus"], englishCjk);

for (const sku of skus) {
  for (const field of ["title", "slug", "categoryId", "productType", "sourceStatus", "imageMappingStatus"]) {
    if (!sku[field] || (typeof sku[field] === "string" && !sku[field].trim())) {
      errors.push({ type: "missing-field", sku: sku.sku, field });
    }
  }
  if (sku.categoryId && !categoryIds.has(sku.categoryId)) errors.push({ type: "unknown-category-id", sku: sku.sku, categoryId: sku.categoryId });
  if (!Array.isArray(sku.materialIds) || sku.materialIds.length === 0) errors.push({ type: "empty-material-ids", sku: sku.sku });
  for (const materialId of sku.materialIds || []) {
    if (!materialIds.has(materialId)) errors.push({ type: "unknown-material-id", sku: sku.sku, materialId });
  }
  if (new Set(sku.materialIds || []).size !== (sku.materialIds || []).length) errors.push({ type: "duplicate-material-id", sku: sku.sku });
  for (const legacyField of ["category", "material", "materials"]) {
    if (Object.hasOwn(sku, legacyField)) errors.push({ type: "legacy-field-present", sku: sku.sku, field: legacyField });
  }
  const kraftMaterial = (sku.materialIds || []).some((id) => /kraft|cardstock/iu.test(id));
  if (sku.title?.en?.toLowerCase().includes("kraft") && !kraftMaterial) {
    errors.push({ type: "kraft-material-mismatch", sku: sku.sku, title: sku.title.en, materialIds: sku.materialIds || [] });
  }
  const internalText = JSON.stringify(sku.title || {}) + JSON.stringify(sku.notes || {});
  if (/阿里|来源|标题来自|官网产品页实抓/u.test(internalText)) {
    errors.push({ type: "internal-source-text", sku: sku.sku });
  }
  if (sku.published && sku.groupId && !groupIds.has(sku.groupId)) {
    errors.push({ type: "missing-group-reference", sku: sku.sku, groupId: sku.groupId });
  }
  if (sku.published && (sku.sourceStatus !== "confirmed" || !["exact", "representative", "approved"].includes(sku.imageMappingStatus))) {
    errors.push({ type: "published-gate-failed", sku: sku.sku, sourceStatus: sku.sourceStatus, imageMappingStatus: sku.imageMappingStatus });
  }
  if (sku.sourceStatus === "pending" && sku.published) errors.push({ type: "pending-product-published", sku: sku.sku });
}

for (const group of groups) {
  const groupId = group.id || group.groupId || group.canonicalGroupId;
  const variantIds = group.variantIds || group.skus || [];
  for (const sku of variantIds) {
    if (!skuIds.has(sku)) errors.push({ type: "group-references-missing-sku", group: group.id || group.canonicalGroupId, sku });
  }
  const actualCount = publishedGroupCounts.get(groupId) || 0;
  if (group.variantCount !== actualCount) errors.push({ type: "group-variant-count-mismatch", group: groupId, declared: group.variantCount, actual: actualCount });
  if (variantIds.length !== actualCount) errors.push({ type: "group-variant-list-count-mismatch", group: groupId, declared: variantIds.length, actual: actualCount });
  if (group.representativeSku && !publishedSkus.some((sku) => sku.sku === group.representativeSku && (sku.groupId || sku.canonicalGroupId || sku.sku) === groupId)) {
    errors.push({ type: "group-representative-mismatch", group: groupId, representativeSku: group.representativeSku });
  }
}

if (duplicateSkus.length) errors.push({ type: "duplicate-sku", items: duplicateSkus });
if (duplicateSlugs.length) errors.push({ type: "duplicate-slug", items: duplicateSlugs });
if (englishCjk.length) errors.push({ type: "english-cjk", items: englishCjk });
if (!skus.length) errors.push({ type: "empty-catalog" });
if (groups.length === 0) warnings.push("No product groups were generated.");

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    skus: skus.length,
    publishedSkus: publishedSkus.length,
    pendingSkus: skus.filter((sku) => !sku.published).length,
    productGroups: groups.length,
  },
  duplicateSkuCount: duplicateSkus.length,
  duplicateSlugCount: duplicateSlugs.length,
  englishCjkCount: englishCjk.length,
  errors,
  warnings,
  notes: [
    "Product groups contain published products only; pending source records remain in the data audit but are excluded from catalog, sitemap and detail routes.",
    "English notes containing unverified source-language text are blanked during data normalization rather than translated by guesswork.",
    "Legacy category/material fields are removed from the public product records; canonical categoryId/materialIds are validated against taxonomy.json.",
  ],
};

const markdown = `# Kehong Product Data Cleaning Report\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n- SKUs: ${report.totals.skus}\n- Product groups: ${report.totals.productGroups}\n- Duplicate SKUs: ${report.duplicateSkuCount}\n- Duplicate slugs: ${report.duplicateSlugCount}\n- English CJK errors: ${report.englishCjkCount}\n- Validation errors: ${errors.length}\n\n## Cleaning decisions\n\n${report.notes.map((note) => `- ${note}`).join("\n")}\n\n## Errors\n\n${errors.length ? `\`\`\`json\n${JSON.stringify(errors, null, 2)}\n\`\`\`` : "No blocking data errors."}\n\n## Warnings\n\n${warnings.length ? warnings.map((warning) => `- ${warning}`).join("\n") : "None."}\n`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown);
console.log(JSON.stringify(report, null, 2));

if (errors.length) process.exitCode = 1;
