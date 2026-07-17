import type { SiteHref } from "@/lib/site";

export type IndustrySeoPageData = {
  href: SiteHref;
  title: string;
  zhTitle: string;
  description: string;
  zhDescription: string;
  eyebrow: string;
  buyerFocus: readonly string[];
  capabilities: readonly string[];
  applications: readonly string[];
  faq: readonly { question: string; answer: string }[];
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
    buyerFocus: ["Food-grade paperboard", "PE-coated cupstock", "Custom fan dimensions", "Export-ready packaging"],
    capabilities: ["Material and GSM matching", "Single- or double-sided PE coating", "Cup fan printing coordination", "Sample and production approval"],
    applications: ["Hot and cold beverage cups", "Takeaway beverage packaging", "Café and foodservice supply", "Distributor cupstock programs"],
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
    buyerFocus: ["Food packaging structure", "Paper inserts and pads", "Custom printed boxes", "Clear quote information"],
    capabilities: ["Structure and material confirmation", "OEM/ODM packaging support", "GSM and finish matching", "WhatsApp and quote support"],
    applications: ["Bakery packaging", "Pizza and takeaway boxes", "Retail paper boxes", "Distributor packaging programs"],
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
    buyerFocus: ["Material selection", "GSM and size confirmation", "Custom structure", "Sample and quote support"],
    capabilities: ["Paper cup fan blanks and rolls", "Kraft, white board and specialty paper", "Food packaging boxes", "Paper inserts, pads and trays"],
    applications: ["Foodservice packaging", "Bakery and dessert packaging", "Retail packaging projects", "Regional distributor programs"],
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
  },
} as const;
