import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { productFamilyCatalog, getFamilyPublishedGroups, getPublicProductFamilyBySlug, isPublicProductFamily } from "@/data/product-family-catalog";
import { buildProductGroupSummary, getLocalizedProductMaterial, getLocalizedProductTitle, getLocalizedCatalogValue, getLocalizedProductSku } from "@/lib/catalog";
import { formatProductFieldValue } from "@/lib/productPresentation";
import { getPublicAssetMeta } from "@/lib/productImages";
import { siteConfig } from "@/lib/site";
import ProductFamilyVariantTable from "@/components/site/ProductFamilyVariantTable";
import { isSourceOnlyRecord } from "@/data/sourceOnlyRecords";

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ProductFamilyPage({ locale, familySlug }: { locale: string; familySlug: string }) {
  const config = getPublicProductFamilyBySlug(familySlug);
  if (!config) return null;
  const t = await getTranslations({ locale, namespace: "ProductFamilies" });
  const tx = t as unknown as (key: string, values?: Record<string, unknown>) => string;
  const familyKey = `family.${config.id}`;
  const image = getPublicAssetMeta(config.imageId, locale);
  const publishedGroups = getFamilyPublishedGroups(config)
    .map((group) => ({ ...group, variants: group.variants.filter((variant) => !isSourceOnlyRecord(variant.id)) }))
    .filter((group) => group.variants.length > 0);
  const publishedVariants = publishedGroups.flatMap((group) => group.variants);
  const related = productFamilyCatalog.filter((candidate) => isPublicProductFamily(candidate) && candidate.id !== config.id).sort((a, b) => a.navigationPriority - b.navigationPriority).slice(0, 4);
  const familyHref = `/products/families/${config.routeSlug}`;
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tx(`${familyKey}.title`),
    description: tx(`${familyKey}.description`),
    url: `${siteConfig.url}/${locale}${familyHref}`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tx("breadcrumbProducts"), item: `${siteConfig.url}/${locale}/products` },
      { "@type": "ListItem", position: 2, name: tx("breadcrumbFamilies"), item: `${siteConfig.url}/${locale}/products#product-families` },
      { "@type": "ListItem", position: 3, name: tx(`${familyKey}.title`), item: `${siteConfig.url}/${locale}${familyHref}` },
    ],
  };

  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <main>
        <section className="kh-shell pt-7 sm:pt-10">
          <nav aria-label={locale === "zh" ? "面包屑" : "Breadcrumb"} className="kh-mono flex flex-wrap items-center gap-2 text-xs text-(--kh-muted)">
            <Link href="/products" className="kh-text-link">{tx("breadcrumbProducts")}</Link><span aria-hidden="true">/</span>
            <Link href="/products#product-families" className="kh-text-link">{tx("breadcrumbFamilies")}</Link><span aria-hidden="true">/</span>
            <span>{tx(`${familyKey}.title`)}</span>
          </nav>
        </section>
        <section className="kh-shell grid gap-8 py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)] lg:items-end lg:py-12">
          <div>
            <p className="kh-eyebrow">{String(config.navigationPriority).padStart(2, "0")} · {tx("eyebrow")}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-(--kh-ink) sm:text-6xl">{tx(`${familyKey}.title`)}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-(--kh-muted) sm:text-lg">{tx(`${familyKey}.description`)}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/contact?interest=${encodeURIComponent(config.rfqInterestValue)}&family=${config.id}`} className="kh-button kh-button-dark">{tx("requestQuote")}</Link>
              <Link href="/products" className="kh-button kh-button-ghost">{tx("viewAllSpecifications")}</Link>
            </div>
          </div>
          <figure className="overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface-muted)">
            <div className="relative aspect-[4/3]">
              {image ? <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /> : null}
            </div>
            <figcaption className="px-4 py-3 text-xs leading-5 text-(--kh-muted)">{tx("representativeNote")}</figcaption>
          </figure>
        </section>
        <section className="kh-section kh-section-muted border-y border-(--kh-line)" aria-labelledby="family-brief-title">
          <div className="kh-shell">
            <p className="kh-eyebrow">02 · {tx("eyebrow")}</p>
            <h2 id="family-brief-title" className="mt-2 text-2xl font-semibold text-(--kh-ink)">{tx("commonParameters")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {(["material", "forms", "applications", "capabilities", "parameters"] as const).map((field) => (
                <article key={field} className="kh-panel p-5">
                  <p className="kh-eyebrow">{tx(field === "material" ? "materials" : field === "parameters" ? "commonParameters" : field)}</p>
                  <p className="mt-3 text-sm leading-6 text-(--kh-ink)">{tx(`${familyKey}.${field}`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="kh-shell py-12 sm:py-16" aria-labelledby="published-specs-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kh-eyebrow">03 · {tx("publishedSpecs")}</p>
              <h2 id="published-specs-title" className="mt-2 text-3xl font-semibold text-(--kh-ink)">{tx("publishedSpecs")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-(--kh-muted)">{tx("publishedSpecsDescription")}</p>
            </div>
            {publishedVariants.length ? <span className="kh-mono text-xs text-(--kh-muted)">{tx("publishedCount", { count: publishedVariants.length })}</span> : null}
          </div>
          {publishedGroups.length ? (
            <div className="mt-7 grid gap-4">
              {publishedGroups.map((group) => {
                const summary = buildProductGroupSummary({ id: group.id, representative: group.representative, variants: group.variants }, locale);
                const first = group.representative;
                const specs = [
                  [locale === "zh" ? "材料" : "Material", getLocalizedProductMaterial(first, locale)],
                  [locale === "zh" ? "克重 / 厚度" : "GSM / thickness", getLocalizedCatalogValue(first.gsmOrThickness, locale)],
                  [locale === "zh" ? "结构" : "Structure", formatProductFieldValue(getLocalizedCatalogValue(first.structureOrFlute, locale), "structure", locale)],
                  [locale === "zh" ? "尺寸" : "Size", formatProductFieldValue(getLocalizedCatalogValue(first.commonSize, locale), "size", locale)],
                ].filter(([, value]) => value);
                return (
                  <article key={group.id} className="kh-panel p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="kh-eyebrow">{group.variants.length} · {tx("publishedSpecs")}</p>
                        <h3 className="mt-2 text-xl font-semibold leading-tight text-(--kh-ink)">{summary.title || getLocalizedProductTitle(first, locale)}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--kh-muted)">
                          {locale === "zh" ? "按实际公开 SKU 对比材料、涂层、克重与关键规格。" : "Compare material, coating, GSM and key specifications across the published SKUs."}
                        </p>
                      </div>
                      <Link href={`/products/${first.slug}`} className="kh-button kh-button-secondary kh-button-compact shrink-0">{tx("viewPublishedSpecs")}</Link>
                    </div>
                    <dl className="mt-5 grid gap-2 border-y border-(--kh-line) py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      {specs.map(([label, value]) => <div key={label} className="grid gap-1"><dt className="text-xs font-semibold uppercase tracking-[.08em] text-(--kh-muted)">{label}</dt><dd className="font-semibold text-(--kh-ink)">{value}</dd></div>)}
                    </dl>
                    <details className="mt-4 group/variants" open={group.variants.length <= 20}>
                      <summary className="cursor-pointer list-none text-sm font-semibold text-(--kh-forest) marker:hidden">
                        <span className="inline-flex items-center gap-2">{locale === "zh" ? `查看 ${group.variants.length} 个变体` : `View ${group.variants.length} variants`}<span aria-hidden="true" className="transition group-open/variants:rotate-90">→</span></span>
                      </summary>
                      <ProductFamilyVariantTable variants={group.variants.map((variant) => getLocalizedProductSku(variant, locale))} locale={locale} />
                    </details>
                  </article>
                );
              })}
            </div>
          ) : <div className="kh-panel mt-7 p-6 text-sm leading-6 text-(--kh-muted)">{config.id === "service" ? tx("serviceNote") : tx("noPublishedSpecs")}</div>}
        </section>
        <section className="kh-shell py-10 sm:py-12" aria-labelledby="project-support-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kh-eyebrow">05 · {tx("projectSupport")}</p>
              <h2 id="project-support-title" className="mt-2 text-2xl font-semibold text-(--kh-ink)">{tx("projectSupport")}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/capabilities" className="kh-button kh-button-ghost">{tx("capabilitiesLink")}</Link>
              <Link href="/process" className="kh-button kh-button-ghost">{tx("processLink")}</Link>
            </div>
          </div>
        </section>
        <section className="kh-section kh-section-muted border-y border-(--kh-line)" aria-labelledby="related-families-title">
          <div className="kh-shell">
            <p className="kh-eyebrow">04 · {tx("relatedFamilies")}</p>
            <h2 id="related-families-title" className="mt-2 text-2xl font-semibold text-(--kh-ink)">{tx("relatedFamilies")}</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => <Link key={item.id} href={`/products/families/${item.routeSlug}`} className="kh-panel p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><span className="kh-eyebrow">{String(item.navigationPriority).padStart(2, "0")}</span><span className="mt-2 block text-base font-semibold text-(--kh-ink)">{tx(`family.${item.id}.title`)}</span></Link>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
