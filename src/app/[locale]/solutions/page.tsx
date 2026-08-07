import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import SolutionsDirectory from "@/components/site/SolutionsDirectory";
import { Link } from "@/i18n/navigation";
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
  const isZh = locale === "zh";
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "包装解决方案" : "Packaging solutions"}
          title={isZh ? "按应用选择结构。" : "Choose the structure by application."}
          lede={
            isZh
              ? "从食品、杯纸到瓦楞和内托，先确认应用与保护要求，再进入匹配的产品范围。"
              : "Start with the application and protection requirement, then move into a focused product range for sampling and quotation."
          }
          meta={[
            isZh ? "4 类应用" : "4 applications",
            "OEM / ODM",
            isZh ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <a href="#solutions-directory" className="kh-button kh-button-light">
            {isZh ? "浏览解决方案" : "Browse solutions"}
          </a>
          <Link href="/contact" className="kh-button kh-button-ghost">
            {isZh ? "获取报价" : "Request a quote"}
          </Link>
        </PageHero>
        <SolutionsDirectory />
      </main>
      <SiteFooter />
    </div>
  );
}
