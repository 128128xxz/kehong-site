export const contact = {
  whatsapp: "+447599669700",
  phone: "+447599669700",
  email: "info@kehong.tech",
} as const;

export const companyFacts = [
  { value: "20+", labelKey: "facts.years" },
  { value: "8000+", labelKey: "facts.factoryArea" },
  { value: "OEM/ODM", labelKey: "facts.customPackaging" },
  { value: "MOQ", labelKey: "facts.flexibleOrders" },
] as const;

export const productFamilies = [
  "Corrugated / Fluted Paper",
  "Food Grade Paper",
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
