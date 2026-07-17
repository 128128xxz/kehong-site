import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/catalog.normalized.json");
const imagesPath = path.join(root, "src/data/productImages.json");

function readJson(file) {
  if (!fs.existsSync(file)) {
    console.error(`Missing file: ${file}`);
    process.exitCode = 1;
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function countBy(items, pick) {
  const counts = new Map();
  for (const item of items) {
    const key = pick(item) || "";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

const catalog = readJson(catalogPath);
const productImages = readJson(imagesPath);

if (!catalog || !productImages) process.exit(1);

const imageStatuses = new Set(["exact", "representative", "ai-representative", "pending"]);
const permissionStatuses = new Set(["approved", "generated-for-site", "pending", "rejected", "unknown"]);
const assets = new Map((productImages.assets || []).map((asset) => [asset.assetId, asset]));
const skuImageMap = productImages.skuImages || {};
const skus = catalog.skus || [];

function normalizeImageStatus(status) {
  return imageStatuses.has(status) ? status : "pending";
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
  const asset = mainId ? assets.get(mainId) : undefined;

  if (!asset || !isDisplayAllowedAsset(asset)) return "pending";
  if (isAiGeneratedAsset(asset)) return "ai-representative";

  const assetExactness = normalizeImageStatus(asset.exactness);
  if (requestedStatus === "exact") return assetExactness === "exact" ? "exact" : assetExactness;
  if (requestedStatus === "representative") return assetExactness === "exact" ? "representative" : assetExactness;
  return requestedStatus;
}

let errors = 0;
let warnings = 0;

function warn(message) {
  console.warn(message);
  warnings += 1;
}

function error(message) {
  console.error(message);
  errors += 1;
}

for (const asset of productImages.assets || []) {
  if (!asset.assetId) {
    error(`Asset missing assetId: ${JSON.stringify(asset).slice(0, 160)}`);
    continue;
  }

  if (!asset.localPath) {
    error(`Asset missing localPath: ${asset.assetId}`);
  } else {
    const full = path.join(root, "public", asset.localPath.replace(/^\//, ""));
    if (!fs.existsSync(full)) error(`Missing image file for ${asset.assetId}: ${asset.localPath}`);
  }

  if (!permissionStatuses.has(asset.permissionStatus)) {
    warn(`Unrecognized permissionStatus for ${asset.assetId}: ${asset.permissionStatus}`);
  }

  if (!isDisplayAllowedAsset(asset)) warn(`Permission not approved for production display: ${asset.assetId} ${asset.permissionStatus}`);
  if (asset.licenseOrPermission === "unknown") warn(`Unknown license: ${asset.assetId}`);
  if (!imageStatuses.has(asset.exactness)) warn(`Unrecognized exactness for ${asset.assetId}: ${asset.exactness}`);
  if (asset.exactness === "exact" && asset.permissionStatus !== "approved") {
    error(`Exact asset is not approved: ${asset.assetId}`);
  }
  if (isAiGeneratedAsset(asset)) {
    if (asset.permissionStatus !== "generated-for-site") {
      error(`AI-generated asset must use permissionStatus generated-for-site: ${asset.assetId}`);
    }
    if (asset.exactness !== "representative") {
      error(`AI-generated asset must keep exactness representative: ${asset.assetId}`);
    }
    if (asset.imageStatus !== "ai-representative") {
      error(`AI-generated asset must use imageStatus ai-representative: ${asset.assetId}`);
    }
    if (asset.productionUsageAllowed !== true) {
      error(`AI-generated asset must explicitly set productionUsageAllowed true: ${asset.assetId}`);
    }
    if (asset.exactSkuEligible !== false) {
      error(`AI-generated asset must explicitly set exactSkuEligible false: ${asset.assetId}`);
    }
  }
}

for (const sku of skus) {
  if (!sku.sku) {
    error(`SKU missing sku: ${JSON.stringify(sku).slice(0, 160)}`);
    continue;
  }

  if (!sku.productType) warn(`SKU missing productType: ${sku.sku}`);
  if (!sku.sourceStatus) warn(`SKU missing sourceStatus: ${sku.sku}`);
  if (!sku.imageMappingStatus) warn(`SKU missing imageMappingStatus: ${sku.sku}`);

  const mapping = skuImageMap[sku.sku];
  if (!mapping) {
    warn(`SKU missing productImages.skuImages mapping: ${sku.sku}`);
  }

  const mainId = mapping?.main || sku.mainImageAssetId;
  if (!mainId) {
    warn(`SKU has no main image asset: ${sku.sku}`);
  } else if (!assets.has(mainId)) {
    error(`SKU ${sku.sku} references missing image asset ${mainId}`);
  }

  const status = mapping?.imageStatus || sku.imageMappingStatus;
  if (status && !imageStatuses.has(status)) warn(`SKU ${sku.sku} has unrecognized imageStatus: ${status}`);

  if (sku.imageMappingStatus && mapping?.imageStatus && sku.imageMappingStatus !== mapping.imageStatus) {
    warn(`SKU ${sku.sku} catalog imageMappingStatus (${sku.imageMappingStatus}) differs from productImages mapping (${mapping.imageStatus}). UI uses effective productImages status.`);
  }

  if (status === "exact") {
    const asset = assets.get(mainId);
    if (!asset) {
      error(`Exact SKU ${sku.sku} has missing asset ${mainId}`);
    } else if (isAiGeneratedAsset(asset)) {
      error(`SKU ${sku.sku} is marked exact but asset ${mainId} is AI-generated`);
    } else if (asset.exactness !== "exact" || asset.permissionStatus !== "approved") {
      error(`SKU ${sku.sku} is marked exact but asset ${mainId} is ${asset.exactness}/${asset.permissionStatus}`);
    }
  }

  for (const galleryAssetId of mapping?.gallery || sku.galleryAssetIds || []) {
    if (!assets.has(galleryAssetId)) error(`SKU ${sku.sku} references missing gallery asset ${galleryAssetId}`);
  }
}

const mappedSkuCount = Object.keys(skuImageMap).length;
const publishedSkuCount = skus.filter((sku) => sku.published).length;
const pendingSkuCount = skus.length - publishedSkuCount;
const requestedSkuImageStatusCounts = countBy(skus, (sku) => skuImageMap[sku.sku]?.imageStatus || sku.imageMappingStatus || "pending");
const effectiveSkuImageStatusCounts = countBy(skus, (sku) => effectiveSkuImageStatus(sku));
const assetExactnessCounts = countBy(productImages.assets || [], (asset) => asset.exactness || "pending");
const sourceStatusCounts = countBy(skus, (sku) => sku.sourceStatus || "");

if ((effectiveSkuImageStatusCounts.exact || 0) === 0) {
  warn("No SKU is marked with an exact product image. This is safe but means SKU photography is not actually complete.");
}

if ((effectiveSkuImageStatusCounts.representative || 0) === skus.length) {
  warn("All SKUs still use representative visuals. This is acceptable for a safe interim build, but exact SKU image mapping is not complete.");
}

console.log(`Checked ${skus.length} SKUs, ${mappedSkuCount} SKU-image mappings and ${assets.size} image assets.`);
console.log(`Requested SKU image status: ${JSON.stringify(requestedSkuImageStatusCounts)}`);
console.log(`Effective SKU image status: ${JSON.stringify(effectiveSkuImageStatusCounts)}`);
console.log(`Image asset exactness: ${JSON.stringify(assetExactnessCounts)}`);
console.log(`Source status: ${JSON.stringify(sourceStatusCounts)}`);
console.log(`Published products: ${publishedSkuCount}, pending products: ${pendingSkuCount}.`);
console.log(`${errors} errors, ${warnings} warnings.`);

if (errors) process.exit(1);
