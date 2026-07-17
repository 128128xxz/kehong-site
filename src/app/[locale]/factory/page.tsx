import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import BuyerDecisionBrief from "@/components/site/BuyerDecisionBrief";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; const title = locale === "zh" ? "工厂与服务能力" : "Factory and capabilities"; const canonical = await getLocaleUrl(locale, "/factory" as SiteHref);
  return { metadataBase: new URL(siteConfig.url), title: `${title} | ${siteConfig.name}`, description: locale === "zh" ? "了解 Kehong 的纸品包装生产与项目支持能力。" : "Review Kehong's paper packaging manufacturing and project support capabilities.", alternates: { canonical, languages: await getAlternateLanguages("/factory") } };
}

export default async function FactoryPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <div className="texture-paper min-h-screen bg-[#f6f4ec]"><Header /><main><BuyerDecisionBrief /></main><SiteFooter /></div>; }
