import { showcaseImages } from "@/data/visuals";

export type IndustryApplication = {
  slug: string;
  title: string;
  description: string;
  image: string;
  relatedProducts: string[];
  seoTitle: string;
  seoDescription: string;
};

export type IndustryGroup = {
  slug: string;
  title: string;
  description: string;
  applications: IndustryApplication[];
};

function application(slug: string, title: string, description: string, image: string, relatedProducts: string[]): IndustryApplication {
  return { slug, title, description, image, relatedProducts, seoTitle: `${title} Packaging Solutions | Kehong`, seoDescription: `Paper packaging materials, structures and components for ${title.toLowerCase()} projects.` };
}

export const industryGroups: IndustryGroup[] = [
  { slug: "food-bakery-beverage", title: "Food, Bakery & Beverage", description: "Paper materials, boxes and inserts for foodservice, bakery, beverage and specialty drink workflows.", applications: [
    application("food-packaging", "Food Packaging", "Paper structures and materials for foodservice and branded food presentation.", showcaseImages.foodBoxRealAlt, ["takeout-boxes", "food-packaging-boxes"]),
    application("bakery-dessert", "Bakery & Dessert", "Presentation and transport formats for bakery, dessert and celebration products.", showcaseImages.cakeBoardReal, ["cake-boxes", "cake-boards-cake-drums"]),
    application("tea-coffee-specialty-beverage", "Tea, Coffee & Specialty Beverage", "Material and packaging paths for dry goods, takeaway drinks and specialty beverage brands.", showcaseImages.portalSwatch, ["paper-bags", "paper-packaging-materials"]),
    application("beverage-packaging", "Beverage Packaging", "Paper components and structures reviewed around beverage handling and presentation needs.", showcaseImages.foodBox, ["food-packaging-boxes", "paper-packaging-materials"]),
  ] },
  { slug: "retail-lifestyle", title: "Retail & Lifestyle", description: "Brand-ready paper structures for retail presentation, gifting and lifestyle products.", applications: [
    application("apparel", "Apparel", "Carry bags, boxes and inserts for apparel presentation and retail dispatch.", showcaseImages.webKraftGiftBox, ["paper-bags", "paper-boxes"]),
    application("cosmetics-skincare", "Cosmetics & Skincare", "Compact packaging structures and branded components for beauty products.", showcaseImages.displayWide, ["pillow-boxes", "paper-boxes"]),
    application("candles", "Candles", "Protective and presentation packaging for candle formats and gift sets.", showcaseImages.webCorrugatedSheet, ["corrugated-mailer-boxes", "pillow-boxes"]),
    application("jewelry-watches", "Jewelry & Watches", "Small-format boxes, inserts and presentation components for retail products.", showcaseImages.goldBoard, ["pillow-boxes", "paper-inserts"]),
    application("gifts-holiday", "Gifts & Holiday", "Gift-ready bags, boxes and inserts for seasonal and promotional collections.", showcaseImages.webKraftGiftBox, ["paper-bags", "pillow-boxes"]),
    application("home-kitchen", "Home & Kitchen", "Product protection and presentation formats for home and kitchen goods.", showcaseImages.webCorrugatedSheet, ["corrugated-mailer-boxes", "paper-boxes"]),
    application("pet-supplies", "Pet Supplies", "Mailers, boxes and printed components for pet products and accessories.", showcaseImages.machineClose, ["corrugated-mailer-boxes", "paper-bags"]),
    application("toys", "Toys", "Paper packaging structures that support product presentation, handling and dispatch.", showcaseImages.aiToyBox, ["paper-boxes", "corrugated-mailer-boxes"]),
    application("sports-outdoor", "Sports & Outdoor", "Protective packaging and inserts for equipment, accessories and outdoor goods.", showcaseImages.machine, ["corrugated-mailer-boxes", "paper-inserts"]),
  ] },
  { slug: "ecommerce-industrial-professional", title: "E-commerce, Industrial & Professional", description: "Protective and presentation packaging for dispatch, devices, parts and professional supply chains.", applications: [
    application("ecommerce-mailers", "E-commerce & Mailers", "Corrugated mailers and inserts for parcel dispatch and product protection.", showcaseImages.webCorrugatedSheet, ["corrugated-mailer-boxes", "paper-inserts"]),
    application("electronics", "Electronics", "Protective structures and inserts reviewed around devices, accessories and presentation.", showcaseImages.machineClose, ["paper-inserts", "corrugated-mailer-boxes"]),
    application("healthcare-pharmaceutical", "Healthcare & Pharmaceutical", "Project-specific paper packaging components for professional product handling.", showcaseImages.portalSwatch, ["paper-packaging-materials", "paper-inserts"]),
    application("eyewear-medical-devices", "Eyewear & Medical Devices", "Compact protective and presentation formats for precision products.", showcaseImages.displayWide, ["pillow-boxes", "paper-inserts"]),
    application("automotive-parts-tools", "Automotive Parts & Tools", "Protective inserts and mailers for parts, tools and technical products.", showcaseImages.machine, ["corrugated-mailer-boxes", "paper-inserts"]),
    application("stationery-office-supplies", "Stationery & Office Supplies", "Printed boxes, bags and inserts for stationery and office product ranges.", showcaseImages.goldBoard, ["paper-bags", "paper-boxes"]),
    application("cbd-packaging", "CBD Packaging", "Packaging structures reviewed against the applicable product and market brief.", showcaseImages.displayWide, ["pillow-boxes", "paper-boxes"]),
  ] },
];

/** Public Chinese copy is kept beside the English industry taxonomy so cards
 * remain tied to the same group and application slugs in every locale. */
export const industryZhCopy: Record<string, { title: string; description: string; applications: Record<string, string> }> = {
  "food-bakery-beverage": {
    title: "食品、烘焙与饮品",
    description: "适用于餐饮、烘焙、饮品与特色饮品流程的纸材、纸盒和纸内托。",
    applications: { "food-packaging": "食品包装", "bakery-dessert": "烘焙与甜品", "tea-coffee-specialty-beverage": "茶、咖啡与特色饮品", "beverage-packaging": "饮品包装" },
  },
  "retail-lifestyle": {
    title: "零售与生活方式",
    description: "面向零售展示、礼赠与生活方式产品的品牌纸包装结构。",
    applications: { apparel: "服装", "cosmetics-skincare": "化妆品与护肤", candles: "蜡烛", "jewelry-watches": "珠宝与腕表", "gifts-holiday": "礼品与节庆", "home-kitchen": "家居与厨房", "pet-supplies": "宠物用品", toys: "玩具", "sports-outdoor": "运动与户外" },
  },
  "ecommerce-industrial-professional": {
    title: "电商、工业与专业供应链",
    description: "适用于发货、设备、零部件及专业供应链的保护性与展示型纸包装。",
    applications: { "ecommerce-mailers": "电商与邮寄盒", electronics: "电子产品", "healthcare-pharmaceutical": "医疗与制药", "eyewear-medical-devices": "眼镜与医疗设备", "automotive-parts-tools": "汽车零部件与工具", "stationery-office-supplies": "文具与办公用品", "cbd-packaging": "CBD 包装" },
  },
};
