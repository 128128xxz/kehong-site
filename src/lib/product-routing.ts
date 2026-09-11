import { getAllSkus, getProductGroupId, getPublicProductType } from "@/lib/catalog";
import { getProductCollection } from "@/data/productCollections";

export type ProductEntryId =
  | "materials"
  | "packaging"
  /** Legacy source identifier retained for audit/test compatibility only. */
  | "paper-cup-fan"
  | "pe-coated-paper-roll"
  | "pe-coated-paper-sheet"
  | "paper-cup-bottom-roll"
  | "cupstock-paper"
  | "food-tray-material";

type ProductEntry = {
  id: ProductEntryId;
  categoryId?: string;
  collectionId?: string;
  productGroupId?: string;
  productType?: string;
  fallbackHref: string;
  title: { en: string; zh: string };
  note: { en: string; zh: string };
  image: string;
  alt: { en: string; zh: string };
};

/**
 * One source of truth for every homepage product entry. A directory filter is
 * used only when the public data actually has a matching SKU. Otherwise the
 * link moves the buyer to a real category explanation or a prefilled brief;
 * buyers never land on an empty catalogue by following a site-owned link.
 */
const productEntries: readonly ProductEntry[] = [
  {
    id: "materials",
    collectionId: "materials",
    fallbackHref: "/contact?product=paper-materials",
    title: { en: "Browse materials", zh: "浏览纸材" },
    note: { en: "Paper grades, coating and converting formats", zh: "纸材等级、涂层与加工规格" },
    image: "/media/materials/paper-die-cut-sheet-reference.jpg",
    alt: { en: "Paper converting material reference", zh: "纸品加工材料参考图" },
  },
  {
    id: "packaging",
    fallbackHref: "/packaging",
    title: { en: "Browse packaging", zh: "浏览成品包装" },
    note: { en: "Structures for food, retail and delivery", zh: "适用于餐饮、零售与配送的包装结构" },
    image: "/media/packaging/paper-packaging-family-reference.jpg",
    alt: { en: "Paper packaging structures reference", zh: "纸包装结构参考图" },
  },
  {
    id: "paper-cup-fan",
    productGroupId: "paper-cup-fan-paper-cup-fan",
    fallbackHref: "/products",
    title: { en: "Archived product family", zh: "已归档产品族" },
    note: { en: "Legacy source record retained for audit only", zh: "仅保留用于审计的历史来源记录" },
    image: "/media/materials/paper-die-cut-sheet-reference.jpg",
    alt: { en: "Paper converting material reference", zh: "纸品加工材料参考图" },
  },
  {
    id: "pe-coated-paper-roll",
    productType: "pe-coated-paper-roll",
    fallbackHref: "/contact?product=pe-coated-paper-roll",
    title: { en: "Coated paper roll", zh: "淋膜纸卷" },
    note: { en: "Coated roll material for paper cup and bowl converting", zh: "用于纸杯、纸碗加工的淋膜卷材" },
    image: "/media/products/paper-cup-materials/pe-coated-paper-roll-reference-01.jpg",
    alt: { en: "Coated paper roll reference", zh: "淋膜纸卷参考图" },
  },
  {
    id: "pe-coated-paper-sheet",
    productType: "pe-coated-paper-sheet",
    fallbackHref: "/contact?product=pe-coated-paper-sheet",
    title: { en: "Coated paper sheet", zh: "淋膜平张纸" },
    note: { en: "Sheet formats for converting and forming", zh: "适用于加工与成型的平张规格" },
    image: "/media/products/paper-cup-materials/pe-coated-paper-sheet-concept-reference-01.webp",
    alt: { en: "Stacked coated paper sheets", zh: "叠放的淋膜纸片" },
  },
  {
    id: "paper-cup-bottom-roll",
    productType: "paper-cup-bottom-roll",
    fallbackHref: "/contact?product=paper-cup-bottom-roll",
    title: { en: "Paper cup bottom roll", zh: "纸杯底纸卷" },
    note: { en: "Bottom-roll requirements for cup converting", zh: "用于纸杯加工的底卷需求" },
    image: "/media/products/paper-cup-materials/paper-cup-bottom-roll-reference-01.jpg",
    alt: { en: "Paper cup bottom rolls", zh: "纸杯底卷参考图" },
  },
  {
    id: "cupstock-paper",
    productType: "cupstock-paper",
    fallbackHref: "/contact?product=cupstock-paper",
    title: { en: "Cupstock paper", zh: "杯纸原纸" },
    note: { en: "Paper grades for cup converting projects", zh: "用于纸杯加工项目的纸材等级" },
    image: "/media/products/paper-cup-materials/cupstock-paper-product-reference-01.jpg",
    alt: { en: "Cupstock paper reference", zh: "杯纸参考图" },
  },
  {
    id: "food-tray-material",
    productType: "food-tray-paper-material",
    fallbackHref: "/contact?product=food-tray-paper-material",
    title: { en: "Food tray paper material", zh: "食品纸托材料" },
    note: { en: "Paper material for food trays and paper inserts", zh: "用于食品纸托和纸内托成型的纸材" },
    image: "/media/products/paper-inserts/paper-insert-tray-reference-01.webp",
    alt: { en: "Paper tray and insert material formats", zh: "纸托与纸内托材料形态" },
  },
] as const;

function matchesEntry(entry: ProductEntry) {
  if (!entry.categoryId && !entry.productType && !entry.productGroupId && !entry.collectionId) return false;
  return getAllSkus().some((sku) => {
    if (entry.collectionId && !getProductCollection(entry.collectionId)?.productGroupIds.includes(getProductGroupId(sku) as never)) return false;
    if (entry.productGroupId && getProductGroupId(sku) !== entry.productGroupId) return false;
    if (entry.productType && getPublicProductType(sku) !== entry.productType) return false;
    if (entry.categoryId && sku.categoryId !== entry.categoryId) return false;
    return true;
  });
}

function catalogHref(entry: ProductEntry) {
  const params = new URLSearchParams();
  if (entry.collectionId) params.set("collection", entry.collectionId);
  if (entry.categoryId) params.set("category", entry.categoryId);
  if (entry.productType) params.set("productType", entry.productType);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function getProductEntry(id: ProductEntryId) {
  const entry = productEntries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown product entry: ${id}`);
  return { ...entry, href: matchesEntry(entry) ? catalogHref(entry) : entry.fallbackHref, hasPublicSku: matchesEntry(entry) };
}

export function getHomepageProductEntries() {
  return [
    getProductEntry("pe-coated-paper-roll"),
    getProductEntry("pe-coated-paper-sheet"),
    getProductEntry("paper-cup-bottom-roll"),
    getProductEntry("cupstock-paper"),
    getProductEntry("food-tray-material"),
  ];
}
