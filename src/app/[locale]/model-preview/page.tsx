import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import OrinscareModelPreview from "@/components/site/OrinscareModelPreview";
import SiteFooter from "@/components/site/SiteFooter";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = await getLocaleUrl(locale, "/model-preview");

  return {
    metadataBase: new URL(siteConfig.url),
    title: `3D product preview | ${siteConfig.name}`,
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
      <OrinscareModelPreview locale={locale} />
      <SiteFooter />
    </div>
  );
}
