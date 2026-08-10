import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import ProcessPreview from "@/components/site/ProcessPreview";
import { Link } from "@/i18n/navigation";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const brand = getBrandConfig(locale); const title = locale === "zh" ? "生产流程" : "Production process"; const description = locale === "zh" ? "从规格确认、打样到生产与交付的科宏项目流程。" : "Kehong's project process from specification and sampling through production and delivery."; const canonical = await getLocaleUrl(locale, "/process" as SiteHref); const metadataTitle = `${title} | ${brand.name}`; return { metadataBase: new URL(siteConfig.url), title: metadataTitle, description, alternates: { canonical, languages: await getAlternateLanguages("/process") }, openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title: metadataTitle, description } }; }

export default async function ProcessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";

  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "受控生产" : "Controlled production"}
          title={isZh ? "从材料确认到包装出货。" : "From material confirmation to finished packaging."}
          lede={
            isZh
              ? "每个项目将材料、结构、加工和检验要求对应到清晰的生产节点。"
              : "Each project connects material, structure, converting, and inspection requirements to a clear production stage."
          }
          meta={
            isZh
              ? ["6 个生产节点", "中国广东佛山", "OEM / ODM"]
              : ["6 production stages", "Foshan, Guangdong, China", "OEM / ODM"]
          }
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "提交项目需求" : "Start a packaging project"}
          </Link>
          <Link href="/factory" className="kh-button kh-button-ghost">
            {isZh ? "了解工厂和设备" : "See factory & equipment"}
          </Link>
        </PageHero>
        <ProcessPreview />
      </main>
      <SiteFooter />
    </div>
  );
}
