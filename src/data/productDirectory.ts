export type DirectoryLink = {
  id: string;
  href: string;
  en: string;
  zh: string;
};

export type DirectoryGroup = {
  id: string;
  en: string;
  zh: string;
  links: readonly DirectoryLink[];
};

/**
 * Shared buyer-facing taxonomy for the product page and Header. Every
 * material link targets a current published SKU group; every finished link
 * targets one of the five active packaging project directions.
 */
export const materialDirectoryGroups: readonly DirectoryGroup[] = [
  {
    id: "cupstock-components",
    en: "Cupstock & cup components",
    zh: "杯纸与纸杯组件",
    links: [
      { id: "paper-cup-fan", href: "/products?group=paper-cup-fan-paper-cup-fan", en: "Paper cup fan", zh: "纸杯扇形片" },
      { id: "paper-cup-bottom-roll", href: "/products?group=paper-cup-fan-paper-cup-bottom-roll", en: "Paper cup bottom roll", zh: "纸杯底纸卷" },
      { id: "cupstock-paper", href: "/products?group=paper-cup-fan-kraft-cupstock-paper", en: "Cupstock paper", zh: "杯纸原纸" },
    ],
  },
  {
    id: "coated-rolls-sheets",
    en: "Coated rolls & sheets",
    zh: "淋膜卷材与平张",
    links: [
      { id: "pe-coated-paper-roll", href: "/products?group=paper-cup-fan-pe-coated-paper-roll-for-paper-cup", en: "PE-coated paper roll", zh: "PE 淋膜纸卷" },
      { id: "pe-coated-paper-sheet", href: "/products?group=paper-cup-fan-pe-coated-paper-sheet-for-paper-cup", en: "PE-coated paper sheet", zh: "PE 淋膜平张纸" },
    ],
  },
  {
    id: "tray-forming-materials",
    en: "Tray & forming materials",
    zh: "纸托与成型材料",
    links: [
      { id: "food-tray-material", href: "/products?group=paper-cup-fan-food-tray-paper-material", en: "Food tray paper material", zh: "食品纸托材料" },
    ],
  },
];

export const finishedPackagingDirectoryGroups: readonly DirectoryGroup[] = [
  {
    id: "food-bakery",
    en: "Food & bakery packaging",
    zh: "餐饮与烘焙包装",
    links: [
      { id: "takeout-boxes", href: "/packaging/takeout-boxes", en: "Takeout boxes", zh: "外带食品盒" },
      { id: "cake-boxes", href: "/packaging/cake-boxes", en: "Cake boxes", zh: "蛋糕盒" },
      { id: "cake-boards-cake-drums", href: "/packaging/cake-boards-cake-drums", en: "Cake boards & cake drums", zh: "蛋糕底托与蛋糕鼓" },
    ],
  },
  {
    id: "retail-carry",
    en: "Retail & carry packaging",
    zh: "零售与手提包装",
    links: [
      { id: "paper-bags", href: "/packaging/paper-bags", en: "Paper bags", zh: "纸袋" },
    ],
  },
  {
    id: "ecommerce-shipping",
    en: "E-commerce & shipping packaging",
    zh: "电商与运输包装",
    links: [
      { id: "corrugated-mailer-boxes", href: "/packaging/corrugated-mailer-boxes", en: "Corrugated mailer boxes", zh: "瓦楞邮寄盒" },
    ],
  },
];
