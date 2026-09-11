export type NewsCitationEnhancement = {
  directAnswer: string;
  comparisonColumns: string[];
  comparisonRows: Array<Record<string, string>>;
  buyerChecklist: string[];
  sources: Array<{ label: string; href?: string }>;
};

const en = {
  "materials-formats-01": {
    directAnswer: "Paper cup fan blanks, PE-coated rolls and coated sheets are different converting formats. A fan is die-cut for a forming handoff; a roll feeds a continuous web; a sheet feeds cut stock. Compare them using the same paper, coating, GSM, quantity and equipment assumptions so the quotation reflects the actual material route rather than a different delivery format.",
    comparisonColumns: ["Format", "How it is supplied", "Best first confirmation"],
    comparisonRows: [
      { Format: "Cup fan blank", "How it is supplied": "Die-cut individual blank", "Best first confirmation": "Cup size and forming handoff" },
      { Format: "Coated roll", "How it is supplied": "Continuous web", "Best first confirmation": "Roll width, coating and machine feed" },
      { Format: "Coated sheet", "How it is supplied": "Cut sheets", "Best first confirmation": "Sheet size, grain and next process" },
    ],
    buyerChecklist: ["Application and finished size", "Paper, GSM and coating side", "Roll, sheet or fan handoff", "Quantity and destination market"],
    sources: [{ label: "Current Kehong material catalog", href: "/products?collection=materials" }, { label: "Buyer-supplied packaging details" }],
  },
  "packaging-brief-02": {
    directAnswer: "A takeout-box quotation is easier to review when the brief names the product, inside dimensions, opening style, material, artwork status, quantity and destination. These details describe the structure and converting route without assuming grease resistance, food-contact status or another performance claim. A photo, drawing or existing sample can fill gaps when the final dieline is not ready.",
    comparisonColumns: ["Brief item", "What to send", "Why it matters"],
    comparisonRows: [
      { "Brief item": "Product and use", "What to send": "Contents and handling", "Why it matters": "Separates tray, folding or window structures" },
      { "Brief item": "Dimensions and opening", "What to send": "Inside size, lid and insert", "Why it matters": "Sets the structure discussion" },
      { "Brief item": "Material and quantity", "What to send": "Paper preference, GSM and range", "Why it matters": "Keeps quotation assumptions visible" },
    ],
    buyerChecklist: ["Product and use case", "Inside dimensions and opening", "Paper or board preference", "Artwork status and print sides", "Quantity, market and sample path"],
    sources: [{ label: "Current Kehong packaging catalog", href: "/products?collection=packaging" }, { label: "Packaging structure review", href: "/contact?interest=structure-review" }],
  },
  "packaging-brief-03": {
    directAnswer: "Specify a corrugated mailer from the packed product outward: record the product footprint, clearance, closure, board or flute information, and any paper insert or divider. Review the insert with the closed box, not as a separate item. If board protection or the final structure is still open, request a structure review instead of assuming a fixed performance level.",
    comparisonColumns: ["Element", "Record", "Review together with"],
    comparisonRows: [
      { Element: "Packed product", Record: "Footprint, clearance and direction", "Review together with": "Inner cavity and closure" },
      { Element: "Board construction", Record: "Confirmed board or flute", "Review together with": "Print and converting route" },
      { Element: "Insert", Record: "Fold, fit and attachment", "Review together with": "Closed mailer and packing sequence" },
    ],
    buyerChecklist: ["Packed product dimensions", "Clearance and fragile points", "Confirmed board or open structure question", "Insert, divider or wrap preference", "Artwork and packing sequence"],
    sources: [{ label: "Corrugated mailer packaging", href: "/packaging/corrugated-mailer-boxes" }, { label: "Packaging selection guide", href: "/resources/packaging-selection-guide" }],
  },
  "packaging-brief-04": {
    directAnswer: "A paper-bag quotation starts with four connected inputs: paper, handle, printing and quantity. Add the finished dimensions, packed product, opening, artwork status and destination so the team can separate appearance decisions from structure and packing assumptions. A quantity range is acceptable for an initial discussion, while the final quotation should identify every open assumption.",
    comparisonColumns: ["Input", "Confirm", "Quotation impact"],
    comparisonRows: [
      { Input: "Paper", Confirm: "Visual preference and size", "Quotation impact": "Sets the material starting point" },
      { Input: "Handle", Confirm: "Style and attachment", "Quotation impact": "Defines structure and packing" },
      { Input: "Printing and quantity", Confirm: "Colors, artwork and range", "Quotation impact": "Defines converting assumptions" },
    ],
    buyerChecklist: ["Bag dimensions and packed product", "Paper preference", "Handle style and attachment", "Print colors and artwork status", "Quantity, destination and sample needs"],
    sources: [{ label: "Paper-bag packaging", href: "/packaging/paper-bags" }, { label: "Artwork handoff guide", href: "/resources/artwork-guidelines" }],
  },
  "bakery-packaging-05": {
    directAnswer: "Match a cake box, cake board and cake drum as one packed set. Confirm the cake footprint, board edge allowance, finished height, opening and any drum thickness before comparing sizes. Then review the material, surface and print areas against the selected products and sample brief. This prevents a board or drum from being treated as an unrelated item that changes the final presentation.",
    comparisonColumns: ["Component", "Confirm first", "Set-level check"],
    comparisonRows: [
      { Component: "Cake box", "Confirm first": "Footprint, height and opening", "Set-level check": "Loading and presentation" },
      { Component: "Cake board", "Confirm first": "Diameter and edge allowance", "Set-level check": "Fit inside box" },
      { Component: "Cake drum", "Confirm first": "Thickness and presentation role", "Set-level check": "Closed-box height" },
    ],
    buyerChecklist: ["Cake diameter or footprint", "Finished height", "Box opening and style", "Board or drum size and thickness", "Quantity, destination and reference photo"],
    sources: [{ label: "Cake boards and cake drums", href: "/products/cake-boards-and-drums" }, { label: "Bakery packaging formats", href: "/packaging/cake-boxes" }],
  },
  "sampling-preparation-06": {
    directAnswer: "Before packaging sampling, align the product, packed dimensions, material preference, quantity, artwork version, cut lines, folds, bleed and safe zones in one structure brief. Artwork communicates the visual layer; a dieline communicates the physical relationship. Use the sample to confirm size, opening, fit and presentation, then keep the revised artwork, dieline and review notes on the same version path.",
    comparisonColumns: ["Stage", "Prepare", "Visible decision"],
    comparisonRows: [
      { Stage: "Packaging details", Prepare: "Product, size, material and quantity", "Visible decision": "Scope for structure review" },
      { Stage: "Artwork handoff", Prepare: "Version, print area, bleed and safe zone", "Visible decision": "Approved visual layer" },
      { Stage: "Sample review", Prepare: "Fit, opening and presentation notes", "Visible decision": "Changes before next handoff" },
    ],
    buyerChecklist: ["Product and packed dimensions", "Material and quantity", "Artwork version and print areas", "Dieline cut/fold reference", "Sample review notes and next version"],
    sources: [{ label: "Artwork guidelines", href: "/resources/artwork-guidelines" }, { label: "Dielines and template request", href: "/resources/dielines-templates" }],
  },
} satisfies Record<string, NewsCitationEnhancement>;

const zh = {
  "materials-formats-01": {
    directAnswer: "纸杯扇形片、淋膜纸卷和平张纸的区别，首先在于供料形态和下一道工序。扇形片已完成模切，纸卷连续供料，平张以裁切后的纸张供料。比较时应同时确认纸张、淋膜、克重、数量和设备交接方式。",
    comparisonColumns: ["形态", "供料方式", "优先确认"],
    comparisonRows: [{ "形态": "杯纸扇形片", "供料方式": "单张模切片", "优先确认": "杯型尺寸与成型交接" }, { "形态": "淋膜纸卷", "供料方式": "连续纸卷", "优先确认": "卷宽、淋膜与设备送料" }, { "形态": "淋膜平张", "供料方式": "裁切平张", "优先确认": "平张尺寸、纸纹与下一工序" }],
    buyerChecklist: ["应用和成品尺寸", "纸张、克重和淋膜面", "纸卷、平张或扇形片交接", "数量和目的地"],
    sources: [{ label: "科宏现有纸材目录", href: "/products?collection=materials" }, { label: "买家提供的项目简报" }],
  },
  "packaging-brief-02": {
    directAnswer: "外带食品盒询价时，应同时写明产品、内尺寸、开合方式、材料、设计稿状态、数量和目的地。这些信息可以说明结构和加工路径，但不能自行推断防油、食品接触或其他性能。没有最终刀模图时，可补充参考照片、图纸或现有样品，帮助团队先完成结构评审。",
    comparisonColumns: ["简报项目", "需要提供", "作用"],
    comparisonRows: [{ "简报项目": "产品与用途", "需要提供": "装什么、如何使用", "作用": "区分托盘、折叠盒等结构" }, { "简报项目": "尺寸与开合", "需要提供": "内尺寸、盒盖和内托", "作用": "确定结构讨论范围" }, { "简报项目": "材料与数量", "需要提供": "纸张偏好、克重和区间", "作用": "让报价假设可追踪" }],
    buyerChecklist: ["产品和使用方式", "内尺寸与开合", "纸张或纸板偏好", "设计稿状态与印刷面", "数量、市场和样品路径"],
    sources: [{ label: "科宏现有成品包装目录", href: "/products?collection=packaging" }, { label: "包装结构评审", href: "/contact?interest=structure-review" }],
  },
  "packaging-brief-03": {
    directAnswer: "瓦楞邮寄盒应从装入的产品开始确认：记录产品占位、间隙、闭合方式、纸板或坑型信息，以及纸质内托或隔板。内托要和合上的盒体一起评审，而不是单独看。如果纸板保护要求或结构仍未确定，应申请结构评审，不要自行假定固定性能。",
    comparisonColumns: ["要素", "需要记录", "一起评审"],
    comparisonRows: [{ "要素": "装入产品", "需要记录": "占位、间隙和方向", "一起评审": "内腔与闭合" }, { "要素": "纸板结构", "需要记录": "已确认纸板或坑型", "一起评审": "印刷与加工路径" }, { "要素": "内托", "需要记录": "折法、适配和固定", "一起评审": "合上的邮寄盒与装箱顺序" }],
    buyerChecklist: ["装好后的产品尺寸", "间隙和易碰撞部位", "已确认纸板或待评审结构", "内托、隔板或包裹偏好", "设计稿和装箱顺序"],
    sources: [{ label: "瓦楞邮寄盒包装", href: "/packaging/corrugated-mailer-boxes" }, { label: "包装选型指南", href: "/resources/packaging-selection-guide" }],
  },
  "packaging-brief-04": {
    directAnswer: "纸袋询价可以从纸张、提手、印刷和数量四项开始，再补充成品尺寸、装入产品、袋口、设计稿状态和目的地。这样能把外观选择与结构、包装假设分开讨论。第一次沟通可以提供数量区间，最终报价则应明确每一项仍待确认的条件。",
    comparisonColumns: ["项目", "确认内容", "对报价的影响"],
    comparisonRows: [{ "项目": "纸张", "确认内容": "外观偏好和尺寸", "对报价的影响": "确定材料起点" }, { "项目": "提手", "确认内容": "形式和固定方式", "对报价的影响": "影响结构与包装" }, { "项目": "印刷与数量", "确认内容": "颜色、稿件和区间", "对报价的影响": "确定加工假设" }],
    buyerChecklist: ["纸袋尺寸和装入产品", "纸张偏好", "提手形式与固定", "印刷颜色和设计稿状态", "数量、目的地和样品需求"],
    sources: [{ label: "纸袋包装分类", href: "/packaging/paper-bags" }, { label: "设计稿交接指南", href: "/resources/artwork-guidelines" }],
  },
  "bakery-packaging-05": {
    directAnswer: "蛋糕盒、蛋糕底托和蛋糕鼓应作为一个装配组合来匹配。先确认蛋糕占地、底托边缘余量、成品高度、盒子开合方式和蛋糕鼓厚度，再比较尺寸。之后将材料、表面和印刷区域与选定产品及样品简报对应，避免某一件配件改变整体展示比例。",
    comparisonColumns: ["组件", "优先确认", "组合检查"],
    comparisonRows: [{ "组件": "蛋糕盒", "优先确认": "占地、高度和开合", "组合检查": "装入与展示" }, { "组件": "蛋糕底托", "优先确认": "直径和边缘余量", "组合检查": "盒内适配" }, { "组件": "蛋糕鼓", "优先确认": "厚度和展示作用", "组合检查": "合盒后的高度" }],
    buyerChecklist: ["蛋糕直径或占地", "成品高度", "盒型和开合", "底托或蛋糕鼓尺寸与厚度", "数量、目的地和参考照片"],
    sources: [{ label: "蛋糕底托与蛋糕鼓", href: "/products/cake-boards-and-drums" }, { label: "烘焙包装分类", href: "/packaging/cake-boxes" }],
  },
  "sampling-preparation-06": {
    directAnswer: "包装打样前，应把产品、包装后尺寸、材料偏好、数量、设计稿版本、切线、折线、出血和安全区整理到同一份结构简报中。设计稿表达视觉层，刀模图表达实体关系。样品用于确认尺寸、开合、适配和展示，评审后要让新版设计稿、刀模图和备注保持同一版本路径。",
    comparisonColumns: ["阶段", "准备内容", "需要确认"],
    comparisonRows: [{ "阶段": "项目简报", "准备内容": "产品、尺寸、材料和数量", "需要确认": "结构评审范围" }, { "阶段": "设计稿交接", "准备内容": "版本、印刷区、出血和安全区", "需要确认": "视觉层版本" }, { "阶段": "样品评审", "准备内容": "适配、开合和展示备注", "需要确认": "下一版修改" }],
    buyerChecklist: ["产品和包装后尺寸", "材料和数量", "设计稿版本与印刷区", "刀模图切线和折线", "样品评审备注与下一版"],
    sources: [{ label: "设计稿指南", href: "/resources/artwork-guidelines" }, { label: "刀模图与模板申请", href: "/resources/dielines-templates" }],
  },
} satisfies Record<string, NewsCitationEnhancement>;

export function getNewsEnhancement(locale: "en" | "zh", translationKey: string): NewsCitationEnhancement {
  return (locale === "zh" ? zh : en)[translationKey as keyof typeof en] ?? (locale === "zh" ? zh : en)["materials-formats-01"];
}
