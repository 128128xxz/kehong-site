import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageCircle,
  PackageCheck,
  Ruler,
  Search,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";
import Header from "@/components/site/Header";
import InquiryForm from "@/components/site/InquiryForm";
import SiteFooter from "@/components/site/SiteFooter";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { absoluteSiteUrl, getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import {
  getAllSkus,
  getProductCategoryBySlug,
  getLocalizedCatalogValue,
  getLocalizedProductMaterial,
  getLocalizedProductTitle,
  getProductGroupId,
  getSkuBySlug,
  getSkusByGroupId,
  buildProductGroupSummary,
  productDataRevision,
} from "@/lib/catalog";
import ProductImageWithStatus from "@/components/site/ProductImageWithStatus";
import RelatedLinks from "@/components/site/RelatedLinks";
import {
  getProductTypeLabel,
  getPublicProductTypeLabel,
  getSkuImageMeta,
} from "@/lib/productImages";

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const brand = getBrandConfig(locale);
  const sku = getSkuBySlug(slug);
  const category = getProductCategoryBySlug(slug);

  if (!sku) {
    if (category) {
      const title = locale === "zh" ? category.title.zh : category.title.en;
      const description = locale === "zh" ? category.description.zh : category.description.en;
      const canonical = await getLocaleUrl(locale, `/products/${category.slug}` as SiteHref);
      return {
        metadataBase: new URL(siteConfig.url),
        title: `${title} | ${brand.name}`,
        description,
        alternates: { canonical, languages: await getAlternateLanguages(`/products/${category.slug}` as SiteHref) },
        openGraph: { title, description, url: canonical, siteName: brand.name, type: "website" },
      };
    }
    return {
      title: brand.name,
    };
  }

  const href = `/products/${sku.slug}` as SiteHref;
  const canonical = await getLocaleUrl(locale, href);
  const groupVariants = getSkusByGroupId(getProductGroupId(sku));
  const groupSummary = buildProductGroupSummary({ id: getProductGroupId(sku), representative: sku, variants: groupVariants }, locale);
  const title = groupSummary.metadata.title;
  const description = groupSummary.metadata.description;
  const imageMeta = getSkuImageMeta(sku, locale);
  const socialImage = imageMeta.status === "exact" ? imageMeta.src : "/og-image.png";

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    keywords: [
      sku.sku,
      sku.title.en,
      sku.productType,
      ...sku.materialIds,
      sku.categoryId,
      getLocalizedCatalogValue(sku.applications, locale),
    ].filter(Boolean),
    alternates: {
      canonical,
      languages: await getAlternateLanguages(href),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: imageMeta.alt,
        },
      ],
      locale: openGraphLocales[locale] ?? locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const query = searchParams ? await searchParams : {};
  setRequestLocale(locale);
  const sku = getSkuBySlug(slug);

  if (!sku) {
    const category = getProductCategoryBySlug(slug);
    if (category) {
      const isZh = locale === "zh";
      const categoryTitle = isZh ? category.title.zh : category.title.en;
      const categoryDescription = isZh ? category.description.zh : category.description.en;
      const categorySkus = getAllSkus().filter((item) => item.productType === category.productType).slice(0, 12);
      const categoryUrl = `/products/${category.slug}` as SiteHref;
      return (
        <div className="texture-paper min-h-screen">
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href="/products" className="kh-text-link">{isZh ? "返回产品目录" : "Back to catalog"}</Link>
            <section className="premium-depth texture-ink mt-6 rounded-xl p-8 sm:p-12">
              <p className="kh-eyebrow kh-eyebrow-light">{isZh ? "产品分类" : "Product category"}</p>
              <h1 className="kh-editorial-heading mt-4 text-4xl sm:text-6xl">{categoryTitle}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">{categoryDescription}</p>
              <Link href={categoryUrl} className="kh-button kh-button-light mt-7">
                {isZh ? "查看全部规格" : "View all specifications"}
              </Link>
            </section>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorySkus.map((item) => (
                <Link key={item.sku} href={`/products/${item.slug}`} className="kh-panel p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <p className="kh-eyebrow">{item.sku}</p>
                  <h2 className="mt-2 text-lg font-semibold text-(--kh-ink)">{getLocalizedProductTitle(item, locale)}</h2>
                  <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{getLocalizedProductMaterial(item, locale) || getLocalizedCatalogValue(item.gsmOrThickness, locale)}</p>
                </Link>
              ))}
            </section>
          </main>
          <SiteFooter />
        </div>
      );
    }
    notFound();
    throw new Error(`Product not found: ${slug}`);
  }

  const t = await getTranslations({ locale, namespace: "Site" });
  const isZh = locale === "zh";
  const brand = getBrandConfig(locale);
  const productHref = `/products/${sku.slug}` as SiteHref;
  const productUrl = await getLocaleUrl(locale, productHref);
  const groupVariants = getSkusByGroupId(getProductGroupId(sku));
  const groupSummary = buildProductGroupSummary({ id: getProductGroupId(sku), representative: sku, variants: groupVariants }, locale);
  const contactHref = `/contact?product=${encodeURIComponent(sku.slug)}&sku=${encodeURIComponent(sku.sku)}&url=${encodeURIComponent(productUrl)}` as SiteHref;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`${t("inquiry.message")}\n- ${isZh ? "产品组" : "Product group"}: ${groupSummary.title}\n- ${isZh ? "当前 SKU" : "Current SKU"}: ${sku.sku}\n- URL: ${productUrl}`)}`;
  const imageMeta = getSkuImageMeta(sku, locale);
  const variantSearch = typeof query.variantSearch === "string" ? query.variantSearch.trim().toLowerCase() : "";
  const matchingVariants = variantSearch
    ? groupVariants.filter((variant) => [variant.sku, variant.gsmOrThickness, variant.coating, variant.commonSize]
      .map((value) => getLocalizedCatalogValue(value, locale).toLowerCase())
      .some((value) => value.includes(variantSearch)))
    : groupVariants;
  const showAllVariants = query.variants === "all" || Boolean(variantSearch);
  const visibleVariants = showAllVariants ? matchingVariants : matchingVariants.slice(0, 12);
  const hasMoreVariants = matchingVariants.length > visibleVariants.length;

  const groupSpecs = [
    [isZh ? "产品家族" : "Product family", groupSummary.familyLabel],
    [isZh ? "可用克重范围" : "Available GSM range", groupSummary.gsm || (isZh ? "按规格确认" : "Confirmed by specification")],
    [isZh ? "可选材料" : "Material options", groupSummary.materials.join(isZh ? "、" : " / ")],
    [isZh ? "可选涂层 / 淋膜" : "Coating options", groupSummary.coating],
    [isZh ? "变体数量" : "Variant count", isZh ? `${groupSummary.variantCount} 个变体` : `${groupSummary.variantCount} ${groupSummary.variantCount === 1 ? "variant" : "variants"}`],
    [isZh ? "适用方向" : "Applications", groupSummary.applications.join(" / ")],
  ].filter(([, value]) => value);
  const currentSkuSpecs = [
    [isZh ? "当前 SKU" : "Current SKU", sku.sku],
    [t("detail.material"), getLocalizedProductMaterial(sku, locale)],
    [isZh ? "当前克重 / 厚度" : "Current GSM / thickness", getLocalizedCatalogValue(sku.gsmOrThickness, locale)],
    [isZh ? "当前涂层 / 淋膜" : "Current coating", getLocalizedCatalogValue(sku.coating, locale)],
    [t("detail.structure"), getLocalizedCatalogValue(sku.structureOrFlute, locale)],
    [t("detail.surface"), getLocalizedCatalogValue(sku.surfaceProcess, locale)],
    [t("detail.finishing"), getLocalizedCatalogValue(sku.finishingProcess, locale)],
    [t("detail.size"), getLocalizedCatalogValue(sku.commonSize, locale)],
    [t("detail.moq"), getLocalizedCatalogValue(sku.moq, locale)],
    [t("detail.unit"), getLocalizedCatalogValue(sku.unit, locale)],
  ].filter(([, value]) => value);
  const procurementCards = [
    {
      icon: PackageCheck,
      label: "MOQ",
      value: getLocalizedCatalogValue(sku.moq, locale) || (isZh ? "按项目确认" : "Confirmed by project"),
    },
    {
      icon: Ruler,
      label: isZh ? "样品 / 打样" : "Sample",
      value: isZh ? "尺寸、结构和材质确认后安排" : "Arranged after size, structure and material are confirmed",
    },
    {
      icon: Timer,
      label: isZh ? "交期" : "Lead time",
      value: isZh ? "按数量、印刷和后工艺报价同步" : "Included in the quotation based on quantity, print and finishing",
    },
    {
      icon: Truck,
      label: isZh ? "包装 / 运输" : "Packing / shipping",
      value: isZh ? "按出口或国内配送要求确认" : "Matched to export or domestic delivery needs",
    },
  ] as const;
  const customNotes = [
    isZh ? "可按图纸、样品图或尺寸要求确认结构" : "Structure can be confirmed by drawing, sample photo or target size",
    isZh ? "支持材质、颜色、表面工艺和后加工组合" : "Material, color, surface process and finishing can be combined",
    isZh ? "批量生产前建议确认样品或关键参数" : "Sample or key specifications should be confirmed before bulk production",
  ];
  const rfqChecklist = isZh
    ? ["产品图片 / 图纸", "尺寸 / 材质 / 克重", "数量 / 目标价格", "印刷颜色 / 后工艺", "目标市场"]
    : ["Product photo / drawing", "Size / material / GSM", "Quantity / target price", "Print color / finish", "Destination market"];
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/kehong-logo-full-transparent.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: contact.whatsapp,
      email: contact.email,
    },
  };
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: groupSummary.title,
    alternateName: isZh ? sku.title.en : undefined,
    sku: sku.sku,
    category: groupSummary.familyLabel,
    material: getLocalizedProductMaterial(sku, locale) || undefined,
    description: groupSummary.metadata.description,
    url: productUrl,
    image: imageMeta.status === "exact" ? absoluteSiteUrl(imageMeta.src) : undefined,
    brand: {
      "@type": "Brand",
      name: brand.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    additionalProperty: [...groupSpecs, ...currentSkuSpecs].map(([name, value]) => ({
      "@type": "PropertyValue",
      name: String(name),
      value: String(value),
    })),
  };
  const productFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can you confirm this product for my project?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Share the target size, material, GSM, quantity and application so the sales team can confirm the right specification.",
        },
      },
      {
        "@type": "Question",
        name: "What information is needed for a quote?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Please share the product type, size, material, GSM or thickness, quantity, print requirements, destination market and any sample photos or drawings.",
        },
      },
      {
        "@type": "Question",
        name: "Can this product be customized?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kehong supports OEM/ODM paper packaging projects, including material, structure, size, color, printing and finishing confirmation before bulk production.",
        },
      },
      {
        "@type": "Question",
        name: "What is the MOQ and lead time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MOQ and lead time are confirmed by product structure, material, print process and order quantity. The sales team will confirm them during quotation.",
        },
      },
    ],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: await getLocaleUrl(locale, "/" as SiteHref) },
      { "@type": "ListItem", position: 2, name: isZh ? "产品目录" : "Products", item: await getLocaleUrl(locale, "/products" as SiteHref) },
      { "@type": "ListItem", position: 3, name: groupSummary.familyLabel, item: await getLocaleUrl(locale, `/products?group=${encodeURIComponent(groupSummary.id)}` as SiteHref) },
      { "@type": "ListItem", position: 4, name: groupSummary.title, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productFaqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div
        data-product-template-version="v2"
        data-product-data-revision={productDataRevision}
        data-product-group-id={getProductGroupId(sku)}
        data-product-sku={sku.sku}
        className="kh-premium-product texture-paper min-h-screen"
      >
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/products" className="kh-text-link">
          {t("detail.back")}
        </Link>
        <div className="kh-detail-hero mt-6 lg:grid lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[380px] lg:min-h-[720px]">
            <ProductImageWithStatus
              sku={sku}
              locale={locale}
              priority
              sizes="(min-width: 1024px) 48vw, 95vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-(--kh-ink)/60 to-transparent" />
            <div className="absolute right-5 top-5 rounded-full border border-white/25 bg-(--kh-ink)/55 px-3 py-2 text-xs font-semibold uppercase tracking-[.08em] text-white backdrop-blur-md">
              {sku.customizable ? "OEM / ODM" : isZh ? "产品" : "Product"}
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="kh-eyebrow kh-eyebrow-light">
                {groupSummary.familyLabel}
              </p>
              <p className="mt-2 text-2xl font-semibold">{sku.sku}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-(--kh-paper-deep) px-3 py-1.5 text-xs font-semibold uppercase tracking-[.08em] text-(--kh-forest)">
              {groupSummary.familyLabel}
              </p>
              <span className="rounded-full bg-(--kh-paper) px-3 py-1.5 text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                {getPublicProductTypeLabel(sku, locale)}
              </span>
              {sku.customizable ? (
                <span className="rounded-full bg-(--kh-forest) px-3 py-1.5 text-xs font-semibold uppercase tracking-[.08em] text-(--kh-surface)">
                  OEM / ODM
                </span>
              ) : null}
              <span className="rounded-full bg-(--kh-paper) px-3 py-1.5 text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                {groupSummary.variantCount} {isZh ? "个变体" : groupSummary.variantCount === 1 ? "variant" : "variants"}
              </span>
            </div>
            <h1 className="kh-editorial-heading mt-4 text-3xl text-(--kh-ink) sm:text-4xl lg:text-5xl">
              {groupSummary.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-(--kh-muted)">
              {groupSummary.description || getLocalizedProductMaterial(sku, locale) || getProductTypeLabel(sku.productType, locale)}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {procurementCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="kh-panel bg-(--kh-paper) p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-(--kh-forest) text-(--kh-brass-soft)">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm font-semibold leading-5 text-(--kh-ink)">
                          {item.value}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

              <section aria-labelledby="product-specifications-title" className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="size-5 text-(--kh-brass)" />
                <h2 id="product-specifications-title" className="text-xl font-semibold text-(--kh-ink)">{isZh ? "产品组与可选规格" : "Product group and available specifications"}</h2>
              </div>
              <p id="product-group-summary-title" className="mb-2 text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">{isZh ? "产品组摘要" : "Product group summary"}</p>
              <dl aria-labelledby="product-group-summary-title" className="grid overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) text-sm sm:grid-cols-2">
                {groupSpecs.map(([label, value]) => (
                  <div key={label} className="border-b border-(--kh-line) p-4 last:border-0">
                    <dt className="text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                      {label}
                    </dt>
                    <dd className="mt-2 font-semibold text-(--kh-ink)">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p id="current-specification-title" className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">{isZh ? "当前规格" : "Current specification"}</p>
              <dl aria-labelledby="current-specification-title" className="grid overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) text-sm sm:grid-cols-2">
                {currentSkuSpecs.map(([label, value]) => (
                  <div key={label} className="border-b border-(--kh-line) p-4 last:border-0">
                    <dt className="text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">{label}</dt>
                    <dd className="mt-2 font-semibold text-(--kh-ink)">{value}</dd>
                  </div>
                ))}
              </dl>
              </section>

            <p className="mt-6 text-sm text-(--kh-muted)">{t("detail.note")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="kh-button kh-button-primary">
                <MessageCircle className="size-4" />
                {t("cta.whatsapp")}
              </a>
              <Link href={contactHref} className="kh-button kh-button-secondary">
                <FileText className="size-4" />
                {isZh ? "获取报价" : "Request a quote"}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.86fr]">
          <section className="kh-panel p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="size-5 text-(--kh-brass)" />
              <h2 className="text-xl font-semibold text-(--kh-ink)">
                {isZh ? "应用、定制与质量保障" : "Applications, customization and quality assurance"}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-(--kh-line) bg-(--kh-paper) p-4">
                <p className="text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                  {isZh ? "适用场景" : "Application"}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-(--kh-ink)">
                  {getLocalizedCatalogValue(sku.applications, locale) || getProductTypeLabel(sku.productType, locale)}
                </p>
              </div>
              <div className="rounded-md border border-(--kh-line) bg-(--kh-paper) p-4">
                <p className="text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                  {isZh ? "表面 / 后工艺" : "Surface / finishing"}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-(--kh-ink)">
                  {[sku.surfaceProcess, sku.finishingProcess]
                    .map((value) => getLocalizedCatalogValue(value, locale))
                    .filter(Boolean)
                    .join(" / ") || (isZh ? "按项目确认" : "Confirmed by project")}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {customNotes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-(--kh-line) bg-(--kh-paper) px-3 py-3 text-sm font-semibold leading-6 text-(--kh-ink)">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-(--kh-brass)" />
                  {item}
                </div>
              ))}
            </div>

            {groupVariants.length > 1 ? (
              <div className="mt-6 overflow-hidden rounded-lg border border-(--kh-line)">
                <div className="flex flex-col gap-3 bg-(--kh-paper) px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[.08em] text-(--kh-ink)">
                      {isZh ? "产品选项" : "Product options"}
                    </h3>
                    <p className="mt-1 text-xs text-(--kh-muted)">
                      {isZh ? `显示 ${visibleVariants.length} / ${matchingVariants.length} 项` : `Showing ${visibleVariants.length} of ${matchingVariants.length} variants`}
                    </p>
                  </div>
                  <form method="get" className="flex min-w-0 items-center gap-2">
                    {query.variants === "all" ? <input type="hidden" name="variants" value="all" /> : null}
                    <label htmlFor="variant-search" className="sr-only">{isZh ? "搜索变体" : "Search variants"}</label>
                    <div className="flex min-w-0 items-center gap-2 rounded-md border border-(--kh-line) bg-(--kh-surface) px-3 py-2">
                      <Search className="size-3.5 shrink-0 text-(--kh-brass)" aria-hidden="true" />
                      <input id="variant-search" name="variantSearch" defaultValue={variantSearch} placeholder={isZh ? "搜索尺寸 / 克重 / 涂层" : "Search size / GSM / coating"} className="min-w-0 w-full bg-transparent text-xs font-semibold text-(--kh-ink) outline-none placeholder:text-(--kh-muted)/80" />
                    </div>
                    <button type="submit" className="kh-button kh-button-primary kh-button-compact">{isZh ? "搜索" : "Search"}</button>
                  </form>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full border-collapse bg-(--kh-surface) text-sm">
                    <thead>
                      <tr className="border-b border-(--kh-line) text-left text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
                        <th className="px-4 py-3">{isZh ? "产品编号" : "Product code"}</th>
                        <th className="px-4 py-3">{isZh ? "克重 / 厚度" : "GSM / thickness"}</th>
                        <th className="px-4 py-3">{isZh ? "涂层" : "Coating"}</th>
                        <th className="px-4 py-3">{isZh ? "尺寸" : "Size"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleVariants.map((variant) => (
                        <tr key={variant.sku} className="border-b border-(--kh-paper-deep) last:border-0">
                          <td className="px-4 py-3 font-semibold text-(--kh-ink)">{variant.sku}</td>
                          <td className="px-4 py-3 text-(--kh-muted)">{getLocalizedCatalogValue(variant.gsmOrThickness, locale) || "-"}</td>
                          <td className="px-4 py-3 text-(--kh-muted)">{getLocalizedCatalogValue(variant.coating, locale) || "-"}</td>
                          <td className="px-4 py-3 text-(--kh-muted)">{getLocalizedCatalogValue(variant.commonSize, locale) || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {matchingVariants.length === 0 ? (
                  <p className="border-t border-(--kh-line) bg-(--kh-surface) px-4 py-4 text-sm text-(--kh-muted)">{isZh ? "没有匹配的变体，请调整搜索条件。" : "No matching variants. Adjust the search terms and try again."}</p>
                ) : null}
                {hasMoreVariants ? (
                  <div className="border-t border-(--kh-line) bg-(--kh-surface) px-4 py-3">
                    <Link href={`${productHref}?variants=all${variantSearch ? `&variantSearch=${encodeURIComponent(variantSearch)}` : ""}`} className="kh-text-link">
                      {isZh ? `查看全部 ${matchingVariants.length} 个变体` : `View all ${matchingVariants.length} variants`} →
                    </Link>
                  </div>
                ) : showAllVariants && matchingVariants.length > 12 ? (
                  <div className="border-t border-(--kh-line) bg-(--kh-surface) px-4 py-3">
                    <Link href={productHref} className="kh-text-link">{isZh ? "收起变体" : "Show fewer variants"} ↑</Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <aside className="premium-depth texture-ink self-start rounded-xl p-5 sm:p-6">
            <p className="kh-eyebrow kh-eyebrow-light">
              {isZh ? "报价所需信息" : "Quote checklist"}
            </p>
            <h2 className="kh-editorial-heading mt-3 text-2xl">
              {isZh ? "发这些信息，报价会更快。" : "Send these details for a faster quote."}
            </h2>
            <div className="mt-5 grid gap-2">
              {rfqChecklist.map((item) => (
                <span key={item} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white/85">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-2">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="kh-button kh-button-light">
                <MessageCircle className="size-4" />
                {isZh ? "咨询此产品" : "Discuss this product"}
              </a>
              <Link href={contactHref} className="kh-button border border-white/35 text-(--kh-surface) hover:bg-white/10">
                <FileText className="size-4" />
                {isZh ? "获取报价" : "Request a quote"}
              </Link>
            </div>
          </aside>
        </div>

        <section id="request-quote" className="mt-6 scroll-mt-24">
          <InquiryForm
            locale={locale}
            initialProducts={[
              {
                productGroupId: groupSummary.id,
                productGroupTitle: groupSummary.title,
                sku: sku.sku,
                skuTitle: isZh ? sku.title.zh : sku.title.en,
                name: groupSummary.title,
                url: productUrl,
              },
            ]}
            title={isZh ? "提交询价" : "Request a quote"}
            description={
              isZh
                ? "已为您带入产品名称和产品编号。补充数量、尺寸、印刷和目标市场即可提交。"
                : "Your product is preselected. Add quantity, size, print and destination market to request a quote."
            }
          />
        </section>
        <RelatedLinks
          locale={locale}
          index="06"
          title={{ en: "Related product paths", zh: "相关产品路径" }}
          links={[
            { href: "/products?collection=materials", en: "Related material groups", zh: "相关材料产品组" },
            { href: "/packaging", en: "Related packaging formats", zh: "相关成品包装" },
            { href: "/industries", en: "Related industries", zh: "相关行业" },
            { href: "/contact?interest=structure-review", en: "Need structure review?", zh: "需要结构评审？" },
          ]}
        />
      </main>
        <SiteFooter />
      </div>
    </>
  );
}
