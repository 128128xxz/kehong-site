import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import NewsPage from "@/components/pages/NewsPage";
import { type NewsLocale } from "@/content/news";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

// The archive filter is client interactive; render the locale hub on demand so
// both language paths share the same published-content selector at runtime.
export const dynamic = "force-dynamic";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale, "/news");
  const title = zh ? `新闻与洞察 | ${brand.name}` : `News & Insights | ${brand.name}`;
  const description = zh ? "围绕纸材、包装结构、设计稿和采购准备的实用内容。" : "Practical insights on paper materials, packaging structure, artwork and procurement preparation.";
  return {
    metadataBase: new URL(siteConfig.url), title, description,
    alternates: { canonical, languages: await getAlternateLanguages("/news") },
    openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function NewsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NewsPage locale={(locale === "zh" ? "zh" : "en") as NewsLocale} />;
}
