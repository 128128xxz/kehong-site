import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const candidatesPath = path.join(root, "work/product-image-candidates.json");
const candidates = fs.existsSync(candidatesPath)
  ? JSON.parse(fs.readFileSync(candidatesPath, "utf8")).candidates || []
  : [];

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function countBy(items, picker) {
  const counts = new Map();
  for (const item of items) {
    const key = picker(item) || "";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

const candidateByGroup = new Map(candidates.map((candidate) => [candidate.targetGroupId, candidate]));
const skus = catalog.skus || [];
const decisions = skus.map((sku) => {
  const candidate = candidateByGroup.get(sku.canonicalGroupId);
  const hasProductLink = Boolean(sku.productLink);

  return {
    sku: sku.sku,
    canonicalGroupId: sku.canonicalGroupId,
    productType: sku.productType,
    titleEn: sku.title?.en || "",
    titleZh: sku.title?.zh || "",
    currentDataStatus: sku.dataStatus || "",
    currentProductLink: sku.productLink || "",
    sourceDecision: hasProductLink ? "source-linked-research-only" : "needs-kehong-owned-photo",
    sourceDecisionReason: hasProductLink
      ? "Product link exists and can support specification research. It is not exact image permission."
      : "No productLink exists in the normalized catalog. Do not invent a source; request Kehong-owned exact photo, drawing or approved supplier proof.",
    candidateId: candidate?.candidateId || "",
    candidatePermissionStatus: candidate?.permissionStatus || "",
    candidateExactnessAssessment: candidate?.exactnessAssessment || "",
    recommendedAction: candidate?.recommendedAction || (hasProductLink ? "research-source-only" : "request-kehong-owned-photo"),
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  totalSkus: decisions.length,
  sourceDecision: countBy(decisions, (decision) => decision.sourceDecision),
  productTypeForMissingSources: countBy(
    decisions.filter((decision) => decision.sourceDecision === "needs-kehong-owned-photo"),
    (decision) => decision.productType,
  ),
  note: "This file records source decisions only. It does not approve any candidate image for production.",
};

const headers = Object.keys(decisions[0] || {});
const csv = [headers.join(","), ...decisions.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");

fs.mkdirSync(path.join(root, "work"), { recursive: true });
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "work/product-source-decisions.json"), `${JSON.stringify({ summary, decisions }, null, 2)}\n`);
fs.writeFileSync(path.join(root, "work/product-source-decisions.csv"), `${csv}\n`);
fs.writeFileSync(
  path.join(root, "docs/PRODUCT_SOURCE_DECISIONS_LATEST.md"),
  `# Product Source Decisions\n\nGenerated: ${summary.generatedAt}\n\n- SKUs reviewed: ${summary.totalSkus}\n- Source-linked research-only SKUs: ${summary.sourceDecision["source-linked-research-only"] || 0}\n- SKUs needing Kehong-owned photo/source: ${summary.sourceDecision["needs-kehong-owned-photo"] || 0}\n\nNo product links were invented. Missing-source SKUs are explicitly marked for Kehong follow-up.\n`,
);

console.log(JSON.stringify(summary, null, 2));
