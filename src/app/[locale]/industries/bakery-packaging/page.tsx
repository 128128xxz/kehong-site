import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import BakeryPackagingPage from "@/components/pages/BakeryPackagingPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const zh = locale === "zh"; const brand = getBrandConfig(locale); const canonical = await getLocaleUrl(locale, "/industries/bakery-packaging"); const title = `${zh ? "烘焙包装" : "Bakery Packaging"} | ${brand.name}`; const description = zh ? "用于展示与运输的蛋糕盒、蛋糕底托、蛋糕鼓和烘焙包装方案。" : "Cake boxes, cake boards, cake drums and bakery packaging paths for presentation and transport."; return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages("/industries/bakery-packaging") }, openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title, description } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <BakeryPackagingPage locale={locale} />; }
