import { contact, companyLegalName, companyProfile, socialLinks } from "@/data/company";
import { FACTORY_ADDRESS, FACTORY_BAIDU_MAP_URL, FACTORY_GOOGLE_MAPS_URL } from "@/data/companyLocation";
import { getProductGroups, type ProductGroup } from "@/lib/catalog";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";
import { getBrandConfig } from "@/lib/site-config";
import { getVerifiedFact } from "@/data/verifiedCompanyFacts";

const jsonLdValue = (id: string, locale: string) => {
  const value = getVerifiedFact(id);
  return value?.status === "OWNER_CONFIRMATION_REQUIRED" ? undefined : value?.[locale === "zh" ? "zh" : "en"];
};

function officialSameAs() {
  return Object.values(socialLinks).filter((url) => Boolean(url && /^https:\/\//u.test(url))).map((url) => String(url));
}

export function buildOrganizationJsonLd(locale: string, description?: string) {
  const brand = getBrandConfig(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: brand.name,
    legalName: companyLegalName,
    description: description ?? companyProfile.productionCapability[locale === "zh" ? "zh" : "en"],
    url: siteConfig.url,
    logo: absoluteSiteUrl(jsonLdValue("logo", locale) ?? "/media/brand/kehong-full-logo-transparent.png"),
    sameAs: officialSameAs().length ? officialSameAs() : undefined,
    contactPoint: buildContactPointJsonLd(),
  };
}

export function buildContactPointJsonLd() {
  return {
    "@type": "ContactPoint",
    contactType: "sales",
    email: jsonLdValue("email", "en") ?? contact.email,
    telephone: jsonLdValue("phone-en", "en") ?? contact.phone.en,
    availableLanguage: ["en", "zh"],
  };
}

export function buildLocalBusinessJsonLd(locale: string) {
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#factory`,
    name: brand.name,
    description: companyProfile.productionCapability[zh ? "zh" : "en"],
    url: siteConfig.url,
    image: [absoluteSiteUrl(jsonLdValue("logo", locale) ?? "/media/brand/kehong-full-logo-transparent.png")],
    telephone: contact.phone[zh ? "zh" : "en"],
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: FACTORY_ADDRESS[zh ? "zh" : "en"],
      addressLocality: "Foshan",
      addressRegion: "Guangdong",
      addressCountry: "CN",
    },
    hasMap: zh ? FACTORY_BAIDU_MAP_URL : FACTORY_GOOGLE_MAPS_URL,
    parentOrganization: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function buildWebsiteJsonLd(locale: string, canonical: string, description: string) {
  const brand = getBrandConfig(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: brand.name,
    description,
    url: canonical,
    inLanguage: locale,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function buildWebPageJsonLd(locale: string, canonical: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    name,
    description,
    url: canonical,
    inLanguage: locale,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function buildProductGroupJsonLd(group: ProductGroup, locale: string, canonical: string) {
  const zh = locale === "zh";
  const title = group.title[zh ? "zh" : "en"];
  const description = group.shortDescription[zh ? "zh" : "en"];
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: title,
    description,
    url: canonical,
    productGroupID: group.id,
    numberOfItems: group.variantCount,
    brand: { "@type": "Brand", name: getBrandConfig(locale).name },
    manufacturer: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function getPublicProductGroups() {
  return getProductGroups().filter((group) => group.sourceStatus === "confirmed");
}
