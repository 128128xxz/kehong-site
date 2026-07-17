import catalog from "@/data/catalog.normalized.json";
import {
  getLocalizedProductMaterials,
  getTaxonomyCategoryById,
  getTaxonomyCategoryBySlug,
  getTaxonomyCategories,
  getTaxonomyMaterialLabel,
} from "@/lib/taxonomy";

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
  "按项目确认": "Confirmed by project",
  "未公开/询价": "To be confirmed by quotation",
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
  return sku.title[locale as keyof typeof sku.title] ?? sku.title.en;
}

function englishCatalogValue(value: string | undefined) {
  return value ? getLocalizedCatalogValue(value, "en") : value;
}

/** Keep source records bilingual without serializing untranslated fields into English client props. */
export function getLocalizedProductSku(sku: ProductSku, locale: string): ProductSku {
  if (locale !== "en") return sku;

  return {
    ...sku,
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
  fallback = "Custom paper packaging specification",
) {
  if (!value) return "";
  if (locale === "zh") {
    const parts = value.split(" /");
    const last = parts.at(-1)?.trim() ?? "";
    return parts.length > 1 && last && !containsCjk(last) ? parts.slice(0, -1).join(" /").trim() : value;
  }

  const exact = catalogEnglishLabels[value];
  if (exact) return exact;

  if (/\d/u.test(value) && !containsCjk(value)) return value;

  const parts = value.split(" /");
  const last = parts.at(-1)?.trim() ?? "";
  if (parts.length > 1 && last && !containsCjk(last)) return last;

  const translated = catalogEnglishReplacements.reduce(
    (result, [from, to]) => result.replaceAll(from, to),
  value,
  );
  const normalized = normalizeEnglishSpacing(translated);
  return containsCjk(normalized) ? fallback : normalized;
}

export function getFamilies(): ProductFamily[] {
  const publishedCounts = new Map<string, number>();
  for (const sku of getAllSkus()) {
    publishedCounts.set(sku.productType, (publishedCounts.get(sku.productType) ?? 0) + 1);
  }

  return catalog.families
    .map((family) => {
      const productType = family.categoryId
        .replace(/-series$/u, "")
        .replace("paper-box-components", "paper-box")
        .replace("finished-paper-boxes", "paper-box");
      return {
        ...family,
        count: publishedCounts.get(productType) ?? 0,
      };
    })
    .sort((a, b) => b.count - a.count || a.title.en.localeCompare(b.title.en));
}

export function getProductGroups(): ProductGroup[] {
  return catalog.groups;
}

export function getAllSkus(): ProductSku[] {
  return catalog.skus.filter((sku) => sku.published === true && sku.sourceStatus === "confirmed");
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
  { slug: "food-grade-paper", productType: "paper-cup-fan", title: { en: "Food-Grade Paper", zh: "食品级纸" }, description: { en: "Food-contact paper materials for cups, bowls and takeaway packaging.", zh: "适用于纸杯、纸碗和外带包装的食品级纸材。" } },
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

/** Homepage cards are selected by product group so one range cannot crowd out the others. */
export function getFeaturedProductGroups(limit = 8) {
  return getCatalogGroups(getAllSkus()).slice(0, limit);
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

export function filterCatalogSkus(filters: CatalogFilters = {}, skus: ProductSku[] = catalog.skus): ProductSku[] {
  const query = filters.search?.trim().toLocaleLowerCase();
  const matchesLocalizedValue = (raw: string | undefined, selected: string | undefined) => {
    if (!raw || !selected) return false;
    return raw === selected || getLocalizedCatalogValue(raw, "en") === selected;
  };
  return skus.filter((sku) => {
    if (filters.category && getCanonicalCategoryForSku(sku)?.slug !== filters.category) return false;
    if (filters.group && getProductGroupId(sku) !== filters.group) return false;
    if (filters.productType && sku.productType !== filters.productType) return false;
    if (filters.material && !(sku.materialIds ?? []).includes(filters.material)) return false;
    if (filters.gsm && !matchesGsmOption(sku.gsm ?? sku.gsmOrThickness, filters.gsm)) return false;
    if (filters.coating && !matchesLocalizedValue(sku.coating, filters.coating)) return false;
    if (filters.process && ![sku.surfaceProcess, sku.finishingProcess, ...(sku.process ?? [])].some((value) => matchesLocalizedValue(value, filters.process))) return false;
    if (filters.customizable && !sku.customizable) return false;
    if (query && !searchableSkuText(sku).includes(query)) return false;
    return true;
  });
}

export function getCatalogFilterOptions(locale = "zh"): CatalogFilterOptions {
  const publishedSkus = getAllSkus();
  const localize = (value: string) => locale === "en" ? getLocalizedCatalogValue(value, "en") : value;
  const values = (getter: (sku: ProductSku) => string[]) => [...new Set(publishedSkus.flatMap(getter).filter(Boolean).map(localize))].sort((a, b) => a.localeCompare(b));
  return {
    categories: getTaxonomyCategories().map((category) => category.slug),
    productTypes: values((sku) => [sku.productType]),
    materials: values((sku) => sku.materialIds ?? []),
    gsm: getCommonGsmOptions(),
    coatings: values((sku) => [sku.coating]),
    processes: values((sku) => [...(sku.process ?? []), sku.surfaceProcess, sku.finishingProcess]),
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
