import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import FactoryOverview from "@/components/site/FactoryOverview";
import { Link } from "@/i18n/navigation";
import { companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const brand = getBrandConfig(locale); const title = locale === "zh" ? "工厂与服务能力" : "Factory and capabilities"; const description = locale === "zh" ? "了解科宏的纸品包装生产与项目支持能力。" : "Review Kehong's paper packaging manufacturing and project support capabilities."; const canonical = await getLocaleUrl(locale, "/factory" as SiteHref); const metadataTitle = `${title} | ${brand.name}`;
  return { metadataBase: new URL(siteConfig.url), title: metadataTitle, description, alternates: { canonical, languages: await getAlternateLanguages("/factory") }, openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title: metadataTitle, description } };
}

export default async function FactoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";

  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "佛山工厂" : "Foshan production site"}
          title={isZh ? "佛山纸品加工与包装生产" : "Paper converting and packaging production in Foshan"}
          lede={
            isZh
              ? "科宏位于广东佛山，可根据产品结构和规格要求安排选材、结构打样、纸材加工、后道工艺和出货准备。"
              : "Kehong is based in Foshan, Guangdong. Our team handles material selection, structural sampling, paper converting, finishing and shipment preparation for paper packaging projects."
          }
          meta={
            isZh
              ? [companyProfile.location.zh, "20+ 年纸品加工经验", "8,000+ ㎡生产场地"]
              : [companyProfile.location.en, "20+ years in paper converting", "8,000+ m²"]
          }
          image={{
            src: showcaseImages.factoryHallWide,
            alt: isZh ? "科宏工厂车间：成排模切设备与纸板堆垛" : "Kehong factory hall with die-cutting lines and stacked board",
          }}
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "提交项目需求" : "Start a packaging project"}
          </Link>
          <Link href="/process" className="kh-button kh-button-ghost">
            {isZh ? "查看生产流程" : "View production process"}
          </Link>
        </PageHero>
        <FactoryOverview />
      </main>
      <SiteFooter />
    </div>
  );
}
