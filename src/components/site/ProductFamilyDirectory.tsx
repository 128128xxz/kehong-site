import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { productFamilyCatalog, CORE_PRODUCT_ANCHOR, getFamilyPublishedGroups } from "@/data/product-family-catalog";
import { buildProductGroupSummary, getLocalizedProductTitle } from "@/lib/catalog";
import { getPublicAssetMeta } from "@/lib/productImages";

type Props = {
  locale: string;
  showAnchor?: boolean;
};

export default async function ProductFamilyDirectory({ locale, showAnchor = true }: Props) {
  const t = await getTranslations({ locale, namespace: "ProductFamilies" });
  const tx = t as unknown as (key: string, values?: Record<string, unknown>) => string;
  const sortedFamilies = [...productFamilyCatalog].sort((a, b) => a.navigationPriority - b.navigationPriority);

  return (
    <section id="product-families" aria-labelledby="product-families-title" className="kh-shell scroll-mt-24 py-12 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="kh-eyebrow">{tx("eyebrow")}</p>
          <h2 id="product-families-title" className="mt-2 text-3xl font-semibold tracking-tight text-(--kh-ink) sm:text-4xl">{tx("breadcrumbFamilies")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-(--kh-muted)">{tx("publishedSpecsDescription")}</p>
        </div>
        {showAnchor ? <Link href="/products/food-tray-paper-material" className="kh-button kh-button-dark self-start md:self-auto">{tx("anchorEyebrow")}</Link> : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sortedFamilies.map((config) => {
          const familyKey = `family.${config.id}`;
          const image = getPublicAssetMeta(config.imageId, locale);
          // The cup family contains a large manual-review cluster. Keep the
          // published directory accessible, but promote only the approved
          // singleton anchor in this family-first surface.
          const publishedGroups = getFamilyPublishedGroups(config).filter((group) => config.id !== "cup" || group.id === CORE_PRODUCT_ANCHOR.sourceClusterId.replace(/^cluster-/, ""));
          const familyHref = `/products/families/${config.routeSlug}`;
          return (
            <div key={config.id} className="kh-panel flex min-h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/9] bg-(--kh-surface-muted)">
                {image ? <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /> : null}
                <span className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-(--kh-ink)/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">{image?.statusLabel ?? tx("representativeNote")}</span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="kh-eyebrow">{String(config.navigationPriority).padStart(2, "0")} · {tx("eyebrow")}</p>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-(--kh-ink)">{tx(`${familyKey}.title`)}</h3>
                <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{tx(`${familyKey}.description`)}</p>
                <dl className="mt-5 grid gap-3 border-t border-(--kh-line) pt-4 text-sm">
                  {(["material", "forms", "applications", "capabilities", "parameters"] as const).map((field) => (
                    <div key={field} className="grid grid-cols-[7.5rem_1fr] gap-3">
                      <dt className="font-semibold text-(--kh-ink)">{tx(field === "material" ? "materials" : field === "parameters" ? "commonParameters" : field)}</dt>
                      <dd className="text-(--kh-muted)">{tx(`${familyKey}.${field}`)}</dd>
                    </div>
                  ))}
                </dl>
                {publishedGroups.length ? (
                  <div className="mt-5 border-t border-(--kh-line) pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--kh-muted)">{tx("publishedSpecs")}</p>
                    <div className="mt-2 space-y-2">
                      {publishedGroups.slice(0, 6).map((group) => {
                        const summary = buildProductGroupSummary({ id: group.id, representative: group.representative, variants: group.variants }, locale);
                        return (
                          <Link key={group.id} href={`/products/${group.representative.slug}`} className="block rounded-md border border-(--kh-line) px-3 py-2 transition hover:border-(--kh-forest)/50 hover:bg-(--kh-surface-muted)">
                            <span className="block text-sm font-semibold text-(--kh-ink)">{summary.title || getLocalizedProductTitle(group.representative, locale)}</span>
                            <span className="block text-xs text-(--kh-muted)">{tx("publishedCount", { count: group.variants.length })}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : <p className="mt-5 border-t border-(--kh-line) pt-4 text-sm leading-6 text-(--kh-muted)">{tx("noPublishedSpecs")}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={familyHref} className="kh-button kh-button-dark">{tx("viewFamily")}</Link>
                  <Link href={`/contact?interest=${encodeURIComponent(config.rfqInterestValue)}&family=${config.id}`} className="kh-button kh-button-ghost">{tx("requestQuote")}</Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
