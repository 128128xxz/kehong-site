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
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";
import Header from "@/components/site/Header";
import InquiryForm from "@/components/site/InquiryForm";
import SiteFooter from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { absoluteSiteUrl, getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig, type SiteHref } from "@/lib/site";
import {
  getAllSkus,
  getCanonicalCategoryForSku,
  getProductCategoryBySlug,
  getProductCategoryForSku,
  getLocalizedCatalogValue,
  getLocalizedProductMaterial,
  getLocalizedProductTitle,
  getProductGroupId,
  getSkuBySlug,
  getSkusByGroupId,
  productDataRevision,
} from "@/lib/catalog";
import ProductImageWithStatus from "@/components/site/ProductImageWithStatus";
import {
  getProductTypeLabel,
  getSkuImageMeta,
} from "@/lib/productImages";

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function productDescription(sku: ReturnType<typeof getAllSkus>[number], locale: string) {
  const title = getLocalizedProductTitle(sku, locale);
  const details = [getLocalizedProductMaterial(sku, locale), sku.gsmOrThickness, sku.coating, sku.structureOrFlute, sku.applications]
    .map((value) => getLocalizedCatalogValue(value, locale))
    .filter(Boolean)
    .join(" / ");

  return details ? `${title}. ${details}.` : title;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const sku = getSkuBySlug(slug);
  const category = getProductCategoryBySlug(slug);

  if (!sku) {
    if (category) {
      const title = locale === "zh" ? category.title.zh : category.title.en;
      const description = locale === "zh" ? category.description.zh : category.description.en;
      const canonical = await getLocaleUrl(locale, `/products/${category.slug}` as SiteHref);
      return {
        metadataBase: new URL(siteConfig.url),
        title: `${title} | ${siteConfig.name}`,
        description,
        alternates: { canonical, languages: await getAlternateLanguages(`/products/${category.slug}` as SiteHref) },
        openGraph: { title, description, url: canonical, siteName: siteConfig.name, type: "website" },
      };
    }
    return {
      title: siteConfig.name,
    };
  }

  const href = `/products/${sku.slug}` as SiteHref;
  const canonical = await getLocaleUrl(locale, href);
  const title = `${getLocalizedProductTitle(sku, locale)} | ${sku.sku}`;
  const description = productDescription(sku, locale);
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
      siteName: siteConfig.name,
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
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
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
        <div className="texture-paper min-h-screen bg-[#f6f4ec]">
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href="/products" className="text-sm font-bold text-[#171713]">{isZh ? "返回产品目录" : "Back to catalog"}</Link>
            <section className="premium-depth mt-6 rounded-lg border border-[#d9d2be] bg-[#171713] p-8 text-white sm:p-12">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e8c06c]">{isZh ? "产品分类" : "Product category"}</p>
              <h1 className="mt-4 text-4xl font-black sm:text-6xl">{categoryTitle}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#f7f0df]/78">{categoryDescription}</p>
              <Link href={categoryUrl} className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#e8c06c] px-5 text-sm font-black text-[#171713]">
                {isZh ? "查看全部规格" : "View all specifications"}
              </Link>
            </section>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorySkus.map((item) => (
                <Link key={item.sku} href={`/products/${item.slug}`} className="rounded-lg border border-[#d9d2be] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#9a6b1f]">{item.sku}</p>
                  <h2 className="mt-2 text-lg font-black text-[#171713]">{getLocalizedProductTitle(item, locale)}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#626156]">{getLocalizedProductMaterial(item, locale) || getLocalizedCatalogValue(item.gsmOrThickness, locale)}</p>
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
  const productHref = `/products/${sku.slug}` as SiteHref;
  const productUrl = await getLocaleUrl(locale, productHref);
  const contactHref = `/contact?product=${encodeURIComponent(sku.slug)}&sku=${encodeURIComponent(sku.sku)}&url=${encodeURIComponent(productUrl)}` as SiteHref;
  const productCategory = getProductCategoryForSku(sku);
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`${t("inquiry.message")}\n- ${isZh ? "产品编号" : "Product code"}: ${sku.sku} ${getLocalizedProductTitle(sku, locale)}\n- URL: ${productUrl}`)}`;
  const imageMeta = getSkuImageMeta(sku, locale);
  const groupVariants = getSkusByGroupId(getProductGroupId(sku));

  const specs = [
    [isZh ? "产品类型" : "Product type", getProductTypeLabel(sku.productType, locale)],
    [t("detail.material"), getLocalizedProductMaterial(sku, locale)],
    [t("detail.gsm"), getLocalizedCatalogValue(sku.gsmOrThickness, locale)],
    [isZh ? "涂层 / 淋膜" : "Coating", getLocalizedCatalogValue(sku.coating, locale)],
    [t("detail.structure"), getLocalizedCatalogValue(sku.structureOrFlute, locale)],
    [t("detail.surface"), getLocalizedCatalogValue(sku.surfaceProcess, locale)],
    [t("detail.finishing"), getLocalizedCatalogValue(sku.finishingProcess, locale)],
    [t("detail.size"), getLocalizedCatalogValue(sku.commonSize, locale)],
    [t("detail.moq"), getLocalizedCatalogValue(sku.moq, locale)],
    [t("detail.application"), getLocalizedCatalogValue(sku.applications, locale)],
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
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/kehong/factory.webp`,
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
    name: isZh ? sku.title.zh : sku.title.en,
    alternateName: isZh ? sku.title.en : undefined,
    sku: sku.sku,
    category: getProductTypeLabel(sku.productType, locale),
    material: getLocalizedProductMaterial(sku, locale) || undefined,
    description: productDescription(sku, locale),
    url: productUrl,
    image: imageMeta.status === "exact" ? absoluteSiteUrl(imageMeta.src) : undefined,
    brand: {
      "@type": "Brand",
      name: siteConfig.author.alias,
    },
    manufacturer: {
      "@type": "Organization",
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    additionalProperty: specs.map(([name, value]) => ({
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
      { "@type": "ListItem", position: 3, name: isZh ? productCategory.title.zh : productCategory.title.en, item: await getLocaleUrl(locale, `/products/${productCategory.slug}` as SiteHref) },
      { "@type": "ListItem", position: 4, name: getLocalizedProductTitle(sku, locale), item: productUrl },
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
        className="texture-paper min-h-screen bg-[#f6f4ec]"
      >
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/products" className="text-sm font-bold text-[#171713]">
          {t("detail.back")}
        </Link>
        <div className="premium-depth mt-6 overflow-hidden rounded-lg border border-[#d9d2be] bg-white shadow-2xl shadow-[#171713]/10 lg:grid lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[380px] lg:min-h-[720px]">
            <ProductImageWithStatus
              sku={sku}
              locale={locale}
              priority
              sizes="(min-width: 1024px) 48vw, 95vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(23,23,19,.62))]" />
            <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/18 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-black/16 backdrop-blur-xl">
              {sku.customizable ? "OEM / ODM" : isZh ? "产品" : "Product"}
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e8c06c]">
                {getProductTypeLabel(sku.productType, locale)}
              </p>
              <p className="mt-2 text-2xl font-black">{sku.sku}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-[#f1e7cf] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#9a6b1f]">
              {getCanonicalCategoryForSku(sku)?.localizedLabel[locale === "zh" ? "zh" : "en"] ?? getProductTypeLabel(sku.productType, locale)}
              </p>
              <span className="rounded-full bg-[#f6f4ec] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#626156]">
                {getProductTypeLabel(sku.productType, locale)}
              </span>
              {sku.customizable ? (
                <span className="rounded-full bg-[#171713] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white">
                  OEM / ODM
                </span>
              ) : null}
              <span className="rounded-full bg-[#f6f4ec] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#626156]">
                {groupVariants.length} {isZh ? "个变体" : groupVariants.length === 1 ? "variant" : "variants"}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#171713] sm:text-4xl lg:text-5xl">
              {getLocalizedProductTitle(sku, locale)}
            </h1>
            <p className="mt-4 text-base leading-8 text-[#626156]">
              {getLocalizedProductMaterial(sku, locale) || getProductTypeLabel(sku.productType, locale)}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {procurementCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="kh-panel rounded-md border border-[#d9d2be] bg-[#f6f4ec] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#171713] text-[#e8c06c]">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#626156]">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm font-bold leading-5 text-[#171713]">
                          {item.value}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="size-5 text-[#9a6b1f]" />
                <h2 className="text-xl font-black text-[#171713]">{t("detail.specs")}</h2>
              </div>
              <dl className="grid overflow-hidden rounded-lg border border-[#d9d2be] bg-white text-sm sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div key={label} className="border-b border-[#d9d2be] p-4 last:border-0">
                    <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#626156]">
                      {label}
                    </dt>
                    <dd className="mt-2 font-semibold text-[#171713]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-6 text-sm text-[#626156]">{t("detail.note")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#171713] text-white hover:bg-[#2b2b24]">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  {t("cta.whatsapp")}
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={contactHref}>
                  <FileText className="size-4" />
                  {isZh ? "获取报价" : "Request a quote"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.86fr]">
          <section className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-5 shadow-xl shadow-[#171713]/8 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#9a6b1f]" />
              <h2 className="text-xl font-black text-[#171713]">
                {isZh ? "应用、定制与质量保障" : "Applications, customization and quality assurance"}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#626156]">
                  {isZh ? "适用场景" : "Application"}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#171713]">
                  {getLocalizedCatalogValue(sku.applications, locale) || getProductTypeLabel(sku.productType, locale)}
                </p>
              </div>
              <div className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#626156]">
                  {isZh ? "表面 / 后工艺" : "Surface / finishing"}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#171713]">
                  {[sku.surfaceProcess, sku.finishingProcess]
                    .map((value) => getLocalizedCatalogValue(value, locale))
                    .filter(Boolean)
                    .join(" / ") || (isZh ? "按项目确认" : "Confirmed by project")}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {customNotes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-[#d9d2be] bg-[#f6f4ec] px-3 py-3 text-sm font-semibold leading-6 text-[#171713]">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#9a6b1f]" />
                  {item}
                </div>
              ))}
            </div>

            {groupVariants.length > 1 ? (
              <div className="mt-6 overflow-hidden rounded-lg border border-[#d9d2be]">
                <div className="flex items-center justify-between gap-3 bg-[#f6f4ec] px-4 py-3">
                  <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#171713]">
                    {isZh ? "产品选项" : "Product options"}
                  </h3>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a6b1f]">
                    {groupVariants.length} {isZh ? "项" : "items"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full border-collapse bg-white text-sm">
                    <thead>
                      <tr className="border-b border-[#d9d2be] text-left text-xs font-black uppercase tracking-[0.12em] text-[#626156]">
                        <th className="px-4 py-3">{isZh ? "产品编号" : "Product code"}</th>
                        <th className="px-4 py-3">{isZh ? "克重 / 厚度" : "GSM / thickness"}</th>
                        <th className="px-4 py-3">{isZh ? "涂层" : "Coating"}</th>
                        <th className="px-4 py-3">{isZh ? "尺寸" : "Size"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupVariants.map((variant) => (
                        <tr key={variant.sku} className="border-b border-[#f1e7cf] last:border-0">
                          <td className="px-4 py-3 font-black text-[#171713]">{variant.sku}</td>
                          <td className="px-4 py-3 text-[#626156]">{getLocalizedCatalogValue(variant.gsmOrThickness, locale) || "-"}</td>
                          <td className="px-4 py-3 text-[#626156]">{getLocalizedCatalogValue(variant.coating, locale) || "-"}</td>
                          <td className="px-4 py-3 text-[#626156]">{getLocalizedCatalogValue(variant.commonSize, locale) || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="kh-panel rounded-lg border border-[#d9d2be] bg-[#171713] p-5 text-white shadow-xl shadow-[#171713]/12 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e8c06c]">
              {isZh ? "报价所需信息" : "Quote checklist"}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight">
              {isZh ? "发这些信息，报价会更快。" : "Send these details for a faster quote."}
            </h2>
            <div className="mt-5 grid gap-2">
              {rfqChecklist.map((item) => (
                <span key={item} className="rounded-md border border-white/12 bg-white/8 px-3 py-2 text-sm font-bold text-[#f7f0df]/84">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-2">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e8c06c] px-4 text-sm font-black text-[#171713]">
                <MessageCircle className="size-4" />
                {isZh ? "咨询此产品" : "Discuss this product"}
              </a>
              <Link href={contactHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/18 px-4 text-sm font-black text-white">
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
                sku: sku.sku,
                name: isZh ? sku.title.zh : sku.title.en,
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
      </main>
        <SiteFooter />
      </div>
    </>
  );
}
