import productImages from "@/data/productImages.json";
import type { AppLocale } from "@/i18n/locales";
import type { ProductSku } from "@/lib/catalog";
import { getPublicProductType } from "@/lib/catalog";

export type ProductImageStatus = "exact" | "representative" | "ai-representative" | "pending";
export type ProductDataStatus = "complete" | "partial" | "pending-source";

// Keep archived translation source available without reintroducing it to the
// public locale registry.
type ArchivedLocale = "es" | "id" | "ms" | "th" | "vi";
type LocalizedLabel = { en: string; zh: string } & Partial<Record<AppLocale | ArchivedLocale, string>>;
type ProductImageAsset = (typeof productImages.assets)[number] & {
  sourceType?: string;
  productionUsageAllowed?: boolean;
  exactSkuEligible?: boolean;
  imageStatus?: string;
};
type SkuImageMapEntry = {
  main?: string;
  gallery?: string[];
  imageStatus?: ProductImageStatus | string;
};

const assetsById = new Map(productImages.assets.map((asset) => [asset.assetId, asset]));
const skuImagesBySku = productImages.skuImages as Record<string, SkuImageMapEntry | undefined>;

/**
 * The confirmed public catalogue currently has six cupstock-related groups.
 * Their source records once inherited a single family image, making distinct
 * roll, sheet and tray directions look like duplicates. These are approved
 * representative assets, selected by stable group ID rather than by position.
 */
const publicGroupVisualAssets: Record<string, string> = {
  "paper-cup-fan-paper-cup-fan": "kh-cupfan-family-representative",
  "paper-cup-fan-paper-cup-bottom-roll": "kh-cup-bottom-family-representative",
  "paper-cup-fan-pe-coated-paper-roll-for-paper-cup": "kh-material-family-representative",
  "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup": "kh-coated-sheet-family-concept",
  "paper-cup-fan-kraft-cupstock-paper": "kh-kraft-family-representative",
  "paper-cup-fan-food-tray-paper-material": "kh-food-tray-family-concept",
};

export type ProductImageMeta = {
  src: string;
  alt: string;
  status: ProductImageStatus;
  statusLabel: string;
  statusTone: "success" | "warning" | "muted";
  asset?: ProductImageAsset;
};

function pickLabel(label: LocalizedLabel, locale: string) {
  return label[locale as AppLocale | ArchivedLocale] ?? label.en;
}

function normalizeImageStatus(status: ProductImageStatus | string | undefined): ProductImageStatus {
  if (
    status === "exact" ||
    status === "representative" ||
    status === "ai-representative" ||
    status === "pending"
  ) {
    return status;
  }
  return "pending";
}

function getSkuImageMapping(sku: ProductSku): SkuImageMapEntry {
  return skuImagesBySku[sku.sku] ?? {};
}

function getGroupVisualAssetId(sku: Pick<ProductSku, "groupId" | "canonicalGroupId">) {
  return publicGroupVisualAssets[sku.groupId ?? sku.canonicalGroupId ?? ""];
}

const imageStatusLabels: Record<ProductImageStatus, LocalizedLabel> = {
  exact: {
    en: "Verified Product Photo",
    zh: "已核验产品照片",
    es: "Verified Product Photo",
    id: "Verified Product Photo",
    vi: "Verified Product Photo",
    th: "Verified Product Photo",
    ms: "Verified Product Photo",
  },
  representative: {
    en: "Product reference image",
    zh: "纸品生产能力示意图",
    es: "Imagen de referencia",
    id: "Gambar referensi produk",
    vi: "Hình ảnh tham khảo",
    th: "ภาพอ้างอิงสินค้า",
    ms: "Imej rujukan produk",
  },
  "ai-representative": {
    en: "Concept visualization",
    zh: "概念示意图",
    es: "Visualización conceptual",
    id: "Visualisasi konsep",
    vi: "Minh họa khái niệm",
    th: "ภาพแนวคิด",
    ms: "Visualisasi konsep",
  },
  pending: {
    en: "Image Pending Confirmation",
    zh: "图片待确认",
    es: "Image Pending Confirmation",
    id: "Image Pending Confirmation",
    vi: "Image Pending Confirmation",
    th: "Image Pending Confirmation",
    ms: "Image Pending Confirmation",
  },
};

export function getImageStatusLabel(status: ProductImageStatus | string, locale: string) {
  return pickLabel(imageStatusLabels[normalizeImageStatus(status)], locale);
}

const dataStatusLabels: Record<ProductDataStatus, LocalizedLabel> = {
  complete: {
    en: "Source linked",
    zh: "来源已关联",
    es: "Fuente vinculada",
    id: "Sumber tertaut",
    vi: "Đã liên kết nguồn",
    th: "เชื่อมโยงแหล่งที่มาแล้ว",
    ms: "Sumber dipautkan",
  },
  partial: {
    en: "Partial source",
    zh: "部分来源",
    es: "Fuente parcial",
    id: "Sumber sebagian",
    vi: "Nguồn một phần",
    th: "แหล่งที่มาบางส่วน",
    ms: "Sumber separa",
  },
  "pending-source": {
    en: "Source pending",
    zh: "来源待确认",
    es: "Fuente pendiente",
    id: "Sumber menunggu konfirmasi",
    vi: "Nguồn chờ xác nhận",
    th: "รอยืนยันแหล่งที่มา",
    ms: "Sumber menunggu pengesahan",
  },
};

export function getDataStatusLabel(status: ProductDataStatus | string, locale: string) {
  const safeStatus: ProductDataStatus =
    status === "complete" || status === "partial" || status === "pending-source"
      ? status
      : "pending-source";
  return pickLabel(dataStatusLabels[safeStatus], locale);
}

const productTypeLabels: Record<string, LocalizedLabel> = {
  "paper-cup-fan": {
    en: "Cupstock components",
    zh: "杯纸组件",
    es: "Componentes de cupstock",
    id: "Cupstock components",
    vi: "Thành phần giấy làm ly",
    th: "ส่วนประกอบกระดาษทำแก้ว",
    ms: "Komponen cupstock",
  },
  "pe-coated-paper-roll": { en: "PE coated paper roll", zh: "PE 淋膜纸卷" },
  "pe-coated-paper-sheet": { en: "Coated paper sheet", zh: "淋膜平张纸" },
  "paper-cup-bottom-roll": { en: "Paper cup bottom roll", zh: "纸杯底卷" },
  "cupstock-paper": { en: "Cupstock paper", zh: "杯纸" },
  "food-tray-paper-material": { en: "Food tray paper material", zh: "食品纸托材料" },
  "kraft-paper": {
    en: "Kraft paper",
    zh: "牛皮纸",
    es: "Papel kraft",
    id: "Kertas kraft",
    vi: "Giấy kraft",
    th: "กระดาษคราฟท์",
    ms: "Kertas kraft",
  },
  "white-cardboard": {
    en: "White cardboard",
    zh: "白卡纸",
    es: "Cartón blanco",
    id: "Karton putih",
    vi: "Giấy bìa trắng",
    th: "กระดาษการ์ดขาว",
    ms: "Kadbod putih",
  },
  "corrugated-fluted-paper": {
    en: "Corrugated / fluted paper",
    zh: "瓦楞 / 坑纸",
    es: "Papel corrugado / ondulado",
    id: "Kertas bergelombang",
    vi: "Giấy sóng / giấy flute",
    th: "กระดาษลูกฟูก",
    ms: "Kertas beralun",
  },
  "specialty-paper": {
    en: "Specialty paper",
    zh: "特种纸",
    es: "Papel especial",
    id: "Kertas khusus",
    vi: "Giấy đặc biệt",
    th: "กระดาษชนิดพิเศษ",
    ms: "Kertas khas",
  },
  "food-packaging-box": {
    en: "Food packaging boxes",
    zh: "食品包装盒",
    es: "Cajas para alimentos",
    id: "Kotak kemasan makanan",
    vi: "Hộp bao bì thực phẩm",
    th: "กล่องบรรจุอาหาร",
    ms: "Kotak pembungkusan makanan",
  },
  "paper-pad": {
    en: "Paper pads / cake boards",
    zh: "纸垫片 / 蛋糕垫",
    es: "Bases de papel / cake boards",
    id: "Alas kertas / cake board",
    vi: "Miếng lót giấy / đế bánh",
    th: "แผ่นรองกระดาษ / ฐานเค้ก",
    ms: "Pad kertas / papan kek",
  },
  "paper-insert": {
    en: "Paper inserts / trays",
    zh: "纸内托 / 纸托",
    es: "Insertos / bandejas de papel",
    id: "Sisipan / tray kertas",
    vi: "Khay / vỉ lót giấy",
    th: "ถาดและไส้ในกระดาษ",
    ms: "Sisipan / dulang kertas",
  },
  "paper-box": {
    en: "Paper boxes",
    zh: "纸盒",
    es: "Cajas de papel",
    id: "Kotak kertas",
    vi: "Hộp giấy",
    th: "กล่องกระดาษ",
    ms: "Kotak kertas",
  },
  "paper-packaging-material": {
    en: "Packaging material",
    zh: "包装材料",
    es: "Material de embalaje",
    id: "Bahan kemasan",
    vi: "Vật liệu bao bì",
    th: "วัสดุบรรจุภัณฑ์",
    ms: "Bahan pembungkusan",
  },
};

export function getProductTypeLabel(productType: string, locale: string) {
  const label = productTypeLabels[productType];
  return label ? pickLabel(label, locale) : productType;
}

export function getPublicProductTypeLabel(sku: ProductSku, locale: string) {
  const publicType = getPublicProductType(sku);
  const labels: Record<string, LocalizedLabel> = {
    "paper-cup-fan": { en: "Paper cup fan", zh: "纸杯扇形片" },
    "pe-coated-paper-roll": { en: "PE coated paper roll", zh: "PE 淋膜纸卷" },
    "pe-coated-paper-sheet": { en: "Coated paper sheet", zh: "淋膜平张纸" },
    "paper-cup-bottom-roll": { en: "Paper cup bottom roll", zh: "纸杯底卷" },
    "cupstock-paper": { en: "Cupstock paper", zh: "杯纸" },
    "food-tray-paper-material": { en: "Food tray paper material", zh: "食品纸托材料" },
  };
  return labels[publicType] ? pickLabel(labels[publicType], locale) : getProductTypeLabel(publicType, locale);
}

function statusTone(status: ProductImageStatus): ProductImageMeta["statusTone"] {
  if (status === "exact") return "success";
  if (status === "representative" || status === "ai-representative") return "warning";
  return "muted";
}

function isAiGeneratedAsset(asset: ProductImageAsset) {
  return asset.sourceType === "ai-generated";
}

function isAssetDisplayAllowed(asset: ProductImageAsset) {
  if (asset.permissionStatus === "approved") return true;

  return (
    isAiGeneratedAsset(asset) &&
    asset.permissionStatus === "generated-for-site" &&
    asset.exactness === "representative" &&
    asset.imageStatus === "ai-representative" &&
    asset.productionUsageAllowed === true &&
    asset.exactSkuEligible === false
  );
}

export function getSkuEffectiveImageStatus(sku: ProductSku): ProductImageStatus {
  const mapping = getSkuImageMapping(sku);
  const requestedStatus = normalizeImageStatus(mapping.imageStatus ?? sku.imageMappingStatus);
  const mainImageAssetId = getGroupVisualAssetId(sku) ?? mapping.main ?? sku.mainImageAssetId;
  const asset = mainImageAssetId ? assetsById.get(mainImageAssetId) : undefined;

  if (!asset || !isAssetDisplayAllowed(asset)) return "pending";

  if (isAiGeneratedAsset(asset)) return "ai-representative";

  const assetExactness = normalizeImageStatus(asset.exactness);
  if (requestedStatus === "exact") return assetExactness === "exact" ? "exact" : assetExactness;
  if (requestedStatus === "representative") return assetExactness === "exact" ? "representative" : assetExactness;
  return requestedStatus;
}

const productTypeFallbacks: Record<string, { src: string; en: string; zh: string }> = {
  "paper-cup-fan": { src: "/images/ai/ai-cup-fan-blanks.jpg", en: "Paper cup fan blanks for cup converting", zh: "用于纸杯加工的纸杯扇形片" },
  "paper-packaging-material": { src: "/images/ai/ai-pe-coated-roll.jpg", en: "PE-coated paper roll for packaging conversion", zh: "用于包装加工的 PE 淋膜纸卷" },
  "kraft-paper": { src: "/images/ai/ai-kraft-cupstock.jpg", en: "Kraft paper and cupstock material reference", zh: "牛皮纸与杯纸材料参考图" },
  "food-packaging-box": { src: "/images/kehong/showcase/optimized/food-box-real-01.jpg", en: "Food packaging box structure reference", zh: "食品包装盒结构参考图" },
  "corrugated-fluted-paper": { src: "/images/ai/ai-flute-types.jpg", en: "Corrugated board material structure reference", zh: "瓦楞纸板材料结构参考图" },
  "paper-insert": { src: "/images/ai/ai-paper-insert.jpg", en: "Paper insert and protective tray reference", zh: "纸内托与保护纸托参考图" },
  "paper-pad": { src: "/images/ai/ai-cake-pads.jpg", en: "Paper pad and cake board reference", zh: "纸垫片与蛋糕垫板参考图" },
};

function fallbackImage(sku: ProductSku, locale: string): ProductImageMeta {
  const fallback = productTypeFallbacks[sku.productType];
  return {
    src: fallback?.src ?? "/images/kehong/showcase/precision-machine-closeup.webp",
    alt: locale === "zh" ? (fallback?.zh ?? "纸品生产能力代表图") : (fallback?.en ?? "Representative paper production capability"),
    status: "pending",
    statusLabel: getImageStatusLabel("pending", locale),
    statusTone: statusTone("pending"),
  };
}

export function getSkuImageMeta(sku: ProductSku, locale: string): ProductImageMeta {
  const mapping = getSkuImageMapping(sku);
  const mainImageAssetId = getGroupVisualAssetId(sku) ?? mapping.main ?? sku.mainImageAssetId;
  const asset = mainImageAssetId ? assetsById.get(mainImageAssetId) : undefined;
  const approvedAsset = asset && isAssetDisplayAllowed(asset) ? asset : undefined;

  if (!approvedAsset) return fallbackImage(sku, locale);

  const safeStatus = getSkuEffectiveImageStatus(sku);
  const alt = locale === "zh" ? approvedAsset.alt.zh : approvedAsset.alt.en;

  return {
    src: approvedAsset.localPath,
    alt,
    status: safeStatus,
    statusLabel: getImageStatusLabel(safeStatus, locale),
    statusTone: statusTone(safeStatus),
    asset: approvedAsset,
  };
}

function getSafeGalleryStatus(sku: ProductSku, asset: ProductImageAsset): ProductImageStatus {
  const mapping = getSkuImageMapping(sku);
  const requestedStatus = normalizeImageStatus(mapping.imageStatus ?? sku.imageMappingStatus);
  const assetExactness = normalizeImageStatus(asset.exactness);

  if (!isAssetDisplayAllowed(asset)) return "pending";
  if (isAiGeneratedAsset(asset)) return "ai-representative";
  if (requestedStatus === "exact") return assetExactness === "exact" ? "exact" : assetExactness;
  if (requestedStatus === "representative") return assetExactness === "exact" ? "representative" : assetExactness;
  return requestedStatus;
}

export function getSkuGalleryMeta(sku: ProductSku, locale: string): ProductImageMeta[] {
  const mapping = getSkuImageMapping(sku);
  const groupVisualAssetId = getGroupVisualAssetId(sku);
  const ids = groupVisualAssetId
    ? [groupVisualAssetId, ...(mapping.gallery ?? []).filter((assetId) => assetId !== groupVisualAssetId)]
    : mapping.gallery?.length
      ? mapping.gallery
    : sku.galleryAssetIds?.length
      ? sku.galleryAssetIds
      : [mapping.main ?? sku.mainImageAssetId].filter(Boolean);

  const gallery = ids.flatMap((assetId) => {
    const asset = assetsById.get(assetId);
    if (!asset || !isAssetDisplayAllowed(asset)) return [];

    const status = getSafeGalleryStatus(sku, asset);

    return [
      {
        src: asset.localPath,
        alt: locale === "zh" ? asset.alt.zh : asset.alt.en,
        status,
        statusLabel: getImageStatusLabel(status, locale),
        statusTone: statusTone(status),
        asset,
      },
    ];
  });

  return gallery.length ? gallery : [getSkuImageMeta(sku, locale)];
}
