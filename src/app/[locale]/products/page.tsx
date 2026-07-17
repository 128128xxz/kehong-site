import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import ProductCatalog from "@/components/site/ProductCatalog";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { filterCatalogSkus, getAllSkus, getCatalogFilterOptions, getCatalogGroups, getLocalizedProductSku, getProductGroupId } from "@/lib/catalog";
import { showcaseImages } from "@/data/visuals";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";

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
  const title = `${t("catalog.title")} | ${siteConfig.name}`;
  const description = t("catalog.description");
  const canonical = await getLocaleUrl(locale, "/products");
  const query = searchParams ? await searchParams : {};
  const hasFilters = ["category", "group", "productType", "material", "gsm", "coating", "process", "customizable", "search", "page"]
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
      siteName: siteConfig.name,
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
  const value = (key: string) => (typeof query[key] === "string" ? query[key] : "");
  const page = Math.max(1, Number.parseInt(value("page") || "1", 10) || 1);
  const allSkus = getAllSkus();
  const filteredSkus = filterCatalogSkus({
    category: value("category"),
    group: value("group"),
    productType: value("productType"),
    material: value("material"),
    gsm: value("gsm"),
    coating: value("coating"),
    process: value("process"),
    customizable: value("customizable") === "true",
    search: value("search"),
  }, allSkus);
  const allGroups = getCatalogGroups(filteredSkus);
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(allGroups.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleGroupIds = new Set(allGroups.slice((safePage - 1) * pageSize, safePage * pageSize).map((group) => group.id));
  const skus = filteredSkus
    .filter((sku) => visibleGroupIds.has(getProductGroupId(sku)))
    .map((sku) => getLocalizedProductSku(sku, locale));
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
      <div className="texture-paper min-h-screen bg-[#f6f4ec]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="premium-depth kh-micro-grid grid overflow-hidden rounded-lg border border-[#d9d2be] bg-[#171713] text-white shadow-2xl shadow-[#171713]/12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
              {t("products.eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
              {t("catalog.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#f7f0df]/76">
              {t("catalog.description")}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#catalog-list"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#e8c06c] px-5 text-sm font-black text-[#171713]"
              >
                {locale === "zh" ? "查看产品规格" : "View specifications"}
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/22 px-5 text-sm font-black text-white"
              >
                {locale === "zh" ? "索取目录 / 规格资料" : "Request catalog / data sheet"}
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px]">
            <Image
              src={showcaseImages.webOpenShippingBox}
              alt="Kehong paper material swatches"
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 95vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,19,.52),rgba(23,23,19,.05))]" />
          </div>
        </section>
        <div id="catalog-list" className="mt-10 scroll-mt-24">
          <ProductCatalog
            skus={skus}
            initialQuery={value("search")}
            filterOptions={getCatalogFilterOptions(locale)}
            siteOrigin={siteConfig.url}
            pagination={{ page: safePage, totalPages, totalGroups: allGroups.length, totalSkus: filteredSkus.length, pageSize }}
          />
        </div>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
