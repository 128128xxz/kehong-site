import type { SiteHref } from "@/lib/site";

export type IndustrySeoPageData = {
  href: SiteHref;
  title: string;
  zhTitle: string;
  description: string;
  zhDescription: string;
  eyebrow: string;
  zhEyebrow: string;
  buyerFocus: readonly string[];
  zhBuyerFocus: readonly string[];
  capabilities: readonly string[];
  zhCapabilities: readonly string[];
  applications: readonly string[];
  zhApplications: readonly string[];
  faq: readonly { question: string; answer: string }[];
  zhFaq: readonly { question: string; answer: string }[];
};

export const industrySeoPages = {
  paperCupFanManufacturer: {
    href: "/paper-cup-fan-manufacturer" as SiteHref,
    title: "Paper Cup Fan Blanks Manufacturer for Foodservice Packaging",
    zhTitle: "纸杯扇形片与食品级杯纸供应商",
    description:
      "Kehong supplies paper cup fan blanks and cupstock solutions for foodservice buyers, with material, GSM, coating and custom printing support.",
    zhDescription:
      "科宏供应纸杯扇形片和杯纸材料，支持材质、克重、淋膜、尺寸和定制印刷确认。",
    eyebrow: "Paper Cup Fan Blanks Manufacturer",
    zhEyebrow: "纸杯扇形片供应商",
    buyerFocus: ["Food-grade paperboard", "PE-coated cupstock", "Custom fan dimensions", "Export-ready packaging"],
    zhBuyerFocus: ["食品包装纸板", "PE 淋膜杯纸", "定制扇形尺寸", "出口包装准备"],
    capabilities: ["Material and GSM matching", "Single- or double-sided PE coating", "Cup fan printing coordination", "Sample and production approval"],
    zhCapabilities: ["材料与克重匹配", "单面或双面 PE 淋膜", "纸杯扇形片印刷协调", "样品与生产确认"],
    applications: ["Hot and cold beverage cups", "Takeaway beverage packaging", "Café and foodservice supply", "Distributor cupstock programs"],
    zhApplications: ["冷热饮纸杯", "外带饮品包装", "咖啡与餐饮供应", "经销商杯纸项目"],
    faq: [
      {
        question: "Can Kehong customize paper cup fan dimensions?",
        answer: "Yes. Share the cup size, fan drawing, material, coating and quantity for a quotation and sample confirmation.",
      },
      {
        question: "Can you confirm the specification for my project?",
        answer: "Share the target material, GSM, size and application so the team can confirm a suitable specification and sample plan.",
      },
    ],
    zhFaq: [
      { question: "可以定制纸杯扇形片尺寸吗？", answer: "可以。请提供杯型尺寸、扇形图纸、材料、淋膜和数量，以便报价和样品确认。" },
      { question: "可以确认项目规格吗？", answer: "请提供目标材料、克重、尺寸和用途，团队会确认合适的规格与打样方案。" },
    ],
  },
  paperPackagingSupplier: {
    href: "/paper-packaging-supplier" as SiteHref,
    title: "Paper Packaging Supplier for Food, Bakery and Retail Projects",
    zhTitle: "食品、烘焙与零售纸品包装供应商",
    description:
      "Kehong supports food packaging boxes, paper inserts, pads and custom printed packaging for B2B buyers.",
    zhDescription:
      "科宏支持食品包装盒、纸内托、纸垫片和彩印包装定制，服务海外采购与渠道客户。",
    eyebrow: "Paper Packaging Supplier",
    zhEyebrow: "纸品包装供应商",
    buyerFocus: ["Food packaging structure", "Paper inserts and pads", "Custom printed boxes", "Clear quote information"],
    zhBuyerFocus: ["食品包装结构", "纸内托与纸垫", "定制印刷纸盒", "清晰的报价信息"],
    capabilities: ["Structure and material confirmation", "OEM/ODM packaging support", "GSM and finish matching", "WhatsApp and quote support"],
    zhCapabilities: ["结构与材料确认", "OEM / ODM 包装支持", "克重与表面工艺匹配", "WhatsApp 与报价支持"],
    applications: ["Bakery packaging", "Pizza and takeaway boxes", "Retail paper boxes", "Distributor packaging programs"],
    zhApplications: ["烘焙包装", "披萨和外带盒", "零售纸盒", "经销商包装项目"],
    faq: [
      {
        question: "What information should buyers send for packaging quotes?",
        answer: "Send product type, size, material, GSM, quantity, print requirements, target market and sample photos or drawings.",
      },
      {
        question: "Can Kehong support overseas buyers?",
        answer: "Yes. The site is structured for export inquiries, multilingual browsing, sample confirmation and delivery-ready packing support.",
      },
    ],
    zhFaq: [
      { question: "包装报价需要提供哪些信息？", answer: "请提供产品类型、尺寸、材料、克重、数量、印刷需求、目标市场，以及样品照片或图纸。" },
      { question: "支持海外买家吗？", answer: "支持。网站面向出口询盘、多语言浏览、样品确认和出货包装协调。" },
    ],
  },
  customPaperProducts: {
    href: "/custom-paper-products" as SiteHref,
    title: "Custom Paper Products for B2B Packaging Projects",
    zhTitle: "B2B 纸制品定制与采购方案",
    description:
      "Kehong helps buyers source custom paper products by product type, material, GSM, size, structure, MOQ and packaging requirements.",
    zhDescription:
      "科宏按产品类型、材质、克重、尺寸、结构、MOQ 和包装要求支持纸制品定制采购。",
    eyebrow: "Custom Paper Products",
    zhEyebrow: "纸制品定制",
    buyerFocus: ["Material selection", "GSM and size confirmation", "Custom structure", "Sample and quote support"],
    zhBuyerFocus: ["材料选择", "克重与尺寸确认", "定制结构", "样品与报价支持"],
    capabilities: ["Paper cup fan blanks and rolls", "Kraft, white board and specialty paper", "Food packaging boxes", "Paper inserts, pads and trays"],
    zhCapabilities: ["纸杯扇形片与卷材", "牛皮纸、白卡与特种纸", "食品包装盒", "纸内托、纸垫与纸托"],
    applications: ["Foodservice packaging", "Bakery and dessert packaging", "Retail packaging projects", "Regional distributor programs"],
    zhApplications: ["餐饮包装", "烘焙与甜品包装", "零售包装项目", "区域经销商项目"],
    faq: [
      {
        question: "Can you confirm a product from a sample or drawing?",
      answer: "Share a sample, drawing or target specification and the team will confirm the suitable material and production route.",
      },
      {
        question: "How does the custom product process work?",
        answer: "Share your requirements, Kehong confirms the specifications, production follows the approved details, then inspection and shipment are arranged.",
      },
    ],
    zhFaq: [
      { question: "可以根据样品或图纸确认产品吗？", answer: "请提供样品、图纸或目标规格，团队会确认合适的材料和加工方式。" },
      { question: "定制产品流程如何进行？", answer: "提交需求后，科宏确认规格；生产按批准细节执行，再安排检验与出货。" },
    ],
  },
  retailLifestyle: {
    href: "/industries/retail-lifestyle" as SiteHref,
    title: "Retail & Lifestyle Packaging for Presentation and Gifting",
    zhTitle: "零售与品牌纸包装",
    description: "Paper bags, presentation boxes, inserts and branded components developed around retail display, gifting and dispatch requirements.",
    zhDescription: "围绕零售陈列、礼赠与发货需求开发纸袋、展示盒、内托与品牌纸品部件。",
    eyebrow: "Retail & Lifestyle Packaging",
    zhEyebrow: "零售与生活方式包装",
    buyerFocus: ["Product footprint and presentation", "Board, paper and finish requirements", "Branded print and component requirements", "Packing and dispatch needs"],
    zhBuyerFocus: ["产品尺寸与展示", "纸板、纸张与表面要求", "品牌印刷与部件需求", "包装与发货需求"],
    capabilities: ["Paper bag, box and insert development", "Structure and finish review", "Sampling before production confirmation", "Export-ready packing coordination"],
    zhCapabilities: ["纸袋、纸盒与内托开发", "结构与表面工艺评审", "生产前打样确认", "出口包装协调"],
    applications: ["Retail presentation", "Lifestyle product packaging", "Gift sets and seasonal ranges", "Branded retail dispatch"],
    zhApplications: ["零售展示", "生活方式产品包装", "礼盒与季节性产品", "品牌零售发货"],
    faq: [
      { question: "Can the packaging be developed around a retail product?", answer: "Yes. Share the product dimensions, presentation goal, quantity and artwork status so the structure and material requirements can be reviewed." },
      { question: "Can Kehong support branded components as well as boxes?", answer: "A project brief can include bags, inserts, paper cards and other paper components alongside the main packaging structure." },
    ],
    zhFaq: [
      { question: "能按零售产品开发包装吗？", answer: "可以。请提供产品尺寸、展示目标、数量和设计稿状态，以评审结构和材料要求。" },
      { question: "除了纸盒，还能支持品牌纸品部件吗？", answer: "项目需求可同时涵盖纸袋、内托、纸卡和其他纸品部件。" },
    ],
  },
  ecommerceIndustrialProfessional: {
    href: "/industries/ecommerce-industrial-professional" as SiteHref,
    title: "E-commerce & Distribution Packaging for Dispatch and Protection",
    zhTitle: "电商与运输纸包装",
    description: "Mailer structures, protective paper components and presentation packaging reviewed around handling, dispatch and product protection requirements.",
    zhDescription: "围绕搬运、发货与产品保护需求评审邮寄盒、保护性纸部件和展示包装。",
    eyebrow: "E-commerce & Distribution Packaging",
    zhEyebrow: "电商与运输包装",
    buyerFocus: ["Product protection and fit", "Dispatch and handling workflow", "Board structure and insert needs", "Clear quantity and delivery brief"],
    zhBuyerFocus: ["产品保护与适配", "发货与搬运流程", "纸板结构与内托需求", "明确的数量与交期需求"],
    capabilities: ["Mailer and protective-structure review", "Paper insert and divider development", "Structural sampling coordination", "Export packing preparation"],
    zhCapabilities: ["邮寄盒与保护结构评审", "纸内托与隔板开发", "结构打样协调", "出口包装准备"],
    applications: ["E-commerce dispatch", "Professional equipment packaging", "Retail fulfillment", "Protective paper components"],
    zhApplications: ["电商发货", "专业设备包装", "零售履约", "保护性纸品部件"],
    faq: [
      { question: "Can you review a protective paper insert requirement?", answer: "Share the product dimensions, fragile points, packing process and expected quantity. The team can review a practical structure option." },
      { question: "How should I start an e-commerce packaging quote?", answer: "Send a product photo or drawing, dimensions, target quantity, destination and any mailer, insert or print requirements." },
    ],
    zhFaq: [
      { question: "可以评审保护性纸内托需求吗？", answer: "请提供产品尺寸、易损位置、包装流程和预期数量，团队会评审可行的结构选项。" },
      { question: "如何开始电商包装报价？", answer: "请发送产品照片或图纸、尺寸、目标数量、目的地及邮寄盒、内托或印刷需求。" },
    ],
  },
} as const;
