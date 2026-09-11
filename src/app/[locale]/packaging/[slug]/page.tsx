import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import PackagingCategoryPage from "@/components/pages/PackagingCategoryPage";
import { getPackagingCategory, packagingCategories } from "@/data/packagingCategories";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig, absoluteSiteUrl } from "@/lib/site";
import { getR2AssetsForPackagingRoute } from "@/data/r2WebsiteAssets";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

export function generateStaticParams() {
  return locales.flatMap((locale) => packagingCategories.map((category) => ({ locale, slug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = getPackagingCategory(slug);
  if (!category) return {};
  const canonical = await getLocaleUrl(locale, `/packaging/${slug}`);
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const title = zh ? `${category.title.zh} | ${brand.name}` : category.seoTitle;
  const description = zh ? category.shortDescription.zh : category.seoDescription;
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: { canonical, languages: await getAlternateLanguages(`/packaging/${slug}`) },
    openGraph: { title, description, url: canonical, siteName: brand.name, locale: openGraphLocales[locale] ?? locale, type: "website", images: [{ url: category.image, width: 1200, height: 630, alt: zh ? category.title.zh : category.title.en }] },
    twitter: { card: "summary_large_image", title, description, images: [category.image] },
  };
}

export default async function PackagingCategoryRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const category = getPackagingCategory(slug);
  if (!category) notFound();
  setRequestLocale(locale);
  const imageUrls = [category.image, ...getR2AssetsForPackagingRoute(category.slug).map((asset) => asset.image)].map(absoluteSiteUrl);
  const packagingJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteSiteUrl(`/${locale}/packaging/${slug}`)}#webpage`,
    url: absoluteSiteUrl(`/${locale}/packaging/${slug}`),
    name: locale === "zh" ? category.title.zh : category.title.en,
    description: locale === "zh" ? category.description.zh : category.description.en,
    image: imageUrls,
    isPartOf: { "@type": "WebSite", name: "Kehong", url: absoluteSiteUrl(`/${locale}`) },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(packagingJsonLd).replace(/</g, "\\u003c") }} />
      <PackagingCategoryPage locale={locale} category={category} />
    </>
  );
}
