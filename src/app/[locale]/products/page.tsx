import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import ProductCatalog from "@/components/site/ProductCatalog";
import ProductDirectory from "@/components/site/ProductDirectory";
import { Link } from "@/i18n/navigation";
import { buildProductCatalogView, getCatalogFilterOptions, getQueryValue } from "@/lib/catalog";
import { buildOrganizationJsonLd } from "@/lib/aiEntities";
import { getCanonicalTaxonomyCategoryId } from "@/lib/taxonomy";
import { showcaseImages } from "@/data/visuals";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

// Only the query-sensitive catalogue opts out of static data reuse. Other
// routes keep their normal rendering strategy.
export const revalidate = 0;

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });
  const brand = getBrandConfig(locale);
  const title = `${locale === "zh" ? "产品目录" : "Finished Packaging"} | ${brand.name}`;
  const description = locale === "zh"
    ? "食品盒、蛋糕盒、纸袋与瓦楞邮寄盒，按用途、结构、材料和数量提供定制包装支持。"
    : "Food boxes, cake packaging, paper bags and corrugated mailers developed around your application, structure, material and quantity.";
  const canonical = await getLocaleUrl(locale, "/products");
  const query = searchParams ? await searchParams : {};
  const hasFilters = ["system", "category", "group", "productType", "material", "gsm", "coating", "process", "customizable", "search", "page"]
    .some((key) => query[key] !== undefined);

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical,
      languages: await getAlternateLanguages("/products"),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: showcaseImages.webOpenShippingBox,
          width: 1200,
          height: 630,
          alt: t("catalog.title"),
        },
      ],
      locale: openGraphLocales[locale] ?? locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [showcaseImages.webOpenShippingBox],
    },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site" });
  const value = (key: string) => getQueryValue(query[key]);
  const legacyCatalogFilter = value("productType") === "paper-cup-fan"
    || /paper-cup-fan|cupfan/iu.test(value("group"));
  if (legacyCatalogFilter) redirect(`/${locale}/products`);
  const rawCategory = value("category");
  const canonicalCategory = getCanonicalTaxonomyCategoryId(rawCategory);
  if (rawCategory && canonicalCategory && canonicalCategory !== rawCategory) {
    const normalized = new URLSearchParams();
    Object.entries(query).forEach(([key, rawValue]) => {
      if (typeof rawValue === "string" && rawValue) normalized.set(key, key === "category" ? (canonicalCategory ?? "") : rawValue);
    });
    if (!canonicalCategory) normalized.delete("category");
    const suffix = normalized.toString();
    redirect(`/${locale}/products${suffix ? `?${suffix}` : ""}`);
  }
  const catalogView = buildProductCatalogView(query, locale);
  const organizationJsonLd = buildOrganizationJsonLd(locale, t("catalog.description"));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What should I send to confirm a product?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Send the material, GSM, size, quantity and application. Kehong will confirm a suitable option and whether a sample is needed.",
        },
      },
      {
        "@type": "Question",
        name: "Can Kehong customize paper products?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kehong supports custom material, GSM, size, coating, printing and packaging structure for your project.",
        },
      },
      {
        "@type": "Question",
        name: "What should buyers send for a quotation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Please send the product type, material, GSM, size, quantity, target market, print details and any sample photos or drawings.",
        },
      },
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("products.eyebrow")}
          title={locale === "zh" ? "成品包装" : "Finished Packaging"}
          lede={locale === "zh" ? "食品盒、蛋糕盒、纸袋与瓦楞邮寄盒，按用途、结构、材料和数量提供定制包装支持。" : "Food boxes, cake packaging, paper bags and corrugated mailers developed around your application, structure, material and quantity."}
          meta={[
            locale === "zh" ? "材料与加工能力" : "Materials & converting",
            "OEM / ODM",
            locale === "zh" ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <a href="#finished-packaging" className="kh-button kh-button-light">
            {locale === "zh" ? "查看包装类型" : "Explore packaging"}
          </a>
          <Link href="/contact" className="kh-button kh-button-ghost">
            {locale === "zh" ? "查看全部规格" : "View all specifications"}
          </Link>
        </PageHero>
        <ProductDirectory locale={locale} section="finished" />
        <ProductDirectory locale={locale} section="materials" />
        <section id="catalog-list" aria-labelledby="material-catalog-title" className="kh-shell scroll-mt-24 py-10">
          <div className="mb-7 max-w-3xl">
            <p className="kh-eyebrow">{locale === "zh" ? "规格筛选" : "Specification catalog"}</p>
            <h2 id="material-catalog-title" className="mt-2 text-3xl font-semibold tracking-tight">{locale === "zh" ? "材料与加工规格" : "Materials & converting specifications"}</h2>
            <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{locale === "zh" ? "这里集中展示纸材、卷材、平张和加工部件的规格筛选。成品包装请先从上方的包装目录开始。" : "Use this section to compare paper materials, rolls, sheets and converting components. Start with the finished-packaging directory above for project-led packaging."}</p>
          </div>
          <ProductCatalog
            skus={catalogView.skus}
            initialQuery={catalogView.initialQuery}
            initialFilters={catalogView.initialFilters}
            filterOptions={getCatalogFilterOptions(locale)}
            siteOrigin={siteConfig.url}
            pagination={{ page: catalogView.page, totalPages: catalogView.totalPages, totalGroups: catalogView.totalGroups, totalSkus: catalogView.filteredSkus.length, pageSize: catalogView.pageSize }}
            invalidFilters={catalogView.invalidFilters}
          />
        </section>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
