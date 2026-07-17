import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/catalog.normalized.json");
const outDir = path.join(root, "work");
const jsonPath = path.join(outDir, "product-image-candidates.json");
const csvPath = path.join(outDir, "product-image-candidates.csv");
const summaryPath = path.join(outDir, "product-image-candidates-summary.md");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function ownerFromUrl(url) {
  if (!url) return "Kehong / user follow-up required";

  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function recommendedAction(url) {
  if (!url) return "request-kehong-owned-photo";

  const owner = ownerFromUrl(url);
  if (owner.includes("shirongpaper") || owner.includes("alibaba")) {
    return "request-permission";
  }

  return "review-source";
}

function reasoningFor(url, count) {
  if (!url) {
    return "No productLink exists in the source catalog. A Kehong-owned exact SKU photo or approved supplier photo is required before promotion.";
  }

  return `${count} SKU(s) share this source page. It can be used for specification research, but product photos must stay out of production until reuse permission and exact SKU match are approved.`;
}

const linkedGroups = new Map();
const missingSourceGroups = new Map();

for (const sku of catalog.skus) {
  if (sku.productLink) {
    const current = linkedGroups.get(sku.productLink) || [];
    current.push(sku);
    linkedGroups.set(sku.productLink, current);
  } else {
    const current = missingSourceGroups.get(sku.canonicalGroupId) || [];
    current.push(sku);
    missingSourceGroups.set(sku.canonicalGroupId, current);
  }
}

const candidates = [];

for (const [url, skus] of linkedGroups.entries()) {
  const lead = skus[0];
  candidates.push({
    candidateId: `source-${String(candidates.length + 1).padStart(3, "0")}`,
    targetSku: lead.sku,
    targetSkus: skus.map((sku) => sku.sku),
    targetGroupId: lead.canonicalGroupId,
    targetProductType: lead.productType,
    candidateSourcePageUrl: url,
    candidateDirectImageUrl: "",
    sourceOwner: ownerFromUrl(url),
    licenseOrPermission: "unknown",
    permissionStatus: "pending",
    exactnessAssessment: "uncertain",
    reasoning: reasoningFor(url, skus.length),
    recommendedAction: recommendedAction(url),
    notes: "Research-only candidate. Do not copy product photos into public/images/products until permission and exactness are confirmed.",
  });
}

for (const [, skus] of missingSourceGroups.entries()) {
  const lead = skus[0];
  candidates.push({
    candidateId: `missing-source-${String(candidates.length + 1).padStart(3, "0")}`,
    targetSku: lead.sku,
    targetSkus: skus.map((sku) => sku.sku),
    targetGroupId: lead.canonicalGroupId,
    targetProductType: lead.productType,
    candidateSourcePageUrl: "",
    candidateDirectImageUrl: "",
    sourceOwner: "Kehong / user follow-up required",
    licenseOrPermission: "user-provided",
    permissionStatus: "pending",
    exactnessAssessment: "uncertain",
    reasoning: reasoningFor("", skus.length),
    recommendedAction: "request-kehong-owned-photo",
    notes: "Ask Kehong for exact SKU photo, sample photo, drawing or approved supplier image.",
  });
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

const csvHeaders = [
  "candidateId",
  "targetSku",
  "targetSkus",
  "targetGroupId",
  "targetProductType",
  "candidateSourcePageUrl",
  "candidateDirectImageUrl",
  "sourceOwner",
  "licenseOrPermission",
  "permissionStatus",
  "exactnessAssessment",
  "reasoning",
  "recommendedAction",
  "notes",
];

const csv = [
  csvHeaders.join(","),
  ...candidates.map((candidate) => csvHeaders.map((key) => csvCell(candidate[key])).join(",")),
].join("\n");

const summary = `# Product Image Candidate Research\n\nGenerated from src/data/catalog.normalized.json.\n\n- Total candidates: ${candidates.length}\n- Unique linked source pages: ${linkedGroups.size}\n- Missing-source canonical groups: ${missingSourceGroups.size}\n- Production images promoted: 0\n\nAll candidates are research-only. Unknown-permission supplier or marketplace images must not be copied into production paths until permission and exact SKU match are approved.\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), candidates }, null, 2)}\n`);
fs.writeFileSync(csvPath, `${csv}\n`);
fs.writeFileSync(summaryPath, summary);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${csvPath}`);
console.log(`Wrote ${summaryPath}`);
console.log(`Generated ${candidates.length} research-only candidates.`);
