import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import PackagingCategoryPage from "@/components/pages/PackagingCategoryPage";
import { getPackagingCategory, packagingCategories } from "@/data/packagingCategories";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";
import { locales } from "@/i18n/locales";

export function generateStaticParams() {
  return locales.flatMap((locale) => packagingCategories.map((category) => ({ locale, slug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = getPackagingCategory(slug);
  if (!category) return {};
  const canonical = await getLocaleUrl(locale, `/packaging/${slug}`);
  return {
    metadataBase: new URL(siteConfig.url),
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical, languages: await getAlternateLanguages(`/packaging/${slug}`) },
    openGraph: { title: category.seoTitle, description: category.seoDescription, url: canonical, siteName: siteConfig.name, locale: openGraphLocales[locale] ?? locale, type: "website", images: [{ url: category.image, width: 1200, height: 630, alt: category.title.en }] },
    twitter: { card: "summary_large_image", title: category.seoTitle, description: category.seoDescription, images: [category.image] },
  };
}

export default async function PackagingCategoryRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const category = getPackagingCategory(slug);
  if (!category) notFound();
  setRequestLocale(locale);
  return <PackagingCategoryPage locale={locale} category={category} />;
}
