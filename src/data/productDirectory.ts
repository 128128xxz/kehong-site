export type LocalizedText = {
  en: string;
  zh: string;
};

export type DirectoryLink = LocalizedText & {
  id: string;
  href: string;
  description: LocalizedText;
};

export type DirectoryGroup = LocalizedText & {
  id: string;
  links: readonly DirectoryLink[];
};

export type ProductCatalogSection = {
  id: "materials" | "finished-packaging";
  label: LocalizedText;
  description: LocalizedText;
  cta: LocalizedText;
  href: string;
  groups: readonly DirectoryGroup[];
};

/**
 * The sole buyer-facing taxonomy for the Header, homepage and product page.
 * Material links are verified published-SKU group routes; finished links are
 * the five active packaging categories and intentionally do not imply SKUs.
 */
export const productCatalogSections: readonly ProductCatalogSection[] = [
  {
    id: "materials",
    label: { en: "Paper materials & semi-finished components", zh: "纸材与半成品" },
    description: {
      en: "Rolls, sheets and forming materials with published specifications and buyer-facing filters.",
      zh: "卷材、平张和成型用纸材，提供清晰的公开规格与筛选。",
    },
    cta: { en: "View specifications", zh: "查看规格" },
    href: "/products#materials-and-components",
    groups: [
      {
        id: "cupstock-components",
        en: "Cupstock & cup components",
        zh: "杯纸与纸杯组件",
        links: [
          { id: "paper-cup-bottom-roll", href: "/products?productType=paper-cup-bottom-roll", en: "Paper cup bottom roll", zh: "纸杯底纸卷", description: { en: "Bottom-stock rolls for cup-bottom punching and sealing.", zh: "纸杯底部冲切和卷封用底纸卷" } },
          { id: "cupstock-paper", href: "/products?productType=cupstock-paper", en: "Cupstock paper", zh: "杯纸原纸", description: { en: "Cupstock grades for paper cup and bowl converting.", zh: "纸杯、纸碗等食品容器加工用原纸" } },
        ],
      },
      {
        id: "coated-rolls-sheets",
        en: "Coated rolls & sheets",
        zh: "淋膜卷材与平张",
        links: [
          { id: "pe-coated-paper-roll", href: "/products?productType=pe-coated-paper-roll", en: "Coated paper roll", zh: "淋膜纸卷", description: { en: "Coated roll material for paper cups, bowls and other food containers.", zh: "纸杯、纸碗等食品容器加工用淋膜卷材" } },
          { id: "pe-coated-paper-sheet", href: "/products?productType=pe-coated-paper-sheet", en: "Coated paper sheet", zh: "淋膜平张纸", description: { en: "Coated sheets for printing, die-cutting and forming.", zh: "印刷、模切和后续成型用淋膜平张纸" } },
        ],
      },
      {
        id: "tray-forming-materials",
        en: "Tray & forming materials",
        zh: "纸托与成型材料",
        links: [
          { id: "food-tray-material", href: "/products?productType=food-tray-paper-material", en: "Food tray paper material", zh: "食品纸托材料", description: { en: "Paper material for formed food trays and paper inserts.", zh: "食品纸托和纸内托成型用纸材" } },
        ],
      },
    ],
  },
  {
    id: "finished-packaging",
    label: { en: "Finished packaging", zh: "成品包装" },
    description: {
      en: "Food boxes, paper bags and mailer boxes developed to your required dimensions, material, print and structure.",
      zh: "食品盒、纸袋和邮寄盒按实际项目参数开发。下单前请提供尺寸、材料、印刷方式和结构要求。",
    },
    cta: { en: "View packaging types", zh: "查看包装类型" },
    href: "/products#finished-packaging",
    groups: [
      {
        id: "food-bakery",
        en: "Food & bakery packaging",
        zh: "餐饮与烘焙包装",
        links: [
          { id: "takeout-boxes", href: "/packaging/takeout-boxes", en: "Takeout boxes", zh: "外带食品盒", description: { en: "Paper boxes for takeaway food, prepared meals and bakery products.", zh: "餐饮外带、熟食和烘焙食品的纸盒包装" } },
          { id: "cake-boxes", href: "/packaging/cake-boxes", en: "Cake boxes", zh: "蛋糕盒", description: { en: "Paper boxes for cakes, desserts and bakery products.", zh: "蛋糕、甜点和烘焙产品的纸盒包装" } },
          { id: "cake-boards-cake-drums", href: "/packaging/cake-boards-cake-drums", en: "Cake boards & cake drums", zh: "蛋糕底托与蛋糕鼓", description: { en: "Boards and drums for cake support, presentation and transport.", zh: "蛋糕承托、展示和运输" } },
          { id: "pizza-packaging", href: "/packaging/pizza-packaging", en: "Pizza boxes & pads", zh: "披萨盒与披萨垫纸", description: { en: "Pizza boxes, pads and liners for delivery and takeaway programs.", zh: "披萨配送和外带用盒、垫纸与内衬" } },
          { id: "food-packaging", href: "/packaging/food-packaging", en: "Food packaging", zh: "食品包装", description: { en: "Paper food boxes, trays, pads and components for foodservice projects.", zh: "面向餐饮项目的食品盒、纸托、垫纸和纸材部件" } },
          { id: "inserts-dividers", href: "/packaging/inserts-dividers", en: "Corrugated inserts & paperboard inserts", zh: "瓦楞内托与纸板内托", description: { en: "Inserts, dividers and pads for protection and presentation.", zh: "用于保护和展示的内托、隔板与纸垫" } },
        ],
      },
      {
        id: "retail-carry",
        en: "Retail & carry packaging",
        zh: "零售与手提包装",
        links: [
          { id: "paper-bags", href: "/packaging/paper-bags", en: "Paper bags", zh: "纸袋", description: { en: "Carry packaging for retail, foodservice and branded applications.", zh: "零售、餐饮和品牌手提包装" } },
          { id: "retail-packaging", href: "/packaging/retail-packaging", en: "Retail packaging", zh: "零售包装", description: { en: "Paper bags, presentation boxes and display-ready packaging.", zh: "纸袋、展示盒和陈列就绪包装" } },
        ],
      },
      {
        id: "ecommerce-shipping",
        en: "E-commerce & shipping packaging",
        zh: "电商与运输包装",
        links: [
          { id: "corrugated-mailer-boxes", href: "/packaging/corrugated-mailer-boxes", en: "Corrugated mailer boxes", zh: "瓦楞邮寄盒", description: { en: "Protective mailer boxes for e-commerce and shipping.", zh: "电商发货、运输和产品保护" } },
        ],
      },
    ],
  },
];

export const materialDirectoryGroups = productCatalogSections[0].groups;
export const finishedPackagingDirectoryGroups = productCatalogSections[1].groups;
