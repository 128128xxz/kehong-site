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
import { getPublicProductGroups, buildOrganizationJsonLd, buildProductGroupJsonLd } from "@/lib/aiEntities";
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
  const title = `${t("catalog.title")} | ${brand.name}`;
  const description = t("catalog.description");
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
  const productGroupsJsonLd = getPublicProductGroups().map((group) => buildProductGroupJsonLd(group, locale, `${siteConfig.url}/${locale}/products?group=${encodeURIComponent(group.id)}`));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I confirm a product specification?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Please send the target material, GSM, size, quantity and application. Kehong will confirm the suitable specification and sample requirements.",
        },
      },
      {
        "@type": "Question",
        name: "Can Kehong customize paper products?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kehong supports custom material, GSM, size, coating, printing and packaging structure based on project requirements.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@graph": productGroupsJsonLd }) }}
      />
      <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("products.eyebrow")}
          title={t("catalog.title")}
          lede={t("catalog.description")}
          meta={[
            locale === "zh" ? `${catalogView.allSkus.length} 个纸材与半成品 SKU` : `${catalogView.allSkus.length} material & semi-finished SKUs`,
            "OEM / ODM",
            locale === "zh" ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <a href="#materials-and-components" className="kh-button kh-button-light">
            {locale === "zh" ? "查看规格" : "View specifications"}
          </a>
          <Link href="/contact" className="kh-button kh-button-ghost">
            {locale === "zh" ? "索取目录 / 规格资料" : "Request catalog / data sheet"}
          </Link>
        </PageHero>
        <ProductDirectory locale={locale} section="materials" />
        <section id="catalog-list" aria-labelledby="material-catalog-title" className="kh-shell scroll-mt-24 py-10">
          <div className="mb-7 max-w-3xl">
            <p className="kh-eyebrow">{locale === "zh" ? "规格筛选" : "Specification catalog"}</p>
            <h2 id="material-catalog-title" className="mt-2 text-3xl font-semibold tracking-tight">{locale === "zh" ? "纸材与半成品 SKU 规格" : "Material & semi-finished SKU specifications"}</h2>
            <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{locale === "zh" ? "筛选器和 231 个已发布 SKU 仅对应纸材、卷材、平张和加工部件；成品包装项目请见下方目录。" : "Filters and the 231 published SKUs cover paper materials, rolls, sheets and converting components only. See the project-led finished packaging directory below."}</p>
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
        <ProductDirectory locale={locale} section="finished" />
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
