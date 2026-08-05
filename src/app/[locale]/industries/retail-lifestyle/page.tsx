import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import IndustrySeoPage from "@/components/pages/IndustrySeoPage";
import { industrySeoPages } from "@/data/industrySeoPages";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = industrySeoPages.retailLifestyle;
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale, page.href);
  const title = `${locale === "zh" ? page.zhTitle : page.title} | ${brand.name}`;
  const description = locale === "zh" ? page.zhDescription : page.description;
  return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages(page.href) }, openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <IndustrySeoPage locale={locale} page={industrySeoPages.retailLifestyle} />; }
