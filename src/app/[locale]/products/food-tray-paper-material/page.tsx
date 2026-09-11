import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import ProductAnchorSelector, { type AnchorVariantOption } from "@/components/site/ProductAnchorSelector";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { CORE_PRODUCT_ANCHOR, getCoreAnchorVariants } from "@/data/product-family-catalog";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { getLocalizedCatalogValue, getLocalizedProductMaterial, getLocalizedProductTitle } from "@/lib/catalog";
import { formatProductFieldValue } from "@/lib/productPresentation";
import { getSkuImageMeta } from "@/lib/productImages";
import Image from "next/image";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductFamilies" });
  const tx = t as unknown as (key: string) => string;
  const brand = getBrandConfig(locale);
  const href = "/products/food-tray-paper-material" as SiteHref;
  const canonical = await getLocaleUrl(locale, href);
  const title = `${tx("anchor.title")} | ${brand.name}`;
  const description = tx("anchor.description");
  return {
    metadataBase: new URL(siteConfig.url), title, description,
    alternates: { canonical, languages: await getAlternateLanguages(href) },
    openGraph: { title, description, url: canonical, siteName: brand.name, locale: openGraphLocales[locale] ?? locale, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function FoodTrayAnchorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const variants = getCoreAnchorVariants();
  if (!variants.length) notFound();
  const t = await getTranslations({ locale, namespace: "ProductFamilies" });
  const tx = t as unknown as (key: string) => string;
  const anchor = variants[0];
  const image = getSkuImageMeta(anchor, locale);
  const variantOptions: AnchorVariantOption[] = variants.map((variant) => ({
    sku: variant.sku,
    slug: variant.slug,
    title: getLocalizedProductTitle(variant, locale),
    material: getLocalizedProductMaterial(variant, locale),
    form: formatProductFieldValue(getLocalizedCatalogValue(variant.structureOrFlute, locale), "structure", locale),
    gsm: getLocalizedCatalogValue(variant.gsmOrThickness, locale),
    coating: getLocalizedCatalogValue(variant.coating, locale),
    size: formatProductFieldValue(getLocalizedCatalogValue(variant.commonSize, locale), "size", locale),
    application: formatProductFieldValue(getLocalizedCatalogValue(variant.applications, locale), "application", locale),
  }));
  return (
    <>
      <Header />
      <div className="kh-premium-site texture-paper min-h-screen">
      <main>
        <section className="kh-shell pt-7 sm:pt-10">
          <nav aria-label={locale === "zh" ? "面包屑" : "Breadcrumb"} className="kh-mono flex flex-wrap items-center gap-2 text-xs text-(--kh-muted)">
            <Link href="/products" className="kh-text-link">{tx("breadcrumbProducts")}</Link><span aria-hidden="true">/</span>
            <span>{tx("anchor.title")}</span>
          </nav>
        </section>
        <section className="kh-shell grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.7fr)] lg:items-end lg:py-12">
          <div>
            <p className="kh-eyebrow">{tx("anchorEyebrow")}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-(--kh-ink) sm:text-6xl">{tx("anchor.title")}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-(--kh-muted) sm:text-lg">{tx("anchor.description")}</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/products" className="kh-button kh-button-ghost">{tx("viewAllSpecifications")}</Link><Link href={`/contact?interest=${CORE_PRODUCT_ANCHOR.interest}&product=${anchor.slug}&sku=${anchor.sku}&family=${CORE_PRODUCT_ANCHOR.familyId}`} className="kh-button kh-button-dark">{tx("requestQuote")}</Link></div>
          </div>
          <figure className="overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface-muted)"><div className="relative aspect-[4/3]"><Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" /></div><figcaption className="px-4 py-3 text-xs leading-5 text-(--kh-muted)">{tx("representativeNote")}</figcaption></figure>
        </section>
        <section className="kh-shell pb-12 sm:pb-16" aria-labelledby="anchor-specs-title">
          <h2 id="anchor-specs-title" className="text-2xl font-semibold text-(--kh-ink)">{tx("realOptions")}</h2>
          <ProductAnchorSelector locale={locale} variants={variantOptions} labels={{ material: tx("anchor.materialLabel"), form: tx("anchor.formLabel"), gsm: tx("anchor.gsmLabel"), coating: tx("anchor.coatingLabel"), size: tx("anchor.sizeLabel"), application: tx("anchor.applicationLabel"), selected: tx("selectedRecord"), viewFullRecord: tx("viewFullRecord"), requestQuote: tx("requestQuote"), realRecordNote: tx("anchor.realRecordNote") }} />
        </section>
      </main>
      </div>
      <SiteFooter />
    </>
  );
}
