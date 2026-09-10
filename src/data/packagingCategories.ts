import { showcaseImages } from "@/data/visuals";

type LocalizedList = { en: string[]; zh: string[] };

export const packagingCategorySlugs = [
  "paper-bags",
  "takeout-boxes",
  "cake-boxes",
  "cake-boards-cake-drums",
  "pizza-packaging",
  "food-packaging",
  "inserts-dividers",
  "retail-packaging",
  "corrugated-mailer-boxes",
] as const;

export type PackagingCategorySlug = (typeof packagingCategorySlugs)[number];

/** The sole public product-direction mapping for packaging-category inquiries. */
export const PACKAGING_INQUIRY_LABELS = {
  "paper-bags": { en: "Paper Bags", zh: "纸袋" },
  "takeout-boxes": { en: "Takeout Boxes", zh: "外带食品盒" },
  "cake-boxes": { en: "Cake Boxes", zh: "蛋糕盒" },
  "cake-boards-cake-drums": { en: "Cake Boards & Cake Drums", zh: "蛋糕底托与蛋糕鼓" },
  "pizza-packaging": { en: "Pizza Boxes & Pizza Pads", zh: "披萨盒与披萨垫纸" },
  "food-packaging": { en: "Food Packaging", zh: "食品包装" },
  "inserts-dividers": { en: "Corrugated Inserts & Paperboard Inserts", zh: "瓦楞内托与纸板内托" },
  "retail-packaging": { en: "Retail Packaging", zh: "零售包装" },
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
    shortDescription: { en: "Custom paper bags for retail, gifting and everyday carry applications.", zh: "定制纸袋，用于零售、礼品和日常携带。" },
    description: { en: "Develop a paper bag around your product, handle style and brand finish. Kehong reviews paper grade, dimensions, printing, surface treatment and packing requirements against your submitted project brief.", zh: "纸袋按产品类型、手柄形式和品牌工艺开发。科宏根据已提交的项目资料评估纸张、尺寸、印刷、表面处理和包装要求。" },
    image: showcaseImages.aiPaperBagBranded,
    subcategories: { en: ["Rope-handle bags", "Twisted-paper-handle bags", "Flat-handle bags", "Die-cut-handle bags", "SOS / kraft bags", "Gift and mailing bags"], zh: ["绳提手纸袋", "扭绳提手纸袋", "平提手纸袋", "模切提手纸袋", "SOS / 牛皮纸袋", "礼品与邮寄纸袋"] },
    applications: { en: ["Retail carry-out", "Gift presentation", "Apparel and lifestyle", "E-commerce dispatch"], zh: ["零售外带", "礼品展示", "服装与生活方式", "电商发货"] },
    filters: { en: ["Material", "Size", "Printing", "Handle type", "Finish"], zh: ["材料", "尺寸", "印刷", "提手类型", "表面工艺"] },
    seoTitle: "Custom Paper Bags | Foshan Kehong Paper Products Co., Ltd.",
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
    seoTitle: "Custom Pillow Boxes | Foshan Kehong Paper Products Co., Ltd.",
    seoDescription: "Custom printed, kraft and window pillow boxes developed around your product dimensions and brand finish.",
    searchTerms: ["pillow box"],
    productTypes: ["paper-box", "food-packaging-box"],
  },
  {
    slug: "takeout-boxes",
    title: { en: "Takeout Boxes", zh: "外带盒" },
    shortDescription: { en: "Paper takeaway structures for foodservice, bakery and delivery workflows.", zh: "纸质外带盒，用于餐饮、烘焙和外卖配送。" },
    description: { en: "Review takeaway box dimensions, board, ventilation, closure and print requirements with a packaging partner. Performance details are confirmed only when supported by the project specification.", zh: "请提供外带盒尺寸、纸板类型、通风、闭合方式和印刷要求。相关性能按实际项目规格和支持资料确认。" },
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
    shortDescription: { en: "Cake, cupcake and macaron boxes designed for presentation and transport.", zh: "蛋糕盒、纸杯蛋糕盒和马卡龙盒，用于展示和运输。" },
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
    shortDescription: { en: "Boards and drums for everyday cake support, display and heavier multi-layer transport.", zh: "蛋糕底托与蛋糕鼓，蛋糕承托、展示和运输" },
    description: { en: "Cake boards are generally used for everyday support and presentation. Cake drums are thicker and suited to heavier or multi-layer cakes. Cake base boards provide a stable foundation for transport and display; exact material and thickness are confirmed from the project information.", zh: "蛋糕托板用于日常承托和展示。蛋糕鼓更厚，适合较重或多层蛋糕。蛋糕底板用于运输基础承托。具体材料和厚度以项目资料为准。" },
    image: showcaseImages.aiCakeBoardsSet,
    subcategories: { en: ["Cardboard cake board", "Cake drum", "Cake base board", "MDF / Masonite board", "Mini cake board", "Double-thick cake card"], zh: ["纸板蛋糕托", "蛋糕鼓", "蛋糕底板", "MDF/硬质纤维板", "迷你蛋糕托", "加厚蛋糕卡"] },
    applications: { en: ["Cake support", "Bakery display", "Layered cake transport", "Dessert presentation"], zh: ["蛋糕承托", "烘焙展示", "多层蛋糕运输", "甜品展示"] },
    filters: { en: ["Shape", "Size", "Thickness", "Color", "Edge", "Finish", "Printing"], zh: ["形状", "尺寸", "厚度", "颜色", "边缘", "表面工艺", "印刷"] },
    seoTitle: "Cake Boards & Cake Drums | Bakery Support Packaging",
    seoDescription: "Cake boards, drums and base boards for bakery support, display and transport requirements.",
    searchTerms: ["cake board", "cake drum", "board"],
    productTypes: ["paper-pad"],
  },
  {
    slug: "pizza-packaging",
    title: { en: "Pizza Boxes & Pizza Pads", zh: "披萨盒与披萨垫纸" },
    shortDescription: { en: "Pizza boxes, liners and pads for delivery, takeaway and bakery programs.", zh: "用于配送、外带和烘焙项目的披萨盒、垫纸和内衬。" },
    description: { en: "Review the pizza footprint, board, grease resistance, ventilation, stacking and print requirements together. Pizza pads and liners can be scoped with the box when the application needs a complete delivery set.", zh: "可一并评审披萨尺寸、纸板、耐油、通风、堆叠和印刷要求。需要完整配送组合时，披萨垫纸和内衬可与盒型一起纳入项目。" },
    image: showcaseImages.aiPizzaBox,
    subcategories: { en: ["Pizza boxes", "Pizza pads", "Pizza liner paper", "Corrugated pizza boxes", "Window pizza boxes", "Custom delivery sets"], zh: ["披萨盒", "披萨垫纸", "披萨内衬纸", "瓦楞披萨盒", "开窗披萨盒", "定制配送组合"] },
    applications: { en: ["Pizza delivery", "Restaurant takeaway", "Bakery and foodservice", "Grease-sensitive foods"], zh: ["披萨配送", "餐厅外带", "烘焙与餐饮", "需耐油的食品"] },
    filters: { en: ["Box size", "Board", "Flute", "Grease barrier", "Ventilation", "Printing"], zh: ["盒型尺寸", "纸板", "楞型", "耐油要求", "通风", "印刷"] },
    seoTitle: "Pizza Boxes & Pizza Pads | Custom Food Packaging",
    seoDescription: "Pizza boxes, pads and liners scoped around delivery dimensions, board, grease barrier, ventilation and printing requirements.",
    searchTerms: ["pizza", "liner", "pad"],
    productTypes: ["food-packaging-box", "paper-pad", "corrugated-fluted-paper"],
  },
  {
    slug: "food-packaging",
    title: { en: "Food Packaging", zh: "食品包装" },
    shortDescription: { en: "Paper food packaging for takeaway, bakery, prepared meals and delivery programs.", zh: "面向外带、烘焙、熟食和配送项目的纸质食品包装。" },
    description: { en: "Select the food format first, then confirm the footprint, board, barrier, closure, ventilation, printing and packing workflow. Kehong can review boxes, trays, pads and related paper components within one project brief.", zh: "先确认食品应用，再确认尺寸、纸板、阻隔、闭合、通风、印刷和包装流程。科宏可在同一项目需求中评审食品盒、纸托、垫纸及相关纸材部件。" },
    image: showcaseImages.takeoutBoxesReference,
    subcategories: { en: ["Takeout boxes", "Pizza boxes", "Food trays", "Bakery boxes", "Food pads and liners", "Paper cup components"], zh: ["外带盒", "披萨盒", "食品纸托", "烘焙盒", "食品垫纸与内衬", "纸杯组件"] },
    applications: { en: ["Foodservice", "Bakery delivery", "Restaurant takeaway", "Prepared meals", "Catering"], zh: ["餐饮服务", "烘焙配送", "餐厅外带", "熟食配送", "餐饮配套"] },
    filters: { en: ["Food format", "Material", "Barrier", "Structure", "Size", "Printing"], zh: ["食品类型", "材料", "阻隔要求", "结构", "尺寸", "印刷"] },
    seoTitle: "Food Packaging | Custom Paper Food Boxes & Components",
    seoDescription: "Custom paper food packaging for takeaway, bakery, prepared meals and delivery projects, including boxes, trays, pads and liners.",
    searchTerms: ["food", "takeaway", "bakery", "tray", "cup"],
    productTypes: ["food-packaging-box", "paper-pad"],
  },
  {
    slug: "inserts-dividers",
    title: { en: "Corrugated Inserts & Paperboard Inserts", zh: "瓦楞内托与纸板内托" },
    shortDescription: { en: "Die-cut inserts, dividers and pads for product protection, presentation and shipping stability.", zh: "用于产品保护、展示和运输稳定性的模切内托、隔板和纸垫。" },
    description: { en: "Share the product footprint, contact points, stacking direction and packing sequence. Corrugated inserts, paperboard inserts, cosmetic inserts and custom dividers can be reviewed with the outer package.", zh: "请提供产品尺寸、接触位置、堆叠方向和装箱顺序。瓦楞内托、纸板内托、化妆品内托和定制隔板可与外包装一并评审。" },
    image: showcaseImages.representativeInserts,
    subcategories: { en: ["Corrugated inserts", "Paperboard inserts", "Cosmetic inserts", "Custom dividers", "Protective pads", "Electronics inserts"], zh: ["瓦楞内托", "纸板内托", "化妆品内托", "定制隔板", "保护垫", "电子产品内托"] },
    applications: { en: ["E-commerce shipping", "Cosmetics", "Electronics", "Retail presentation", "Food and bakery"], zh: ["电商运输", "化妆品", "电子产品", "零售展示", "食品与烘焙"] },
    filters: { en: ["Product footprint", "Board", "Flute", "Divider layout", "Printing", "Finish"], zh: ["产品尺寸", "纸板", "楞型", "隔板布局", "印刷", "表面工艺"] },
    seoTitle: "Corrugated Inserts & Paperboard Inserts | Custom Packaging Components",
    seoDescription: "Custom corrugated inserts, paperboard inserts, cosmetic inserts, dividers and pads reviewed with the outer packaging structure.",
    searchTerms: ["insert", "divider", "pad", "cosmetic", "electronics"],
    productTypes: ["paper-insert", "paper-pad", "corrugated-fluted-paper"],
  },
  {
    slug: "retail-packaging",
    title: { en: "Retail Packaging", zh: "零售包装" },
    shortDescription: { en: "Branded paper bags, presentation boxes and display-ready packaging for retail programs.", zh: "面向零售项目的品牌纸袋、展示盒和陈列就绪包装。" },
    description: { en: "Build a retail packaging brief around the product, shelf or carry context, brand artwork, paper grade, handle, finish and packing requirements. The same review can cover carry bags, retail boxes and display components.", zh: "围绕产品、货架或携带场景、品牌稿件、纸张、提手、表面工艺和包装要求建立零售包装需求。同一项目可同时评审手提袋、零售盒和展示部件。" },
    image: showcaseImages.retailShelfDisplay,
    subcategories: { en: ["Paper bags", "Retail boxes", "Gift packaging", "Counter display packaging", "Branded carry packaging", "Presentation inserts"], zh: ["纸袋", "零售盒", "礼品包装", "台面展示包装", "品牌手提包装", "展示内托"] },
    applications: { en: ["Retail stores", "Apparel and lifestyle", "Gift presentation", "Beauty and cosmetics", "E-commerce dispatch"], zh: ["零售门店", "服装与生活方式", "礼品展示", "美妆与化妆品", "电商发货"] },
    filters: { en: ["Product size", "Paper grade", "Handle", "Printing", "Finish", "Insert"], zh: ["产品尺寸", "纸张", "提手", "印刷", "表面工艺", "内托"] },
    seoTitle: "Retail Packaging | Custom Paper Bags, Boxes & Displays",
    seoDescription: "Custom retail packaging including paper bags, presentation boxes, display packaging and inserts for overseas B2B programs.",
    searchTerms: ["retail", "bag", "display", "gift", "cosmetic"],
    productTypes: ["kraft-paper", "paper-box", "paper-insert"],
  },
  {
    slug: "corrugated-mailer-boxes",
    title: { en: "Corrugated Mailer Boxes", zh: "瓦楞邮寄盒" },
    shortDescription: { en: "Protective corrugated structures for e-commerce dispatch and product presentation.", zh: "瓦楞保护结构，用于电商发货和产品展示。" },
    description: { en: "Develop mailer structures around the product footprint, board construction, closure and print requirement. Sampling confirms the final fit before a production quotation.", zh: "邮寄盒按产品尺寸、纸板结构、闭合方式和印刷需求开发。打样确认后进入生产报价。" },
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

/** Pillow boxes remain internal source material and are not exposed publicly. */
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
