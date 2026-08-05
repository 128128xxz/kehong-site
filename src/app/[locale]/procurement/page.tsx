import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import B2BProcurementSections from "@/components/site/B2BProcurementSections";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; const zh = locale === "zh"; const brand = getBrandConfig(locale); const title = zh ? "采购支持与项目准备 | 科宏纸品" : `Procurement support | ${brand.name}`; const description = zh ? "获取材质、克重、定制、打样、质量和出口包装支持。" : "Material, GSM, customization, sampling, quality and export packing support for paper packaging projects."; const canonical = await getLocaleUrl(locale, "/procurement" as SiteHref); return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages("/procurement") }, openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title, description } }; }

export default async function ProcurementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <B2BProcurementSections />
      </main>
      <SiteFooter />
    </div>
  );
}
