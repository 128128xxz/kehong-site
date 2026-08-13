const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://www.kehong.tech";
const siteUrl = configuredSiteUrl.replace(/\/+$/u, "");

export const siteConfig = {
  name: "Foshan Kehong Paper Products Co., Ltd.",
  legalName: "Foshan Kehong Paper Products Co., Ltd.",
  url: siteUrl,
  author: {
    name: "Foshan Kehong Paper Products Co., Ltd.",
    alias: "Foshan Kehong Paper Products Co., Ltd.",
    url: siteUrl,
  },
} as const;

/** Public brand copy has one source of truth; legal registration remains separate. */
export const brandConfig = {
  en: {
    name: "Foshan Kehong Paper Products Co., Ltd.",
    tagline: "Paper materials & custom packaging",
  },
  zh: {
    name: "佛山科宏纸品有限公司",
    tagline: "纸材、半成品与定制纸包装",
  },
} as const;

export function getBrandConfig(locale: string) {
  return locale === "zh" ? brandConfig.zh : brandConfig.en;
}

export type SiteHref = "/" | `/${string}`;

export function absoluteSiteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}
