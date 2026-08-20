import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import ProductFamilyPage from "@/components/site/ProductFamilyPage";
import { locales } from "@/i18n/locales";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { getProductFamilyBySlug, PRODUCT_FAMILY_ROUTE_SLUGS } from "@/data/product-family-catalog";

export function generateStaticParams() {
  return locales.flatMap((locale) => PRODUCT_FAMILY_ROUTE_SLUGS.map((familySlug) => ({ locale, familySlug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; familySlug: string }> }): Promise<Metadata> {
  const { locale, familySlug } = await params;
  const config = getProductFamilyBySlug(familySlug);
  if (!config) return {};
  const t = await getTranslations({ locale, namespace: "ProductFamilies" });
  const tx = t as unknown as (key: string) => string;
  const brand = getBrandConfig(locale);
  const href = `/products/families/${familySlug}` as SiteHref;
  const canonical = await getLocaleUrl(locale, href);
  const title = `${tx(`family.${config.id}.title`)} | ${brand.name}`;
  const description = tx(`family.${config.id}.description`);
  return {
    metadataBase: new URL(siteConfig.url), title, description,
    alternates: { canonical, languages: await getAlternateLanguages(href) },
    openGraph: { title, description, url: canonical, siteName: brand.name, locale: openGraphLocales[locale] ?? locale, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function FamilyRoute({ params }: { params: Promise<{ locale: string; familySlug: string }> }) {
  const { locale, familySlug } = await params;
  if (!getProductFamilyBySlug(familySlug)) notFound();
  setRequestLocale(locale);
  return <><Header /><ProductFamilyPage locale={locale} familySlug={familySlug} /><SiteFooter /></>;
}
