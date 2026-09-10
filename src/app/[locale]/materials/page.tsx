import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import MaterialsPage from "@/components/pages/MaterialsPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale, "/materials");
  const title = zh ? `包装材料与表面选择 | ${brand.name}` : `Packaging Materials & Surface Options | ${brand.name}`;
  const description = zh ? "按瓦楞结构、坑型、层数、金属、珠光、压纹和镭射表面浏览科宏包装材料集合。" : "Browse Kehong packaging material collections by corrugated construction, flute, layers, metallic, pearlescent, embossed and laser surfaces.";
  return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages("/materials") }, openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MaterialsPage locale={locale} />;
}
