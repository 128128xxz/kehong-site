import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const catalogPath = path.join(root, "src/data/catalog.json");
const normalizedPath = path.join(root, "src/data/catalog.normalized.json");
const productImagesPath = path.join(root, "src/data/productImages.json");
const sourcesPath = path.join(root, "public/images/products/SOURCES.md");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/pe\/pla/g, "pe-pla")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function haystack(sku) {
  return [
    sku.sku,
    sku.sourceGroup,
    sku.category,
    sku.title?.en,
    sku.title?.zh,
    sku.material,
    sku.gsmOrThickness,
    sku.color,
    sku.structureOrFlute,
    sku.surfaceProcess,
    sku.finishingProcess,
    sku.commonSize,
    sku.applications,
    sku.industries,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferProductType(sku) {
  const text = haystack(sku);

  if (sku.sourceGroup === "cup-fan" || text.includes("cup fan") || text.includes("扇形片")) {
    return "paper-cup-fan";
  }

  if (text.includes("cake board") || text.includes("cake pad") || text.includes("垫片")) {
    return "paper-pad";
  }

  if (text.includes("insert") || text.includes("tray") || text.includes("内托")) {
    return "paper-insert";
  }

  if (text.includes("corrugated") || text.includes("flute") || text.includes("瓦楞") || text.includes("坑")) {
    return "corrugated-fluted-paper";
  }

  if (text.includes("food packaging") || text.includes("食品包装盒") || text.includes("pizza") || text.includes("bakery")) {
    return "food-packaging-box";
  }

  if (text.includes("white card") || text.includes("white cardboard") || text.includes("白卡")) {
    return "white-cardboard";
  }

  if (text.includes("kraft") || text.includes("牛皮")) {
    return "kraft-paper";
  }

  if (text.includes("gold") || text.includes("silver") || text.includes("specialty") || text.includes("特种") || text.includes("金银")) {
    return "specialty-paper";
  }

  if (text.includes("box") || text.includes("盒")) {
    return "paper-box";
  }

  return "paper-packaging-material";
}

function inferCoating(sku) {
  const text = haystack(sku);
  if (text.includes("pla")) return "PLA coating";
  if (text.includes("pe")) return "PE coating";
  if (text.includes("防油") || text.includes("grease")) return "Greaseproof";
  if (text.includes("淋膜") || text.includes("coated")) return "Coated";
  return "";
}

function inferDataStatus(sku) {
  if (!sku.productLink) return "pending-source";
  if (!sku.color || !sku.finishingProcess || !sku.sourceReferencePrice) return "partial";
  return "complete";
}

function canonicalGroupId(sku, productType, coating) {
  if (sku.productLink) {
    const urlTail = sku.productLink.split("?")[0].split("/").filter(Boolean).pop();
    return `${productType}-${slugify(urlTail || sku.productLink)}`;
  }

  const groupSeed = [
    productType,
    sku.category,
    sku.material,
    sku.gsmOrThickness,
    coating,
    sku.surfaceProcess,
    sku.structureOrFlute,
  ].join(" ");

  return slugify(groupSeed);
}

function productGroupId(sku, productType) {
  const title = sku.englishName || sku.title?.en || sku.title?.zh || sku.sku;
  return slugify(`${productType}-${title}`);
}

function englishNote(value) {
  const text = String(value || "").trim();
  return /[\u3400-\u9fff]/u.test(text) ? "" : text;
}

function normalizeNotes(notes) {
  let zh = String(notes?.zh || "")
    .replace(/标题来自官网分类页；?/u, "")
    .replace(/来自阿里\/搜索索引；?/u, "")
    .replace(/来源待确认；?/u, "")
    .trim();
  if (/阿里|来源参考|询盘\/报价SKU矩阵|不是阿里/u.test(zh)) zh = "";
  return {
    ...(notes || {}),
    en: englishNote(notes?.en),
    zh,
  };
}

function splitList(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(/[、,，/]+/u)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeMoq(value) {
  const text = String(value || "").trim();
  if (text === "询价；阿里常见1-5吨起") return "1–5 metric tons (typical)";
  if (text === "未公开/询价") return "Available on request";
  return text;
}

function normalizeTitle(sku) {
  const title = { ...(sku.title || {}) };
  const material = String(sku.material || "");
  if (/kraft cupstock paper/i.test(String(title.en || "")) && !/kraft|牛皮/iu.test(material)) {
    for (const key of ["en", "es", "id", "vi", "th", "ms"]) title[key] = "Cupstock Paper";
    title.zh = "杯纸";
  }
  return title;
}

const typeToImage = {
  "paper-cup-fan": "kh-cupfan-family-representative",
  "kraft-paper": "kh-kraft-family-representative",
  "white-cardboard": "kh-white-cardboard-family-representative",
  "corrugated-fluted-paper": "kh-corrugated-family-representative",
  "specialty-paper": "kh-specialty-family-representative",
  "food-packaging-box": "kh-food-box-family-representative",
  "paper-pad": "kh-paper-pad-family-representative",
  "paper-insert": "kh-paper-insert-family-representative",
  "paper-box": "kh-paper-box-family-representative",
  "paper-packaging-material": "kh-material-family-representative",
};

const assets = [
  {
    assetId: "kh-cupfan-family-representative",
    localPath: "/images/kehong/showcase/color-material-swatch.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative paper cup fan and coated paper material swatches",
      zh: "纸杯扇形片与淋膜纸材料代表图",
    },
  },
  {
    assetId: "kh-kraft-family-representative",
    localPath: "/images/kehong/showcase/honeycomb-paper-roll.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative kraft and honeycomb paper material roll",
      zh: "牛皮纸与蜂窝纸材料代表图",
    },
  },
  {
    assetId: "kh-white-cardboard-family-representative",
    localPath: "/images/kehong/showcase/food-paper-box-open.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative white cardboard food packaging structure",
      zh: "白卡纸食品包装结构代表图",
    },
  },
  {
    assetId: "kh-corrugated-family-representative",
    localPath: "/images/kehong/showcase/optimized/structure-material-real.jpg",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative corrugated and structured paper material texture",
      zh: "瓦楞与结构纸材质代表图",
    },
  },
  {
    assetId: "kh-specialty-family-representative",
    localPath: "/images/kehong/showcase/gold-board-stack.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative specialty paper and gold board stack",
      zh: "特种纸与金银卡纸代表图",
    },
  },
  {
    assetId: "kh-food-box-family-representative",
    localPath: "/images/kehong/showcase/orins-pizza-box-collage.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative food packaging box structure sample",
      zh: "食品包装盒结构样品代表图",
    },
  },
  {
    assetId: "kh-paper-pad-family-representative",
    localPath: "/images/kehong/showcase/optimized/cake-board-real.jpg",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative cake board and paper pad product image",
      zh: "蛋糕垫片与纸垫片代表图",
    },
  },
  {
    assetId: "kh-paper-insert-family-representative",
    localPath: "/images/kehong/showcase/custom-box-display-open.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative open paper insert and custom box structure",
      zh: "纸内托与定制盒结构代表图",
    },
  },
  {
    assetId: "kh-paper-box-family-representative",
    localPath: "/images/kehong/showcase/pink-structural-box.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative paper box structure sample",
      zh: "纸盒结构样品代表图",
    },
  },
  {
    assetId: "kh-material-family-representative",
    localPath: "/images/kehong/showcase/precision-machine-closeup.webp",
    scope: "family",
    exactness: "representative",
    alt: {
      en: "Representative paper material converting and production proof",
      zh: "纸品材料加工与生产能力代表图",
    },
  },
].map((asset) => ({
  sourcePageUrl: "local://user-provided-kehong-image-pack",
  directImageUrl: asset.localPath,
  sourceOwner: "Kehong / user-provided project asset",
  licenseOrPermission: "authorized",
  permissionStatus: "approved",
  notes: "Representative visual only. Not verified as exact SKU photography.",
  ...asset,
}));

const normalizedSkus = catalog.skus.map((sku) => {
  const productType = inferProductType(sku);
  const coating = inferCoating(sku);
  const mainImageAssetId = typeToImage[productType] || typeToImage["paper-packaging-material"];
  const galleryAssetIds = Array.from(
    new Set([
      mainImageAssetId,
      productType === "paper-cup-fan" ? "kh-material-family-representative" : "kh-cupfan-family-representative",
      productType.includes("box") ? "kh-paper-insert-family-representative" : "kh-food-box-family-representative",
    ]),
  ).slice(0, 3);
  const publicSku = { ...sku };
  for (const key of ["source", "sourceReferencePrice", "productLink", "sourceNotes", "sourceGroup"]) {
    delete publicSku[key];
  }

  return {
    ...publicSku,
    canonicalGroupId: canonicalGroupId(sku, productType, coating),
    groupId: productGroupId(sku, productType),
    productType,
    coating,
    gsm: sku.gsmOrThickness || "",
    thickness: sku.gsmOrThickness || "",
    size: sku.commonSize || "",
    process: [sku.surfaceProcess, sku.finishingProcess].flatMap(splitList),
    applicationsList: splitList(sku.applications),
    materials: splitList(sku.material),
    title: normalizeTitle(sku),
    moq: normalizeMoq(sku.moq),
    notes: normalizeNotes(sku.notes),
    dataStatus: inferDataStatus(sku),
    imageStatus: "representative",
    mainImageAssetId,
    galleryAssetIds,
  };
});

const productImages = {
  generatedAt: new Date().toISOString(),
  policy: {
    exact: "Only assets verified as the exact SKU image may be used as exact.",
    representative: "Representative assets can be used for family, group and SKU context only when visibly labeled.",
    pending: "Pending or unknown-license images must not be presented as production SKU photos.",
  },
  assets,
  skuImages: Object.fromEntries(
    normalizedSkus.map((sku) => [
      sku.sku,
      {
        main: sku.mainImageAssetId,
        gallery: sku.galleryAssetIds,
        imageStatus: sku.imageStatus,
      },
    ]),
  ),
  familyImages: Object.fromEntries(
    Object.entries(typeToImage).map(([productType, assetId]) => [
      productType,
      {
        main: assetId,
        imageStatus: "representative",
      },
    ]),
  ),
};

const groups = new Map();
for (const sku of normalizedSkus) {
  const groupKey = sku.groupId;
  const group = groups.get(groupKey) || {
    id: groupKey,
    slug: groupKey,
    canonicalGroupId: groupKey,
    productType: sku.productType,
    category: sku.category,
    title: sku.title,
    primaryMaterial: sku.material || "",
    shortDescription: {
      en: sku.title?.en || "",
      zh: sku.title?.zh || "",
    },
    applications: [],
    representativeImages: [sku.mainImageAssetId],
    variantIds: [],
    representativeSku: sku.sku,
    mainImageAssetId: sku.mainImageAssetId,
    imageStatus: sku.imageStatus,
    dataStatus: sku.dataStatus,
    variantCount: 0,
    skus: [],
  };

  group.variantCount += 1;
  group.skus.push(sku.sku);
  group.variantIds.push(sku.sku);
  for (const application of sku.applicationsList) {
    if (!group.applications.includes(application)) group.applications.push(application);
  }
  if (sku.material && !group.primaryMaterial) group.primaryMaterial = sku.material;
  if (group.dataStatus !== "complete" && sku.dataStatus === "complete") {
    group.dataStatus = "complete";
  }
  groups.set(groupKey, group);
}

const normalizedCatalog = {
  ...catalog,
  generatedAt: new Date().toISOString(),
  normalizationPolicy: {
    dataStatus: {
      complete: "Source link and core commercial fields are present.",
      partial: "Source link exists, but some procurement fields still need confirmation.",
      "pending-source": "No productLink is available in the source catalog.",
    },
    imageStatus: {
      exact: "Verified exact SKU image.",
      representative: "Approved representative image, not exact SKU proof.",
      pending: "No approved image for production display.",
    },
  },
  groups: Array.from(groups.values()),
  skus: normalizedSkus,
};

fs.mkdirSync(path.dirname(normalizedPath), { recursive: true });
fs.writeFileSync(normalizedPath, `${JSON.stringify(normalizedCatalog, null, 2)}\n`);
fs.writeFileSync(productImagesPath, `${JSON.stringify(productImages, null, 2)}\n`);

fs.mkdirSync(path.dirname(sourcesPath), { recursive: true });
fs.writeFileSync(
  sourcesPath,
  `# Product Image Sources\n\nGenerated by scripts/build-product-data.mjs.\n\nAll production product images in src/data/productImages.json currently use project-local Kehong/user-provided assets only. They are marked as authorized representative visuals, not exact SKU photos.\n\nNo unapproved competitor images are used as SKU production images in this build.\n\n## Next steps\n\n- Add exact SKU photography when Kehong confirms source ownership or written permission.\n- Change imageStatus from representative to exact only after visual and source verification.\n- Keep sourcePageUrl, directImageUrl, permissionStatus and exactness updated for every new image.\n`,
);

console.log(`Wrote ${normalizedPath}`);
console.log(`Wrote ${productImagesPath}`);
console.log(`Wrote ${sourcesPath}`);
console.log(`Normalized ${normalizedSkus.length} SKUs into ${groups.size} canonical groups.`);

const migration = spawnSync(process.execPath, [path.join(root, "scripts/migrate-product-taxonomy.mjs")], { stdio: "inherit" });
if (migration.status !== 0) process.exit(migration.status ?? 1);
