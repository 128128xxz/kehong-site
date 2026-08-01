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
    application("food-packaging", "Food Packaging", "Paper structures and materials for foodservice and branded food presentation.", showcaseImages.foodBoxReal, ["takeout-boxes", "food-packaging-boxes"]),
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
    application("toys", "Toys", "Paper packaging structures that support product presentation, handling and dispatch.", showcaseImages.foodBoxReal, ["paper-boxes", "corrugated-mailer-boxes"]),
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
