import productImages from "@/data/productImages.json";
import type { AppLocale } from "@/i18n/locales";
import type { ProductSku } from "@/lib/catalog";

export type ProductImageStatus = "exact" | "representative" | "ai-representative" | "pending";
export type ProductDataStatus = "complete" | "partial" | "pending-source";

type LocalizedLabel = { en: string; zh: string } & Partial<Record<AppLocale, string>>;
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

export type ProductImageMeta = {
  src: string;
  alt: string;
  status: ProductImageStatus;
  statusLabel: string;
  statusTone: "success" | "warning" | "muted";
  asset?: ProductImageAsset;
};

function pickLabel(label: LocalizedLabel, locale: string) {
  return label[locale as AppLocale] ?? label.en;
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

const imageStatusLabels: Record<ProductImageStatus, LocalizedLabel> = {
  exact: {
    en: "Verified Product Photo",
    zh: "Verified Product Photo",
    es: "Verified Product Photo",
    id: "Verified Product Photo",
    vi: "Verified Product Photo",
    th: "Verified Product Photo",
    ms: "Verified Product Photo",
  },
  representative: {
    en: "Representative Visual",
    zh: "Representative Visual",
    es: "Representative Visual",
    id: "Representative Visual",
    vi: "Representative Visual",
    th: "Representative Visual",
    ms: "Representative Visual",
  },
  "ai-representative": {
    en: "AI Generated Representative Visual",
    zh: "AI Generated Representative Visual",
    es: "AI Generated Representative Visual",
    id: "AI Generated Representative Visual",
    vi: "AI Generated Representative Visual",
    th: "AI Generated Representative Visual",
    ms: "AI Generated Representative Visual",
  },
  pending: {
    en: "Image Pending Confirmation",
    zh: "Image Pending Confirmation",
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
    en: "Paper cup fan & cupstock",
    zh: "纸杯扇形片 / 杯纸",
    es: "Paper cup fan y cartulina para vasos",
    id: "Paper cup fan & cupstock",
    vi: "Phôi quạt ly giấy & giấy làm ly",
    th: "แผ่นพัดแก้วกระดาษและกระดาษทำแก้ว",
    ms: "Paper cup fan & cupstock",
  },
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
  const mainImageAssetId = mapping.main ?? sku.mainImageAssetId;
  const asset = mainImageAssetId ? assetsById.get(mainImageAssetId) : undefined;

  if (!asset || !isAssetDisplayAllowed(asset)) return "pending";

  if (isAiGeneratedAsset(asset)) return "ai-representative";

  const assetExactness = normalizeImageStatus(asset.exactness);
  if (requestedStatus === "exact") return assetExactness === "exact" ? "exact" : assetExactness;
  if (requestedStatus === "representative") return assetExactness === "exact" ? "representative" : assetExactness;
  return requestedStatus;
}

function fallbackImage(locale: string): ProductImageMeta {
  return {
    src: "/images/kehong/showcase/precision-machine-closeup.webp",
    alt: locale === "zh" ? "纸品生产能力代表图" : "Representative paper production capability",
    status: "pending",
    statusLabel: getImageStatusLabel("pending", locale),
    statusTone: statusTone("pending"),
  };
}

export function getSkuImageMeta(sku: ProductSku, locale: string): ProductImageMeta {
  const mapping = getSkuImageMapping(sku);
  const mainImageAssetId = mapping.main ?? sku.mainImageAssetId;
  const asset = mainImageAssetId ? assetsById.get(mainImageAssetId) : undefined;
  const approvedAsset = asset && isAssetDisplayAllowed(asset) ? asset : undefined;

  if (!approvedAsset) return fallbackImage(locale);

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
  const ids = mapping.gallery?.length
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
