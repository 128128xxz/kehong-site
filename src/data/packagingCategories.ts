import { showcaseImages } from "@/data/visuals";

export type PackagingCategory = {
  slug: string;
  title: { en: string; zh: string };
  shortDescription: { en: string; zh: string };
  description: { en: string; zh: string };
  image: string;
  subcategories: string[];
  applications: string[];
  filters: string[];
  seoTitle: string;
  seoDescription: string;
  searchTerms: string[];
  productTypes?: string[];
};

export const packagingCategories: PackagingCategory[] = [
  {
    slug: "paper-bags",
    title: { en: "Paper Bags", zh: "纸袋" },
    shortDescription: { en: "Custom paper bags for retail, gifting and everyday carry applications.", zh: "适用于零售、礼品和日常携带场景的定制纸袋。" },
    description: { en: "Develop a paper bag around the product, handle style and brand finish you need. Kehong can review paper grade, dimensions, printing, surface treatment and packing requirements against the confirmed project brief.", zh: "围绕产品、手柄形式和品牌工艺开发纸袋。Kehong 可根据已确认的项目需求评估纸张、尺寸、印刷、表面处理和包装要求。" },
    image: showcaseImages.webKraftPaperBag,
    subcategories: ["Rope-handle bags", "Twisted-paper-handle bags", "Flat-handle bags", "Die-cut-handle bags", "SOS / kraft bags", "Gift and mailing bags"],
    applications: ["Retail carry-out", "Gift presentation", "Apparel and lifestyle", "E-commerce dispatch"],
    filters: ["Material", "Size", "Printing", "Handle type", "Finish"],
    seoTitle: "Custom Paper Bags | Kehong Paper Packaging",
    seoDescription: "Custom paper bag development with paper, handle, printing and finish options for overseas B2B packaging projects.",
    searchTerms: ["paper bag", "kraft bag"],
    productTypes: ["kraft-paper"],
  },
  {
    slug: "labels-stickers",
    title: { en: "Labels & Stickers", zh: "标签与贴纸" },
    shortDescription: { en: "Printed labels, tags and stickers kept separate from structural box products.", zh: "独立于纸盒结构产品的印刷标签、吊牌与贴纸。" },
    description: { en: "Use this range for labels, hang tags and stickers that support product identification and brand presentation. Final substrate, adhesive, finish and application are confirmed from the production brief.", zh: "用于产品识别和品牌展示的标签、吊牌与贴纸。最终基材、胶粘、工艺和应用需根据生产需求确认。" },
    image: showcaseImages.webKraftHangTags,
    subcategories: ["Hang tags", "Carton labels", "Clear labels", "Waterproof labels", "Die-cut stickers", "Roll labels"],
    applications: ["Retail labeling", "Carton identification", "Product branding", "Promotional packaging"],
    filters: ["Substrate", "Printing", "Shape", "Adhesive", "Finish"],
    seoTitle: "Labels & Stickers | Custom Packaging Components",
    seoDescription: "Explore custom labels, hang tags and stickers for product identification and packaging presentation.",
    searchTerms: ["label", "sticker", "hang tag"],
  },
  {
    slug: "pillow-boxes",
    title: { en: "Pillow Boxes", zh: "枕头盒" },
    shortDescription: { en: "Curved-profile paper boxes for gifting, retail and compact product presentation.", zh: "适用于礼品、零售和小型产品展示的弧形纸盒。" },
    description: { en: "Pillow boxes can be developed in printed, kraft, window or special-finish directions. Confirm the product size, board, opening style and presentation requirement before quotation.", zh: "枕头盒可按印刷、牛皮、开窗或特殊工艺方向开发。报价前需确认产品尺寸、纸板、开启方式和展示要求。" },
    image: showcaseImages.pinkBox,
    subcategories: ["Printed pillow boxes", "Kraft pillow boxes", "Window pillow boxes", "Gift pillow boxes", "Special-finish pillow boxes"],
    applications: ["Gifts", "Cosmetics", "Small retail products", "Event packaging"],
    filters: ["Structure", "Board", "Window", "Printing", "Finish"],
    seoTitle: "Custom Pillow Boxes | Kehong Paper Packaging",
    seoDescription: "Custom printed, kraft and window pillow boxes developed around your product dimensions and brand finish.",
    searchTerms: ["pillow box"],
    productTypes: ["paper-box", "food-packaging-box"],
  },
  {
    slug: "takeout-boxes",
    title: { en: "Takeout Boxes", zh: "外带盒" },
    shortDescription: { en: "Paper takeaway structures for foodservice, bakery and delivery workflows.", zh: "适用于餐饮、烘焙和外卖配送流程的纸质外带结构。" },
    description: { en: "Review takeaway box dimensions, board, ventilation, closure and print requirements with a packaging partner. Food-contact, grease or barrier claims are confirmed only when supported by the project specification.", zh: "与包装合作方确认外带盒尺寸、纸板、通风、闭合和印刷要求。食品接触、防油或阻隔性能仅在项目规格支持时确认。" },
    image: showcaseImages.foodBoxReal,
    subcategories: ["Burger boxes", "Fried-food boxes", "Lunch boxes", "Pizza boxes", "Kraft meal boxes", "Takeaway cake boxes"],
    applications: ["Foodservice", "Bakery delivery", "Restaurant takeaway", "Meal delivery"],
    filters: ["Material", "Structure", "Size", "Printing", "Window"],
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
    image: showcaseImages.displayOpen,
    subcategories: ["Transparent cake boxes", "Square cake boxes", "Corrugated cake boxes", "Separate-lid boxes", "Cupcake boxes", "Macaron boxes", "Carry-handle boxes"],
    applications: ["Bakeries", "Dessert brands", "Cake delivery", "Celebration gifting"],
    filters: ["Color", "Size", "Design", "Shape", "Material", "Window", "Insert"],
    seoTitle: "Custom Cake Boxes | Bakery Packaging Manufacturer",
    seoDescription: "Custom cake, cupcake and macaron boxes with window, handle and insert options for bakery packaging projects.",
    searchTerms: ["cake", "bakery", "cupcake", "macaron"],
    productTypes: ["food-packaging-box", "paper-box"],
  },
  {
    slug: "cake-boards-cake-drums",
    title: { en: "Cake Boards & Cake Drums", zh: "蛋糕底托与蛋糕鼓" },
    shortDescription: { en: "Boards and drums for everyday cake support, display and heavier multi-layer transport.", zh: "用于日常蛋糕承托、展示以及较重多层蛋糕运输的底托与蛋糕鼓。" },
    description: { en: "Cake boards are generally used for everyday support and presentation. Cake drums are thicker and suited to heavier or multi-layer cakes. Cake base boards provide a stable foundation for transport and display; exact material and thickness remain project-confirmed.", zh: "Cake Board 通常用于日常承托与展示；Cake Drum 更厚，适合较重或多层蛋糕；Cake Base Board 用于运输和展示的基础承托，具体材料和厚度以项目确认为准。" },
    image: showcaseImages.cakeBoardReal,
    subcategories: ["Cardboard cake board", "Cake drum", "Cake base board", "MDF / Masonite board", "Mini cake board", "Double-thick cake card"],
    applications: ["Cake support", "Bakery display", "Layered cake transport", "Dessert presentation"],
    filters: ["Shape", "Size", "Thickness", "Color", "Edge", "Finish", "Printing"],
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
    image: showcaseImages.webCorrugatedSheet,
    subcategories: ["Self-locking mailers", "Corrugated shipping boxes", "E-commerce presentation boxes", "Protective inserts"],
    applications: ["E-commerce", "Subscription packaging", "Retail dispatch", "Protective shipping"],
    filters: ["Flute", "Board", "Size", "Closure", "Printing", "Insert"],
    seoTitle: "Corrugated Mailer Boxes | Custom E-commerce Packaging",
    seoDescription: "Custom corrugated mailer boxes for e-commerce dispatch, product presentation and protective shipping.",
    searchTerms: ["corrugated", "mailer", "shipping"],
    productTypes: ["corrugated-fluted-paper", "paper-box"],
  },
  {
    slug: "all-products",
    title: { en: "All Products", zh: "全部产品" },
    shortDescription: { en: "Browse confirmed paper materials, components and finished packaging ranges.", zh: "浏览已确认的纸材、半成品和成品包装系列。" },
    description: { en: "Use the full catalog to compare material, GSM, coating, process and packaging structure options. Product groups are shown from confirmed public records; project-specific specifications are confirmed during quotation.", zh: "在完整目录中对比材料、克重、涂层、工艺和包装结构。产品组来自已确认的公开记录，项目规格在报价阶段确认。" },
    image: showcaseImages.displayWide,
    subcategories: ["Paper materials", "Food packaging", "Paper boxes", "Paper pads", "Paper inserts", "Specialty paper"],
    applications: ["Food and bakery", "Retail", "E-commerce", "Industrial protection"],
    filters: ["Material", "Structure", "Application", "GSM", "Coating", "Process"],
    seoTitle: "All Paper Packaging Products | Kehong",
    seoDescription: "Browse Kehong's confirmed paper materials, components and finished packaging product ranges.",
    searchTerms: [],
  },
];

export function getPackagingCategory(slug: string) {
  return packagingCategories.find((category) => category.slug === slug);
}
