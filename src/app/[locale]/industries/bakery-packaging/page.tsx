import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import BakeryPackagingPage from "@/components/pages/BakeryPackagingPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";

export function generateStaticParams() { return ["en", "zh", "es", "th", "vi", "id", "ms"].map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const canonical = await getLocaleUrl(locale, "/industries/bakery-packaging"); return { metadataBase: new URL(siteConfig.url), title: "Bakery Packaging | Kehong", description: "Cake boxes, cake boards, cake drums and bakery packaging paths for presentation and transport.", alternates: { canonical, languages: await getAlternateLanguages("/industries/bakery-packaging") }, openGraph: { title: "Bakery Packaging | Kehong", description: "Compare bakery packaging structures and support products.", url: canonical, siteName: siteConfig.name, type: "website" } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <BakeryPackagingPage locale={locale} />; }
