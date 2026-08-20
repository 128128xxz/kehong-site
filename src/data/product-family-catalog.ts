import catalog from "@/data/catalog.normalized.json";
import {
  getAllSkus,
  getProductGroupId,
  getSkusByGroupId,
  type ProductSku,
} from "@/lib/catalog";

export type ProductFamilyId =
  | "corrugated"
  | "specialty"
  | "functional"
  | "cup"
  | "converted"
  | "service";

export type ProductFamilyConfig = {
  id: ProductFamilyId;
  routeSlug: string;
  imageId: string;
  sourceClusterIds: readonly string[];
  sourceProductIds: readonly string[];
  buyerTypeKeys: readonly string[];
  applicationKeys: readonly string[];
  capabilityKeys: readonly string[];
  commonParameterKeys: readonly string[];
  rfqInterestValue: string;
  navigationPriority: number;
  homepagePriority: number;
  serviceRoute?: string;
};

const family = (
  id: ProductFamilyId,
  routeSlug: string,
  imageId: string,
  sourceClusterIds: readonly string[],
  options: Omit<ProductFamilyConfig, "id" | "routeSlug" | "imageId" | "sourceClusterIds">,
): ProductFamilyConfig => ({ id, routeSlug, imageId, sourceClusterIds, ...options });

export const productFamilyCatalog: readonly ProductFamilyConfig[] = [
  family("corrugated", "corrugated-board-flute-materials", "kh-corrugated-family-representative", [
    "cluster-paper-insert-specialty-paper-laminated-corrugated-paper",
    "cluster-corrugated-fluted-paper-anti-counterfeit-corrugated-paper",
    "cluster-corrugated-fluted-paper-colored-corrugated-box",
    "cluster-corrugated-fluted-paper-colored-corrugated-paper",
    "cluster-corrugated-fluted-paper-corrugated-box-blank",
    "cluster-corrugated-fluted-paper-corrugated-box-semi-finished-sheet",
    "cluster-corrugated-fluted-paper-corrugated-paper-box",
    "cluster-corrugated-fluted-paper-custom-shape-box-blank",
    "cluster-corrugated-fluted-paper-die-cut-semi-finished-sheet",
    "cluster-corrugated-fluted-paper-electronics-packaging-box",
    "cluster-corrugated-fluted-paper-gift-packaging-box",
    "cluster-corrugated-fluted-paper-kraft-corrugated-paper",
    "cluster-corrugated-fluted-paper-laminated-semi-finished-sheet",
    "cluster-corrugated-fluted-paper-logo-embossed-corrugated-paper",
    "cluster-corrugated-fluted-paper-one-piece-paper-box",
    "cluster-corrugated-fluted-paper-pizza-box",
    "cluster-corrugated-fluted-paper-pizza-liner-paper",
    "cluster-corrugated-fluted-paper-printed-color-box-blank",
    "cluster-corrugated-fluted-paper-white-card-laminated-corrugated-paper",
    "cluster-corrugated-fluted-paper-white-cardboard-laminated-corrugated-paper",
    "cluster-corrugated-fluted-paper-white-corrugated-paper",
    "cluster-paper-insert-black-card-laminated-corrugated-paper",
    "cluster-paper-insert-black-corrugated-paper",
    "cluster-paper-insert-corrugated-paper-insert",
    "cluster-paper-insert-double-wall-corrugated-paper",
    "cluster-paper-insert-e-flute-corrugated-paper",
    "cluster-paper-insert-electronics-paper-insert",
    "cluster-paper-insert-f-flute-corrugated-paper",
    "cluster-paper-insert-g-flute-corrugated-paper",
    "cluster-paper-insert-kraft-laminated-corrugated-paper",
    "cluster-paper-insert-triple-layer-corrugated-paper",
    "cluster-paper-insert-wine-box-paper-insert",
    "cluster-paper-pad-custom-die-cut-paper-pad",
    "cluster-paper-pad-electronics-paper-pad",
    "cluster-paper-pad-pizza-paper-pad",
    "cluster-paper-pad-shock-absorbing-paper-pad",
    "cluster-paper-pad-single-face-corrugated-paper",
    "cluster-paper-pad-square-paper-pad",
  ], {
    sourceProductIds: [], buyerTypeKeys: ["packaging-converter", "ecommerce-buyer"],
    applicationKeys: ["protective-structures", "mailer-packaging"], capabilityKeys: ["structure-review", "custom-converting"],
    commonParameterKeys: ["board-construction", "flute", "dimensions", "printing"], rfqInterestValue: "structure-review", navigationPriority: 1, homepagePriority: 1,
  }),
  family("specialty", "specialty-decorative-paper", "kh-specialty-family-representative", [
    "cluster-food-packaging-box-cake-box", "cluster-paper-insert-cosmetic-paper-insert", "cluster-paper-insert-gift-box-paper-insert", "cluster-paper-insert-gift-box-semi-finished-sheet", "cluster-paper-insert-perfume-paper-insert", "cluster-paper-insert-silver-card-paper", "cluster-paper-insert-specialty-paper-insert", "cluster-paper-insert-tea-box-paper-insert", "cluster-paper-pad-black-card-paper", "cluster-paper-pad-cake-pad", "cluster-paper-pad-cosmetic-box-semi-finished-sheet", "cluster-paper-pad-cosmetic-paper-pad", "cluster-paper-pad-gift-box-inner-pad", "cluster-paper-pad-gold-card-paper", "cluster-paper-pad-round-paper-pad", "cluster-specialty-paper-anti-counterfeit-paper", "cluster-specialty-paper-anti-scratch-paper", "cluster-specialty-paper-colored-specialty-paper", "cluster-specialty-paper-holographic-paper", "cluster-specialty-paper-pearlescent-paper", "cluster-specialty-paper-scented-paper", "cluster-white-cardboard-cosmetic-packaging-box",
  ], {
    sourceProductIds: [], buyerTypeKeys: ["brand-buyer", "packaging-converter"], applicationKeys: ["retail-packaging", "gift-packaging"], capabilityKeys: ["custom-printing", "finishing"], commonParameterKeys: ["paper-surface", "color", "printing", "format"], rfqInterestValue: "structure-review", navigationPriority: 2, homepagePriority: 2,
  }),
  family("functional", "functional-food-paper", "kh-food-box-family-representative", [
    "cluster-kraft-paper-food-grade-kraft-paper", "cluster-food-packaging-box-burger-box", "cluster-food-packaging-box-food-liner-paper", "cluster-food-packaging-box-food-packaging-box", "cluster-food-packaging-box-food-paper-sleeve", "cluster-food-packaging-box-fried-chicken-box", "cluster-food-packaging-box-takeaway-food-box", "cluster-kraft-paper-greaseproof-kraft-paper", "cluster-kraft-paper-pe-coated-kraft-paper", "cluster-paper-insert-food-paper-insert", "cluster-paper-insert-food-paper-tray", "cluster-paper-insert-food-tray-paper", "cluster-paper-packaging-material-baking-paper", "cluster-paper-packaging-material-burger-wrapping-paper", "cluster-paper-packaging-material-greaseproof-paper", "cluster-paper-packaging-material-sandwich-wrapping-paper", "cluster-paper-pad-cake-pad-paper", "cluster-paper-pad-food-grade-white-cardboard", "cluster-paper-pad-food-paper-pad", "cluster-white-cardboard-food-box-blank", "cluster-white-cardboard-pe-coated-white-cardboard",
  ], {
    sourceProductIds: [], buyerTypeKeys: ["food-packaging-buyer", "packaging-converter"], applicationKeys: ["foodservice-packaging", "tray-and-insert-forming"], capabilityKeys: ["material-selection", "structure-review"], commonParameterKeys: ["material", "gsm", "format", "surface-process"], rfqInterestValue: "structure-review", navigationPriority: 3, homepagePriority: 3,
  }),
  family("cup", "paper-cup-materials", "kh-cupfan-family-representative", [
    "cluster-paper-cup-fan-paper-cup-fan", "cluster-paper-cup-fan-pe-coated-paper-roll-for-paper-cup", "cluster-paper-cup-fan-pe-coated-paper-sheet-for-paper-cup", "cluster-paper-cup-fan-paper-cup-bottom-roll", "cluster-paper-cup-fan-kraft-cupstock-paper", "cluster-paper-cup-fan-food-tray-paper-material",
  ], {
    sourceProductIds: ["KH-FD-CUPFAN-150350-PR-001", "KH-FD-CUPROLL-150350-PR-032", "KH-FD-CUPSHEET-150350-PE-043", "KH-FD-CUPBOT-150350-PE-025", "KH-FD-KCUP-150350-PR-048", "KH-FD-TRAYP-150350-PE-290"], buyerTypeKeys: ["paper-cup-converter", "food-packaging-converter"], applicationKeys: ["paper-cups", "paper-bowls", "food-trays"], capabilityKeys: ["die-cutting", "coating", "custom-printing"], commonParameterKeys: ["gsm", "size", "coating", "surface-process", "finishing"], rfqInterestValue: "paper-cup-fan", navigationPriority: 4, homepagePriority: 4,
  }),
  family("converted", "packaging-materials-converted-components", "kh-paper-insert-family-representative", [
    "cluster-paper-insert-white-cardboard-insert", "cluster-food-packaging-box-bakery-packaging-box", "cluster-food-packaging-box-sandwich-box", "cluster-kraft-paper-double-sided-kraft-paper", "cluster-kraft-paper-kraft-paper-box", "cluster-kraft-paper-printed-kraft-paper", "cluster-kraft-paper-single-sided-kraft-paper", "cluster-kraft-paper-white-kraft-paper", "cluster-kraft-paper-yellow-kraft-paper", "cluster-paper-pad-kraft-cardstock", "cluster-paper-pad-white-cardboard", "cluster-paper-pad-white-cardboard-pad", "cluster-white-cardboard-creased-semi-finished-sheet", "cluster-white-cardboard-double-side-coated-white-board", "cluster-white-cardboard-folding-box-blank", "cluster-white-cardboard-folding-carton", "cluster-white-cardboard-food-box-paper-material", "cluster-white-cardboard-food-grade-white-cardboard", "cluster-white-cardboard-printed-white-cardboard", "cluster-white-cardboard-single-side-coated-white-board", "cluster-white-cardboard-white-cardboard-box-material", "cluster-white-cardboard-white-cardboard-packaging-box",
  ], {
    sourceProductIds: [], buyerTypeKeys: ["packaging-converter", "brand-buyer"], applicationKeys: ["paper-box-components", "paper-inserts"], capabilityKeys: ["die-cutting", "creasing", "paper-lamination"], commonParameterKeys: ["material", "gsm", "structure", "size"], rfqInterestValue: "structure-review", navigationPriority: 5, homepagePriority: 5,
  }),
  family("service", "oem-odm-custom-paper-converting", "kh-material-family-representative", [], {
    sourceProductIds: [], buyerTypeKeys: ["b2b-packaging-buyer"], applicationKeys: ["custom-packaging-projects"], capabilityKeys: ["material-selection", "structure-review", "custom-converting"], commonParameterKeys: ["material", "gsm", "size", "quantity"], rfqInterestValue: "structure-review", navigationPriority: 6, homepagePriority: 6, serviceRoute: "/custom-paper-products",
  }),
] as const;

export const PRODUCT_FAMILY_IDS = productFamilyCatalog.map((item) => item.id);
export const PRODUCT_FAMILY_ROUTE_SLUGS = productFamilyCatalog.map((item) => item.routeSlug);
export const CORE_PRODUCT_ANCHOR = {
  id: "food-tray-material",
  slug: "food-tray-paper-material",
  recordSlug: "kh-fd-trayp-150350-pe-290-food-tray-paper-material",
  sourceClusterId: "cluster-paper-cup-fan-food-tray-paper-material",
  sourceRecordId: "kh-fd-trayp-150350-pe-290",
  familyId: "cup" as const,
  interest: "structure-review",
} as const;

export function getProductFamilyConfig(id: ProductFamilyId) {
  return productFamilyCatalog.find((item) => item.id === id);
}

export function getProductFamilyBySlug(routeSlug: string) {
  return productFamilyCatalog.find((item) => item.routeSlug === routeSlug);
}

export function getFamilyPublishedSkus(config: ProductFamilyConfig): ProductSku[] {
  // Stage 3A.5 names source clusters with a `cluster-` prefix while the
  // published catalog stores the same stable group ID without that prefix.
  const sourceGroups = new Set(config.sourceClusterIds.map((id) => id.replace(/^cluster-/, "")));
  return getAllSkus().filter((sku) => sourceGroups.has(getProductGroupId(sku)));
}

export function getFamilyPublishedGroups(config: ProductFamilyConfig) {
  const groups = new Map<string, ProductSku[]>();
  for (const sku of getFamilyPublishedSkus(config)) {
    const groupId = getProductGroupId(sku);
    groups.set(groupId, [...(groups.get(groupId) ?? []), sku]);
  }
  return [...groups.entries()].map(([id, variants]) => ({ id, variants, representative: variants[0] }));
}

export function getCoreAnchorVariants() {
  return getSkusByGroupId(CORE_PRODUCT_ANCHOR.sourceClusterId.replace(/^cluster-/, ""));
}

export function getCatalogRecordCounts() {
  const all = catalog.skus;
  return { total: all.length, published: all.filter((sku) => sku.published && sku.sourceStatus === "confirmed").length, pending: all.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed")).length };
}
