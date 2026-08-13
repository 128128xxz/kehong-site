export type VerifiedFactStatus = "APPROVED" | "LOCKED" | "OWNER_CONFIRMATION_REQUIRED";

export type VerifiedCompanyFact = {
  id: string;
  zh: string;
  en: string;
  status: VerifiedFactStatus;
  source: string;
  lastVerifiedDate: string;
  mayRephrase: boolean;
  mayChangeValue: boolean;
};

const source = "Kehong approved public site facts and current product catalog";
const lastVerifiedDate = "2026-08-12";

/**
 * The only buyer-facing company fact registry. Product specifications remain
 * in catalog.normalized.json and are never copied into this registry.
 */
export const verifiedCompanyFacts = [
  { id: "legal-name", zh: "佛山市科宏纸品有限公司", en: "Foshan Kehong Paper Products Co., Ltd.", status: "LOCKED", source: "Current legal/site configuration", lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "brand-name", zh: "科宏纸品", en: "Kehong Paper Products", status: "LOCKED", source: "Current brand configuration", lastVerifiedDate, mayRephrase: false, mayChangeValue: false },
  { id: "factory-address", zh: "佛山市南海区布新工业区7号科宏纸品", en: "Kehong Paper Products, No. 7 Buxin Industrial Zone, Nanhai District, Foshan, Guangdong, China", status: "LOCKED", source: "Current factory location data", lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "website", zh: "https://www.kehong.tech", en: "https://www.kehong.tech", status: "LOCKED", source: "Current canonical site configuration", lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "logo", zh: "/brand/kehong-logo-full-transparent.png", en: "/brand/kehong-logo-full-transparent.png", status: "LOCKED", source: "Current brand asset configuration", lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "email", zh: "info@kehong.tech", en: "info@kehong.tech", status: "LOCKED", source: "Current contact configuration", lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "whatsapp", zh: "+447599669700", en: "+447599669700", status: "LOCKED", source: "Current contact configuration", lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "paper-converting-experience", zh: "20+ 年纸品加工经验", en: "20+ years of paper converting experience", status: "APPROVED", source, lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "production-site", zh: "8,000+ ㎡生产场地", en: "8,000+ ㎡ production site", status: "APPROVED", source, lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "custom-model", zh: "OEM / ODM", en: "OEM / ODM", status: "APPROVED", source, lastVerifiedDate, mayRephrase: false, mayChangeValue: true },
  { id: "moq", zh: "MOQ 灵活起订", en: "Flexible MOQ", status: "APPROVED", source, lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "material-sku-count", zh: "231 个纸材与半成品 SKU", en: "231 paper material and semi-finished SKUs", status: "LOCKED", source: "Current normalized product catalog", lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "material-group-count", zh: "6 个纸材与半成品产品组", en: "6 paper material and semi-finished product groups", status: "LOCKED", source: "Current normalized product catalog", lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "packaging-category-count", zh: "5 个成品包装分类", en: "5 finished packaging categories", status: "LOCKED", source: "Current packaging taxonomy", lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "confirmed-processes", zh: "选材、结构打样、纸材加工、模切、分切、后道工艺、质量检查和出货准备", en: "Material selection, structure sampling, paper converting, die-cutting, slitting, finishing, quality checks and dispatch preparation", status: "APPROVED", source: "Current factory and process pages", lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
  { id: "official-social-profiles", zh: "待负责人确认的官方社交主页", en: "Official social profiles pending owner confirmation", status: "OWNER_CONFIRMATION_REQUIRED", source: "No verified public profile URLs are configured", lastVerifiedDate, mayRephrase: true, mayChangeValue: true },
] as const satisfies readonly VerifiedCompanyFact[];

export function getVerifiedFact(id: string) {
  return verifiedCompanyFacts.find((fact) => fact.id === id);
}

export function getPublicVerifiedFacts() {
  return verifiedCompanyFacts.filter((fact) => fact.status === "APPROVED" || fact.status === "LOCKED");
}
