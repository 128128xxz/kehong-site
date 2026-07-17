import { getPathname } from "@/i18n/navigation";
import { localeConfig, locales } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { absoluteSiteUrl, type SiteHref } from "@/lib/site-config";

export { absoluteSiteUrl, siteConfig, type SiteHref } from "@/lib/site-config";

export const openGraphLocales = Object.fromEntries(
  locales.map((locale) => [locale, localeConfig[locale].ogLocale]),
);

export async function getLocaleUrl(
  locale: string,
  href: SiteHref = "/",
) {
  const pathname = await getPathname({ locale, href });
  return absoluteSiteUrl(pathname);
}

export async function getAlternateLanguages(
  href: SiteHref = "/",
) {
  const localeUrls = await Promise.all(
    routing.locales.map(async (locale) => [
      locale,
      await getLocaleUrl(locale, href),
    ]),
  );

  return Object.fromEntries([
    ...localeUrls,
    ["x-default", await getLocaleUrl(routing.defaultLocale, href)],
  ]);
}
