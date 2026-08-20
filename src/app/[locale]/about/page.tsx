import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import AboutPage from "@/components/pages/AboutPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const brand = getBrandConfig(locale);
  const zh = locale === "zh";
  const canonical = await getLocaleUrl(locale, "/about");
  const title = `${zh ? "关于科宏" : "About Kehong"} | ${brand.name}`;
  const description = zh
    ? "科宏为 B2B 买家提供纸材、瓦楞纸板、纸品加工与定制包装支持。"
    : "Kehong provides paper materials, corrugated board, paper converting and custom packaging support for B2B buyers.";
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: { canonical, languages: await getAlternateLanguages("/about") },
    openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AboutPageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <AboutPage locale={locale} />
      </main>
      <SiteFooter />
    </div>
  );
}