import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const productImages = JSON.parse(fs.readFileSync(path.join(root, "src/data/productImages.json"), "utf8"));
const auditPath = path.join(root, "docs/ai_generated_asset_audit_latest.json");
const assets = productImages.assets || [];
const assetById = new Map(assets.map((asset) => [asset.assetId, asset]));
const skuImages = productImages.skuImages || {};
const errors = [];
const warnings = [];

for (const asset of assets) {
  if (!asset.assetId) errors.push("Asset is missing assetId");
  if (!asset.localPath) errors.push(`Asset ${asset.assetId || "(unknown)"} is missing localPath`);
  else if (!fs.existsSync(path.join(root, "public", asset.localPath.replace(/^\//, "")))) errors.push(`Missing media file: ${asset.localPath}`);
  if (!["exact", "representative", "pending"].includes(asset.exactness)) errors.push(`Invalid neutral image status: ${asset.assetId}`);
  if (asset.exactness === "exact" && asset.permissionStatus !== "approved") errors.push(`Unapproved exact asset: ${asset.assetId}`);
  if (asset.imageStatus === "ai-representative") errors.push(`Legacy public image status remains: ${asset.assetId}`);
}

for (const sku of catalog.skus || []) {
  const mapping = skuImages[sku.sku] || {};
  const main = mapping.main || sku.mainImageAssetId;
  if (main && !assetById.has(main)) errors.push(`SKU ${sku.sku} references missing asset ${main}`);
  if (mapping.imageStatus === "ai-representative") errors.push(`Legacy SKU image status remains: ${sku.sku}`);
  for (const galleryId of mapping.gallery || []) if (!assetById.has(galleryId)) errors.push(`SKU ${sku.sku} references missing gallery asset ${galleryId}`);
}

const statusCounts = Object.fromEntries(["exact", "representative", "pending"].map((status) => [status, assets.filter((asset) => asset.exactness === status).length]));
const audit = {
  generatedAt: new Date().toISOString(),
  publicImageStatusPolicy: "representative is the only non-exact public display state; exact remains zero until verified.",
  assetCount: assets.length,
  statusCounts,
  legacyAiRepresentativeCount: assets.filter((asset) => asset.exactness === "ai-representative" || asset.imageStatus === "ai-representative").length,
  errors,
  warnings,
};
fs.mkdirSync(path.dirname(auditPath), { recursive: true });
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Checked ${assets.length} media assets across ${(catalog.skus || []).length} SKUs.`);
console.log(`Neutral status counts: ${JSON.stringify(statusCounts)}`);
console.log(`Legacy ai-representative count: ${audit.legacyAiRepresentativeCount}`);
console.log(`${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length) process.exit(1);
