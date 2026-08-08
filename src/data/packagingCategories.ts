import { showcaseImages } from "@/data/visuals";

type LocalizedList = { en: string[]; zh: string[] };

export const packagingCategorySlugs = [
  "paper-bags",
  "takeout-boxes",
  "cake-boxes",
  "cake-boards-cake-drums",
  "corrugated-mailer-boxes",
] as const;

export type PackagingCategorySlug = (typeof packagingCategorySlugs)[number];

/** The sole public product-direction mapping for packaging-category inquiries. */
export const PACKAGING_INQUIRY_LABELS = {
  "paper-bags": { en: "Paper Bags", zh: "纸袋" },
  "takeout-boxes": { en: "Takeout Boxes", zh: "外带食品盒" },
  "cake-boxes": { en: "Cake Boxes", zh: "蛋糕盒" },
  "cake-boards-cake-drums": { en: "Cake Boards & Cake Drums", zh: "蛋糕底托与蛋糕鼓" },
  "corrugated-mailer-boxes": { en: "Corrugated Mailer Boxes", zh: "瓦楞邮寄盒" },
} as const satisfies Record<PackagingCategorySlug, { en: string; zh: string }>;

export type PackagingCategory = {
  slug: string;
  title: { en: string; zh: string };
  shortDescription: { en: string; zh: string };
  description: { en: string; zh: string };
  image: string;
  subcategories: LocalizedList;
  applications: LocalizedList;
  filters: LocalizedList;
  seoTitle: string;
  seoDescription: string;
  searchTerms: string[];
  productTypes?: string[];
};

const allPackagingCategories: PackagingCategory[] = [
  {
    slug: "paper-bags",
    title: { en: "Paper Bags", zh: "纸袋" },
    shortDescription: { en: "Custom paper bags for retail, gifting and everyday carry applications.", zh: "适用于零售、礼品和日常携带场景的定制纸袋。" },
    description: { en: "Develop a paper bag around your product, handle style and brand finish. Kehong reviews paper grade, dimensions, printing, surface treatment and packing requirements against your submitted project brief.", zh: "围绕产品、手柄形式和品牌工艺开发纸袋。科宏可根据已提交的项目资料评估纸张、尺寸、印刷、表面处理和包装要求。" },
    image: showcaseImages.aiPaperBagBranded,
    subcategories: { en: ["Rope-handle bags", "Twisted-paper-handle bags", "Flat-handle bags", "Die-cut-handle bags", "SOS / kraft bags", "Gift and mailing bags"], zh: ["绳提手纸袋", "扭绳提手纸袋", "平提手纸袋", "模切提手纸袋", "SOS / 牛皮纸袋", "礼品与邮寄纸袋"] },
    applications: { en: ["Retail carry-out", "Gift presentation", "Apparel and lifestyle", "E-commerce dispatch"], zh: ["零售外带", "礼品展示", "服装与生活方式", "电商发货"] },
    filters: { en: ["Material", "Size", "Printing", "Handle type", "Finish"], zh: ["材料", "尺寸", "印刷", "提手类型", "表面工艺"] },
    seoTitle: "Custom Paper Bags | Kehong Paper Products",
    seoDescription: "Custom paper bag development with paper, handle, printing and finish options for overseas B2B packaging projects.",
    searchTerms: ["paper bag", "kraft bag"],
    productTypes: ["kraft-paper"],
  },
  {
    slug: "pillow-boxes",
    title: { en: "Pillow Boxes", zh: "枕头盒" },
    shortDescription: { en: "Curved-profile paper boxes for gifting, retail and compact product presentation.", zh: "适用于礼品、零售和小型产品展示的弧形纸盒。" },
    description: { en: "Pillow boxes can be developed with printed, kraft, window or special-finish options. Confirm the product size, board, opening style and presentation requirement before quotation.", zh: "枕头盒可按印刷、牛皮、开窗或特殊工艺选项开发。报价前需确认产品尺寸、纸板、开启方式和展示要求。" },
    image: showcaseImages.aiPillowBox,
    subcategories: { en: ["Printed pillow boxes", "Kraft pillow boxes", "Window pillow boxes", "Gift pillow boxes", "Special-finish pillow boxes"], zh: ["印刷枕头盒", "牛皮纸枕头盒", "开窗枕头盒", "礼品枕头盒", "特殊工艺枕头盒"] },
    applications: { en: ["Gifts", "Cosmetics", "Small retail products", "Event packaging"], zh: ["礼品", "化妆品", "小型零售产品", "活动包装"] },
    filters: { en: ["Structure", "Board", "Window", "Printing", "Finish"], zh: ["结构", "纸板", "开窗", "印刷", "表面工艺"] },
    seoTitle: "Custom Pillow Boxes | Kehong Paper Products",
    seoDescription: "Custom printed, kraft and window pillow boxes developed around your product dimensions and brand finish.",
    searchTerms: ["pillow box"],
    productTypes: ["paper-box", "food-packaging-box"],
  },
  {
    slug: "takeout-boxes",
    title: { en: "Takeout Boxes", zh: "外带盒" },
    shortDescription: { en: "Paper takeaway structures for foodservice, bakery and delivery workflows.", zh: "适用于餐饮、烘焙和外卖配送流程的纸质外带结构。" },
    description: { en: "Review takeaway box dimensions, board, ventilation, closure and print requirements with a packaging partner. Food-contact, grease or barrier claims are confirmed only when supported by the project specification.", zh: "与包装合作方确认外带盒尺寸、纸板、通风、闭合和印刷要求。食品接触、防油或阻隔性能仅在项目规格支持时确认。" },
    image: showcaseImages.takeoutBoxesReference,
    subcategories: { en: ["Burger boxes", "Fried-food boxes", "Lunch boxes", "Pizza boxes", "Kraft meal boxes", "Takeaway cake boxes"], zh: ["汉堡盒", "炸食盒", "餐盒", "披萨盒", "牛皮纸餐盒", "外带蛋糕盒"] },
    applications: { en: ["Foodservice", "Bakery delivery", "Restaurant takeaway", "Meal delivery"], zh: ["餐饮服务", "烘焙配送", "餐厅外带", "餐食配送"] },
    filters: { en: ["Material", "Structure", "Size", "Printing", "Window"], zh: ["材料", "结构", "尺寸", "印刷", "开窗"] },
    seoTitle: "Custom Takeout Boxes | Food Packaging",
    seoDescription: "Paper takeaway boxes for foodservice and bakery projects, developed around structure, size and print requirements.",
    searchTerms: ["food", "takeaway", "burger", "pizza", "bakery"],
    productTypes: ["food-packaging-box"],
  },
  {
    slug: "cake-boxes",
    title: { en: "Cake Boxes", zh: "蛋糕盒" },
    shortDescription: { en: "Cake, cupcake and macaron boxes designed for presentation and transport.", zh: "面向展示与运输的蛋糕、纸杯蛋糕和马卡龙盒。" },
    description: { en: "Start with the product footprint, opening, window and carrying requirement. The OEM brief can cover color, size, design, shape, material, logo, window and insert decisions before sampling.", zh: "从产品尺寸、开启方式、开窗和携带需求开始。OEM 需求可覆盖颜色、尺寸、设计、形状、材料、Logo、开窗和内托，再进入打样。" },
    image: showcaseImages.aiCakeBoxWindow,
    subcategories: { en: ["Transparent cake boxes", "Square cake boxes", "Corrugated cake boxes", "Separate-lid boxes", "Cupcake boxes", "Macaron boxes", "Carry-handle boxes"], zh: ["透明蛋糕盒", "方形蛋糕盒", "瓦楞蛋糕盒", "天地盖盒", "纸杯蛋糕盒", "马卡龙盒", "提手盒"] },
    applications: { en: ["Bakeries", "Dessert brands", "Cake delivery", "Celebration gifting"], zh: ["烘焙店", "甜品品牌", "蛋糕配送", "节庆礼赠"] },
    filters: { en: ["Color", "Size", "Design", "Shape", "Material", "Window", "Insert"], zh: ["颜色", "尺寸", "设计", "形状", "材料", "开窗", "内托"] },
    seoTitle: "Custom Cake Boxes | Bakery Packaging Manufacturer",
    seoDescription: "Custom cake, cupcake and macaron boxes with window, handle and insert options for bakery packaging projects.",
    searchTerms: ["cake", "bakery", "cupcake", "macaron"],
    productTypes: ["food-packaging-box", "paper-box"],
  },
  {
    slug: "cake-boards-cake-drums",
    title: { en: "Cake Boards & Cake Drums", zh: "蛋糕底托与蛋糕鼓" },
    shortDescription: { en: "Boards and drums for everyday cake support, display and heavier multi-layer transport.", zh: "用于日常蛋糕承托、展示以及较重多层蛋糕运输的底托与蛋糕鼓。" },
    description: { en: "Cake boards are generally used for everyday support and presentation. Cake drums are thicker and suited to heavier or multi-layer cakes. Cake base boards provide a stable foundation for transport and display; exact material and thickness are confirmed from the project information.", zh: "蛋糕托板（Cake Board）通常用于日常承托与展示；蛋糕鼓（Cake Drum）更厚，适合较重或多层蛋糕；蛋糕底板（Cake Base Board）用于运输和展示的基础承托，具体材料和厚度以项目资料确认。" },
    image: showcaseImages.aiCakeBoardsSet,
    subcategories: { en: ["Cardboard cake board", "Cake drum", "Cake base board", "MDF / Masonite board", "Mini cake board", "Double-thick cake card"], zh: ["纸板蛋糕托", "蛋糕鼓", "蛋糕底板", "MDF / 硬质纤维板", "迷你蛋糕托", "加厚蛋糕卡"] },
    applications: { en: ["Cake support", "Bakery display", "Layered cake transport", "Dessert presentation"], zh: ["蛋糕承托", "烘焙展示", "多层蛋糕运输", "甜品展示"] },
    filters: { en: ["Shape", "Size", "Thickness", "Color", "Edge", "Finish", "Printing"], zh: ["形状", "尺寸", "厚度", "颜色", "边缘", "表面工艺", "印刷"] },
    seoTitle: "Cake Boards & Cake Drums | Bakery Support Packaging",
    seoDescription: "Cake boards, drums and base boards for bakery support, display and transport requirements.",
    searchTerms: ["cake board", "cake drum", "board"],
    productTypes: ["paper-pad"],
  },
  {
    slug: "corrugated-mailer-boxes",
    title: { en: "Corrugated Mailer Boxes", zh: "瓦楞邮寄盒" },
    shortDescription: { en: "Protective corrugated structures for e-commerce dispatch and product presentation.", zh: "适用于电商发货和产品展示的保护性瓦楞结构。" },
    description: { en: "Develop mailer structures around the product footprint, board construction, closure and print requirement. Sampling confirms the final fit before a production quotation.", zh: "围绕产品尺寸、纸板结构、闭合方式和印刷需求开发邮寄盒，打样后确认最终匹配，再进入生产报价。" },
    image: showcaseImages.representativeProtectiveStructures,
    subcategories: { en: ["Self-locking mailers", "Corrugated shipping boxes", "E-commerce presentation boxes", "Protective inserts"], zh: ["自锁邮寄盒", "瓦楞运输箱", "电商展示盒", "保护内托"] },
    applications: { en: ["E-commerce", "Subscription packaging", "Retail dispatch", "Protective shipping"], zh: ["电商", "订阅制包装", "零售发货", "保护性运输"] },
    filters: { en: ["Flute", "Board", "Size", "Closure", "Printing", "Insert"], zh: ["楞型", "纸板", "尺寸", "闭合方式", "印刷", "内托"] },
    seoTitle: "Corrugated Mailer Boxes | Custom E-commerce Packaging",
    seoDescription: "Custom corrugated mailer boxes for e-commerce dispatch, product presentation and protective shipping.",
    searchTerms: ["corrugated", "mailer", "shipping"],
    productTypes: ["corrugated-fluted-paper", "paper-box"],
  },
];

/**
 * These descriptions remain as source material, but only the five approved
 * current categories are exposed through routes, navigation, and sitemap.
 */
const retiredPackagingCategorySlugs = new Set(["pillow-boxes"]);

export const packagingCategories = allPackagingCategories.filter(
  (category) => !retiredPackagingCategorySlugs.has(category.slug),
);

export function getPackagingCategory(slug: string) {
  return packagingCategories.find((category) => category.slug === slug);
}

export function getPackagingInquiryLabel(slug: string, locale: string) {
  const labels = PACKAGING_INQUIRY_LABELS[slug as PackagingCategorySlug];
  return labels ? (locale === "zh" ? labels.zh : labels.en) : undefined;
}
