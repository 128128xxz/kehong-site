import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/catalog.normalized.json");
const taxonomyPath = path.join(root, "src/data/taxonomy.json");
const unresolvedPath = path.join(root, "reports/unresolved-taxonomy.json");
const pendingCsvPath = path.join(root, "reports/pending-product-sources.csv");
const migrationReportPath = path.join(root, "reports/taxonomy-migration.json");

const categoryDefinitions = [
  ["kraft-paper-series", "kraft-paper", "Kraft Paper Series", "牛皮纸系列"],
  ["white-cardboard-series", "white-cardboard", "White Cardboard Series", "白卡纸系列"],
  ["food-grade-paper-series", "food-paper", "Food Paper Series", "食品纸系列"],
  ["corrugated-fluted-paper-series", "corrugated-paper", "Corrugated / Fluted Paper Series", "瓦楞纸 / 坑纸系列"],
  ["specialty-paper-series", "specialty-paper", "Specialty Paper Series", "特种纸系列"],
  ["food-packaging-boxes", "food-packaging-boxes", "Food Packaging Boxes", "食品包装盒"],
  ["paper-pads", "paper-pads", "Paper Pads", "纸垫片"],
  ["paper-inserts", "paper-inserts", "Paper Inserts", "纸内托"],
  ["paper-box-components", "paper-box-components", "Paper Box Components", "纸盒半成品"],
  ["finished-paper-boxes", "finished-paper-boxes", "Finished Paper Boxes", "包装盒成品"],
  ["food-grade-paper", "food-grade-paper", "Food-Grade Paper Series", "食品级纸系列"],
].map(([id, slug, en, zh], index) => ({
  id,
  slug,
  localizedLabel: { en, zh },
  sortOrder: index + 1,
  active: true,
}));

const categoryAliases = {
  "牛皮纸系列": "kraft-paper-series",
  "白卡纸系列": "white-cardboard-series",
  "食品纸系列": "food-grade-paper-series",
  "瓦楞纸 / 坑纸系列": "corrugated-fluted-paper-series",
  "特种纸系列": "specialty-paper-series",
  "食品包装盒": "food-packaging-boxes",
  "纸垫片 / Paper Pads": "paper-pads",
  "纸内托 / Paper Inserts": "paper-inserts",
  "纸盒半成品": "paper-box-components",
  "包装盒成品": "finished-paper-boxes",
  "食品级纸系列": "food-grade-paper",
};

const materialDefinitions = [
  ["kraft-paper", "kraft-paper", "Kraft paper", "牛皮纸", ["kraft paper", "牛皮纸"]],
  ["single-sided-kraft-paper", "single-sided-kraft-paper", "Single-sided kraft paper", "单面牛皮纸", ["single-sided kraft paper", "单面牛皮纸"]],
  ["double-sided-kraft-paper", "double-sided-kraft-paper", "Double-sided kraft paper", "双面牛皮纸", ["double-sided kraft paper", "双面牛皮纸"]],
  ["white-kraft-paper", "white-kraft-paper", "White kraft paper", "白牛皮纸", ["white kraft", "white kraft paper", "白牛皮纸"]],
  ["yellow-kraft-paper", "yellow-kraft-paper", "Yellow kraft paper", "黄牛皮纸", ["yellow kraft", "yellow kraft paper", "黄牛皮纸"]],
  ["food-grade-kraft-paper", "food-grade-kraft-paper", "Food-grade kraft paper", "食品级牛皮纸", ["food grade kraft", "food-grade kraft paper", "食品级牛皮纸"]],
  ["kraft-cardstock", "kraft-cardstock", "Kraft cardstock", "牛卡纸", ["kraft cardstock", "牛卡纸", "牛卡"]],
  ["white-cardboard", "white-cardboard", "White cardboard", "白卡纸", ["white cardboard", "white board", "white card", "白卡纸", "白卡"]],
  ["food-grade-white-board", "food-grade-white-board", "Food-grade white board", "食品级白卡纸", ["food-grade white board", "food grade white board", "食品级白卡纸", "食品白卡"]],
  ["coated-white-board", "coated-white-board", "Coated white board", "涂布白卡纸", ["coated white board", "single-coated white board", "double-coated white board", "单铜白卡", "双铜白卡"]],
  ["cupstock-paper", "cupstock-paper", "Cupstock paper", "杯纸", ["cupstock", "cupstock paper", "paper cup stock", "杯纸"]],
  ["food-grade-paper", "food-grade-paper", "Food-grade paper", "食品级纸", ["food-grade paper", "food paper", "食品级纸", "食品纸"]],
  ["greaseproof-paper", "greaseproof-paper", "Greaseproof paper", "防油纸", ["greaseproof", "greaseproof paper", "防油纸", "防油食品纸", "防油牛皮纸"]],
  ["corrugated-paper", "corrugated-paper", "Corrugated paper", "瓦楞纸", ["corrugated", "corrugated paper", "瓦楞", "瓦楞纸", "彩色瓦楞纸"]],
  ["fluted-paper", "fluted-paper", "Fluted paper", "坑纸", ["fluted", "fluted paper", "坑纸", "E 坑", "F 坑", "G 坑", "E/F/G 坑", "E/F/G flute"]],
  ["corrugated-medium", "corrugated-medium", "Corrugated medium", "瓦楞芯纸", ["corrugated medium", "fluting medium", "瓦楞芯纸", "芯纸"]],
  ["liner-paper", "liner-paper", "Liner paper", "面纸", ["liner paper", "面纸"]],
  ["inner-liner", "inner-liner", "Inner liner", "里纸", ["inner liner", "里纸"]],
  ["specialty-paper", "specialty-paper", "Specialty paper", "特种纸", ["specialty paper", "特种纸"]],
  ["colored-paper", "colored-paper", "Colored paper", "彩色纸", ["colored paper", "彩色纸", "彩纸"]],
  ["black-board", "black-board", "Black board", "黑卡纸", ["black board", "black card", "黑卡纸", "黑卡"]],
  ["gold-board", "gold-board", "Gold board", "金卡纸", ["gold board", "gold card", "金卡纸", "金卡"]],
  ["silver-board", "silver-board", "Silver board", "银卡纸", ["silver board", "silver card", "银卡纸", "银卡"]],
  ["holographic-paper", "holographic-paper", "Holographic paper", "镭射纸", ["holographic paper", "镭射纸"]],
  ["pearlescent-paper", "pearlescent-paper", "Pearlescent paper", "珠光纸", ["pearlescent paper", "珠光纸"]],
  ["composite-paper", "composite-paper", "Composite paper", "复合纸", ["composite paper", "复合纸"]],
  ["greyboard", "greyboard", "Greyboard", "灰板", ["greyboard", "灰板", "灰板面纸"]],
  ["security-paper", "security-paper", "Security paper", "防伪纸", ["security paper", "防伪纸", "防伪透明字"]],
  ["scratch-resistant-paper", "scratch-resistant-paper", "Scratch-resistant paper", "防刮花纸", ["scratch-resistant paper", "防刮花纸"]],
  ["fragrance-paper", "fragrance-paper", "Fragrance paper", "留香纸", ["fragrance paper", "留香纸"]],
].map(([id, slug, en, zh, aliases]) => ({
  id,
  slug,
  localizedLabel: { en, zh },
  aliases: [...new Set([en, zh, ...aliases])],
  active: true,
}));

const taxonomy = { categories: categoryDefinitions, materials: materialDefinitions };
const categoryByAlias = new Map(Object.entries(categoryAliases));
const materialByAlias = new Map();
for (const material of materialDefinitions) {
  for (const alias of material.aliases) materialByAlias.set(normalize(alias), material.id);
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .replaceAll("／", "/")
    .replaceAll("＋", "+")
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase();
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/u.test(value);
}

function splitMaterialSource(value) {
  const source = String(value ?? "").trim();
  if (!source) return [];
  const slashParts = source.split(/\s*\/\s*/u).filter(Boolean);
  const parts = [];
  if (slashParts.length > 1) {
    for (let index = 0; index < slashParts.length; index += 1) {
      const part = slashParts[index];
      const next = slashParts[index + 1];
      // Keep bilingual labels together and use the source-language side as the canonical alias.
      if (index === 0 && slashParts.length === 2 && hasCjk(part) && next && !hasCjk(next)) {
        parts.push(part);
        break;
      }
      parts.push(part);
    }
  } else {
    parts.push(source);
  }
  return parts.flatMap((part) => part.split(/\s*[+,、|，]\s*/u).filter(Boolean));
}

function resolveMaterialToken(token) {
  const normalized = normalize(token);
  if (!normalized) return { ids: [], ignored: true };
  if (/^(pe|pla)(?:\s*\/\s*(?:pe|pla))?|淋膜|涂层|coating|lamination|裱纸|裱瓦楞纸|printing|印刷|模切|die[- ]?cut|压痕|防油处理|压坑|flute forming$/iu.test(normalized)) {
    return { ids: [], ignored: true };
  }
  if (/e\s*\/\s*f\s*\/\s*g|e\s*(?:flute|坑)|f\s*(?:flute|坑)|g\s*(?:flute|坑)|\bflute\b|坑纸|裱瓦楞/iu.test(normalized)) {
    return { ids: ["fluted-paper"], ignored: false };
  }
  if (/(?:greaseproof|防油).*(?:kraft|牛皮)|(?:kraft|牛皮).*(?:greaseproof|防油)/iu.test(normalized)) {
    return { ids: ["greaseproof-paper", "kraft-paper"], ignored: false };
  }
  const direct = materialByAlias.get(normalized);
  if (direct) return { ids: [direct], ignored: false };
  const partial = [...materialByAlias.entries()]
    .filter(([alias]) => alias.length >= 3 && (normalized.includes(alias) || alias.includes(normalized)))
    .sort((a, b) => b[0].length - a[0].length)[0];
  if (partial) return { ids: [partial[1]], ignored: false };
  return { ids: [], ignored: false, unresolved: token };
}

function migrateMaterialValue(value) {
  const materialIds = [];
  const unresolved = [];
  for (const token of splitMaterialSource(value)) {
    const result = resolveMaterialToken(token);
    for (const id of result.ids) if (!materialIds.includes(id)) materialIds.push(id);
    if (result.unresolved) unresolved.push(result.unresolved);
  }
  return { materialIds, unresolved: [...new Set(unresolved)] };
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const originalSkus = Array.isArray(catalog.skus) ? catalog.skus : [];
const unresolved = [];
const pendingRows = [];
const differences = [];

const migratedSkus = originalSkus.map((sku) => {
  const categoryId = sku.categoryId || categoryByAlias.get(sku.category) || "";
  const migrated = Array.isArray(sku.materialIds) && sku.materialIds.length
    ? { materialIds: [...new Set(sku.materialIds)], unresolved: [] }
    : migrateMaterialValue(sku.material);
  if (/(?:greaseproof|防油).*kraft|kraft.*(?:greaseproof|防油)/iu.test(String(sku.title?.en || "")) && !migrated.materialIds.includes("kraft-paper")) {
    migrated.materialIds.push("kraft-paper");
  }
  const sourceStatus = sku.sourceStatus || (sku.dataStatus === "complete" ? "confirmed" : "pending");
  const imageMappingStatus = sku.imageMappingStatus || sku.imageStatus || "representative";
  const requiredFields = [sku.sku, sku.slug, sku.title?.en, sku.productType, categoryId, sku.gsmOrThickness];
  const needsReview = !categoryId || migrated.materialIds.length === 0 || migrated.unresolved.length > 0;
  const requiredFieldsValid = requiredFields.every((field) => String(field ?? "").trim().length > 0);
  const published = sku.published ?? (sourceStatus === "confirmed" && requiredFieldsValid && !needsReview && ["exact", "representative", "approved"].includes(imageMappingStatus));
  const next = { ...sku, categoryId, materialIds: migrated.materialIds, sourceStatus, imageMappingStatus, published };
  for (const key of ["category", "material", "materials", "dataStatus", "imageStatus"]) delete next[key];
  if (needsReview) {
    unresolved.push({ sku: sku.sku, category: sku.category || categoryId, material: sku.material || "", categoryId, unresolvedMaterialParts: migrated.unresolved, reason: !categoryId ? "unknown-category" : migrated.unresolved.length ? "unknown-material-alias" : "empty-materialIds" });
  }
  if (!published) {
    pendingRows.push({ sku: sku.sku, title: sku.title?.en || "", missingFields: [
      !categoryId ? "categoryId" : "",
      migrated.materialIds.length === 0 ? "materialIds" : "",
      !requiredFields[5] ? "gsmOrThickness" : "",
      imageMappingStatus === "pending" ? "imageMappingStatus" : "",
      sourceStatus !== "confirmed" ? "sourceStatus" : "",
    ].filter(Boolean).join(";"), sourceStatus, imageMappingStatus, currentImage: sku.mainImageAssetId || "", requiredAction: needsReview ? "Confirm taxonomy aliases and source/image mapping" : "Confirm sourceStatus and image mapping" });
  }
  differences.push({ sku: sku.sku, before: { category: sku.category || "", material: sku.material || "" }, after: { categoryId, materialIds: migrated.materialIds } });
  return next;
});

const publishedSkus = migratedSkus.filter((sku) => sku.published);
const groups = new Map();
for (const sku of publishedSkus) {
  const groupKey = sku.groupId || sku.canonicalGroupId || sku.sku;
  const group = groups.get(groupKey) || {
    id: groupKey,
    slug: groupKey,
    canonicalGroupId: sku.canonicalGroupId || groupKey,
    productType: sku.productType,
    categoryId: sku.categoryId,
    title: sku.title,
    materialIds: [...sku.materialIds],
    shortDescription: { en: sku.title?.en || "", zh: sku.title?.zh || "" },
    applications: [],
    representativeImages: [sku.mainImageAssetId].filter(Boolean),
    variantIds: [],
    representativeSku: sku.sku,
    mainImageAssetId: sku.mainImageAssetId,
    imageMappingStatus: sku.imageMappingStatus,
    sourceStatus: sku.sourceStatus,
    variantCount: 0,
    skus: [],
  };
  group.variantCount += 1;
  group.skus.push(sku.sku);
  group.variantIds.push(sku.sku);
  for (const materialId of sku.materialIds) if (!group.materialIds.includes(materialId)) group.materialIds.push(materialId);
  for (const application of sku.applicationsList || []) if (!group.applications.includes(application)) group.applications.push(application);
  groups.set(groupKey, group);
}

const families = (catalog.families || []).map((family) => {
  const categoryId = categoryByAlias.get(family.category) || family.categoryId || "";
  const familySkus = publishedSkus.filter((sku) => sku.categoryId === categoryId);
  return {
    ...family,
    categoryId,
    materialIds: [...new Set(familySkus.flatMap((sku) => sku.materialIds))],
    count: familySkus.length,
  };
});
for (const family of families) {
  delete family.category;
  delete family.materials;
}

const migratedCatalog = {
  ...catalog,
  generatedAt: new Date().toISOString(),
  taxonomyVersion: "2026-07-16.1",
  taxonomy: { categories: taxonomy.categories.map(({ id, slug }) => ({ id, slug })), materials: taxonomy.materials.map(({ id, slug }) => ({ id, slug })) },
  migrationSummary: {
    totalProducts: originalSkus.length,
    migratedProducts: migratedSkus.length,
    publishedProducts: publishedSkus.length,
    pendingProducts: migratedSkus.length - publishedSkus.length,
    unresolvedTaxonomyProducts: unresolved.length,
    generatedAt: new Date().toISOString(),
  },
  families,
  skus: migratedSkus,
  groups: [...groups.values()],
};

fs.mkdirSync(path.dirname(taxonomyPath), { recursive: true });
fs.mkdirSync(path.dirname(unresolvedPath), { recursive: true });
fs.mkdirSync(path.dirname(pendingCsvPath), { recursive: true });
fs.writeFileSync(taxonomyPath, `${JSON.stringify(taxonomy, null, 2)}\n`);
fs.writeFileSync(catalogPath, `${JSON.stringify(migratedCatalog, null, 2)}\n`);
fs.writeFileSync(unresolvedPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: unresolved.length, items: unresolved, differences }, null, 2)}\n`);
const pendingHeaders = ["sku", "title", "missingFields", "sourceStatus", "imageMappingStatus", "currentImage", "requiredAction"];
fs.writeFileSync(pendingCsvPath, `${pendingHeaders.join(",")}\n${pendingRows.map((row) => pendingHeaders.map((header) => csvCell(row[header])).join(",")).join("\n")}\n`);
const migrationReport = {
  totalProducts: originalSkus.length,
  migratedProducts: migratedSkus.length,
  publishedProducts: publishedSkus.length,
  pendingProducts: migratedSkus.length - publishedSkus.length,
  unresolvedTaxonomyProducts: unresolved.length,
  oneToManySplits: differences.filter((item) => item.after.materialIds.length > 1).length,
  emptyFields: migratedSkus.filter((sku) => sku.materialIds.length === 0 || !sku.categoryId).length,
  reports: { taxonomy: taxonomyPath, unresolved: unresolvedPath, pending: pendingCsvPath, migration: migrationReportPath },
};
fs.writeFileSync(migrationReportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), ...migrationReport }, null, 2)}\n`);
console.log(JSON.stringify(migrationReport, null, 2));
