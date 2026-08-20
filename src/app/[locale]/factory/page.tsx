import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import FactoryOverview from "@/components/site/FactoryOverview";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const brand = getBrandConfig(locale);
  const title = locale === "zh" ? "工厂与服务能力" : "Factory and capabilities";
  const description =
    locale === "zh"
      ? "了解科宏的纸品包装生产与项目支持能力。"
      : "Review Kehong's paper packaging manufacturing and project support capabilities.";
  const canonical = await getLocaleUrl(locale, "/factory" as SiteHref);
  const metadataTitle = `${title} | ${brand.name}`;
  return {
    metadataBase: new URL(siteConfig.url),
    title: metadataTitle,
    description,
    alternates: { canonical, languages: await getAlternateLanguages("/factory") },
    openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, type: "website" },
    twitter: { card: "summary_large_image", title: metadataTitle, description },
  };
}

export default async function FactoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Stage2" });

  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("factory.hero.kicker")}
          title={t("factory.hero.title")}
          lede={t("factory.hero.lede")}
          meta={[t("factory.hero.metaLocation"), t("factory.hero.metaScope"), t("factory.hero.metaCustom")]}
          image={{
            src: showcaseImages.machine,
            alt: t("factory.hero.imageAlt"),
          }}
        >
          <Link href="/capabilities" className="kh-button kh-button-light">
            {t("factory.hero.viewCapabilities")}
          </Link>
          <Link href="/contact" className="kh-button kh-button-ghost">
            {t("factory.hero.requestQuote")}
          </Link>
        </PageHero>
        <FactoryOverview locale={locale} />
      </main>
      <SiteFooter />
    </div>
  );
}
