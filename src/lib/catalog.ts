import catalog from "@/data/catalog.normalized.json";
import {
  getCanonicalTaxonomyCategoryId,
  getLocalizedProductMaterials,
  getTaxonomyCategoryById,
  getTaxonomyCategoryBySlug,
  getTaxonomyCategories,
  getTaxonomyMaterialLabel,
} from "@/lib/taxonomy";
import { getCollectionForCategory, getProductCollection } from "@/data/productCollections";
import { getProductFamily } from "@/data/productFamilies";
import { isRemovedFromPublicCatalog } from "@/data/catalogVisibility";
import { isSourceOnlyRecord } from "@/data/sourceOnlyRecords";
import { isDataConflictSku } from "@/data/dataConflictRecords";
import { formatProductDisplayList, formatProductDisplayValue, formatProductFieldValue } from "@/lib/productPresentation";

export type ProductSku = (typeof catalog.skus)[number];
export type ProductFamily = (typeof catalog.families)[number];
export type ProductGroup = (typeof catalog.groups)[number];

/** Revision marker for the bundled product dataset used by the public catalog. */
export const productDataRevision = String(catalog.generatedAt ?? "catalog-unknown");

const catalogEnglishLabels: Record<string, string> = {
  "牛皮纸系列": "Kraft paper series",
  "白卡纸系列": "White cardboard series",
  "食品纸系列": "Food-grade paper series",
  "瓦楞纸 / 坑纸系列": "Corrugated / fluted paper series",
  "特种纸系列": "Specialty paper series",
  "食品包装盒": "Food packaging boxes",
  "纸垫片 / Paper Pads": "Paper pads",
  "纸内托 / Paper Inserts": "Paper inserts",
  "纸盒半成品": "Paper box components",
  "包装盒成品": "Finished paper boxes",
  "食品级纸系列": "Food-grade paper series",
  "单面牛皮纸": "Single-sided kraft paper",
  "双面牛皮纸": "Double-sided kraft paper",
  "白牛皮纸": "White kraft paper",
  "黄牛皮纸": "Yellow kraft paper",
  "食品级牛皮纸": "Food-grade kraft paper",
  "牛皮纸 + PE 淋膜": "Kraft paper + PE coating",
  "防油牛皮纸": "Greaseproof kraft paper",
  "牛卡纸 / Kraft cardstock": "Kraft cardstock",
  "白卡纸 / White cardboard": "White cardboard",
  "白卡纸": "White cardboard",
  "牛卡纸": "Kraft cardstock",
  "食品级白卡纸": "Food-grade white cardboard",
  "牛皮纸 + 瓦楞芯纸": "Kraft paper + corrugated medium",
  "单铜白卡": "Single-coated white board",
  "双铜白卡": "Double-coated white board",
  "防油食品纸": "Greaseproof food-grade paper",
  "白卡 / 食品纸": "White board / food-grade paper",
  "食品纸 / 瓦楞纸": "Food-grade paper / corrugated paper",
  "彩纸 + E/F/G 坑": "Colored paper + E/F/G flute",
  "白卡 / 白牛皮 + E/F/G 坑": "White board / white kraft + E/F/G flute",
  "复合纸 + 坑纸": "Composite paper + fluted paper",
  "防伪透明字": "Security transparent text",
  "防刮花": "Scratch-resistant",
  "防伪": "Security feature",
  "留香": "Fragrance retention",
  "食品容器片材": "Food container stock",
  "白卡 + E/F/G 坑": "White board + E/F/G flute",
  "食品白卡 / 牛皮纸": "Food-grade white board / kraft paper",
  "食品级白卡 / 牛皮纸": "Food-grade white board / kraft paper",
  "金卡纸": "Gold board",
  "银卡纸": "Silver board",
  "镭射纸": "Holographic paper",
  "珠光纸": "Pearlescent paper",
  "黑卡纸": "Black board",
  "彩色特种纸": "Colored specialty paper",
  "瓦楞纸": "Corrugated paper",
  "特种纸": "Specialty paper",
  "牛皮纸": "Kraft paper",
  "食品级纸": "Food-grade paper",
  "防油纸": "Greaseproof paper",
  "面纸 + 芯纸": "Liner paper + fluting medium",
  "面纸 + 芯纸 + 里纸": "Liner paper + fluting medium + inner liner",
  "原纸": "Base paper",
  "印刷": "Printing",
  "防油处理": "Greaseproof treatment",
  "淋膜 PE": "PE coating",
  "食品级原纸": "Food-grade base paper",
  "裱纸": "Paper lamination",
  "模切": "Die-cutting",
  "压痕": "Creasing",
  "压坑": "Flute forming",
  "染色": "Coloring",
  "烫金": "Hot foil stamping",
  "烫银": "Silver foil stamping",
  "覆膜": "Lamination",
  "裱合": "Mounting",
  "分切": "Slitting",
  "柔印 / 定制印刷": "Flexographic / custom printing",
  "按客户杯型/尺寸定制": "Custom by cup size / dimensions",
  "未公开/询价": "Quotation required",
  "询价；阿里常见1-5吨起": "Quoted to order; typical MOQ 1–5 tons",
  "吨 / ton": "ton",
  "平方米 / sqm": "sqm",
  "个 / pc": "pc",
  "张 / sheet": "sheet",
  "套 / set": "set",
  "片 / piece": "piece",
  "本色": "Natural kraft",
  "白色": "White",
  "黄褐色": "Yellow-brown",
  "定制色": "Custom color",
  "可定制": "Customizable",
};

/** Exact, display-only Chinese labels for legacy English source values. */
const catalogChineseDisplayLabels: Record<string, string> = {
  "1–5 metric tons (typical)": "1–5 公吨",
  "PE coating": "PE 淋膜",
  "PLA coating": "PLA 淋膜",
  "PE / PLA coating options": "可选 PE / PLA 淋膜",
  "PE coating options": "可选 PE 淋膜",
  "PLA coating options": "可选 PLA 淋膜",
  "按客户杯型/尺寸定制": "按杯型 / 尺寸定制",
  piece: "件",
  sheet: "张",
  roll: "卷筒",
  ton: "吨",
};

const catalogEnglishReplacements: [string, string][] = [
  ["食品级", "food-grade"],
  ["杯纸", "cupstock"],
  ["压坑", "flute forming"],
  ["裱合", "mounting"],
  ["特殊形状", "special-shaped"],
  ["按材质确认", "Confirmed by material"],
  ["按结构确认", "Confirmed by structure"],
  ["瓶罐", "bottles and jars"],
  ["甜品", "desserts"],
  ["点心", "pastries"],
  ["防刮花", "scratch-resistant"],
  ["防伪透明字", "security transparent text"],
  ["防伪", "security feature"],
  ["留香", "fragrance retention"],
  ["食品容器片材", "food container stock"],
  ["食品纸", "food-grade paper"],
  ["彩纸", "colored paper"],
  ["复合纸", "composite paper"],
  ["白牛皮", "white kraft"],
  ["灰板", "greyboard"],
  ["纸杯扇形片", "paper cup fan"],
  ["热饮杯", "hot drink cup"],
  ["饮料杯", "beverage cup"],
  ["咖啡杯", "coffee cup"],
  ["纸杯", "paper cup"],
  ["纸碗", "paper bowl"],
  ["食品容器", "food container"],
  ["环保", "eco-friendly"],
  ["炸物", "fried food"],
  ["轻食", "light meals"],
  ["外卖", "takeaway"],
  ["托盘", "tray"],
  ["盒料", "box board"],
  ["隔纸", "separator paper"],
  ["隔板", "divider"],
  ["包装", "packaging"],
  ["插卡", "insert card"],
  ["吊牌", "hang tag"],
  ["标签", "label"],
  ["礼盒", "gift box"],
  ["折叠", "folding"],
  ["盒片", "box blank"],
  ["盒坯", "box blank"],
  ["高端", "premium"],
  ["精品", "premium"],
  ["护肤品", "skincare"],
  ["茶叶", "tea"],
  ["香氛", "fragrance"],
  ["香水", "perfume"],
  ["小家电", "small appliances"],
  ["耳机", "headphones"],
  ["充电器", "chargers"],
  ["套装", "set"],
  ["饮料", "beverage"],
  ["烘焙", "bakery"],
  ["餐饮", "foodservice"],
  ["食品", "food"],
  ["纸卡", "paper card"],
  ["卡套", "card sleeve"],
  ["彩盒", "printed box"],
  ["异形", "custom shape"],
  ["圆形", "round"],
  ["方形", "square"],
  ["承托", "support"],
  ["分隔", "divider"],
  ["定位", "positioning"],
  ["缓冲", "cushion"],
  ["展示", "display"],
  ["卡位", "locking tabs"],
  ["杯", "cup"],
  ["牛皮纸", "kraft paper"],
  ["牛皮", "kraft"],
  ["白卡纸", "white cardboard"],
  ["牛卡纸", "kraft cardstock"],
  ["白卡", "white board"],
  ["黑卡", "black board"],
  ["金卡", "gold board"],
  ["银卡", "silver board"],
  ["特种纸", "specialty paper"],
  ["瓦楞纸", "corrugated paper"],
  ["瓦楞", "corrugated"],
  ["坑纸", "fluted paper"],
  ["坑", "flute"],
  ["防油", "greaseproof"],
  ["淋膜", "coating"],
  ["涂层", "coating"],
  ["纸盒", "paper box"],
  ["包装盒", "packaging box"],
  ["纸托", "paper tray"],
  ["内托", "insert tray"],
  ["纸垫片", "paper pad"],
  ["垫片", "pad"],
  ["面纸", "liner paper"],
  ["芯纸", "fluting medium"],
  ["里纸", "inner liner"],
  ["纸袋", "paper bag"],
  ["纸套", "paper sleeve"],
  ["包装纸", "packaging paper"],
  ["食品盒", "food box"],
  ["盒", "box"],
  ["汉堡", "burger"],
  ["三明治", "sandwich"],
  ["蛋糕", "cake"],
  ["面包", "bakery"],
  ["披萨", "pizza"],
  ["模切", "die-cutting"],
  ["压痕", "creasing"],
  ["印刷", "printing"],
  ["分切", "slitting"],
  ["裱纸", "paper lamination"],
  ["覆膜", "lamination"],
  ["压纹", "embossing"],
  ["粘盒", "gluing"],
  ["原纸", "base paper"],
  ["平张", "sheet"],
  ["卷筒", "roll"],
  ["本色", "natural kraft"],
  ["白色", "white"],
  ["黄褐色", "yellow-brown"],
  ["定制色", "custom color"],
  ["可定制", "customizable"],
  ["吨", "tons"],
  ["平方米", "sqm"],
  ["个", "pcs"],
  ["张", "sheets"],
  ["套", "sets"],
  ["片", "pieces"],
];

const englishPunctuationReplacements: [RegExp, string][] = [
  [/、/gu, ", "],
  [/，/gu, ", "],
  [/；/gu, "; "],
  [/：/gu, ": "],
  [/。/gu, ". "],
  [/！/gu, "! "],
  [/？/gu, "? "],
  [/（/gu, " ("],
  [/）/gu, ")"],
  [/“|”|‘|’/gu, '"'],
];

function normalizeEnglishSpacing(value: string) {
  let normalized = englishPunctuationReplacements.reduce(
    (result, [pattern, replacement]) => result.replaceAll(pattern, replacement),
    value,
  );
  // Source-language tokens can become adjacent after replacement (for example
  // `eco-friendlypaper`). Separate only known product words; never infer a
  // specification or alter a numeric value.
  normalized = normalized.replaceAll(
    /(eco-friendly|food-grade|kraft|white|black|gold|silver|specialty|natural|greaseproof|hot|cold|drink|paper|cup|bowl|box|board|card|packaging|corrugated|fluted|coated|base|custom)(?=[a-z])/giu,
    "$1 ",
  );
  return normalized.replaceAll(/\s{2,}/gu, " ").trim();
}

function containsCjk(value: string) {
  return /[\u3400-\u9fff]/u.test(value);
}

export function getLocalizedProductTitle(sku: ProductSku, locale: string) {
  if (isDataConflictSku(sku)) {
    if (sku.groupId === "paper-cup-fan-pe-coated-paper-roll-for-paper-cup") {
      return locale === "zh" ? "纸杯淋膜纸卷" : "Coated Paper Roll for Paper Cup";
    }
    if (sku.groupId === "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup") {
      return locale === "zh" ? "纸杯淋膜平张纸" : "Coated Paper Sheet for Paper Cup";
    }
    if (sku.sku === "KH-FD-KCUP-150350-PR-048") {
      return locale === "zh" ? "杯纸原纸" : "Cupstock Paper";
    }
  }
  return sku.title[locale as keyof typeof sku.title] ?? sku.title.en;
}

function englishCatalogValue(value: string | undefined) {
  return value ? getLocalizedCatalogValue(value, "en") : value;
}

/** Keep source records bilingual without serializing untranslated fields into English client props. */
export function getLocalizedProductSku(sku: ProductSku, locale: string): ProductSku {
  // The normalized source retains legacy grouping keys for internal reconciliation.
  // Never serialize those source-derived keys into public catalog props.
  const publicGroupId = getPublicProductGroupId(sku);
  const publicSku = {
    ...sku,
    canonicalGroupId: publicGroupId,
    groupId: publicGroupId,
    productType: getPublicProductType(sku),
    mainImageAssetId: undefined,
    galleryAssetIds: [],
    productLink: undefined,
  } as unknown as ProductSku;
  if (locale !== "en") return publicSku;

  return {
    ...publicSku,
    title: {
      ...sku.title,
      zh: sku.title.en,
      es: sku.title.en,
      id: sku.title.en,
      vi: sku.title.en,
      th: sku.title.en,
      ms: sku.title.en,
    },
    englishName: sku.title.en,
    color: englishCatalogValue(sku.color),
    structureOrFlute: englishCatalogValue(sku.structureOrFlute),
    surfaceProcess: englishCatalogValue(sku.surfaceProcess),
    finishingProcess: englishCatalogValue(sku.finishingProcess),
    commonSize: englishCatalogValue(sku.commonSize),
    size: englishCatalogValue(sku.size),
    moq: englishCatalogValue(sku.moq),
    industries: englishCatalogValue(sku.industries),
    applications: englishCatalogValue(sku.applications),
    unit: englishCatalogValue(sku.unit),
    notes: {
      ...sku.notes,
      en: englishCatalogValue(sku.notes.en) ?? "",
      zh: englishCatalogValue(sku.notes.en) ?? "",
    },
    process: (sku.process ?? []).map((value) => englishCatalogValue(value) ?? value),
    applicationsList: (sku.applicationsList ?? []).map((value) => englishCatalogValue(value) ?? value),
  } as ProductSku;
}

export function getLocalizedCatalogValue(
  value: string | undefined,
  locale: string,
  fallback = "",
) {
  if (!value) return "";
  value = sanitizeBuyerFacingCatalogValue(value, locale);
  if (!value) return "";
  if (/^(?:custom paper packaging specification|confirmed by project|project[- ]confirmed|按项目确认|按项目资料确认|按项目确认为准)$/iu.test(value.trim())) return "";
  // Display-only exceptions for legacy source labels. IDs, URLs and SKU codes
  // are intentionally never passed through this mapping.
  if (value.trim().toLocaleLowerCase() === "foodservicepackaging") {
    return locale === "zh" ? "餐饮食品包装" : "Foodservice packaging";
  }
  if (locale === "zh") {
    const exact = catalogChineseDisplayLabels[value];
    if (exact) return formatProductDisplayValue(exact, locale);
    const parts = value.split(" /");
    const last = parts.at(-1)?.trim() ?? "";
    return formatProductDisplayValue(parts.length > 1 && last && !containsCjk(last) ? parts.slice(0, -1).join(" /").trim() : value, locale);
  }

  const exact = catalogEnglishLabels[value];
  if (exact) return formatProductDisplayValue(exact, locale);

  if (/\d/u.test(value) && !containsCjk(value)) return formatProductDisplayValue(value, locale);

  const parts = value.split(" /");
  const last = parts.at(-1)?.trim() ?? "";
  if (parts.length > 1 && last && !containsCjk(last)) return formatProductDisplayValue(last, locale);

  const translated = catalogEnglishReplacements.reduce(
    (result, [from, to]) => result.replaceAll(from, to),
  value,
  );
  const normalized = normalizeEnglishSpacing(translated);
  return containsCjk(normalized) ? fallback : formatProductDisplayValue(normalized, locale);
}

/** Keep the internal catalog intact while redacting unconfirmed public claims. */
function sanitizeBuyerFacingCatalogValue(value: string, locale: string) {
  let sanitized = value;
  if (locale === "zh") {
    sanitized = sanitized
      .replaceAll(/食品级白卡纸|食品级牛皮纸|食品级纸/gu, "纸材")
      .replaceAll(/食品级/gu, "")
      .replaceAll(/食品接触(?:认证|要求)?/gu, "使用要求")
      .replaceAll(/防水防油|防油/gu, "表面性能")
      .replaceAll(/阻隔/gu, "性能")
      .replaceAll(/承重/gu, "承托要求");
  } else {
    sanitized = sanitized
      .replaceAll(/food[- ]grade(?:[- ]paper|[- ]kraft|[- ]white board| paper| kraft| white board)?/giu, "paper material")
      .replaceAll(/food[- ]contact(?:[- ]certification| requirements?)?/giu, "product-use requirements")
      .replaceAll(/greaseproof|oil[- ]resistant/giu, "surface performance")
      .replaceAll(/barrier/giu, "performance")
      .replaceAll(/load[- ]bearing/giu, "support requirement");
  }
  return sanitized.replaceAll(/\s{2,}/gu, " ").trim();
}

export type HomepageProductFamily = Omit<ProductFamily, "categoryId"> & { categoryId: string };

export function getFamilies(): HomepageProductFamily[] {
  const publishedCounts = new Map<string, number>();
  for (const sku of getAllSkus()) {
    const categoryId = getCanonicalTaxonomyCategoryId(sku.categoryId);
    if (!categoryId) continue;
    publishedCounts.set(categoryId, (publishedCounts.get(categoryId) ?? 0) + 1);
  }

  const seenCategoryIds = new Set<string>();
  const candidates: Array<{ family: HomepageProductFamily; categoryId: string; count: number }> = [];
  for (const family of catalog.families) {
    const categoryId = getCanonicalTaxonomyCategoryId(family.categoryId);
    if (!categoryId) continue;
    candidates.push({
      family: { ...family, categoryId },
      categoryId,
      count: publishedCounts.get(categoryId) ?? 0,
    });
  }

  return candidates
    .filter(({ categoryId }) => {
      if (seenCategoryIds.has(categoryId)) return false;
      seenCategoryIds.add(categoryId);
      return true;
    })
    .map(({ family, count }) => ({ ...family, count }))
    .sort((a, b) => b.count - a.count || a.title.en.localeCompare(b.title.en));
}

export function getProductGroups(): ProductGroup[] {
  return catalog.groups;
}

export function getAllSkus(): ProductSku[] {
  return catalog.skus.filter((sku) => (
    sku.published === true
    && sku.sourceStatus === "confirmed"
    && !isRemovedFromPublicCatalog(sku)
    && !isSourceOnlyRecord(sku.id)
  ));
}

export function getAllCatalogSkus(): ProductSku[] {
  return catalog.skus;
}

export function getFeaturedSkus(limit = 12): ProductSku[] {
  return getAllSkus().slice(0, limit);
}

export function getProductGroupId(sku: Pick<ProductSku, "groupId" | "canonicalGroupId" | "sku">): string {
  return sku.groupId ?? sku.canonicalGroupId ?? sku.sku;
}

/** Public filter types are stable group directions, not the source import's
 * broad `paper-cup-fan` bucket (which contains rolls, sheets and tray stock). */
const publicProductTypesByGroup: Record<string, string> = {
  "paper-cup-fan-paper-cup-fan": "paper-cup-fan",
  "paper-cup-fan-pe-coated-paper-roll-for-paper-cup": "pe-coated-paper-roll",
  "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup": "pe-coated-paper-sheet",
  "paper-cup-fan-paper-cup-bottom-roll": "paper-cup-bottom-roll",
  "paper-cup-fan-kraft-cupstock-paper": "cupstock-paper",
  "paper-cup-fan-food-tray-paper-material": "food-tray-paper-material",
};

const publicProductGroupIdsByGroup: Record<string, string> = {
  "paper-cup-fan-paper-cup-fan": "removed-product-family",
  "paper-cup-fan-pe-coated-paper-roll-for-paper-cup": "coated-paper-roll",
  "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup": "coated-paper-sheet",
  "paper-cup-fan-paper-cup-bottom-roll": "paper-cup-bottom-roll",
  "paper-cup-fan-kraft-cupstock-paper": "cupstock-paper",
  "paper-cup-fan-food-tray-paper-material": "food-tray-paper-material",
};

export function getPublicProductType(sku: Pick<ProductSku, "groupId" | "canonicalGroupId" | "sku" | "productType">) {
  return publicProductTypesByGroup[getProductGroupId(sku)] ?? sku.productType;
}

export function getPublicProductGroupId(sku: Pick<ProductSku, "groupId" | "canonicalGroupId" | "sku">) {
  const groupId = getProductGroupId(sku);
  return publicProductGroupIdsByGroup[groupId] ?? groupId;
}

export function getProductGroupVariants(sku: ProductSku): ProductSku[] {
  return getSkusByGroupId(getProductGroupId(sku));
}

export function getProductViewModel(sku: ProductSku) {
  const variants = getProductGroupVariants(sku);
  return {
    productGroupId: getProductGroupId(sku),
    sku: sku.sku,
    slug: sku.slug,
    isRepresentative: variants[0]?.sku === sku.sku,
    variantCount: variants.length,
    variantAttributes: {
      gsm: sku.gsm ?? sku.gsmOrThickness,
      coating: sku.coating,
      size: sku.commonSize,
      color: sku.color,
      structure: sku.structureOrFlute,
      surfaceProcess: sku.surfaceProcess,
      finishingProcess: sku.finishingProcess,
    },
  };
}

export function getSkuBySlug(slug: string): ProductSku | undefined {
  return getAllSkus().find((sku) => sku.slug === slug);
}

export function getSkusByCanonicalGroup(canonicalGroupId: string): ProductSku[] {
  return getAllSkus().filter((sku) => sku.canonicalGroupId === canonicalGroupId);
}

export type CatalogFilters = {
  collection?: string;
  category?: string;
  group?: string;
  productType?: string;
  material?: string;
  gsm?: string;
  coating?: string;
  process?: string;
  customizable?: boolean;
  search?: string;
};

export const catalogFilterKeys = ["collection", "category", "group", "productType", "material", "gsm", "coating", "process", "customizable", "search", "page"] as const;

export function getQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.find((item) => item.trim())?.trim() ?? "";
  return typeof value === "string" ? value.trim() : "";
}

export type CatalogFilterOptions = {
  categories: string[];
  productTypes: string[];
  materials: string[];
  gsm: string[];
  coatings: string[];
  processes: string[];
};

export type ProductCategory = {
  slug: string;
  productType: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
};

const productCategories: ProductCategory[] = [
  { slug: "kraft-paper", productType: "kraft-paper", title: { en: "Kraft Paper", zh: "牛皮纸" }, description: { en: "Kraft paper grades for bags, wraps, labels and protective packaging.", zh: "适用于纸袋、包裹、标签和保护性包装的牛皮纸系列。" } },
  { slug: "white-cardboard", productType: "white-cardboard", title: { en: "White Cardboard", zh: "白卡纸" }, description: { en: "Bright, printable white board for premium packaging structures.", zh: "适用于高质感包装结构与印刷的白卡纸。" } },
  { slug: "food-grade-paper", productType: "paper-cup-fan", title: { en: "Food Packaging Paper", zh: "食品包装纸材" }, description: { en: "Paper materials for cups, bowls and takeaway packaging; final use requirements are confirmed by project.", zh: "适用于纸杯、纸碗和外带包装的纸材，具体使用要求按项目确认。" } },
  { slug: "corrugated-paper", productType: "corrugated-fluted-paper", title: { en: "Corrugated Paper", zh: "瓦楞纸" }, description: { en: "Fluted and corrugated structures for protection, rigidity and presentation.", zh: "兼顾缓冲、挺度与展示效果的瓦楞结构纸材。" } },
  { slug: "specialty-paper", productType: "specialty-paper", title: { en: "Specialty Paper", zh: "特种纸" }, description: { en: "Specialty surfaces and visual finishes for differentiated packaging.", zh: "用于差异化包装的特种表面与视觉效果纸材。" } },
  { slug: "food-packaging-boxes", productType: "food-packaging-box", title: { en: "Food Packaging Boxes", zh: "食品包装盒" }, description: { en: "Paper box structures for bakery, takeaway and foodservice applications.", zh: "适用于烘焙、外带与餐饮场景的纸盒结构。" } },
  { slug: "paper-pads", productType: "paper-pad", title: { en: "Paper Pads", zh: "纸垫片" }, description: { en: "Die-cut paper pads and boards for trays, cakes and product support.", zh: "适用于托盘、蛋糕和产品承托的模切纸垫片。" } },
  { slug: "paper-inserts", productType: "paper-insert", title: { en: "Paper Inserts", zh: "纸内托" }, description: { en: "Custom-fit paper inserts for positioning, separation and protection.", zh: "用于定位、分隔和保护的定制纸内托。" } },
  { slug: "paper-boxes", productType: "paper-box", title: { en: "Paper Boxes", zh: "纸盒" }, description: { en: "Paper box components and finished structures for retail packaging.", zh: "适用于零售包装的纸盒半成品与成品结构。" } },
  { slug: "paper-packaging-materials", productType: "paper-packaging-material", title: { en: "Paper Packaging Materials", zh: "纸包装材料" }, description: { en: "Flexible paper materials for converting, printing and packaging production.", zh: "适用于加工、印刷和包装生产的纸类材料。" } },
];

const categoryByProductType = new Map(productCategories.map((category) => [category.productType, category]));

export function getProductCategories(): ProductCategory[] {
  return productCategories;
}

export function getProductCategoryBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export function getProductCategoryForSku(sku: ProductSku): ProductCategory {
  return categoryByProductType.get(sku.productType) ?? productCategories.at(-1)!;
}

export function getCanonicalCategoryForSku(sku: ProductSku) {
  return getTaxonomyCategoryById(sku.categoryId);
}

export function getCanonicalCategoryBySlug(slug: string) {
  return getTaxonomyCategoryBySlug(slug);
}

export function getCanonicalCategories() {
  return getTaxonomyCategories();
}

export function getLocalizedProductMaterial(sku: ProductSku, locale: string) {
  return getLocalizedProductMaterials(sku, locale);
}

export function getProductMaterialLabels(sku: ProductSku, locale: string) {
  return (sku.materialIds ?? []).map((id) => getTaxonomyMaterialLabel(id, locale)).filter(Boolean);
}

export function getSkusByGroupId(groupId: string): ProductSku[] {
  return getAllSkus().filter((sku) => getProductGroupId(sku) === groupId);
}

export function getCatalogGroups(skus: ProductSku[]): Array<{ id: string; representative: ProductSku; variants: ProductSku[] }> {
  const groups = new Map<string, { id: string; representative: ProductSku; variants: ProductSku[] }>();
  for (const sku of skus) {
    const id = getProductGroupId(sku);
    const group = groups.get(id);
    if (group) group.variants.push(sku);
    else groups.set(id, { id, representative: sku, variants: [sku] });
  }
  return [...groups.values()].sort((a, b) => {
    if (b.variants.length !== a.variants.length) return b.variants.length - a.variants.length;
    return a.representative.title.en.localeCompare(b.representative.title.en);
  });
}

export type CatalogView = {
  filters: CatalogFilters;
  initialFilters: Record<string, string>;
  initialQuery: string;
  allSkus: ProductSku[];
  filteredSkus: ProductSku[];
  skus: ProductSku[];
  invalidFilters: boolean;
  page: number;
  totalPages: number;
  totalGroups: number;
  pageSize: number;
};

/**
 * The only server-side catalogue view builder. It deliberately handles the
 * unfiltered directory and every query variation through the same data,
 * filters, product-group summaries and localized SKU mapping.
 */
export function buildProductCatalogView(
  query: Record<string, string | string[] | undefined>,
  locale: string,
): CatalogView {
  const value = (key: string) => getQueryValue(query[key]);
  const filters: CatalogFilters = {
    collection: value("collection"),
    category: value("category"),
    group: value("group"),
    productType: value("productType"),
    material: value("material"),
    gsm: value("gsm"),
    coating: value("coating"),
    process: value("process"),
    customizable: value("customizable") === "true",
    search: value("search"),
  };
  const allSkus = getAllSkus();
  const invalidFilters = hasInvalidCatalogFilters(filters);
  const filteredSkus = invalidFilters ? [] : filterCatalogSkus(filters, allSkus);
  const groups = getCatalogGroups(filteredSkus);
  const pageSize = 24;
  const requestedPage = Math.max(1, Number.parseInt(value("page") || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(groups.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const visibleGroupIds = new Set(groups.slice((page - 1) * pageSize, page * pageSize).map((group) => group.id));

  return {
    filters,
    initialFilters: {
      collection: filters.collection ?? "",
      category: filters.category ?? "",
      group: filters.group ?? "",
      productType: filters.productType ?? "",
      material: filters.material ?? "",
      gsm: filters.gsm ?? "",
      coating: filters.coating ?? "",
      process: filters.process ?? "",
      customizable: value("customizable"),
      search: filters.search ?? "",
    },
    initialQuery: filters.search ?? "",
    allSkus,
    filteredSkus,
    skus: filteredSkus.filter((sku) => visibleGroupIds.has(getProductGroupId(sku))).map((sku) => getLocalizedProductSku(sku, locale)),
    invalidFilters,
    page,
    totalPages,
    totalGroups: groups.length,
    pageSize,
  };
}

function numericRangeFromValues(values: Array<string | undefined>) {
  const numericValues = values.flatMap((value) => (value?.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)).filter(Number.isFinite);
  if (!numericValues.length) return undefined;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  return { min, max };
}

function normalizeCoating(value: string | undefined) {
  const lower = value?.toLocaleLowerCase() ?? "";
  if (/\bpe\b/u.test(lower)) return "PE";
  if (/\bpla\b/u.test(lower)) return "PLA";
  if (/water[ -]?based/u.test(lower)) return "Water-based";
  return "";
}

const processFilterLabels: Record<string, { en: string; zh: string }> = {
  "coating-pe": { en: "PE coating", zh: "PE 淋膜" },
  "coating-pla": { en: "PLA coating", zh: "PLA 淋膜" },
  "die-cutting": { en: "Die-cutting", zh: "模切" },
  flexographic: { en: "Flexographic printing", zh: "柔印" },
  "custom-printing": { en: "Custom printing", zh: "定制印刷" },
  rewinding: { en: "Rewinding", zh: "复卷" },
  slitting: { en: "Slitting", zh: "分切" },
  "slitting-rewinding": { en: "Slitting / rewinding", zh: "分切 / 复卷" },
  "slitting-die-cutting": { en: "Slitting / die-cutting", zh: "分切 / 模切" },
  "flexographic-custom-printing": { en: "Flexographic / custom printing", zh: "柔印 / 定制印刷" },
  "flexographic-custom-printing-slitting-rewinding": { en: "Flexographic / custom printing, slitting / rewinding", zh: "柔印 / 定制印刷、分切 / 复卷" },
  "die-cutting-flexographic-custom-printing": { en: "Die-cutting, flexographic / custom printing", zh: "模切、柔印 / 定制印刷" },
  "die-cutting-flexographic-custom-printing-slitting-rewinding": { en: "Die-cutting, flexographic / custom printing, slitting / rewinding", zh: "模切、柔印 / 定制印刷、分切 / 复卷" },
};

const processFilterIds: Record<string, string> = Object.fromEntries([
  ["PE 淋膜", "coating-pe"], ["PLA 涂层", "coating-pla"], ["模切", "die-cutting"], ["柔印", "flexographic"],
  ["定制印刷", "custom-printing"], ["复卷", "rewinding"], ["分切", "slitting"], ["分切 / 复卷", "slitting-rewinding"],
  ["分切 / 模切", "slitting-die-cutting"], ["柔印 / 定制印刷", "flexographic-custom-printing"],
  ["柔印 / 定制印刷、分切 / 复卷", "flexographic-custom-printing-slitting-rewinding"],
  ["模切、柔印 / 定制印刷", "die-cutting-flexographic-custom-printing"],
  ["模切、柔印 / 定制印刷、分切 / 复卷", "die-cutting-flexographic-custom-printing-slitting-rewinding"],
]);

export function getProcessFilterId(value: string | undefined) {
  if (!value) return "";
  return processFilterIds[value] ?? value.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/gu, "-").replaceAll(/^-|-$/gu, "");
}

export function getLocalizedProcessFilterLabel(value: string, locale: string) {
  const label = processFilterLabels[value];
  return label ? (locale === "zh" ? label.zh : label.en) : value;
}

const canonicalGroupTitles: Record<string, { en: string; zh: string }> = {
  "paper-cup-fan-paper-cup-fan": { en: "Paper Cup Fan", zh: "纸杯扇形片" },
  "paper-cup-fan-pe-coated-paper-roll-for-paper-cup": { en: "Coated Paper Roll for Paper Cup", zh: "纸杯淋膜纸卷" },
  "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup": { en: "Coated Paper Sheet for Paper Cup", zh: "纸杯淋膜平张纸" },
  "paper-cup-fan-paper-cup-bottom-roll": { en: "Paper Cup Bottom Roll", zh: "纸杯底纸卷" },
  // The normalized group contains both white-board/cupstock and kraft variants.
  // Keep the historical slug, but never present it as a kraft-only range.
  "paper-cup-fan-kraft-cupstock-paper": { en: "Cupstock Paper", zh: "杯纸原纸" },
  "paper-cup-fan-food-tray-paper-material": { en: "Food Tray Paper Material", zh: "食品纸托材料" },
  "coated-paper-roll": { en: "Coated Paper Roll for Paper Cup", zh: "纸杯淋膜纸卷" },
  "coated-paper-sheet": { en: "Coated Paper Sheet for Paper Cup", zh: "纸杯淋膜平张纸" },
  "paper-cup-bottom-roll": { en: "Paper Cup Bottom Roll", zh: "纸杯底纸卷" },
  "cupstock-paper": { en: "Cupstock Paper", zh: "杯纸原纸" },
  "food-tray-paper-material": { en: "Food Tray Paper Material", zh: "食品纸托材料" },
};

export type ProductGroupSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  family?: ReturnType<typeof getProductFamily>;
  familyLabel: string;
  gsm: string;
  gsmMin?: number;
  gsmMax?: number;
  coating: string;
  coatingOptions: string[];
  variantCount: number;
  representative: ProductSku;
  visual: ProductSku;
  materials: string[];
  applications: string[];
  relatedGroupIds: string[];
  metadata: { title: string; description: string };
};

/**
 * Canonical group data for catalog cards, query routes and detail pages.
 * A group-level coating or GSM summary always derives from every variant,
 * while the detail page keeps the selected SKU's attributes separate.
 */
export function buildProductGroupSummary(group: { id: string; representative: ProductSku; variants: ProductSku[] }, locale: string): ProductGroupSummary {
  const family = getProductFamily(group.id);
  const coatings = [...new Set(group.variants.map((variant) => normalizeCoating(variant.coating)).filter(Boolean))];
  const isMixedPePla = coatings.includes("PE") && coatings.includes("PLA");
  const canonicalTitle = canonicalGroupTitles[group.id];
  const title = canonicalTitle
    ? (locale === "zh" ? canonicalTitle.zh : canonicalTitle.en)
    : getLocalizedProductTitle(group.representative, locale);
  const coating = coatings.length === 1
    ? (locale === "zh" ? `${coatings[0]} 淋膜` : `${coatings[0]} coating`)
    : isMixedPePla
      ? (locale === "zh" ? "可选 PE / PLA 淋膜" : "PE / PLA coating options")
      : (locale === "zh" ? "淋膜类型按规格确认" : "Coating confirmed by specification");
  const gsmRange = numericRangeFromValues(group.variants.map((variant) => variant.gsm ?? variant.gsmOrThickness));
  const gsm = gsmRange
    ? (gsmRange.min === gsmRange.max ? `${gsmRange.min} GSM` : `${gsmRange.min}–${gsmRange.max} GSM`)
    : "";
  const rawFamilyLabel = family ? (locale === "zh" ? family.title.zh : family.title.en) : "";
  // Family titles are canonical taxonomy labels (for example, "Cupstock").
  // Preserve them verbatim so field-level English spacing normalization cannot
  // turn a brand/product term into a different label. Only redact a family
  // title when it itself contains an unconfirmed buyer-facing claim.
  const familyLabel = family
    ? /food[- ]grade|food[- ]contact|greaseproof|oil[- ]resistant|barrier|load[- ]bearing|食品级|食品接触|防油|阻隔|承重/iu.test(rawFamilyLabel)
      ? getLocalizedCatalogValue(rawFamilyLabel, locale)
      : rawFamilyLabel
    : getPublicProductType(group.representative);
  const materials = group.id === "paper-cup-fan-kraft-cupstock-paper" || group.id === "cupstock-paper"
    ? [locale === "zh" ? "杯纸" : "Cupstock Paper"]
    : [...new Set(group.variants.map((variant) => getLocalizedProductMaterial(variant, locale)).filter(Boolean))];
  const applications = [...new Set(group.variants.flatMap((variant) => (variant.applicationsList ?? [variant.applications])
    .map((value) => formatProductFieldValue(getLocalizedCatalogValue(value, locale), "application", locale))
    .filter(Boolean)))];
  const relatedGroupIds = family?.productGroupIds.filter((id) => id !== group.id) ?? [];
  const description = [familyLabel, gsm, coating, formatProductDisplayList(applications.slice(0, 2), locale)].filter(Boolean).join(" · ");
  return {
    id: group.id,
    slug: group.representative.slug,
    title,
    family,
    familyLabel,
    coating,
    coatingOptions: coatings,
    gsm,
    gsmMin: gsmRange?.min,
    gsmMax: gsmRange?.max,
    variantCount: group.variants.length,
    representative: group.representative,
    visual: group.representative,
    materials,
    applications,
    relatedGroupIds,
    description,
    metadata: {
      title: `${title} | ${familyLabel}`,
      description: description || title,
    },
  };
}

/**
 * Customer-facing group summary. Internal summary calculations retain the
 * source-derived coating rollup for audits and filters; unresolved public
 * conflicts suppress that field only at the presentation boundary.
 */
export function getPublicProductGroupSummary(group: { id: string; representative: ProductSku; variants: ProductSku[] }, locale: string): ProductGroupSummary {
  const summary = buildProductGroupSummary(group, locale);
  if (!group.variants.some(isDataConflictSku)) return summary;

  const description = [
    summary.familyLabel,
    summary.gsm,
    formatProductDisplayList(summary.applications.slice(0, 2), locale),
  ].filter(Boolean).join(" · ");

  return {
    ...summary,
    coating: "",
    coatingOptions: [],
    description,
    metadata: { ...summary.metadata, description },
  };
}

/** @deprecated Use buildProductGroupSummary for all new consumers. */
export const getProductGroupSummary = buildProductGroupSummary;

export type FeaturedProductGroup = {
  id: string;
  productGroupId: string;
  categoryId: string;
  categorySlug: string;
  title: { en: string; zh: string };
  representative?: ProductSku;
  variants: ProductSku[];
  image: string;
};

/**
 * Homepage cards are curated by stable productGroupId. Confirmed groups use a
 * product detail URL; groups awaiting source confirmation intentionally link
 * to their product range instead of publishing an unverified product detail.
 */
const homepageFeaturePlan = [
  {
    productGroupId: "paper-cup-fan-pe-coated-paper-roll-for-paper-cup",
    categoryId: "food-grade-paper",
    categorySlug: "food-grade-paper",
    title: { en: "Cupstock roll", zh: "杯纸卷" },
    image: "/media/applications/paper-cup-stack-reference.jpg",
  },
  {
    productGroupId: "paper-cup-fan-kraft-cupstock-paper",
    categoryId: "kraft-paper",
    categorySlug: "kraft-paper",
    title: { en: "Kraft paper", zh: "牛皮纸" },
    image: "/media/products/paper-materials/kraft-paper-roll-sheet-reference-01.webp",
  },
  {
    productGroupId: "food-packaging-box-burger-box",
    categoryId: "food-packaging-boxes",
    categorySlug: "food-packaging-boxes",
    title: { en: "Food box", zh: "食品包装盒" },
    image: "/media/packaging/category-food-packaging-box-v2-reference.webp",
  },
  {
    productGroupId: "food-packaging-box-bakery-packaging-box",
    categoryId: "food-packaging-boxes",
    categorySlug: "food-packaging-boxes",
    title: { en: "Bakery packaging", zh: "烘焙包装" },
    image: "/media/applications/bakery-kraft-window-box-reference.jpg",
  },
  {
    productGroupId: "corrugated-fluted-paper-colored-corrugated-paper",
    categoryId: "corrugated-paper",
    categorySlug: "corrugated-paper",
    title: { en: "Corrugated", zh: "瓦楞纸" },
    image: "/media/products/corrugated-board/corrugated-board-material-reference-01.webp",
  },
  {
    productGroupId: "specialty-paper-holographic-paper",
    categoryId: "specialty-paper",
    categorySlug: "specialty-paper",
    title: { en: "Specialty paper", zh: "特种纸" },
    image: "/media/products/specialty-paper/specialty-paper-material-reference-01.webp",
  },
  {
    productGroupId: "paper-insert-food-paper-insert",
    categoryId: "paper-inserts",
    categorySlug: "paper-inserts",
    title: { en: "Paper insert / pad", zh: "纸内托 / 纸垫片" },
    image: "/media/products/paper-inserts/paper-insert-tray-reference-02.webp",
  },
] as const;

export function getFeaturedProductGroups(limit = 8): FeaturedProductGroup[] {
  const publishedSkus = getAllSkus();

  return homepageFeaturePlan.slice(0, limit).map((plan) => {
    const variants = publishedSkus.filter((sku) => getProductGroupId(sku) === plan.productGroupId);
    return {
      ...plan,
      id: plan.productGroupId,
      representative: variants[0],
      variants,
    };
  });
}

function searchableSkuText(sku: ProductSku): string {
  return [
    sku.sku,
    sku.title?.en,
    sku.title?.zh,
    getLocalizedProductMaterials(sku, "en"),
    sku.applications,
    getLocalizedCatalogValue(sku.applications, "en"),
    sku.categoryId,
    sku.productType,
    sku.coating,
    sku.gsmOrThickness,
    sku.structureOrFlute,
    sku.surfaceProcess,
    getLocalizedCatalogValue(sku.surfaceProcess, "en"),
    sku.finishingProcess,
    getLocalizedCatalogValue(sku.finishingProcess, "en"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export function filterCatalogSkus(filters: CatalogFilters = {}, skus: ProductSku[] = getAllSkus()): ProductSku[] {
  const query = filters.search?.trim().toLocaleLowerCase();
  const canonicalCategory = getCanonicalTaxonomyCategoryId(filters.category);
  const matchesLocalizedValue = (raw: string | undefined, selected: string | undefined) => {
    if (!raw || !selected) return false;
    return raw === selected
      || getLocalizedCatalogValue(raw, "en") === selected
      || getProcessFilterId(raw) === selected;
  };
  return skus.filter((sku) => {
    const collection = getProductCollection(filters.collection) ?? getCollectionForCategory(canonicalCategory);
    if (filters.collection && !collection) return false;
    if (collection && !collection.productGroupIds.includes(getProductGroupId(sku) as never)) return false;
    // A configured collection alias (currently food-grade-paper) is a public
    // range, not a source-category constraint. This keeps Cupstock in the
    // established material route without mutating its source category.
    if (filters.category && !getCollectionForCategory(canonicalCategory) && (!canonicalCategory || getCanonicalCategoryForSku(sku)?.slug !== canonicalCategory)) return false;
    if (filters.group && getProductGroupId(sku) !== filters.group) return false;
    if (filters.productType && getPublicProductType(sku) !== filters.productType) return false;
    if (filters.material && !(sku.materialIds ?? []).includes(filters.material)) return false;
    if (filters.gsm && !matchesGsmOption(sku.gsm ?? sku.gsmOrThickness, filters.gsm)) return false;
    if (filters.coating && normalizeCoating(sku.coating)?.toLocaleLowerCase() !== filters.coating.toLocaleLowerCase()) return false;
    if (filters.process && ![sku.surfaceProcess, sku.finishingProcess, ...(sku.process ?? [])].some((value) => matchesLocalizedValue(value, filters.process))) return false;
    if (filters.customizable && !sku.customizable) return false;
    if (query && !searchableSkuText(sku).includes(query)) return false;
    return true;
  });
}

/** Invalid recognized filters must not silently become the unfiltered catalogue. */
export function hasInvalidCatalogFilters(filters: CatalogFilters, options = getCatalogFilterOptions("en")) {
  const inList = (value: string | undefined, items: readonly string[]) => !value || items.includes(value);
  if (filters.collection && !getProductCollection(filters.collection)) return true;
  if (filters.category && !getCanonicalTaxonomyCategoryId(filters.category)) return true;
  return !inList(filters.group, getCatalogGroups(getAllSkus()).map((group) => group.id))
    || !inList(filters.productType, options.productTypes)
    || !inList(filters.material, options.materials)
    || !inList(filters.gsm, options.gsm)
    || !inList(filters.coating, options.coatings)
    || !inList(filters.process, options.processes)
    || (filters.customizable !== undefined && typeof filters.customizable !== "boolean");
}

export function getCatalogFilterOptions(locale = "zh"): CatalogFilterOptions {
  void locale;
  const publishedSkus = getAllSkus();
  // Query parameters stay canonical and stable across locales. The UI applies
  // display-only localization when rendering each option.
  const values = (getter: (sku: ProductSku) => string[]) => [...new Set(publishedSkus.flatMap(getter).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return {
    categories: getTaxonomyCategories().map((category) => category.slug),
    productTypes: values((sku) => [getPublicProductType(sku)]),
    materials: values((sku) => sku.materialIds ?? []),
    gsm: getCommonGsmOptions(),
    coatings: [...new Set(publishedSkus.map((sku) => normalizeCoating(sku.coating)).filter(Boolean))].sort(),
    processes: [...new Set(publishedSkus.flatMap((sku) => [...(sku.process ?? []), sku.surfaceProcess, sku.finishingProcess].filter(Boolean).map(getProcessFilterId)))].sort(),
  };
}

export function getFilterOptions(key: keyof ProductSku): string[] {
  const values = new Set<string>();

  for (const sku of catalog.skus) {
    const value = sku[key];
    if (typeof value === "string" && value.trim()) {
      values.add(value);
    }
  }

  return Array.from(values).slice(0, 40);
}

const commonGsmByProductType: Record<string, number[]> = {
  "paper-cup-fan": [170, 180, 190, 200, 210, 230, 240, 250, 280, 300, 320],
  "kraft-paper": [40, 50, 60, 70, 80, 90, 100, 120, 150, 180, 200],
  "paper-packaging-material": [40, 50, 60, 70, 80, 100, 120, 150, 180],
  "white-cardboard": [210, 230, 250, 300, 350, 400, 450, 500, 600],
  "paper-pad": [210, 230, 250, 300, 350, 400, 450, 500, 600],
  "paper-insert": [210, 230, 250, 300, 350, 400, 450, 500, 600],
  "food-packaging-box": [210, 230, 250, 300, 350, 400, 450, 500, 600],
  "paper-box": [210, 230, 250, 300, 350, 400, 450, 500, 600],
  "corrugated-fluted-paper": [120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 600],
  "specialty-paper": [80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 600],
};

export function getCommonGsmOptions(productType?: string): string[] {
  const values = productType
    ? commonGsmByProductType[productType] ?? []
    : Array.from(new Set(Object.values(commonGsmByProductType).flat())).sort((a, b) => a - b);

  return values.map((value) => `${value}gsm`);
}

export function matchesGsmOption(value: string | undefined, option: string): boolean {
  if (!value || !option) return false;
  const target = Number.parseInt(option, 10);
  if (!Number.isFinite(target)) return false;

  const numbers = (value.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (numbers.includes(target)) return true;

  const rangeMatch = value.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (!rangeMatch) return false;
  const min = Number(rangeMatch[1]);
  const max = Number(rangeMatch[2]);
  return target >= min && target <= max;
}
