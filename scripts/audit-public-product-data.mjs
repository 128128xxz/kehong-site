import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const taxonomy = JSON.parse(fs.readFileSync(path.join(root, "src/data/taxonomy.json"), "utf8"));
const skus = Array.isArray(catalog.skus) ? catalog.skus : [];
const groups = Array.isArray(catalog.groups) ? catalog.groups : [];
const issues = [];
const englishFields = ["title.en", "shortDescription.en", "englishName", "slug", "productType", "categoryId", "coating"];
const blockingTypes = new Set([
  "duplicate-sku",
  "duplicate-slug",
  "duplicate-group-id",
  "duplicate-canonical-group-id",
  "english-cjk",
  "english-punctuation",
  "legacy-field",
  "unknown-category",
  "unknown-material",
  "kraft-material-conflict",
]);

function addIssue({ sku = "", slug = "", field, issueType, currentValue, suggestedAction }) {
  issues.push({ sku, slug, field, issueType, currentValue: String(currentValue ?? ""), suggestedAction });
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1);
}

function readPath(value, pathValue) {
  return pathValue.split(".").reduce((current, part) => current?.[part], value);
}

const categoryIds = new Set((taxonomy.categories ?? []).map((item) => item.id));
const materialIds = new Set((taxonomy.materials ?? []).map((item) => item.id));

for (const [value, count] of duplicateValues(skus.map((sku) => sku.sku))) {
  addIssue({ issueType: "duplicate-sku", field: "sku", currentValue: `${value} (${count})`, suggestedAction: "Confirm the commercial SKU and keep only the approved unique value." });
}
for (const [value, count] of duplicateValues(skus.map((sku) => sku.slug))) {
  addIssue({ issueType: "duplicate-slug", field: "slug", currentValue: `${value} (${count})`, suggestedAction: "Keep the existing approved URL where possible; otherwise assign a unique slug and redirect the old URL." });
}
for (const [value, count] of duplicateValues(groups.map((group) => group.id || group.groupId))) {
  addIssue({ issueType: "duplicate-group-id", field: "groups.id", currentValue: `${value} (${count})`, suggestedAction: "Confirm the canonical product group ID before publishing." });
}
for (const [value, count] of duplicateValues(groups.map((group) => group.canonicalGroupId))) {
  addIssue({ issueType: "duplicate-canonical-group-id", field: "groups.canonicalGroupId", currentValue: `${value} (${count})`, suggestedAction: "Confirm whether the groups are one product family or separate products." });
}

const suspiciousPatterns = [
  /food-grade\s*white/iu,
  /kraftpaper/iu,
  /premium\s*flute\s*box/iu,
  /packaging\s*box\s*box/iu,
  /coffee\s+cupbase/iu,
];

for (const sku of skus) {
  for (const field of englishFields) {
    const value = readPath(sku, field);
    if (typeof value !== "string" || !value.trim()) continue;
    if (/[\u3400-\u9fff]/u.test(value)) {
      addIssue({ sku: sku.sku, slug: sku.slug, field, issueType: "english-cjk", currentValue: value, suggestedAction: "Provide an approved English field; do not translate an unverified specification automatically." });
    }
    if (/[、，；。！？：]/u.test(value)) {
      addIssue({ sku: sku.sku, slug: sku.slug, field, issueType: "english-punctuation", currentValue: value, suggestedAction: "Replace Chinese punctuation with approved English punctuation after confirming the wording." });
    }
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        addIssue({ sku: sku.sku, slug: sku.slug, field, issueType: "word-boundary", currentValue: value, suggestedAction: "Review word spacing and product naming manually; no commercial meaning was inferred." });
        break;
      }
    }
  }

  for (const legacyField of ["category", "material", "materials"]) {
    if (Object.hasOwn(sku, legacyField)) {
      addIssue({ sku: sku.sku, slug: sku.slug, field: legacyField, issueType: "legacy-field", currentValue: sku[legacyField], suggestedAction: "Use categoryId/materialIds taxonomy fields instead of a concatenated legacy string." });
    }
  }
  if (typeof sku.process === "string") {
    addIssue({ sku: sku.sku, slug: sku.slug, field: "process", issueType: "legacy-field", currentValue: sku.process, suggestedAction: "Store process values as an array of approved taxonomy values." });
  }
  if (sku.categoryId && !categoryIds.has(sku.categoryId)) {
    addIssue({ sku: sku.sku, slug: sku.slug, field: "categoryId", issueType: "unknown-category", currentValue: sku.categoryId, suggestedAction: "Map the product to an approved taxonomy category." });
  }
  for (const materialId of sku.materialIds ?? []) {
    if (!materialIds.has(materialId)) {
      addIssue({ sku: sku.sku, slug: sku.slug, field: "materialIds", issueType: "unknown-material", currentValue: materialId, suggestedAction: "Map the material to an approved taxonomy ID." });
    }
  }
  const title = String(sku.title?.en ?? "");
  const hasKraftInMaterial = (sku.materialIds ?? []).some((materialId) => /kraft|cardstock/iu.test(materialId));
  if (/\bkraft\b/iu.test(title) && !hasKraftInMaterial) {
    addIssue({ sku: sku.sku, slug: sku.slug, field: "title.en/materialIds", issueType: "kraft-material-conflict", currentValue: `${title} / ${(sku.materialIds ?? []).join(", ")}`, suggestedAction: "Confirm the actual material before changing either field." });
  }
  if (sku.sourceStatus !== "confirmed" || sku.published !== true) {
    addIssue({ sku: sku.sku, slug: sku.slug, field: "sourceStatus", issueType: "pending-source", currentValue: `${sku.sourceStatus} / published=${sku.published}`, suggestedAction: "Confirm source, specification and publication approval with the business owner." });
  }
}

const signatureCounts = new Map();
for (const group of groups) {
  const representative = skus.find((sku) => sku.sku === group.representativeSku) ?? {};
  const signature = [representative.title?.en, representative.productType, representative.categoryId, (representative.materialIds ?? []).join(",")].join("|");
  signatureCounts.set(signature, (signatureCounts.get(signature) ?? 0) + 1);
}
for (const [signature, count] of signatureCounts) {
  if (count > 1) {
    addIssue({ field: "groups", issueType: "indistinguishable-group", currentValue: `${signature} (${count})`, suggestedAction: "Confirm the business distinction before merging or deleting any product group." });
  }
}

const blockingIssues = issues.filter((issue) => blockingTypes.has(issue.issueType));
const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    skus: skus.length,
    publishedSkus: skus.filter((sku) => sku.published === true && sku.sourceStatus === "confirmed").length,
    productGroups: groups.length,
    issues: issues.length,
    blockingIssues: blockingIssues.length,
    pendingSourceRows: issues.filter((issue) => issue.issueType === "pending-source").length,
  },
  issueCounts: Object.fromEntries([...new Set(issues.map((issue) => issue.issueType))].sort().map((type) => [type, issues.filter((issue) => issue.issueType === type).length])),
  issues,
};

const docsDir = path.join(root, "docs");
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, "product-data-audit-latest.json"), `${JSON.stringify(summary, null, 2)}\n`);
const headers = ["sku", "slug", "field", "issueType", "currentValue", "suggestedAction"];
const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
fs.writeFileSync(path.join(docsDir, "product-data-audit-latest.csv"), `${headers.join(",")}\n${issues.map((issue) => headers.map((header) => csvCell(issue[header])).join(",")).join("\n")}\n`);
fs.writeFileSync(path.join(docsDir, "PRODUCT_DATA_AUDIT_LATEST.md"), `# Kehong Product Data Audit\n\nGenerated: ${summary.generatedAt}\n\n- SKUs scanned: ${summary.totals.skus}\n- Published confirmed SKUs: ${summary.totals.publishedSkus}\n- Product groups: ${summary.totals.productGroups}\n- Total issues: ${summary.totals.issues}\n- Blocking issues: ${summary.totals.blockingIssues}\n- Pending/manual-confirmation rows: ${summary.totals.pendingSourceRows}\n\nNo specifications, materials, GSM, coatings, certifications, MOQ, dimensions or applications were inferred or overwritten by this audit.\n\n## Issue counts\n\n${Object.entries(summary.issueCounts).map(([type, count]) => `- ${type}: ${count}`).join("\n") || "- None"}\n\nSee the CSV and JSON files for SKU-level details.\n`);

console.log(JSON.stringify({ ...summary, issues: undefined }, null, 2));
if (blockingIssues.length > 0) process.exitCode = 1;
