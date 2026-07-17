import type { AppLocale } from "@/i18n/locales";

export type VisualCopy = Partial<Record<AppLocale, string>> & {
  en: string;
  zh: string;
};

export function visualText(copy: VisualCopy, locale: string) {
  return copy[locale as AppLocale] ?? copy.en;
}

export const showcaseImages = {
  factoryPoster: "/images/kehong/factory.webp",
  factoryProcess: "/images/kehong/process.webp",
  factoryProducts: "/images/kehong/products.webp",
  foodBox: "/images/kehong/showcase/orins-pizza-box-collage.webp",
  pinkBox: "/images/kehong/showcase/pink-structural-box.webp",
  foodOpen: "/images/kehong/showcase/food-paper-box-open.webp",
  foodDetail: "/images/kehong/showcase/food-paper-box-detail.webp",
  machine: "/images/kehong/showcase/automatic-feeder-line.webp",
  machineClose: "/images/kehong/showcase/precision-machine-closeup.webp",
  honeycomb: "/images/kehong/showcase/honeycomb-paper-roll.webp",
  swatch: "/images/kehong/showcase/color-material-swatch.webp",
  goldBoard: "/images/kehong/showcase/gold-board-stack.webp",
  displayWide: "/images/kehong/showcase/custom-box-display-wide.webp",
  displayOpen: "/images/kehong/showcase/custom-box-display-open.webp",
  sampleRoom: "/images/kehong/showcase/sample-room-boxes.webp",
  booth: "/images/kehong/showcase/exhibition-booth-wide.webp",
  team: "/images/kehong/showcase/exhibition-team.webp",
  cakeBoardReal: "/images/kehong/showcase/optimized/cake-board-real.jpg",
  cakeBoardRealAlt: "/images/kehong/showcase/optimized/cake-board-real-02.jpg",
  foodBoxReal: "/images/kehong/showcase/optimized/food-box-real-01.jpg",
  foodBoxRealAlt: "/images/kehong/showcase/optimized/food-box-real-02.jpg",
  orinsFoodBoxReal: "/images/kehong/showcase/optimized/orins-food-box-real-01.jpg",
  orinsFoodBoxRealAlt: "/images/kehong/showcase/optimized/orins-food-box-real-03.jpg",
  structureMaterialReal: "/images/kehong/showcase/optimized/structure-material-real.jpg",
  webOpenBox: "/images/kehong/showcase/custom-box-display-open.webp",
  webWhiteBox: "/images/kehong/showcase/food-paper-box-open.webp",
  webKraftBox: "/images/kehong/showcase/honeycomb-paper-roll.webp",
  webPaperCups: "/images/kehong/showcase/color-material-swatch.webp",
  webBakeryWindowBox: "/images/kehong/showcase/optimized/food-box-real-01.jpg",
  webBakeryCakeBox: "/images/kehong/showcase/optimized/cake-board-real.jpg",
  webBakeryDisplayBox: "/images/kehong/showcase/orins-pizza-box-collage.webp",
  webBakeryBlueBox: "/images/kehong/showcase/custom-box-display-wide.webp",
  webDonutBoxes: "/images/kehong/showcase/optimized/orins-food-box-real-03.jpg",
  webPaperCupStacks: "/images/kehong/showcase/color-material-swatch.webp",
  webCorrugatedSheet: "/images/kehong/showcase/optimized/structure-material-real.jpg",
  webOpenShippingBox: "/images/kehong/showcase/custom-box-display-open.webp",
  webKraftGiftBox: "/images/kehong/showcase/pink-structural-box.webp",
  webFactoryWorktable: "/images/kehong/showcase/precision-machine-closeup.webp",
  unsplashFoodPackaging: "/images/web/unsplash/paper-food-packaging.jpg",
  unsplashTakeawayPackaging: "/images/web/unsplash/paper-takeaway-packaging.jpg",
} as const;

export const heroScenes = [
  {
    id: "food-safe",
    image: showcaseImages.webBakeryDisplayBox,
    kicker: {
      en: "Food-safe structure",
      zh: "食品包装结构",
      es: "Estructura alimentaria",
      id: "Struktur makanan",
      vi: "Cấu trúc thực phẩm",
      th: "โครงสร้างอาหาร",
      ms: "Struktur makanan",
    },
    title: {
      en: "Pizza boxes, bakery trays and inner pads that ship clean.",
      zh: "披萨盒、烘焙托盘、内垫材料，一站式打样。",
    },
    metric: "Fast sampling",
  },
  {
    id: "material-roll",
    image: showcaseImages.webCorrugatedSheet,
    kicker: {
      en: "Material texture",
      zh: "材料质感",
      es: "Textura material",
      id: "Tekstur material",
      vi: "Vật liệu",
      th: "พื้นผิววัสดุ",
      ms: "Tekstur bahan",
    },
    title: {
      en: "Honeycomb, fluted and specialty paper for stronger protection.",
      zh: "蜂窝纸、坑纸、特种纸，突出保护力和结构感。",
    },
    metric: "Material selection",
  },
  {
    id: "factory-line",
    image: showcaseImages.machine,
    kicker: {
      en: "Factory capability",
      zh: "工厂产能",
      es: "Capacidad fabril",
      id: "Kapasitas pabrik",
      vi: "Năng lực nhà máy",
      th: "กำลังผลิต",
      ms: "Kapasiti kilang",
    },
    title: {
      en: "Automatic feeding, die-cutting and converting for stable delivery.",
      zh: "自动上料、模切、分切加工，支撑稳定交付。",
    },
    metric: "20+ years",
  },
  {
    id: "display",
    image: showcaseImages.webKraftGiftBox,
    kicker: {
      en: "Display packaging",
      zh: "展示包装",
      es: "Packaging display",
      id: "Kemasan display",
      vi: "Bao bì trưng bày",
      th: "บรรจุภัณฑ์โชว์",
      ms: "Paparan pembungkusan",
    },
    title: {
      en: "Retail display boxes and custom structures for brand launches.",
      zh: "展示盒、礼盒、品牌结构包装，适合海外品牌项目。",
    },
    metric: "Custom finishing",
  },
] as const;

export const solutionScenes = [
  {
    id: "food",
    image: showcaseImages.webBakeryWindowBox,
    accent: "#e8c06c",
    href: "/products?search=food",
    title: {
      en: "Food & bakery packaging",
      zh: "食品与烘焙包装",
      es: "Packaging alimentario",
      id: "Kemasan makanan",
      vi: "Bao bì thực phẩm",
      th: "บรรจุภัณฑ์อาหาร",
      ms: "Pembungkusan makanan",
    },
    body: {
      en: "Paper boxes, pads, cup fan blanks and oil-resistant structures for food brands and distributors.",
      zh: "纸盒、纸垫、纸杯扇形片、防油结构，适合食品品牌和渠道客户。",
    },
    tags: ["Food grade", "Oil-proof", "Pizza box", "Cup fan blanks"],
  },
  {
    id: "display",
    image: showcaseImages.webBakeryBlueBox,
    accent: "#171713",
    href: "/products?search=display",
    title: {
      en: "Retail display & gift boxes",
      zh: "展示包装与礼盒",
      es: "Display y regalo",
      id: "Display & hadiah",
      vi: "Trưng bày & quà tặng",
      th: "โชว์สินค้า",
      ms: "Paparan & hadiah",
    },
    body: {
      en: "Brand-ready paper structures with color matching, embossing, hot stamping and display support.",
      zh: "支持配色、压纹、烫金、展示结构，适合品牌包装和展陈。",
    },
    tags: ["Embossing", "Hot stamp", "Color match", "Low MOQ"],
  },
  {
    id: "material",
    image: showcaseImages.webOpenShippingBox,
    accent: "#e8c06c",
    href: "/products?search=paper",
    title: {
      en: "Paper materials",
      zh: "纸材与材料",
      es: "Materiales de papel",
      id: "Bahan kertas",
      vi: "Vật liệu giấy",
      th: "วัสดุกระดาษ",
      ms: "Bahan kertas",
    },
    body: {
      en: "Kraft, white card, colored corrugated, gold and silver cardboard, specialty paper and custom finishing.",
      zh: "牛皮纸、白卡、彩色坑纸、金银卡、特种纸和定制后工艺。",
    },
    tags: ["Kraft", "White card", "Gold board", "Specialty"],
  },
  {
    id: "factory",
    image: showcaseImages.machineClose,
    accent: "#2f8fb7",
    href: "/contact",
    title: {
      en: "Factory-supported sampling",
      zh: "工厂支撑的快速打样",
      es: "Muestreo de fábrica",
      id: "Sampel pabrik",
      vi: "Mẫu từ nhà máy",
      th: "ตัวอย่างจากโรงงาน",
      ms: "Sampel kilang",
    },
    body: {
      en: "Turn drawings, size notes and material targets into practical samples and quote-ready specs.",
      zh: "把图纸、尺寸、材料要求转成可打样、可报价的清晰规格。",
    },
    tags: ["Die-cut", "Creasing", "Slitting", "Lamination"],
  },
] as const;

export const gallerySlides = [
  {
    image: showcaseImages.webBakeryDisplayBox,
    label: { en: "Exhibition-ready product storytelling", zh: "展会级产品展示" },
  },
  {
    image: showcaseImages.webCorrugatedSheet,
    label: { en: "Corrugated texture and kraft structure", zh: "瓦楞纹理与牛皮结构" },
  },
  {
    image: showcaseImages.webKraftGiftBox,
    label: { en: "Sample room and boxed structures", zh: "样品间与结构纸盒" },
  },
  {
    image: showcaseImages.webDonutBoxes,
    label: { en: "Bakery donut boxes and small sets", zh: "甜甜圈盒与小份烘焙包装" },
  },
] as const;

const fallbackSkuImages = [
  showcaseImages.honeycomb,
  showcaseImages.webBakeryWindowBox,
  showcaseImages.webBakeryCakeBox,
  showcaseImages.webDonutBoxes,
  showcaseImages.webPaperCupStacks,
  showcaseImages.webCorrugatedSheet,
  showcaseImages.webKraftBox,
  showcaseImages.webOpenBox,
  showcaseImages.webWhiteBox,
  showcaseImages.swatch,
  showcaseImages.machineClose,
] as const;

export function getSkuVisual(sku: {
  sku: string;
  categoryId: string;
  materialIds: string[];
  title: { en: string; zh: string };
  applications: string;
}) {
  const haystack = [
    sku.categoryId,
    ...sku.materialIds,
    sku.title.en,
    sku.title.zh,
    sku.applications,
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes("donut") || haystack.includes("doughnut") || haystack.includes("甜甜圈")) {
    return showcaseImages.webDonutBoxes;
  }

  if (haystack.includes("cake board") || haystack.includes("cake pad") || haystack.includes("垫片")) {
    return showcaseImages.cakeBoardReal;
  }

  if (haystack.includes("cake") || haystack.includes("bakery") || haystack.includes("pastry") || haystack.includes("蛋糕") || haystack.includes("烘焙")) {
    return showcaseImages.webBakeryWindowBox;
  }

  if (haystack.includes("cup") || haystack.includes("paper cup") || haystack.includes("杯")) {
    return showcaseImages.webPaperCupStacks;
  }

  if (haystack.includes("food") || haystack.includes("pizza")) {
    return showcaseImages.webBakeryDisplayBox;
  }

  if (haystack.includes("gold") || haystack.includes("silver") || haystack.includes("foil")) {
    return showcaseImages.webKraftBox;
  }

  if (haystack.includes("corrugated") || haystack.includes("flute") || haystack.includes("坑")) {
    return showcaseImages.webCorrugatedSheet;
  }

  if (haystack.includes("box") || haystack.includes("tray") || haystack.includes("insert")) {
    return showcaseImages.webOpenShippingBox;
  }

  const checksum = Array.from(sku.sku).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackSkuImages[checksum % fallbackSkuImages.length];
}
