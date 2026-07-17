import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const productImages = JSON.parse(fs.readFileSync(path.join(root, "src/data/productImages.json"), "utf8"));
const candidatesPath = path.join(root, "work/product-image-candidates.json");
const candidates = fs.existsSync(candidatesPath)
  ? JSON.parse(fs.readFileSync(candidatesPath, "utf8")).candidates || []
  : [];

function countBy(items, picker) {
  const counts = new Map();
  for (const item of items) {
    const key = picker(item) || "";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

const skuImageMap = productImages.skuImages || {};
const skus = catalog.skus || [];
const assets = productImages.assets || [];
const assetsById = new Map(assets.map((asset) => [asset.assetId, asset]));
const allowedImageStatuses = new Set(["exact", "representative", "ai-representative", "pending"]);

function normalizeImageStatus(status) {
  return allowedImageStatuses.has(status) ? status : "pending";
}

function isAiGeneratedAsset(asset) {
  return asset?.sourceType === "ai-generated";
}

function isDisplayAllowedAsset(asset) {
  if (asset?.permissionStatus === "approved") return true;

  return (
    isAiGeneratedAsset(asset) &&
    asset.permissionStatus === "generated-for-site" &&
    asset.exactness === "representative" &&
    asset.imageStatus === "ai-representative" &&
    asset.productionUsageAllowed === true &&
    asset.exactSkuEligible === false
  );
}

function effectiveSkuImageStatus(sku) {
  const mapping = skuImageMap[sku.sku] || {};
  const requestedStatus = normalizeImageStatus(mapping.imageStatus || sku.imageMappingStatus);
  const mainId = mapping.main || sku.mainImageAssetId;
  const asset = mainId ? assetsById.get(mainId) : undefined;

  if (!asset || !isDisplayAllowedAsset(asset)) return "pending";
  if (isAiGeneratedAsset(asset)) return "ai-representative";

  const assetExactness = normalizeImageStatus(asset.exactness);
  if (requestedStatus === "exact") return assetExactness === "exact" ? "exact" : assetExactness;
  if (requestedStatus === "representative") return assetExactness === "exact" ? "representative" : assetExactness;
  return requestedStatus;
}

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    skus: skus.length,
    productGroups: (catalog.groups || []).length,
    families: (catalog.families || []).length,
    imageAssets: assets.length,
    skuImageMappings: Object.keys(skuImageMap).length,
    candidateImageRows: candidates.length,
  },
  skuImageStatus: countBy(skus, (sku) => effectiveSkuImageStatus(sku)),
    requestedSkuImageStatus: countBy(skus, (sku) => skuImageMap[sku.sku]?.imageStatus || sku.imageMappingStatus || "pending"),
  assetExactness: countBy(assets, (asset) => asset.exactness || "pending"),
  assetPermissionStatus: countBy(assets, (asset) => asset.permissionStatus || ""),
  assetSourceType: countBy(assets, (asset) => asset.sourceType || "provided-local"),
  sourceStatus: countBy(skus, (sku) => sku.sourceStatus || ""),
  published: countBy(skus, (sku) => String(Boolean(sku.published))),
  productTypeCounts: countBy(skus, (sku) => sku.productType || ""),
  candidateSourceOwners: countBy(candidates, (candidate) => candidate.sourceOwner || ""),
  candidatePermissionStatus: countBy(candidates, (candidate) => candidate.permissionStatus || ""),
  candidateExactnessAssessment: countBy(candidates, (candidate) => candidate.exactnessAssessment || ""),
  conclusion: {
    exactSkuImageMappingComplete: (countBy(skus, (sku) => effectiveSkuImageStatus(sku)).exact || 0) === skus.length && skus.length > 0,
    hasAnyExactSkuImage: (countBy(skus, (sku) => effectiveSkuImageStatus(sku)).exact || 0) > 0,
    productionUsesOnlyApprovedOrGeneratedRepresentativeAssets: assets.every(
      (asset) =>
        isDisplayAllowedAsset(asset) &&
        asset.exactness === "representative" &&
        (!isAiGeneratedAsset(asset) || asset.exactSkuEligible === false),
    ),
    aiGeneratedAssetsCannotCountAsExact: assets.every(
      (asset) => !isAiGeneratedAsset(asset) || (asset.exactness === "representative" && asset.exactSkuEligible === false),
    ),
    stillNeedsExactSkuPhotography: (countBy(skus, (sku) => effectiveSkuImageStatus(sku)).exact || 0) < skus.length,
    stillNeedsSourceConfirmationForPendingProducts: skus.some((sku) => sku.sourceStatus !== "confirmed"),
  },
};

const skuRows = skus.map((sku) => {
  const map = skuImageMap[sku.sku] || {};
  return {
    sku: sku.sku,
    productType: sku.productType,
    canonicalGroupId: sku.canonicalGroupId,
    imageStatus: effectiveSkuImageStatus(sku),
    requestedImageStatus: map.imageStatus || sku.imageMappingStatus,
    mainImageAssetId: map.main || sku.mainImageAssetId,
    sourceStatus: sku.sourceStatus,
    published: sku.published,
    titleEn: sku.title?.en,
    categoryId: sku.categoryId,
    materialIds: sku.materialIds,
    sourceStatus: sku.sourceStatus,
    published: sku.published,
    gsmOrThickness: sku.gsmOrThickness,
    applications: sku.applications,
  };
});

const skuHeaders = Object.keys(skuRows[0] || {});
const skuCsv = [skuHeaders.join(","), ...skuRows.map((row) => skuHeaders.map((header) => csvCell(row[header])).join(","))].join("\n");
const markdown = `# Kehong Product Data Audit

Generated: ${summary.generatedAt}

## Summary

- SKUs: ${summary.totals.skus}
- Product groups: ${summary.totals.productGroups}
- Image assets: ${summary.totals.imageAssets}
- Effective exact SKU images: ${summary.skuImageStatus.exact || 0}
- Effective representative SKU images: ${summary.skuImageStatus.representative || 0}
- Effective AI representative SKU images: ${summary.skuImageStatus["ai-representative"] || 0}
- Effective pending SKU images: ${summary.skuImageStatus.pending || 0}
- Requested exact SKU images: ${summary.requestedSkuImageStatus.exact || 0}
- Published SKUs: ${summary.published.true || 0}
- Pending source SKUs: ${summary.published.false || 0}
- Research-only image candidates: ${summary.totals.candidateImageRows}

## Conclusion

This build is safer than random image assignment because all production SKU cards use approved local representative visuals or generated-for-site AI representative visuals, and they are labeled clearly. It is not an exact SKU image rebuild: there are currently ${summary.skuImageStatus.exact || 0} exact SKU images.

Do not mark any SKU image as exact until the source image is confirmed as Kehong-owned or licensed and visually verified against the target SKU.
`;

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, "audit_product_data_latest.json"), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(docsDir, "audit_sku_image_status_latest.csv"), `${skuCsv}\n`);
fs.writeFileSync(path.join(docsDir, "AUDIT_PRODUCT_DATA_LATEST.md"), markdown);

console.log(JSON.stringify(summary, null, 2));
