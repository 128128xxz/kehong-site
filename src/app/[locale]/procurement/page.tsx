import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import B2BProcurementSections from "@/components/site/B2BProcurementSections";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const title = locale === "zh" ? "采购支持" : "Procurement support"; const canonical = await getLocaleUrl(locale, "/procurement" as SiteHref); return { metadataBase: new URL(siteConfig.url), title: `${title} | ${siteConfig.name}`, description: locale === "zh" ? "获取材质、克重、定制、打样、质量和出口包装支持。" : "Material, GSM, customization, sampling, quality and export packing support for paper packaging projects.", alternates: { canonical, languages: await getAlternateLanguages("/procurement") } }; }

export default async function ProcurementPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <div className="texture-paper min-h-screen bg-[#f6f4ec]"><Header /><main><B2BProcurementSections /></main><SiteFooter /></div>; }
