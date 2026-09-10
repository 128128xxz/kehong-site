import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import MaterialCollectionPage from "@/components/pages/MaterialCollectionPage";
import { getMaterialCollection, materialCollections } from "@/data/materialCollections";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() { return locales.flatMap((locale) => materialCollections.map((collection) => ({ locale, slug: collection.slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = getMaterialCollection(slug);
  if (!collection) return {};
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const title = `${zh ? collection.title.zh : collection.title.en} | ${brand.name}`;
  const description = zh ? collection.description.zh : collection.description.en;
  const canonical = await getLocaleUrl(locale, `/materials/${slug}`);
  return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages(`/materials/${slug}`) }, openGraph: { title, description, url: canonical, siteName: brand.name, type: "website", images: [{ url: collection.image.src, alt: zh ? collection.image.alt.zh : collection.image.alt.en }] }, twitter: { card: "summary_large_image", title, description, images: [collection.image.src] } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const collection = getMaterialCollection(slug);
  if (!collection) notFound();
  setRequestLocale(locale);
  return <MaterialCollectionPage locale={locale} collection={collection} />;
}
