const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://www.kehong.tech";
const siteUrl = configuredSiteUrl.replace(/\/+$/u, "");

export const siteConfig = {
  name: "Foshan Kehong Paper Products",
  url: siteUrl,
  author: {
    name: "Foshan Kehong Paper Products Co., Ltd.",
    alias: "Kehong Paper",
    url: siteUrl,
  },
} as const;

export type SiteHref = "/" | `/${string}`;

export function absoluteSiteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}
