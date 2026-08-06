import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import ProductCatalog from "@/components/site/ProductCatalog";
import ProductDirectory from "@/components/site/ProductDirectory";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { buildProductCatalogView, getCatalogFilterOptions, getQueryValue } from "@/lib/catalog";
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
  const brand = getBrandConfig(locale);
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
      <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("products.eyebrow")}
          title={t("catalog.title")}
          lede={t("catalog.description")}
          meta={[
            locale === "zh" ? `${catalogView.allSkus.length} 个已发布 SKU` : `${catalogView.allSkus.length} published SKUs`,
            "OEM / ODM",
            locale === "zh" ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <a href="#catalog-list" className="kh-button kh-button-light">
            {locale === "zh" ? "查看产品规格" : "View specifications"}
          </a>
          <Link href="/contact" className="kh-button kh-button-ghost">
            {locale === "zh" ? "索取目录 / 规格资料" : "Request catalog / data sheet"}
          </Link>
        </PageHero>
        <ProductDirectory locale={locale} />
        <div id="catalog-list" className="kh-shell scroll-mt-24 py-10">
          <ProductCatalog
            skus={catalogView.skus}
            initialQuery={catalogView.initialQuery}
            initialFilters={catalogView.initialFilters}
            filterOptions={getCatalogFilterOptions(locale)}
            siteOrigin={siteConfig.url}
            pagination={{ page: catalogView.page, totalPages: catalogView.totalPages, totalGroups: catalogView.totalGroups, totalSkus: catalogView.filteredSkus.length, pageSize: catalogView.pageSize }}
            invalidFilters={catalogView.invalidFilters}
          />
        </div>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
