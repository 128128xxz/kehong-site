/**
 * Buyer-facing company values in one place.  Product data and internal review
 * notes deliberately do not belong in this client-safe configuration.
 */
export type PublicContactRole = "factory" | "international-sales" | "general-sales" | "email" | "whatsapp" | "wechat";

export type PublicContactPoint = {
  id: string;
  role: PublicContactRole;
  labelKey: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
};

export const companyPublicConfig = {
  brandName: "Kehong",
  companyNameZh: "佛山科宏纸品有限公司",
  companyNameEn: "Foshan Kehong Paper Products Co., Ltd.",
  website: "https://www.kehong.tech",
  factoryAddressZh: "佛山市南海区布新工业区7号",
  factoryAddressEn: "No. 7 Buxin Industrial Zone, Nanhai District, Foshan, Guangdong, China",
  contacts: [
    {
      id: "china-phone",
      role: "factory",
      labelKey: "contact.factory",
      phone: "+86 15888233221",
      address: "佛山市南海区布新工业区7号",
    },
    {
      id: "international-phone",
      role: "international-sales",
      labelKey: "contact.internationalSales",
      phone: "+44 7599669700",
    },
    {
      id: "international-whatsapp",
      role: "whatsapp",
      labelKey: "contact.internationalSales",
      whatsapp: "+447599669700",
    },
    {
      id: "general-email",
      role: "email",
      labelKey: "contact.generalInquiry",
      email: "info@kehong.tech",
    },
  ] satisfies readonly PublicContactPoint[],
} as const;

export const publicContact = {
  email: companyPublicConfig.contacts.find((item) => item.role === "email")?.email ?? "",
  factoryPhone: companyPublicConfig.contacts.find((item) => item.id === "china-phone")?.phone ?? "",
  internationalPhone: companyPublicConfig.contacts.find((item) => item.id === "international-phone")?.phone ?? "",
  whatsapp: companyPublicConfig.contacts.find((item) => item.role === "whatsapp")?.whatsapp ?? "",
} as const;

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/gu, "")}`;
}

export function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/gu, "")}`;
}

export function mailtoHref(email: string, subject?: string) {
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
