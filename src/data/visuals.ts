import type { AppLocale } from "@/i18n/locales";

export type VisualCopy = Partial<Record<AppLocale, string>> & {
  en: string;
  zh: string;
};

export function visualText(copy: VisualCopy, locale: string) {
  return copy[locale as AppLocale] ?? copy.en;
}

export const showcaseImages = {
  foodBox: "/media/products/food-packaging/food-packaging-box-reference-01.jpg",
  foodOpen: "/media/packaging/food-packaging-box-open.webp",
  foodDetail: "/media/packaging/food-packaging-box-detail.webp",
  machine: "/media/factory/paper-converting-feeder-line-01.webp",
  machineClose: "/media/factory/paper-converting-machine-detail.webp",
  honeycomb: "/media/materials/honeycomb-paper-roll-reference.webp",
  swatch: "/media/materials/paper-color-swatch-detail-01.webp",
  portalSwatch: "/media/materials/paper-color-swatch-portal.webp",
  goldBoard: "/media/materials/gold-metallic-cardstock-stack.webp",
  displayWide: "/media/packaging/custom-paper-box-display-wide.webp",
  displayOpen: "/media/packaging/custom-paper-box-display-open.webp",
  sampleRoom: "/media/packaging/packaging-sample-room-reference.webp",
  booth: "/media/factory/factory-exhibition-booth-reference.webp",
  team: "/media/factory/paper-converting-team-reference.webp",
  cakeBoardReal: "/media/products/cake-boards/cake-board-reference-01.jpg",
  cakeBoardRealAlt: "/media/products/cake-boards/cake-board-reference-02.jpg",
  foodBoxReal: "/media/products/food-packaging/food-packaging-box-reference-01.jpg",
  foodBoxRealAlt: "/media/products/food-packaging/food-packaging-box-reference-02.jpg",
  structureMaterialReal: "/media/materials/packaging-structure-material-reference.jpg",
  webOpenBox: "/media/packaging/custom-paper-box-display-open.webp",
  webWhiteBox: "/media/packaging/food-packaging-box-open.webp",
  webKraftBox: "/media/materials/honeycomb-paper-roll-reference.webp",
  webPaperCups: "/media/materials/paper-color-swatch-01.webp",
  webBakeryWindowBox: "/media/products/food-packaging/food-packaging-box-reference-01.jpg",
  webBakeryCakeBox: "/media/products/cake-boards/cake-board-reference-01.jpg",
  webBakeryDisplayBox: "/media/products/food-packaging/food-packaging-box-reference-02.jpg",
  webBakeryBlueBox: "/media/packaging/custom-paper-box-display-wide.webp",
  webDonutBoxes: "/media/products/cake-boards/cake-board-reference-01.jpg",
  webPaperCupStacks: "/media/materials/paper-color-swatch-01.webp",
  webCorrugatedSheet: "/media/materials/packaging-structure-material-reference.jpg",
  webOpenShippingBox: "/media/packaging/custom-paper-box-display-open.webp",
  webKraftGiftBox: "/media/products/paper-box/paper-box-structure-reference-01.webp",
  webFactoryWorktable: "/media/factory/paper-converting-machine-detail.webp",
  unsplashFoodPackaging: "/media/applications/paper-food-packaging-reference.jpg",
  unsplashTakeawayPackaging: "/media/applications/paper-takeaway-packaging-reference.jpg",
  // 2026-07-27 新增科宏实拍(来源:业主提供的科宏图片文件夹)
  rehnCakeBoardsStyled: "/media/packaging/cake-board-display-reference.jpg",
  kraftCartonsPallet: "/media/packaging/kraft-cartons-pallet-reference.jpg",
  bakeryDessertDisplay: "/media/packaging/bakery-dessert-display-reference.jpg",
  colorPaperFan: "/media/materials/colored-paper-cup-fan-reference.jpg",
  goldBoardPieces: "/media/materials/gold-metallic-cardstock-pieces.jpg",
  goldBoardSheets: "/media/materials/gold-metallic-cardstock-sheets.jpg",
  factorySamplesFloor: "/media/factory/paper-sample-floor-reference.jpg",
  kraftCartonsTall: "/media/packaging/kraft-cartons-tall-reference.jpg",
  retailShelfDisplay: "/media/packaging/retail-display-packaging-reference.jpg",
  boothInterior01: "/media/factory/factory-showroom-interior-01.jpg",
  boothInterior02: "/media/factory/factory-showroom-interior-02.jpg",
  woodenDisplayRack: "/media/packaging/wooden-display-rack-reference.jpg",
  woodenStructureRack: "/media/packaging/wooden-structure-rack-reference.jpg",
  easelWhiteBox: "/media/packaging/white-paper-box-display-reference.jpg",
  kraftBoxesGoldLogo: "/media/packaging/kraft-paper-boxes-gold-logo-reference.jpg",
  textileLine: "/media/factory/paper-converting-line-reference.jpg",
  // GPT-generated representative visuals received 2026-07-27; never presented as Kehong factory photography.
  representativeHeroStructure: "/media/packaging/packaging-structure-reference.png",
  representativeMaterialWarehouse: "/media/materials/paper-material-warehouse-reference.png",
  representativeDieCutting: "/media/packaging/paper-die-cutting-reference.png",
  representativeBoxRange: "/media/packaging/paper-box-range-reference.png",
  representativeSlitting: "/media/packaging/paper-slitting-reference.png",
  representativeProtectiveStructures: "/media/packaging/protective-paper-structures-reference.png",
  representativeInserts: "/media/materials/paper-insert-structures-reference.png",
  representativeBakeryPackaging: "/media/packaging/bakery-packaging-structure-reference.png",
  // Unbranded local representative visual for the Takeout Boxes route.
  // It replaces legacy collage imagery and is not presented as factory photography.
  takeoutBoxesReference: "/media/packaging/paper-box-range-reference.png",
  representativeMaterialSamples: "/media/materials/paper-material-samples-reference.png",
  representativeHeroMaterials: "/media/materials/paper-materials-reference.png",
  // AI 渲染 v2(2026-07-27 第二批,27 张;tea-coffee 源文件损坏待重出)
  aiCupFanBlanks: "/media/products/paper-cup-materials/paper-cup-fan-product-reference-03.jpg",
  aiPeCoatedRoll: "/media/products/paper-cup-materials/pe-coated-paper-roll-reference-01.jpg",
  aiCupBottomRolls: "/media/products/paper-cup-materials/paper-cup-bottom-roll-reference-01.jpg",
  aiKraftCupstock: "/media/products/paper-cup-materials/cupstock-paper-product-reference-01.jpg",
  aiOgBackdrop: "/media/resources/paper-packaging-social-share-reference.jpg",
  aiBurgerBox: "/media/packaging/burger-box-reference.jpg",
  aiMealBox: "/media/packaging/meal-box-reference.jpg",
  aiCakePads: "/media/packaging/cake-pads-reference.jpg",
  aiElectronicsInsert: "/media/packaging/electronics-insert-reference.jpg",
  aiDiecutSheets: "/media/materials/paper-die-cut-sheet-reference.jpg",
  aiSpecialtyPapers: "/media/products/specialty-paper/specialty-paper-sheet-reference-01.jpg",
  aiFluteTypes: "/media/products/corrugated-board/corrugated-board-cross-section-reference-01.jpg",
  aiApparelBox: "/media/packaging/apparel-box-reference.jpg",
  aiCandleBox: "/media/packaging/candle-box-reference.jpg",
  aiElectronicsBox: "/media/packaging/electronics-box-reference.jpg",
  aiToyBox: "/media/packaging/toy-box-reference.jpg",
  aiPharmaBox: "/media/packaging/pharma-box-reference.jpg",
  aiStationeryBox: "/media/packaging/stationery-box-reference.jpg",
  aiJewelryBox: "/media/packaging/jewelry-box-reference.jpg",
  aiHomeStorageBox: "/media/packaging/home-storage-box-reference.jpg",
  aiSportsBox: "/media/packaging/sports-box-reference.jpg",
  aiAutoPartsBox: "/media/packaging/auto-parts-box-reference.jpg",
  aiEyewearBox: "/media/packaging/eyewear-box-reference.jpg",
  aiArtworkGuideCover: "/media/resources/artwork-guide-cover-reference.jpg",
  aiDielineCover: "/media/resources/dieline-cover-reference.jpg",
  aiEmptyBox: "/media/packaging/empty-box-reference.jpg",
  aiExhibitionBackdrop: "/media/resources/exhibition-backdrop-reference.jpg",
  // 代表图（业主提供，来源记录见 docs/stage-1b-media-source-notes/representative-renders.md；实拍到位即替换）
  aiCakeBoxWindow: "/media/packaging/cake-box-window-reference.jpg",
  aiPillowBox: "/media/packaging/pillow-box-reference.jpg",
  aiSeafoodBox: "/media/packaging/seafood-box-reference.jpg",
  aiCakeBoardsSet: "/media/packaging/cake-boards-set-reference.jpg",
  aiLabelsTags: "/media/packaging/labels-tags-reference.jpg",
  aiFoldingCarton: "/media/packaging/folding-carton-reference.jpg",
  aiPaperInsert: "/media/products/paper-inserts/paper-insert-tray-reference-03.jpg",
  aiPizzaBox: "/media/packaging/pizza-box-reference.jpg",
  aiGiftBox: "/media/packaging/gift-box-reference.jpg",
  aiCosmeticsBox: "/media/packaging/cosmetics-box-reference.jpg",
  aiPetBox: "/media/packaging/pet-box-reference.jpg",
  aiPaperBagBranded: "/media/packaging/paper-bag-branded-reference.jpg",
  aiPackagingFamily: "/media/packaging/paper-packaging-family-reference.jpg",
  aiFluteMacro: "/media/products/corrugated-board/corrugated-board-surface-detail-reference.jpg",
  // 2026-07-27 补图：授权来源记录见 docs/stage-1b-media-source-notes/web-image-sources.md
  webKraftPaperBag: "/media/applications/kraft-paper-bag-reference.jpg",
  webKraftHangTags: "/media/applications/kraft-hang-tags-reference.jpg",
  webPaperCupsKraft: "/media/applications/paper-cup-application-reference.jpg",
  // 语义别名(按图片真实画面命名;历史键名与实际内容不符,alt 文案以这些为准)
  factoryHallWide: "/media/factory/factory-exhibition-booth-reference.webp",
  corrugatorHall: "/media/packaging/packaging-sample-room-reference.webp",
  slittingLinePink: "/media/materials/gold-metallic-cardstock-stack.webp",
  feederOperator: "/media/factory/paper-converting-team-reference.webp",
  // Owner-provided packaging photography, optimized from the Kehong image pack.
  providedFoodBox01: "/media/kehong/food-box-01.webp",
  providedFoodBox02: "/media/kehong/food-box-02.webp",
  providedOrinsFoodBox: "/media/kehong/orins-food-box.webp",
  providedOrinsFoodBox03: "/media/kehong/orins-food-box-03.webp",
  providedBakeryBox: "/media/kehong/rehn-bakery-box.webp",
  providedDisplay01: "/media/kehong/packaging-display-01.webp",
  providedDisplay02: "/media/kehong/packaging-display-02.webp",
  providedDisplay03: "/media/kehong/packaging-display-03.webp",
  providedDisplay04: "/media/kehong/packaging-display-04.webp",
  providedPaperBoxDisplay: "/media/kehong/paper-box-display.webp",
  providedStructureMaterial: "/media/kehong/structure-material.webp",
  providedWhitePackaging: "/media/kehong/white-packaging.webp",
  providedSample01: "/media/kehong/sample-display-01.webp",
  providedSample02: "/media/kehong/sample-display-02.webp",
  providedSample03: "/media/kehong/sample-display-03.webp",
  // Owner-provided corrugated material photography from the current DOCX catalog.
  corrugatedBoardColorOptions: "/media/materials/corrugated-board-color-options.webp",
  corrugatedBoardEfgFlute: "/media/materials/corrugated-board-efg-flute.webp",
  foodPaperPadCorrugated: "/media/materials/food-paper-pad-corrugated.webp",
  coloredCorrugatedBoardOptions: "/media/materials/colored-corrugated-board-options.webp",
  corrugatedBoardSurfaceStack: "/media/materials/corrugated-board-surface-stack.webp",
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
      zh: "披萨盒、烘焙托盘和内垫材料，按项目打样。",
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
      zh: "生产支持",
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
      en: "Paper boxes, pads and cup fan blanks for food brands and distributors; final material and use requirements are confirmed by project.",
      zh: "纸盒、纸垫和纸杯扇形片，按食品包装项目确认。",
    },
    tags: ["Structure review", "Material confirmation", "Pizza box", "Cup fan blanks"],
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
