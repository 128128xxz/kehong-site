export type Capability = {
  slug: string;
  title: string;
  summary: string;
  buyerValue: string;
  input: string;
};

export type ResourceItem = {
  slug: string;
  title: string;
  type: "guide" | "request";
  summary: string;
  topics: string[];
};

export type ComplianceDocument = {
  title: string;
  documentType: "test-report" | "certificate" | "declaration" | "other";
  status: "available-upon-request" | "public";
};

export const capabilities: Capability[] = [
  { slug: "structural-design", title: "Structural Design", summary: "Review the product footprint, opening, support and packing sequence before quotation.", buyerValue: "A clearer structure brief helps reduce fit and assembly surprises.", input: "Product dimensions, reference images or an existing dieline." },
  { slug: "artwork-prepress", title: "Artwork & Prepress", summary: "Coordinate artwork checks, print areas and version notes against the approved structure.", buyerValue: "Your team sees what needs confirmation before production files move forward.", input: "Artwork, brand colors, logo files and target print method." },
  { slug: "prototyping", title: "Prototyping", summary: "Use structural samples to review size, fit, opening and handling before production.", buyerValue: "Samples turn a packaging idea into a reviewable physical direction.", input: "Target dimensions, product sample or reference structure." },
  { slug: "printing-finishing", title: "Printing & Finishing", summary: "Coordinate print direction and available surface treatments around the material and structure.", buyerValue: "The finish decision stays connected to substrate, artwork and use case.", input: "Print colors, reference finish and application priorities." },
  { slug: "die-cutting-assembly", title: "Die Cutting & Assembly", summary: "Review panels, folds, cut lines, gluing and assembly requirements as one workflow.", buyerValue: "Clear structural handoff supports repeatable converting and packing.", input: "Dieline, structure drawing or a physical reference." },
  { slug: "quality-control", title: "Quality Control", summary: "Use specification, artwork, dimension, finishing and final packing checks through the project.", buyerValue: "Quality checkpoints are tied to the project brief instead of generic claims.", input: "Approved specification, artwork and inspection priorities." },
  { slug: "packing-export-support", title: "Packing & Export Support", summary: "Coordinate packing information and destination requirements for overseas B2B projects.", buyerValue: "The handoff keeps product, packing and destination details aligned.", input: "Destination country, packing preference and shipping brief." },
];

export const processSteps = [
  { number: "01", title: "Inquiry", body: "Share the product, dimensions, quantity and target market." },
  { number: "02", title: "Structure Review", body: "Confirm material direction, format, opening, fit and project constraints." },
  { number: "03", title: "Sample", body: "Review a structural or project sample when the brief requires it." },
  { number: "04", title: "Production", body: "Move the approved specification into printing, converting and assembly." },
  { number: "05", title: "Quality Check", body: "Review agreed checkpoints before packing and shipment." },
  { number: "06", title: "Export Handoff", body: "Align packing, destination and document details for dispatch." },
];

export const resourceItems: ResourceItem[] = [
  { slug: "artwork-guidelines", title: "Artwork Guidelines", type: "guide", summary: "A practical checklist for artwork handoff, color communication and file versions.", topics: ["CMYK and Pantone communication", "Bleed, safe area and cut/fold lines", "Fonts, vectors and image resolution", "Accepted file formats"] },
  { slug: "dieline-template-request", title: "Dieline & Template Request", type: "request", summary: "Request a structure-specific dieline or template after the product format and dimensions are clear.", topics: ["Packaging format", "Target dimensions", "Product fit and opening", "Artwork handoff requirement"] },
  { slug: "materials-guide", title: "Materials Guide", type: "guide", summary: "Compare paper, board and corrugated directions by structure, appearance and use.", topics: ["Paper and board selection", "Structure and application", "Surface limitations", "Project-confirmed specifications"] },
  { slug: "cupstock-vs-pe-coated-paper", title: "Cupstock vs PE Coated Paper", type: "guide", summary: "Clarify the starting material, conversion format and coating question before a cupstock project is quoted.", topics: ["Cupstock and converting components", "Roll, sheet and fan blank formats", "Coating direction", "GSM and application brief"] },
  { slug: "food-packaging-material-selection", title: "Food Packaging Material Selection", type: "guide", summary: "Prepare the product, handling and specification questions needed to review a food packaging material direction.", topics: ["Product contact and handling brief", "Structure and fit", "Barrier or grease requirement", "Supporting documentation by project"] },
  { slug: "paper-bag-structure-guide", title: "Paper Bag Structure Guide", type: "guide", summary: "Use a concise structure checklist to align bag size, handle, carry load and retail presentation needs.", topics: ["Bag dimensions", "Handle direction", "Paper and board selection", "Printing and packing"] },
  { slug: "corrugated-mailer-structure-guide", title: "Corrugated Mailer Structure Guide", type: "guide", summary: "Review board construction, closure, protective points and inserts for an e-commerce mailer brief.", topics: ["Product footprint", "Board and protective direction", "Closure and insert", "Dispatch workflow"] },
  { slug: "custom-paper-packaging-buyer-faq", title: "FAQ for Custom Paper Packaging Buyers", type: "guide", summary: "A buyer-ready checklist of the information that helps a packaging project move from first contact to review.", topics: ["Product and application", "Size, quantity and market", "Artwork and print", "Sample and production review"] },
  { slug: "finishes-guide", title: "Finishes Guide", type: "guide", summary: "Understand how available finishing directions affect visual effect and artwork planning.", topics: ["Matte or gloss lamination", "Hot foil", "Emboss or deboss", "Spot UV and coating", "Window patching"] },
  { slug: "dielines-templates", title: "Dielines & Templates", type: "request", summary: "No public template is shown without a verified file. Request a dieline for your confirmed structure.", topics: ["Structure type", "Product dimensions", "Cut and fold requirements", "Artwork handoff"] },
  { slug: "packaging-selection-guide", title: "Packaging Selection Guide", type: "guide", summary: "Start from product, transport, display, food-contact and handling priorities.", topics: ["Product fit", "Shipping and protection", "Display and gifting", "Material and finish"] },
  { slug: "proofing-samples", title: "Proofing & Samples", type: "guide", summary: "Understand when a white sample, digital proof or production sample helps the project.", topics: ["White structural sample", "Digital proof", "Printed sample", "Production sample"] },
];

export const complianceDocuments: ComplianceDocument[] = [
  { title: "Project compliance documents", documentType: "other", status: "available-upon-request" },
];

export const finishOptions = ["Matte / gloss lamination", "Hot foil", "Emboss / deboss", "Spot UV", "Window patching", "Aqueous coating", "Specialty paper"];

export const resourceZhCopy: Record<string, { title: string; summary: string; topics: string[] }> = {
  "artwork-guidelines": { title: "设计稿指南", summary: "用于设计稿交接、色彩沟通和文件版本确认的实用清单。", topics: ["CMYK 与潘通色沟通", "出血、安全区域与切折线", "字体、矢量图与图片分辨率", "可接受的文件格式"] },
  "dieline-template-request": { title: "刀模图与模板申请", summary: "在明确产品结构和尺寸后，申请对应结构的刀模图或模板。", topics: ["包装结构", "目标尺寸", "产品适配与开启方式", "设计稿交接需求"] },
  "materials-guide": { title: "材料指南", summary: "按结构、外观和用途比较纸张、纸板和瓦楞材料方向。", topics: ["纸张和纸板选择", "结构与应用", "表面限制", "按项目确认的规格"] },
  "cupstock-vs-pe-coated-paper": { title: "杯纸与 PE 淋膜纸指南", summary: "在杯纸项目报价前，明确原纸、加工形态和淋膜方向。", topics: ["杯纸与加工组件", "纸卷、平张与扇形片", "淋膜方向", "克重与应用需求"] },
  "food-packaging-material-selection": { title: "食品包装材料选型指南", summary: "整理食品包装材料评审所需的产品、操作和规格信息。", topics: ["产品接触与使用需求", "结构与适配", "阻隔或防油需求", "按项目提供支持资料"] },
  "paper-bag-structure-guide": { title: "纸袋结构指南", summary: "通过简明结构清单确认纸袋尺寸、提手、承重和零售展示需求。", topics: ["纸袋尺寸", "提手方向", "纸张与纸板选择", "印刷与包装"] },
  "corrugated-mailer-structure-guide": { title: "瓦楞邮寄盒结构指南", summary: "评审电商邮寄盒的纸板结构、闭合、保护点和内托需求。", topics: ["产品尺寸", "纸板与保护方向", "闭合与内托", "发货流程"] },
  "custom-paper-packaging-buyer-faq": { title: "定制纸包装买家常见问题", summary: "帮助采购方从初步联系走向项目评审的资料清单。", topics: ["产品与应用", "尺寸、数量与市场", "设计稿与印刷", "打样与生产评审"] },
  "finishes-guide": { title: "表面工艺指南", summary: "了解可选工艺如何影响视觉效果和设计稿规划。", topics: ["哑光或亮光覆膜", "烫金", "压凸或压凹", "局部 UV 与涂层", "贴窗"] },
  "dielines-templates": { title: "刀模图与模板", summary: "未核验的文件不会公开展示；可针对已确认结构申请刀模图。", topics: ["结构类型", "产品尺寸", "切线与折线要求", "设计稿交接"] },
  "packaging-selection-guide": { title: "包装选型指南", summary: "从产品、运输、展示、食品接触和操作重点开始梳理。", topics: ["产品适配", "运输与保护", "展示与礼赠", "材料与表面工艺"] },
  "proofing-samples": { title: "校样与样品", summary: "了解何时需要白样、数码校样或生产样来推进项目。", topics: ["白样结构样", "数码校样", "印刷样", "生产样"] },
};

export const finishOptionsZh = ["哑光 / 亮光覆膜", "烫金", "压凸 / 压凹", "局部 UV", "贴窗", "水性涂层", "特种纸"];
