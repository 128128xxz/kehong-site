import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import CapabilitiesPage from "@/components/pages/CapabilitiesPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const brand = getBrandConfig(locale); const zh = locale === "zh"; const canonical = await getLocaleUrl(locale, "/capabilities"); const title = `${zh ? "制造能力" : "Capabilities"} | ${brand.name}`; const description = zh ? "纸包装项目的结构设计、设计稿、打样、印刷、后道加工、质量与出口支持。" : "Structural design, artwork, prototyping, printing, finishing, converting, quality and export support."; return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages("/capabilities") }, openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <CapabilitiesPage locale={locale} />; }
