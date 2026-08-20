import type { SiteHref } from "@/lib/site-config";
import { getNewsEnhancement, type NewsCitationEnhancement } from "@/content/news/citationEnhancements";

export type NewsLocale = "en" | "zh";
export type NewsType = "company-news" | "insight" | "buying-guide";

export type NewsLink = {
  href: SiteHref;
  en: string;
  zh: string;
};

export type NewsSection = {
  heading: string;
  paragraphs: string[];
};

export type NewsArticle = {
  slug: string;
  locale: NewsLocale;
  translationKey: string;
  type: NewsType;
  category: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  coverImage: string;
  coverAlt: string;
  tags: string[];
  sections: NewsSection[];
  relatedLinks: NewsLink[];
  cta: NewsLink;
  socialExcerpt: string;
  published: boolean;
  directAnswer?: NewsCitationEnhancement["directAnswer"];
  comparisonColumns?: NewsCitationEnhancement["comparisonColumns"];
  comparisonRows?: NewsCitationEnhancement["comparisonRows"];
  buyerChecklist?: NewsCitationEnhancement["buyerChecklist"];
  sources?: NewsCitationEnhancement["sources"];
};

const sharedAuthor = {
  en: "Foshan Kehong Paper Products Co., Ltd. Editorial Team",
  zh: "佛山科宏纸品有限公司编辑部",
} as const;

const articles: NewsArticle[] = [
  {
    slug: "paper-cup-fans-coated-rolls-sheets-difference",
    locale: "en",
    translationKey: "materials-formats-01",
    type: "insight",
    category: "Materials & converting",
    title: "Paper cup fans, coated rolls and coated sheets: what is the difference?",
    description: "A practical way to compare cup fan blanks, PE-coated rolls and coated sheets before a paper-cup material brief is quoted.",
    excerpt: "Start with the converting format, coating requirement and machine handoff—not just the paper name.",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-06",
    author: sharedAuthor.en,
    coverImage: "/media/materials/colored-paper-cup-fan-reference.jpg",
    coverAlt: "Paper cup fan blanks and coated paper material",
    tags: ["cupstock", "coated paper", "formats"],
    sections: [
      { heading: "Three formats, three handoffs", paragraphs: ["A paper cup fan is a die-cut blank that is ready for the next forming step. A coated roll is supplied as a continuous web, while a coated sheet is supplied as cut sheets. The right choice depends on the buyer's converting equipment, artwork route and packing preference.", "These terms describe a format, not a promise about a particular paper grade. A useful brief names the intended product, the required GSM, the coating side and whether the next process expects a roll, sheet or fan blank."] },
      { heading: "What to confirm before comparing prices", paragraphs: ["Record the cup or container size, paper direction, coating requirement, print method and estimated quantity. If the buyer already has a forming line, the material handoff should match its feeding method. If the project is still at concept stage, a sample or reference drawing helps the team discuss the feasible blank format.", "A side-by-side comparison is most useful when the same paper, coating and quantity assumptions are used. Otherwise a lower unit price may simply represent a different level of converting or a different delivery format."] },
      { heading: "A cleaner inquiry path", paragraphs: ["Send the intended application, dimensions, material preference and destination together. Kehong can then separate material selection from any die-cutting or printing discussion and keep the quotation tied to the approved brief."] },
    ],
    relatedLinks: [
      { href: "/products?collection=materials", en: "Browse paper materials", zh: "查看纸材产品" },
      { href: "/resources/cupstock-vs-pe-coated-paper", en: "Cupstock and PE-coated paper guide", zh: "杯纸与 PE 淋膜纸指南" },
      { href: "/contact?interest=pe-coated-paper-roll", en: "Ask about a material format", zh: "咨询材料形态" },
    ],
    cta: { href: "/contact?interest=pe-coated-paper-roll", en: "Discuss a cupstock brief", zh: "提交杯纸项目需求" },
    socialExcerpt: "Compare paper cup fan blanks, coated rolls and coated sheets by the converting handoff, coating requirement and project brief.",
    published: true,
  },
  {
    slug: "takeout-box-quotation-six-details",
    locale: "en",
    translationKey: "packaging-brief-02",
    type: "buying-guide",
    category: "Packaging buying guides",
    title: "Six details to confirm before requesting a takeout-box quotation",
    description: "Use six practical details to turn a takeout-box idea into a clearer quotation brief without guessing at unconfirmed performance claims.",
    excerpt: "Product, dimensions, material, opening, artwork and quantity make the first packaging conversation more useful.",
    publishedAt: "2026-08-05",
    updatedAt: "2026-08-05",
    author: sharedAuthor.en,
    coverImage: "/media/products/food-packaging/food-packaging-box-reference-02.jpg",
    coverAlt: "Unbranded takeaway paper boxes",
    tags: ["takeout boxes", "quotation", "brief"],
    sections: [
      { heading: "1. Product and use", paragraphs: ["Start with what the box will hold and how it will be handled. A short use description helps the team distinguish a tray, folding box, window box or another structure before dimensions are discussed."] },
      { heading: "2. Dimensions and opening", paragraphs: ["Share the inside dimensions where possible, plus the opening direction, lid style and any insert. A reference photo or an existing box is useful when a drawing is not ready."] },
      { heading: "3. Material and surface", paragraphs: ["Name the paper or board preference, target GSM if known, print sides and any requested finish. Keep material selection separate from claims such as grease resistance or food-contact compliance; those require a project-specific review and supporting documents."] },
      { heading: "4. Artwork and 5. quantity", paragraphs: ["Artwork files, brand colors and the expected order quantity help define the production path. If artwork is not ready, say so rather than attaching an unapproved version. Quantity can be a range at the first discussion, then refined with the structure and packing plan."] },
      { heading: "6. Destination and next step", paragraphs: ["Add the target market, packing preference and requested sample path. A complete first message lets the sales team return with the missing questions instead of restarting the brief."] },
    ],
    relatedLinks: [
      { href: "/packaging/takeout-boxes", en: "Explore takeout-box formats", zh: "查看外带食品盒分类" },
      { href: "/products?collection=packaging", en: "Review packaging products", zh: "查看成品包装产品" },
      { href: "/resources/artwork-guidelines", en: "Prepare artwork files", zh: "准备设计稿文件" },
      { href: "/contact?interest=structure-review", en: "Send a takeout-box brief", zh: "提交外带食品盒需求" },
    ],
    cta: { href: "/contact?interest=structure-review", en: "Start a takeout-box inquiry", zh: "发起外带食品盒询盘" },
    socialExcerpt: "Six details make a takeout-box quotation easier to review: product, dimensions, material, opening, artwork, quantity and destination.",
    published: true,
  },
  {
    slug: "corrugated-mailer-dimensions-board-inserts",
    locale: "en",
    translationKey: "packaging-brief-03",
    type: "buying-guide",
    category: "Packaging buying guides",
    title: "How to specify dimensions, board and inserts for corrugated mailer boxes",
    description: "A buyer-friendly structure brief for corrugated mailer boxes, from product footprint to board construction and paper inserts.",
    excerpt: "A mailer brief should connect the product footprint, board construction, closure and insert—not list them in isolation.",
    publishedAt: "2026-08-04",
    updatedAt: "2026-08-04",
    author: sharedAuthor.en,
    coverImage: "/media/packaging/kraft-cartons-tall-reference.jpg",
    coverAlt: "Corrugated mailer cartons prepared for dispatch",
    tags: ["corrugated mailers", "inserts", "ecommerce packaging"],
    sections: [
      { heading: "Begin with the packed product", paragraphs: ["Measure the packed product, not only the product itself. Note fragile edges, accessories, clearance and the direction in which the item enters the mailer. Those facts shape the internal footprint and the closure sequence.", "If several items share a box, include the arrangement and whether the buyer wants a paper insert, divider or simple wrap. A quick sketch can be more useful than a long description."] },
      { heading: "Describe the board construction", paragraphs: ["Use the board or flute information already confirmed for the project and distinguish it from the outer paper appearance. If the board specification is still open, ask for a structure review rather than assuming a fixed protection level.", "The outside print area, inside print preference and closure method should be noted alongside the board. This keeps artwork, converting and packing discussions connected."] },
      { heading: "Review inserts with the structure", paragraphs: ["Paper inserts can keep a product positioned, separate components or create a presentation layer. Their dimensions, folds and attachment method should be reviewed with the mailer, because an insert that looks correct alone may not fit the closed box.", "Share a product sample or reference image when available. The final brief should record the approved dimensions, board, insert and packing sequence before artwork moves to a dieline."] },
    ],
    relatedLinks: [
      { href: "/packaging/corrugated-mailer-boxes", en: "Corrugated mailer packaging", zh: "瓦楞邮寄盒包装" },
      { href: "/products?collection=packaging", en: "Review packaging products", zh: "查看成品包装" },
      { href: "/resources/packaging-selection-guide", en: "Packaging selection guide", zh: "包装选型指南" },
      { href: "/contact?interest=structure-review", en: "Request a structure review", zh: "申请结构评审" },
    ],
    cta: { href: "/contact?interest=structure-review", en: "Discuss a corrugated mailer", zh: "咨询瓦楞邮寄盒" },
    socialExcerpt: "Specify corrugated mailers from the packed product outward: footprint, board construction, closure and insert fit.",
    published: true,
  },
  {
    slug: "paper-bag-quotation-paper-handles-printing-quantity",
    locale: "en",
    translationKey: "packaging-brief-04",
    type: "buying-guide",
    category: "Packaging buying guides",
    title: "Paper bag quotation guide: paper, handles, printing and quantity",
    description: "The four-part paper bag brief that helps a buyer compare structure, appearance and packing requirements before quotation.",
    excerpt: "Paper, handle, print and quantity are the starting points for a paper bag discussion.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    author: sharedAuthor.en,
    coverImage: "/media/applications/kraft-paper-bag-reference.jpg",
    coverAlt: "Kraft paper bag used as a packaging reference",
    tags: ["paper bags", "printing", "quotation"],
    sections: [
      { heading: "Paper choice follows the brief", paragraphs: ["Record the bag dimensions, target appearance and intended handling before choosing a paper. Kraft and white paper create different visual starting points, while the final specification also depends on size, print coverage and packing method."] },
      { heading: "Handle and opening details", paragraphs: ["Name the handle style, attachment position and opening width. If the bag must fit a particular product or retail display, include the packed product dimensions and a reference image. These details keep the structural conversation concrete."] },
      { heading: "Printing, quantity and destination", paragraphs: ["Share print colors, artwork status, estimated quantity and target market. A quantity range is acceptable for the first conversation, but the quotation should identify which assumptions are still open.", "When the brief is ready, Kehong can connect the paper bag structure with artwork preparation, sampling and packing review. No performance or certification statement should be inferred from the bag name alone."] },
    ],
    relatedLinks: [
      { href: "/packaging/paper-bags", en: "Explore paper bags", zh: "查看纸袋分类" },
      { href: "/products?collection=packaging", en: "Review packaging products", zh: "查看成品包装产品" },
      { href: "/resources/artwork-guidelines", en: "Artwork handoff guide", zh: "设计稿交接指南" },
      { href: "/contact?interest=artwork-review", en: "Share a paper-bag brief", zh: "提交纸袋需求" },
    ],
    cta: { href: "/contact?interest=artwork-review", en: "Start a paper-bag inquiry", zh: "发起纸袋询盘" },
    socialExcerpt: "A clearer paper-bag quotation begins with paper, handle, printing, quantity and the packed-product brief.",
    published: true,
  },
  {
    slug: "cake-boxes-boards-drums-match",
    locale: "en",
    translationKey: "bakery-packaging-05",
    type: "insight",
    category: "Applications & markets",
    title: "How to match cake boxes with cake boards and cake drums",
    description: "A practical bakery-packaging review of the relationship between box footprint, cake board size, height and presentation.",
    excerpt: "The box, board and drum should be reviewed as one packed set so the size and presentation stay aligned.",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    author: sharedAuthor.en,
    coverImage: "/media/products/cake-boards/cake-board-reference-01.jpg",
    coverAlt: "Cake boards and bakery packaging components",
    tags: ["cake boxes", "cake boards", "bakery packaging"],
    sections: [
      { heading: "Start with the finished presentation", paragraphs: ["A cake box and its board are usually handled together. Confirm the cake diameter or footprint, the board edge allowance, the finished height and the way the box opens. If a drum or spacer is part of the presentation, record its thickness as well.", "A board that is too close to the box wall can make loading harder, while an oversized board can change the visual proportion. Reviewing the set avoids treating each item as an unrelated SKU."] },
      { heading: "Match material and appearance", paragraphs: ["Describe the board finish, the box window or opening, and the print area that matters to the brand. The material and surface conversation should stay tied to the approved product data and the requested sample, rather than a generic promise about performance."] },
      { heading: "Prepare the bakery inquiry", paragraphs: ["Send the cake dimensions, box style, board or drum preference, quantity and destination. A reference photo helps the team distinguish a celebration cake presentation from a bakery transport format. The final project brief can then connect the selected packaging with artwork, sampling and packing review."] },
    ],
    relatedLinks: [
      { href: "/products/cake-boxes", en: "Cake boxes", zh: "蛋糕盒" },
      { href: "/products/cake-boards-and-drums", en: "Cake boards and cake drums", zh: "蛋糕底托与蛋糕鼓" },
      { href: "/packaging/cake-boxes", en: "Bakery packaging formats", zh: "烘焙包装分类" },
      { href: "/resources/packaging-selection-guide", en: "Packaging selection guide", zh: "包装选型指南" },
      { href: "/contact?interest=structure-review", en: "Discuss bakery packaging", zh: "咨询烘焙包装" },
    ],
    cta: { href: "/contact?interest=structure-review", en: "Plan a bakery packaging set", zh: "规划烘焙包装组合" },
    socialExcerpt: "Match cake boxes, cake boards and cake drums as one packed set: footprint, height, opening and presentation all matter.",
    published: true,
  },
  {
    slug: "artwork-to-dielines-packaging-sampling",
    locale: "en",
    translationKey: "sampling-preparation-06",
    type: "buying-guide",
    category: "Packaging buying guides",
    title: "From artwork to dielines: what to prepare before packaging sampling",
    description: "A clear handoff sequence for artwork, dimensions, material and dieline review before a packaging sample is made.",
    excerpt: "Good sampling starts with a shared structure brief, not a file sent without dimensions or version notes.",
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-01",
    author: sharedAuthor.en,
    coverImage: "/media/resources/artwork-guide-cover-reference.jpg",
    coverAlt: "Representative packaging artwork and dieline preparation",
    tags: ["artwork", "dielines", "sampling"],
    sections: [
      { heading: "Prepare the project brief", paragraphs: ["Start with the product, packed dimensions, material preference, quantity and target market. Add a reference image or existing structure when available. The goal is to give the structural review enough context before a dieline or sample is discussed."] },
      { heading: "Separate artwork from structure", paragraphs: ["Artwork files communicate the visual layer; a dieline communicates cut, fold and panel relationships. Keep version names clear and mark the approved structure, print areas, bleed and safe zones. If the structure is still open, request a dieline review instead of forcing artwork onto an unconfirmed template."] },
      { heading: "Use the sample to confirm the brief", paragraphs: ["A sample creates a tangible checkpoint for size, opening, fit and presentation. Record the changes after review and keep the revised artwork, dieline and sample notes aligned. This creates a clearer handoff to converting and packing without adding unsupported promises about timing or performance."] },
    ],
    relatedLinks: [
      { href: "/resources/artwork-guidelines", en: "Artwork guidelines", zh: "设计稿指南" },
      { href: "/resources/dielines-templates", en: "Dielines and templates", zh: "刀模图与模板申请" },
      { href: "/products?collection=packaging", en: "Review packaging products", zh: "查看成品包装产品" },
      { href: "/contact?interest=artwork-review", en: "Prepare a sampling brief", zh: "准备打样需求" },
    ],
    cta: { href: "/contact?interest=artwork-review", en: "Review artwork and sampling", zh: "评审设计稿与打样" },
    socialExcerpt: "Before packaging sampling, align artwork versions with dimensions, material, cut lines, folds and the approved structure brief.",
    published: true,
  },
];

const zhArticles: NewsArticle[] = [
  {
    ...articles[0],
    locale: "zh",
    category: "材料与工艺",
    title: "纸杯扇形片、淋膜纸卷和平张纸有什么区别",
    description: "从加工形态、淋膜要求和设备交接出发，比较纸杯扇形片、淋膜纸卷和平张纸。",
    excerpt: "先确认加工形态、淋膜要求和设备交接方式，再比较纸材名称。",
    author: sharedAuthor.zh,
    coverAlt: "用于包装加工的纸杯扇形片与淋膜纸材",
    sections: [
      { heading: "三种形态对应三种交接方式", paragraphs: ["纸杯扇形片是已经模切好的扇形片，下一步可进入成型加工；淋膜纸卷以连续纸卷形式供料；淋膜平张则以裁切后的平张形式供料。选择哪一种，取决于买家的加工设备、设计稿流程和包装方式。", "这些名称描述的是供料形态，并不等于某一个固定纸种。清晰的需求应同时写明用途、克重、淋膜面，以及下一道工序需要纸卷、平张还是扇形片。"] },
      { heading: "报价前需要确认什么", paragraphs: ["可以先整理杯型或容器尺寸、纸张方向、淋膜要求、印刷方式和预计数量。如果已有成型设备，应让材料形态匹配设备的送料方式；如果仍处于概念阶段，可以提供样品或结构参考图，先讨论可行形态。", "比较价格时要保持纸张、淋膜、数量和加工假设一致。否则单价差异可能只是供料形态或加工深度不同。"] },
      { heading: "让询盘更容易评审", paragraphs: ["把应用、尺寸、材料偏好和目的地放在同一份需求中。科宏可以据此分别讨论材料选择、模切和印刷，让报价始终对应已经确认的项目条件。"] },
    ],
  },
  {
    ...articles[1],
    locale: "zh",
    category: "包装采购指南",
    title: "外带食品盒询价前需要确认的 6 项信息",
    description: "用 6 项实用信息，把外带食品盒需求整理成更清晰的报价简报，不预设未经确认的性能表述。",
    excerpt: "产品、尺寸、材料、开合方式、设计稿和数量，是第一次包装沟通的基础。",
    author: sharedAuthor.zh,
    coverAlt: "无品牌外带食品纸盒",
    sections: [
      { heading: "1. 产品与使用方式", paragraphs: ["先说明纸盒要装什么、如何取放和如何使用。简短的用途说明有助于区分托盘、折叠盒、开窗盒或其他结构，再进入尺寸讨论。"] },
      { heading: "2. 尺寸与开合", paragraphs: ["尽量提供内尺寸，同时说明开口方向、盒盖形式和是否需要内托。没有图纸时，一张参考照片或现有纸盒也能帮助结构评审。"] },
      { heading: "3. 材料与表面", paragraphs: ["写明纸张或纸板偏好、已知克重、印刷面和希望的表面工艺。防油或食品接触等表述需要项目评审和支持文件，不能仅凭产品名称推断。"] },
      { heading: "4. 设计稿与 5. 数量", paragraphs: ["提供设计稿文件、品牌色和预计数量，可以帮助确认加工路径。设计稿未准备好时应明确说明，不要把未经确认的版本当作最终文件。第一次沟通可以提供数量区间，后续再结合结构和包装方式细化。"] },
      { heading: "6. 目的地与下一步", paragraphs: ["补充目标市场、包装偏好和是否需要样品。完整的第一条消息能让销售团队直接指出缺少的信息，而不是重新开始整理。"] },
    ],
  },
  {
    ...articles[2],
    locale: "zh",
    category: "包装采购指南",
    title: "瓦楞邮寄盒如何确认尺寸、纸板和内托",
    description: "从产品尺寸、纸板结构、闭合方式和纸质内托出发，整理瓦楞邮寄盒的结构需求。",
    excerpt: "邮寄盒需求应把产品尺寸、纸板结构、闭合方式和内托配合放在一起说明。",
    author: sharedAuthor.zh,
    coverAlt: "准备出货的瓦楞邮寄盒",
    sections: [
      { heading: "先从装入的产品开始", paragraphs: ["测量装好后的产品，而不只是产品本身。标出易碰撞的边角、配件、需要的间隙和产品放入邮寄盒的方向。这些信息共同决定内腔尺寸和闭合顺序。", "如果一个盒子要装多个物品，还要说明排列方式，以及是否需要纸质内托、隔板或简单包裹。一张简图有时比长段描述更容易评审。"] },
      { heading: "说明纸板结构", paragraphs: ["使用项目中已经确认的纸板或坑型信息，并把纸板结构和外观纸层分开说明。如果纸板规格尚未确定，应申请结构评审，不要自行假定固定保护效果。", "外部印刷区域、内部印刷需求和闭合方式也应与纸板一起记录，这样设计稿、加工和装箱讨论才能保持一致。"] },
      { heading: "让内托与结构一起确认", paragraphs: ["纸质内托可以帮助产品定位、分隔配件或形成展示层。内托尺寸、折法和固定方式需要与邮寄盒一同评审，因为单独看起来合适的内托，装入合上的纸盒后不一定匹配。", "如有产品样品或参考图，建议一并提供。最终简报应记录已经确认的尺寸、纸板、内托和包装顺序，再进入设计稿与刀模图交接。"] },
    ],
  },
  {
    ...articles[3],
    locale: "zh",
    category: "包装采购指南",
    title: "纸袋询价：纸张、提手、印刷和数量",
    description: "从纸张、提手、印刷和数量四个方面整理纸袋结构、外观和包装需求。",
    excerpt: "纸张、提手、印刷和数量，是纸袋询价的四个起点。",
    author: sharedAuthor.zh,
    coverAlt: "纸袋包装参考",
    sections: [
      { heading: "纸张选择要跟着需求走", paragraphs: ["在选择纸张前，先记录纸袋尺寸、目标外观和使用方式。牛皮纸和白纸是不同的视觉起点，最终规格还与尺寸、印刷覆盖和包装方式有关。"] },
      { heading: "确认提手与袋口", paragraphs: ["写明提手形式、固定位置和袋口宽度。如果纸袋需要匹配某个产品或货架展示，也应提供产品尺寸和参考图，让结构讨论有明确依据。"] },
      { heading: "一起说明印刷、数量和目的地", paragraphs: ["提供印刷颜色、设计稿状态、预计数量和目标市场。第一次沟通可以使用数量区间，但报价应标出仍需确认的假设。", "需求清晰后，科宏可以把纸袋结构、设计稿、打样和包装评审连接起来。不能仅凭纸袋名称推断未经确认的性能或认证表述。"] },
    ],
  },
  {
    ...articles[4],
    locale: "zh",
    category: "应用与市场",
    title: "蛋糕盒与蛋糕底托如何搭配",
    description: "从盒内尺寸、蛋糕底托、蛋糕鼓厚度和展示方式出发，整理烘焙包装组合的评审重点。",
    excerpt: "蛋糕盒、底托和蛋糕鼓应作为一个装配组合评审，尺寸和展示效果才能一致。",
    author: sharedAuthor.zh,
    coverAlt: "蛋糕底托与烘焙包装组件",
    sections: [
      { heading: "先确认成品展示方式", paragraphs: ["蛋糕盒和底托通常需要一起使用。先确认蛋糕直径或占地尺寸、底托边缘余量、成品高度和盒子的打开方式。如果展示组合包含蛋糕鼓或垫高件，还要记录其厚度。", "底托贴近盒壁可能增加装入难度，底托过大也会改变整体比例。把组合放在一起评审，可以避免把每件产品当成互不相关的单品。"] },
      { heading: "材料和外观一起说明", paragraphs: ["说明底托表面、盒窗或开口，以及品牌真正关心的印刷区域。材料和工艺讨论应保持在已经确认的产品数据和样品需求范围内，不从通用描述推导额外性能。"] },
      { heading: "准备烘焙包装询盘", paragraphs: ["把蛋糕尺寸、盒型、底托或蛋糕鼓偏好、数量和目的地放在一起。参考照片可以帮助区分庆典蛋糕展示和日常烘焙运输需求，后续再连接设计稿、打样和包装评审。"] },
    ],
  },
  {
    ...articles[5],
    locale: "zh",
    category: "包装采购指南",
    title: "从设计稿到刀模图：包装打样前需要准备什么",
    description: "整理包装设计稿、尺寸、材料和刀模图交接，让打样前的结构评审更清晰。",
    excerpt: "好的打样从共同确认的结构简报开始，而不是把没有尺寸和版本说明的文件直接发出。",
    author: sharedAuthor.zh,
    coverAlt: "包装设计稿与刀模图准备示意",
    sections: [
      { heading: "先整理项目简报", paragraphs: ["从产品、包装后尺寸、材料偏好、数量和目标市场开始。可以加入参考图或现有结构。目的不是一次写完所有答案，而是让结构评审在进入刀模图或样品讨论前获得足够背景。"] },
      { heading: "把设计稿与结构分开", paragraphs: ["设计稿表达视觉层，刀模图表达切线、折线和版面关系。文件名、版本、印刷区域、出血和安全区都要保持清楚。如果结构尚未确认，应先申请刀模图评审，不要把设计稿强行套到未确认的模板上。"] },
      { heading: "用样品确认简报", paragraphs: ["样品可以成为尺寸、开合、适配和展示方式的可视化检查点。评审后记录修改内容，并让新版设计稿、刀模图和样品备注保持对应。这样能帮助后续加工和装箱交接，同时不增加未经确认的交期或性能承诺。"] },
    ],
  },
];

for (const article of zhArticles) {
  article.relatedLinks = articles.find((item) => item.translationKey === article.translationKey)!.relatedLinks;
  article.cta = articles.find((item) => item.translationKey === article.translationKey)!.cta;
  article.socialExcerpt = article.excerpt;
  article.tags = article.tags.map((tag) => tag);
}

export const newsArticles = [...articles, ...zhArticles].map((article) => ({
  ...article,
  ...getNewsEnhancement(article.locale, article.translationKey),
}));

export function getPublishedNews(locale: NewsLocale) {
  return newsArticles
    .filter((article) => article.locale === locale && article.published)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getNewsArticle(locale: NewsLocale, slug: string) {
  return newsArticles.find((article) => article.locale === locale && article.slug === slug && article.published);
}

export function getNewsSlugs() {
  return articles.map((article) => article.slug);
}

export function getNewsTranslation(locale: NewsLocale, translationKey: string) {
  return newsArticles.find((article) => article.locale === locale && article.translationKey === translationKey && article.published);
}

export const NEWS_CATEGORIES = {
  en: ["Company updates", "Materials & converting", "Packaging buying guides", "Applications & markets"],
  zh: ["公司动态", "材料与工艺", "包装采购指南", "应用与市场"],
} as const;
