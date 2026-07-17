import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/catalog.normalized.json");
const imagesPath = path.join(root, "src/data/productImages.json");
const auditPath = path.join(root, "docs/ai_generated_asset_audit_latest.json");

function readJson(file) {
  if (!fs.existsSync(file)) {
    console.error(`Missing file: ${file}`);
    process.exit(1);
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
const skus = catalog.skus || [];
const assets = productImages.assets || [];
const assetsById = new Map(assets.map((asset) => [asset.assetId, asset]));
const skuImages = productImages.skuImages || {};
const familyImages = productImages.familyImages || {};
const allowedStatuses = new Set(["exact", "representative", "ai-representative", "pending"]);

let errors = 0;
let warnings = 0;

function error(message) {
  console.error(message);
  errors += 1;
}

function warn(message) {
  console.warn(message);
  warnings += 1;
}

function isAiGeneratedAsset(asset) {
  return asset?.sourceType === "ai-generated";
}

function isAiGeneratedDisplayAllowed(asset) {
  return (
    isAiGeneratedAsset(asset) &&
    asset.permissionStatus === "generated-for-site" &&
    asset.exactness === "representative" &&
    asset.imageStatus === "ai-representative" &&
    asset.productionUsageAllowed === true &&
    asset.exactSkuEligible === false
  );
}

function normalizeStatus(status) {
  return allowedStatuses.has(status) ? status : "pending";
}

function effectiveSkuImageStatus(sku) {
  const mapping = skuImages[sku.sku] || {};
  const requestedStatus = normalizeStatus(mapping.imageStatus || sku.imageStatus);
  const mainId = mapping.main || sku.mainImageAssetId;
  const asset = mainId ? assetsById.get(mainId) : undefined;

  if (!asset) return "pending";
  if (isAiGeneratedAsset(asset)) return isAiGeneratedDisplayAllowed(asset) ? "ai-representative" : "pending";
  if (asset.permissionStatus !== "approved") return "pending";

  const exactness = normalizeStatus(asset.exactness);
  if (requestedStatus === "exact") return exactness === "exact" ? "exact" : exactness;
  if (requestedStatus === "representative") return exactness === "exact" ? "representative" : exactness;
  return requestedStatus;
}

for (const asset of assets) {
  if (!asset.assetId) {
    error(`Asset missing assetId: ${JSON.stringify(asset).slice(0, 160)}`);
    continue;
  }

  if (asset.sourceType === "ai-generated" || asset.permissionStatus === "generated-for-site") {
    if (asset.sourceType !== "ai-generated") {
      error(`Generated-for-site asset must also use sourceType ai-generated: ${asset.assetId}`);
    }
    if (asset.permissionStatus !== "generated-for-site") {
      error(`AI asset must use permissionStatus generated-for-site: ${asset.assetId}`);
    }
    if (asset.licenseOrPermission !== "generated-for-site") {
      error(`AI asset must use licenseOrPermission generated-for-site: ${asset.assetId}`);
    }
    if (asset.exactness !== "representative") {
      error(`AI asset must keep exactness representative: ${asset.assetId}`);
    }
    if (asset.imageStatus !== "ai-representative") {
      error(`AI asset must use imageStatus ai-representative: ${asset.assetId}`);
    }
    if (asset.productionUsageAllowed !== true) {
      error(`AI asset must explicitly allow production representative usage: ${asset.assetId}`);
    }
    if (asset.exactSkuEligible !== false) {
      error(`AI asset must explicitly set exactSkuEligible false: ${asset.assetId}`);
    }
    if (!asset.localPath?.startsWith("/images/ai-generated/")) {
      error(`AI asset must live under /images/ai-generated/: ${asset.assetId}`);
    }
    if (String(asset.sourceOwner || "").toLowerCase().includes("kehong-owned-photo")) {
      error(`AI asset must not be labeled Kehong-owned-photo: ${asset.assetId}`);
    }
    if (asset.localPath) {
      const fullPath = path.join(root, "public", asset.localPath.replace(/^\//, ""));
      if (!fs.existsSync(fullPath)) error(`Missing AI asset file: ${asset.assetId} ${asset.localPath}`);
    }
  }
}

for (const sku of skus) {
  const mapping = skuImages[sku.sku] || {};
  const mainAsset = mapping.main ? assetsById.get(mapping.main) : undefined;

  if (mapping.imageStatus === "exact" && isAiGeneratedAsset(mainAsset)) {
    error(`SKU ${sku.sku} is marked exact with AI-generated asset ${mapping.main}`);
  }

  if (isAiGeneratedAsset(mainAsset) && mapping.imageStatus !== "ai-representative") {
    error(`SKU ${sku.sku} uses AI main asset but imageStatus is ${mapping.imageStatus}`);
  }

  for (const assetId of mapping.gallery || []) {
    const asset = assetsById.get(assetId);
    if (!asset) continue;
    if (isAiGeneratedAsset(asset) && asset.exactness === "exact") {
      error(`SKU ${sku.sku} gallery contains AI exact asset ${assetId}`);
    }
  }
}

for (const [familyKey, entry] of Object.entries(familyImages)) {
  const asset = entry?.main ? assetsById.get(entry.main) : undefined;
  if (isAiGeneratedAsset(asset) && entry.imageStatus !== "ai-representative") {
    error(`Family image ${familyKey} uses AI asset but imageStatus is ${entry.imageStatus}`);
  }
}

const effectiveStatusCounts = countBy(skus, (sku) => effectiveSkuImageStatus(sku));
const requestedStatusCounts = countBy(skus, (sku) => skuImages[sku.sku]?.imageStatus || sku.imageStatus || "pending");
const aiAssets = assets.filter(isAiGeneratedAsset);
const exactWithAi = skus.filter((sku) => {
  const mapping = skuImages[sku.sku] || {};
  const asset = mapping.main ? assetsById.get(mapping.main) : undefined;
  return mapping.imageStatus === "exact" && isAiGeneratedAsset(asset);
});

if ((effectiveStatusCounts.exact || 0) > 0) {
  warn(`${effectiveStatusCounts.exact} effective exact SKU image(s) exist. Confirm they are real approved non-AI assets.`);
}

if (exactWithAi.length > 0) {
  error(`${exactWithAi.length} SKU(s) incorrectly count AI-generated assets as exact.`);
}

const audit = {
  generatedAt: new Date().toISOString(),
  aiGeneratedAssetCount: aiAssets.length,
  aiGeneratedAssets: aiAssets.map((asset) => ({
    assetId: asset.assetId,
    localPath: asset.localPath,
    permissionStatus: asset.permissionStatus,
    exactness: asset.exactness,
    imageStatus: asset.imageStatus,
    productionUsageAllowed: asset.productionUsageAllowed,
    exactSkuEligible: asset.exactSkuEligible,
  })),
  requestedSkuImageStatus: requestedStatusCounts,
  effectiveSkuImageStatus: effectiveStatusCounts,
  exactSkuImagesUsingAiAssets: exactWithAi.map((sku) => sku.sku),
  errors,
  warnings,
};

fs.mkdirSync(path.dirname(auditPath), { recursive: true });
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

console.log(`Checked ${aiAssets.length} AI-generated asset(s) across ${skus.length} SKUs.`);
console.log(`Requested SKU image status: ${JSON.stringify(requestedStatusCounts)}`);
console.log(`Effective SKU image status: ${JSON.stringify(effectiveStatusCounts)}`);
console.log(`Wrote ${path.relative(root, auditPath)}`);
console.log(`${errors} errors, ${warnings} warnings.`);

if (errors) process.exit(1);
