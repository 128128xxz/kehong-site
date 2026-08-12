import { getVerifiedFact } from "./verifiedCompanyFacts";

const fact = (id: string) => getVerifiedFact(id)!;

export const contact = {
  whatsapp: fact("whatsapp").en,
  phone: fact("whatsapp").en,
  email: fact("email").en,
} as const;

export const companyLegalName = fact("legal-name").en;

export {
  FACTORY_ADDRESS,
  FACTORY_AMAP_URL,
  FACTORY_BAIDU_MAP_URL,
  FACTORY_GOOGLE_MAPS_URL,
  FACTORY_MAP_LABEL,
  FACTORY_MAP_QUERY_ZH,
  getFactoryMapUrl,
} from "./companyLocation";

/** 社媒主页(预留转化入口:填入正式主页 URL 即自动生效;留空时页脚图标指向占位) */
export const socialLinks = {
  linkedin: "",
  facebook: "",
  instagram: "",
  youtube: "",
  x: "",
  tiktok: "",
} as const;

export const companyProfile = {
  location: { en: "Foshan, Guangdong, China", zh: "中国广东佛山" },
  productionCapability: {
    en: fact("confirmed-processes").en,
    zh: fact("confirmed-processes").zh,
  },
  exportExperience: {
    en: "Export-ready packing and project support for overseas B2B orders",
    zh: "支持海外 B2B 订单的出口包装和资料准备",
  },
} as const;

export const companyFacts = [
  { value: "20+", labelKey: "facts.years", factId: "paper-converting-experience" },
  { value: "8000+", labelKey: "facts.factoryArea", factId: "production-site" },
  { value: "OEM/ODM", labelKey: "facts.customPackaging", factId: "custom-model" },
  { value: "MOQ", labelKey: "facts.flexibleOrders", factId: "moq" },
] as const;

export const productFamilies = [
  "Corrugated / Fluted Paper",
  "Food Packaging Paper",
  "Kraft Paper",
  "White Cardboard",
  "Specialty Paper",
  "Paper Boxes & Trays",
] as const;

export const processSteps = [
  {
    id: "die-cutting",
    titleKey: "process.dieCutting.title",
    textKey: "process.dieCutting.text",
  },
  {
    id: "corrugated",
    titleKey: "process.corrugated.title",
    textKey: "process.corrugated.text",
  },
  {
    id: "dyeing",
    titleKey: "process.dyeing.title",
    textKey: "process.dyeing.text",
  },
  {
    id: "laminating",
    titleKey: "process.laminating.title",
    textKey: "process.laminating.text",
  },
] as const;

export const applications = [
  "Food packaging",
  "Cosmetics packaging",
  "Electronics packaging",
  "Daily necessities",
  "Gift packaging",
  "Retail display",
] as const;
