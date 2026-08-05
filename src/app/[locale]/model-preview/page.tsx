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
  const canonical = await getLocaleUrl(locale, "/model-preview");

  return {
    metadataBase: new URL(siteConfig.url),
    title: `3D product preview | ${brand.name}`,
    description: "Interactive 3D product preview for Kehong packaging structures.",
    alternates: {
      canonical,
      languages: await getAlternateLanguages("/model-preview"),
    },
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
