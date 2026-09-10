export type MaterialCopy = { en: string; zh: string };

export type MaterialImage = {
  src: string;
  alt: MaterialCopy;
};

export type MaterialGroup = {
  title: MaterialCopy;
  items: MaterialCopy[];
};

export type MaterialCollection = {
  slug: string;
  title: MaterialCopy;
  description: MaterialCopy;
  image: MaterialImage;
  groups: MaterialGroup[];
  finishes: MaterialCopy[];
  colorsOrTextures: MaterialCopy[];
  applications: MaterialCopy[];
  gallery: MaterialImage[];
};

const copy = (en: string, zh: string): MaterialCopy => ({ en, zh });

const corrugatedGallery: MaterialImage[] = [
  {
    src: "/media/materials/corrugated-board-surface-stack.webp",
    alt: copy("Corrugated board surface and flute stack", "瓦楞纸板表面与坑型叠层"),
  },
  {
    src: "/media/materials/corrugated-board-efg-flute.webp",
    alt: copy("E F G flute corrugated board comparison", "E F G 坑型瓦楞纸板对比"),
  },
  {
    src: "/media/materials/corrugated-board-color-options.webp",
    alt: copy("Colored corrugated board edge options", "彩色瓦楞纸板边缘选项"),
  },
  {
    src: "/media/materials/colored-corrugated-board-options.webp",
    alt: copy("Colored corrugated board material options", "彩色瓦楞纸板材料选项"),
  },
  {
    src: "/media/materials/food-paper-pad-corrugated.webp",
    alt: copy("Food paper pad with corrugated construction", "食品纸垫与瓦楞结构"),
  },
];

const specialtyPdfGallery: MaterialImage[] = [
  {
    src: "/media/materials/specialty-metallic-gold-silver-reflective.webp",
    alt: copy("Gold and silver metallic paper swatches", "金色与银色金属纸样品"),
  },
  {
    src: "/media/materials/specialty-pearlescent-horizontal-hero.webp",
    alt: copy("Pearlescent paper swatches", "珠光纸样品"),
  },
  {
    src: "/media/materials/specialty-embossed-textures.webp",
    alt: copy("Embossed and textured paper swatches", "压纹与纹理纸样品"),
  },
  {
    src: "/media/materials/specialty-laser-holographic.webp",
    alt: copy("Laser and holographic paper swatches", "镭射与全息纸样品"),
  },
  {
    src: "/media/materials/specialty-colored-decorative.webp",
    alt: copy("Colored decorative paper swatches", "彩色装饰纸样品"),
  },
  {
    src: "/media/materials/specialty-touch-paper.webp",
    alt: copy("Soft-touch paper swatches", "触感纸样品"),
  },
  {
    src: "/media/materials/specialty-shiny-high-gloss.webp",
    alt: copy("Shiny and high-gloss paper swatches", "亮光与高光纸样品"),
  },
];

const specialtyComposite: MaterialImage = {
  src: "/media/materials/specialty-materials-composite-v2.webp",
  alt: copy("Specialty paper swatches across metallic, pearlescent, textured and holographic surfaces", "金属、珠光、纹理与全息表面的特种纸样品组合"),
};

export const materialCollectionSlugs = [
  "corrugated-paper",
  "specialty-paper",
  "metallic-paper",
  "pearlescent-paper",
  "embossed-paper",
  "laser-paper",
] as const;

export const materialCollections: MaterialCollection[] = [
  {
    slug: "corrugated-paper",
    title: copy("Corrugated Paper & Board", "瓦楞纸与坑纸材料"),
    description: copy(
      "Corrugated board options for custom packaging structures, with E, F and G flute choices, double-layer and triple-layer construction, plus surface finishing options.",
      "用于定制包装结构的瓦楞纸板选项，提供 E、F、G 坑型、双层和三层结构，以及多种表面工艺。",
    ),
    image: corrugatedGallery[0],
    groups: [
      {
        title: copy("Light Corrugated Series", "浅色系列"),
        items: [
          copy("White Corrugated Board", "白色瓦楞纸板"),
          copy("White Kraft Double-Layer Corrugated Board", "白牛皮双层瓦楞纸板"),
          copy("White Kraft Triple-Layer Corrugated Board", "白牛皮三层瓦楞纸板"),
          copy("Non-Fluorescent Food Paper Double-Layer Corrugated Board", "无荧光食品纸双层瓦楞纸板"),
          copy("White + Kraft + White Triple-Layer Corrugated Board", "白 + 牛皮 + 白三层瓦楞纸板"),
          copy("Imported-Paper White + Kraft + White Triple-Layer Corrugated Board", "进口纸白 + 牛皮 + 白三层瓦楞纸板"),
        ],
      },
      {
        title: copy("Dark Corrugated Series", "深色系列"),
        items: [
          copy("Black Triple-Layer Corrugated Board", "黑色三层瓦楞纸板"),
          copy("Black Triple-Layer Corrugated Board with Lamination", "黑色三层瓦楞纸板与覆膜"),
          copy("Black Corrugated Board with Printing", "黑色瓦楞纸板与印刷"),
          copy("Black Corrugated Board with Laminated Printed Surface", "黑色瓦楞纸板与覆膜印刷表面"),
          copy("Imported-Paper Black Corrugated Board", "进口纸黑色瓦楞纸板"),
          copy("Deep Blue Triple-Layer Corrugated Board", "深蓝色三层瓦楞纸板"),
          copy("Black + Black Double-Layer Corrugated Board", "黑 + 黑双层瓦楞纸板"),
          copy("Black + Kraft + Kraft Triple-Layer Corrugated Board", "黑 + 牛皮 + 牛皮三层瓦楞纸板"),
          copy("Black + Kraft Double-Layer Corrugated Board", "黑 + 牛皮双层瓦楞纸板"),
        ],
      },
      {
        title: copy("Colored Corrugated Series", "彩色系列"),
        items: [
          copy("Colored Triple-Layer Corrugated Board", "彩色三层瓦楞纸板"),
          copy("Colored Double-Layer Corrugated Board", "彩色双层瓦楞纸板"),
          copy("Colored Corrugated Board with Custom Logo", "彩色瓦楞纸板与定制 Logo"),
          copy("PET + Kraft Double-Layer Corrugated Board", "PET + 牛皮双层瓦楞纸板"),
          copy("Pink Corrugated Board", "粉色瓦楞纸板"),
          copy("Gray + Kraft Exposed-Flute Board", "灰色 + 牛皮见坑纸板"),
          copy("Kraft Triple-Layer Corrugated Board", "牛皮三层瓦楞纸板"),
          copy("Kraft Double-Layer Corrugated Board", "牛皮双层瓦楞纸板"),
          copy("Custom Pearlescent Corrugated Board", "定制珠光瓦楞纸板"),
          copy("Mixed-Color Corrugated Board", "混彩瓦楞纸板"),
        ],
      },
      {
        title: copy("Food & Paper Pads", "食品纸垫与纸垫片"),
        items: [
          copy("Food Paper Pad", "食品纸垫"),
          copy("Die-Cut Paper Pad", "模切纸垫片"),
          copy("Corrugated Paper Pad", "瓦楞纸垫片"),
        ],
      },
    ],
    finishes: [
      copy("Gloss lamination", "亮光覆膜"),
      copy("Matte lamination", "哑光覆膜"),
      copy("Coating", "涂层"),
      copy("Scratch-resistant finish", "防刮花工艺"),
      copy("Anti-counterfeit process", "防伪工艺"),
      copy("Custom logo and pattern printing", "定制 Logo 与图案印刷"),
      copy("Fragrance-retention process", "留香工艺"),
      copy("Sample-based development", "来样定制开发"),
    ],
    colorsOrTextures: [
      copy("White", "白色"),
      copy("Kraft", "牛皮色"),
      copy("Black", "黑色"),
      copy("Deep blue", "深蓝色"),
      copy("Pink and mixed colors", "粉色与混彩"),
      copy("Pearlescent surface", "珠光表面"),
    ],
    applications: [
      copy("Corrugated mailer boxes", "瓦楞邮寄盒"),
      copy("Pizza boxes and food packaging", "披萨盒与食品包装"),
      copy("Corrugated inserts and dividers", "瓦楞内托与隔板"),
      copy("Cake packaging components", "蛋糕包装部件"),
      copy("Food paper pads", "食品纸垫"),
    ],
    gallery: corrugatedGallery,
  },
  {
    slug: "specialty-paper",
    title: copy("Specialty & Decorative Paper", "特种纸与装饰纸"),
    description: copy(
      "Explore specialty paper options for branded, retail, cosmetic, gift and presentation packaging, including metallic, pearlescent, embossed, textured and decorative surfaces.",
      "面向品牌、零售、化妆品、礼品和展示包装，提供金属、珠光、压纹、纹理与装饰表面纸材选项。",
    ),
    image: specialtyComposite,
    groups: [
      { title: copy("Material collections", "材料集合"), items: [copy("Metallic Paper", "金属纸"), copy("Pearlescent Paper", "珠光纸"), copy("Embossed & Textured Paper", "压纹与纹理纸"), copy("Laser / Holographic Paper", "镭射 / 全息纸"), copy("Colored Decorative Paper", "彩色装饰纸"), copy("Printed Decorative Paper", "印花装饰纸"), copy("Touch Paper", "触感纸"), copy("Shiny / High-Gloss Paper", "亮光 / 高光纸"), copy("PET Surface Paper", "PET 表面纸")] },
    ],
    finishes: [copy("Embossing and texture", "压纹与纹理"), copy("Glossy or matte surface", "亮光或哑光表面"), copy("Printed decorative surface", "印花装饰表面"), copy("Metallic and pearlescent effect", "金属与珠光效果"), copy("Surface selection for custom packaging", "定制包装表面选择")],
    colorsOrTextures: [copy("Gold and silver", "金色与银色"), copy("Colored metallic", "彩色金属效果"), copy("Pearlescent white and ivory", "白色与象牙色珠光"), copy("Colored pearlescent", "彩色珠光"), copy("Touch and high-gloss", "触感与高光"), copy("Printed and textured surfaces", "印花与纹理表面")],
    applications: [copy("Cosmetic and perfume packaging", "化妆品与香水包装"), copy("Gift and presentation boxes", "礼盒与展示盒"), copy("Retail packaging", "零售包装"), copy("Paper bags, sleeves and inserts", "纸袋、纸套与内托")],
    gallery: specialtyPdfGallery,
  },
  {
    slug: "metallic-paper",
    title: copy("Metallic Paper", "金属纸"),
    description: copy("Choose gold, silver and colored metallic directions for premium packaging surfaces, with glossy, matte and embossed options available for sampling.", "选择适用于高质感包装表面的金色、银色和彩色金属效果，亮光、哑光和压纹方向均可申请样品。"),
    image: specialtyPdfGallery[0],
    groups: [{ title: copy("Metallic directions", "金属效果方向"), items: [copy("Gold", "金色"), copy("Silver", "银色"), copy("Colored metallic", "彩色金属"), copy("Glossy metallic", "亮光金属"), copy("Matte metallic", "哑光金属"), copy("Embossed metallic", "压纹金属")] }],
    finishes: [copy("Glossy surface", "亮光表面"), copy("Matte surface", "哑光表面"), copy("Embossed surface", "压纹表面"), copy("Custom color matching", "定制颜色匹配")],
    colorsOrTextures: [copy("Gold", "金色"), copy("Silver", "银色"), copy("Colored metallic", "彩色金属"), copy("Embossed metallic", "压纹金属")],
    applications: [copy("Cosmetic packaging", "化妆品包装"), copy("Perfume packaging", "香水包装"), copy("Gift boxes", "礼盒"), copy("Retail presentation packaging", "零售展示包装")],
    gallery: specialtyPdfGallery.slice(0, 3),
  },
  {
    slug: "pearlescent-paper",
    title: copy("Pearlescent Paper", "珠光纸"),
    description: copy("Choose pearlescent paper by color, surface and texture, with plain, colored and embossed directions to compare before production.", "按颜色、表面和纹理选择珠光纸，生产前可比较平面、彩色和压纹方向。"),
    image: specialtyPdfGallery[1],
    groups: [{ title: copy("Pearlescent directions", "珠光效果方向"), items: [copy("Plain pearlescent", "平面珠光"), copy("Colored pearlescent", "彩色珠光"), copy("Pearlescent embossed", "珠光压纹"), copy("White / ivory", "白色 / 象牙色"), copy("Pink, red and blue", "粉色、红色与蓝色"), copy("Gold, bronze, copper and black", "金色、青铜色、铜色与黑色")] }],
    finishes: [copy("Plain surface", "平面表面"), copy("Embossed texture", "压纹纹理"), copy("Printed decorative surface", "印花装饰表面")],
    colorsOrTextures: [copy("White and ivory", "白色与象牙色"), copy("Pink and red", "粉色与红色"), copy("Blue", "蓝色"), copy("Gold, bronze and copper", "金色、青铜色与铜色"), copy("Black", "黑色")],
    applications: [copy("Gift packaging", "礼品包装"), copy("Cosmetic packaging", "化妆品包装"), copy("Presentation sleeves", "展示纸套"), copy("Retail inserts", "零售内托")],
    gallery: specialtyPdfGallery.slice(1, 3),
  },
  {
    slug: "embossed-paper",
    title: copy("Embossed & Textured Paper", "压纹与纹理纸"),
    description: copy("Browse embossed and textured paper directions for packaging surfaces. Send us your artwork or reference sample and we can recommend suitable options.", "浏览包装表面的压纹与纹理纸方向，发送图稿或参考样品后，我们可以推荐合适的材料选项。"),
    image: specialtyPdfGallery[2],
    groups: [{ title: copy("Browse by texture", "按纹理浏览"), items: [copy("Linen", "亚麻"), copy("Rose", "玫瑰"), copy("Peony", "牡丹"), copy("Wave", "波浪"), copy("Yarn", "纱线"), copy("Wood grain", "木纹"), copy("Fish scale", "鱼鳞"), copy("Diamond", "菱形"), copy("Feather", "羽毛"), copy("Butterfly", "蝴蝶"), copy("Hairline", "发丝纹"), copy("Straw", "草编纹"), copy("Checker", "棋盘格"), copy("Vine", "藤蔓"), copy("Pearl", "珍珠"), copy("Lichee", "荔枝纹")] }],
    finishes: [copy("Embossed surface", "压纹表面"), copy("Colored embossed surface", "彩色压纹表面"), copy("Metallic embossed surface", "金属压纹表面"), copy("Printed texture direction", "印花纹理方向")],
    colorsOrTextures: [copy("Linen and hairline", "亚麻与发丝纹"), copy("Floral textures", "花卉纹理"), copy("Geometric textures", "几何纹理"), copy("Natural textures", "自然纹理")],
    applications: [copy("Cosmetic boxes", "化妆品盒"), copy("Perfume sleeves", "香水纸套"), copy("Gift packaging", "礼品包装"), copy("Retail display packaging", "零售展示包装")],
    gallery: specialtyPdfGallery.slice(2, 7),
  },
  {
    slug: "laser-paper",
    title: copy("Laser / Holographic Paper", "镭射 / 全息纸"),
    description: copy("Explore laser and holographic paper directions for packaging that needs a reflective or changing surface appearance. Samples are available before production.", "探索适用于反光或变化表面效果包装的镭射与全息纸方向，生产前可申请样品。"),
    image: specialtyPdfGallery[3],
    groups: [{ title: copy("Laser effect directions", "镭射效果方向"), items: [copy("Rainbow", "彩虹"), copy("Light beam", "光束"), copy("Snow", "雪花"), copy("Star", "星光"), copy("Water cube", "水立方"), copy("Holographic decorative effects", "全息装饰效果")] }],
    finishes: [copy("Laser surface effect", "镭射表面效果"), copy("Holographic decorative effect", "全息装饰效果"), copy("Printed surface combination", "印刷表面组合")],
    colorsOrTextures: [copy("Rainbow", "彩虹"), copy("Light beam", "光束"), copy("Snow", "雪花"), copy("Star", "星光"), copy("Water cube", "水立方")],
    applications: [copy("Security-oriented visual packaging", "强调视觉效果的包装"), copy("Gift boxes", "礼盒"), copy("Retail presentation packaging", "零售展示包装"), copy("Cosmetic and fragrance packaging", "化妆品与香氛包装")],
    gallery: specialtyPdfGallery.slice(3, 4),
  },
];

export function getMaterialCollection(slug: string) {
  return materialCollections.find((collection) => collection.slug === slug);
}
