import { getAllSkus, getProductGroupId } from "@/lib/catalog";
import { getProductCollection } from "@/data/productCollections";

export type ProductEntryId =
  | "materials"
  | "packaging"
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
    image: "/images/ai/ai-cup-fan-blanks.jpg",
    alt: { en: "Paper converting material reference", zh: "纸品加工材料参考图" },
  },
  {
    id: "packaging",
    fallbackHref: "/packaging",
    title: { en: "Browse packaging", zh: "浏览成品包装" },
    note: { en: "Structures for food, retail and delivery", zh: "适用于餐饮、零售与配送的包装结构" },
    image: "/images/ai/ai-packaging-family.jpg",
    alt: { en: "Paper packaging structures reference", zh: "纸包装结构参考图" },
  },
  {
    id: "paper-cup-fan",
    productGroupId: "paper-cup-fan-paper-cup-fan",
    fallbackHref: "/contact?product=paper-cup-fan",
    title: { en: "Paper cup fan", zh: "纸杯扇形片" },
    note: { en: "Die-cut blanks and cupstock components", zh: "模切扇形片与杯纸部件" },
    image: "/images/ai/ai-cup-fan-blanks.jpg",
    alt: { en: "Die-cut paper cup fan blanks", zh: "模切纸杯扇形片" },
  },
  {
    id: "pe-coated-paper-roll",
    productGroupId: "paper-cup-fan-pe-coated-paper-roll-for-paper-cup",
    fallbackHref: "/contact?product=pe-coated-paper-roll",
    title: { en: "PE-coated paper roll", zh: "PE 淋膜纸卷" },
    note: { en: "Coated roll requirements reviewed by project", zh: "淋膜卷材按项目需求确认" },
    image: "/images/ai/ai-pe-coated-roll.jpg",
    alt: { en: "PE-coated paper roll reference", zh: "PE 淋膜纸卷参考图" },
  },
  {
    id: "pe-coated-paper-sheet",
    productGroupId: "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup",
    fallbackHref: "/contact?product=pe-coated-paper-sheet",
    title: { en: "PE-coated paper sheet", zh: "PE 淋膜纸片" },
    note: { en: "Sheet formats for converting and forming", zh: "适用于加工与成型的平张规格" },
    image: "/images/ai-generated/category/ai-category-pe-coated-paper-sheet.webp",
    alt: { en: "Stacked PE-coated paper sheets", zh: "叠放的 PE 淋膜纸片" },
  },
  {
    id: "paper-cup-bottom-roll",
    productGroupId: "paper-cup-fan-paper-cup-bottom-roll",
    fallbackHref: "/contact?product=paper-cup-bottom-roll",
    title: { en: "Paper cup bottom roll", zh: "纸杯底卷" },
    note: { en: "Bottom-roll requirements for cup converting", zh: "用于纸杯加工的底卷需求" },
    image: "/images/ai/ai-cup-bottom-rolls.jpg",
    alt: { en: "Paper cup bottom rolls", zh: "纸杯底卷参考图" },
  },
  {
    id: "cupstock-paper",
    productGroupId: "paper-cup-fan-kraft-cupstock-paper",
    fallbackHref: "/contact?product=cupstock-paper",
    title: { en: "Cupstock paper", zh: "杯纸" },
    note: { en: "Paper grades for cup converting projects", zh: "用于纸杯加工项目的纸材等级" },
    image: "/images/ai/ai-kraft-cupstock.jpg",
    alt: { en: "Cupstock paper reference", zh: "杯纸参考图" },
  },
  {
    id: "food-tray-material",
    productGroupId: "paper-cup-fan-food-tray-paper-material",
    fallbackHref: "/contact?product=food-tray-paper-material",
    title: { en: "Food tray material", zh: "食品纸托材料" },
    note: { en: "Forming material and structure direction", zh: "成型材料与结构方向" },
    image: "/images/ai-generated/category/ai-category-paper-insert.webp",
    alt: { en: "Paper tray and insert material formats", zh: "纸托与纸内托材料形态" },
  },
] as const;

function matchesEntry(entry: ProductEntry) {
  if (!entry.categoryId && !entry.productType && !entry.productGroupId && !entry.collectionId) return false;
  return getAllSkus().some((sku) => {
    if (entry.collectionId && !getProductCollection(entry.collectionId)?.productGroupIds.includes(getProductGroupId(sku) as never)) return false;
    if (entry.productGroupId && getProductGroupId(sku) !== entry.productGroupId) return false;
    if (entry.productType && sku.productType !== entry.productType) return false;
    if (entry.categoryId && sku.categoryId !== entry.categoryId) return false;
    return true;
  });
}

function catalogHref(entry: ProductEntry) {
  const params = new URLSearchParams();
  if (entry.collectionId) params.set("collection", entry.collectionId);
  if (entry.categoryId) params.set("category", entry.categoryId);
  if (entry.productGroupId) params.set("group", entry.productGroupId);
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
    getProductEntry("paper-cup-fan"),
    getProductEntry("pe-coated-paper-roll"),
    getProductEntry("pe-coated-paper-sheet"),
    getProductEntry("paper-cup-bottom-roll"),
    getProductEntry("cupstock-paper"),
    getProductEntry("food-tray-material"),
  ];
}
