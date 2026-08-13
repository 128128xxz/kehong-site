import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import PackagingStructurePreview from "@/components/site/PackagingStructurePreview";
import SiteFooter from "@/components/site/SiteFooter";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const brand = getBrandConfig(locale);
  const zh = locale === "zh";
  const canonical = await getLocaleUrl(locale, "/model-preview");
  const title = `${zh ? "3D结构展厅" : "3D Packaging Studio"} | ${brand.name}`;
  const description = zh ? "在线查看包装结构与折叠方式。" : "Explore packaging structures and folding details in 3D.";

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical,
      languages: await getAlternateLanguages("/model-preview"),
    },
    openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ModelPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[#f6f4ec]">
      <Header />
      <PackagingStructurePreview locale={locale} />
      <SiteFooter />
    </div>
  );
}
