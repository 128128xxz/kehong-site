import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import SolutionsDirectory from "@/components/site/SolutionsDirectory";
import { getAlternateLanguages, getLocaleUrl, siteConfig, type SiteHref } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const canonical = await getLocaleUrl(locale, "/solutions" as SiteHref);
  return {
    metadataBase: new URL(siteConfig.url),
    title: `${isZh ? "包装解决方案" : "Packaging solutions"} | ${siteConfig.name}`,
    description: isZh ? "按食品、杯纸、瓦楞纸板与内托应用选择科宏纸包装解决方案。" : "Choose Kehong paper packaging solutions by food, cupstock, corrugated and insert applications.",
    alternates: { canonical, languages: await getAlternateLanguages("/solutions") },
  };
}

export default async function SolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="kh-premium-site min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <SolutionsDirectory />
      </main>
      <SiteFooter />
    </div>
  );
}
