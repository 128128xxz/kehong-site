import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import CapabilitiesPage from "@/components/pages/CapabilitiesPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";

export function generateStaticParams() { return ["en", "zh", "es", "th", "vi", "id", "ms"].map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const canonical = await getLocaleUrl(locale, "/capabilities"); return { metadataBase: new URL(siteConfig.url), title: "Capabilities | Kehong Paper Packaging", description: "Structural design, artwork, prototyping, printing, finishing, converting, quality and export support.", alternates: { canonical, languages: await getAlternateLanguages("/capabilities") }, openGraph: { title: "Capabilities | Kehong Paper Packaging", description: "Manufacturing capabilities for custom paper packaging projects.", url: canonical, siteName: siteConfig.name, type: "website" } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <CapabilitiesPage locale={locale} />; }
