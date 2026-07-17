import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import ProcessPreview from "@/components/site/ProcessPreview";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const title = locale === "zh" ? "生产流程" : "Production process"; const canonical = await getLocaleUrl(locale, "/process" as SiteHref); return { metadataBase: new URL(siteConfig.url), title: `${title} | ${siteConfig.name}`, description: locale === "zh" ? "从规格确认、打样到生产与交付的 Kehong 项目流程。" : "Kehong's project process from specification and sampling through production and delivery.", alternates: { canonical, languages: await getAlternateLanguages("/process") } }; }

export default async function ProcessPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <div className="min-h-screen bg-[#171713]"><Header /><main><ProcessPreview /></main><SiteFooter /></div>; }
