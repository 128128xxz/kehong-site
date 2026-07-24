import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ResourcesPage from "@/components/pages/ResourcesPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";

export function generateStaticParams() { return ["en", "zh", "es", "th", "vi", "id", "ms"].map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const canonical = await getLocaleUrl(locale, "/resources"); return { metadataBase: new URL(siteConfig.url), title: "Resources & Design Center | Kehong", description: "Artwork, materials, finishes, dieline requests and packaging selection guidance.", alternates: { canonical, languages: await getAlternateLanguages("/resources") }, openGraph: { title: "Resources & Design Center | Kehong", description: "Prepare artwork and packaging decisions with Kehong resources.", url: canonical, siteName: siteConfig.name, type: "website" } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <ResourcesPage locale={locale} />; }
