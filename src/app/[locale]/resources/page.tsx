import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ResourcesPage from "@/components/pages/ResourcesPage";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale, "/resources");
  const title = zh ? `纸包装资源与设计支持 | ${brand.name}` : `Resources & Design Center | ${brand.name}`;
  const description = zh
    ? "印刷文件、材料、表面工艺、刀线申请与包装选型资料。"
    : "Artwork, materials, finishes, dieline requests and packaging selection guidance.";

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: { canonical, languages: await getAlternateLanguages("/resources") },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <ResourcesPage locale={locale} />; }
