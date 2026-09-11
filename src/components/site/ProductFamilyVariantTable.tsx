import { Link } from "@/i18n/navigation";
import type { ProductSku } from "@/lib/catalog";
import { getLocalizedCatalogValue, getLocalizedProductMaterial } from "@/lib/catalog";
import { isDataConflictSku } from "@/data/dataConflictRecords";
import { formatProductFieldValue } from "@/lib/productPresentation";

type Props = {
  variants: ProductSku[];
  locale: string;
};

function valueOrDash(value: string | undefined) {
  return value || "—";
}

export default function ProductFamilyVariantTable({ variants, locale }: Props) {
  const isZh = locale === "zh";
  const hideCoating = variants.some(isDataConflictSku);

  return (
    <div className="border-t border-(--kh-line) pt-4">
      <div className="hidden overflow-x-auto lg:block" role="region" aria-label={isZh ? "产品变体表格" : "Product variant table"} tabIndex={0}>
        <table className="min-w-[860px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--kh-line) text-left text-[11px] font-semibold uppercase tracking-[.08em] text-(--kh-muted)">
              <th className="px-3 py-3">{isZh ? "参考编号" : "Ref"}</th>
              <th className="px-3 py-3">{isZh ? "材料" : "Material"}</th>
              {!hideCoating ? <th className="px-3 py-3">{isZh ? "涂层" : "Coating"}</th> : null}
              <th className="px-3 py-3">{isZh ? "克重" : "GSM"}</th>
              <th className="px-3 py-3">{isZh ? "关键规格" : "Key specification"}</th>
              <th className="px-3 py-3 text-right">{isZh ? "查看" : "View"}</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => {
              const keySpecification = formatProductFieldValue(
                getLocalizedCatalogValue(variant.commonSize, locale) ||
                  getLocalizedCatalogValue(variant.structureOrFlute, locale) ||
                  getLocalizedCatalogValue(variant.applications, locale),
                "size",
                locale,
              );
              return (
                <tr key={variant.sku} className="border-b border-(--kh-paper-deep) last:border-0">
                  <td className="px-3 py-3 align-top font-semibold text-(--kh-ink)">{variant.sku}</td>
                  <td className="px-3 py-3 align-top text-(--kh-muted)">{valueOrDash(getLocalizedProductMaterial(variant, locale))}</td>
                  {!hideCoating ? <td className="px-3 py-3 align-top text-(--kh-muted)">{valueOrDash(getLocalizedCatalogValue(variant.coating, locale))}</td> : null}
                  <td className="px-3 py-3 align-top text-(--kh-muted)">{valueOrDash(getLocalizedCatalogValue(variant.gsmOrThickness, locale))}</td>
                  <td className="px-3 py-3 align-top text-(--kh-muted)">{valueOrDash(keySpecification)}</td>
                  <td className="px-3 py-3 text-right align-top"><Link href={`/products/${variant.slug}`} className="kh-text-link whitespace-nowrap">{isZh ? "看详情" : "View SKU"} →</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 lg:hidden">
        {variants.map((variant) => {
          const keySpecification = formatProductFieldValue(
            getLocalizedCatalogValue(variant.commonSize, locale) ||
              getLocalizedCatalogValue(variant.structureOrFlute, locale) ||
              getLocalizedCatalogValue(variant.applications, locale),
            "size",
            locale,
          );
          return (
            <article key={variant.sku} className="rounded-md border border-(--kh-line) bg-(--kh-surface) p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="kh-mono min-w-0 break-all text-xs font-semibold text-(--kh-ink)">{variant.sku}</p>
                <Link href={`/products/${variant.slug}`} className="kh-text-link shrink-0 text-xs">{isZh ? "查看" : "View"} →</Link>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div><dt className="text-(--kh-muted)">{isZh ? "材料" : "Material"}</dt><dd className="mt-1 font-semibold text-(--kh-ink)">{valueOrDash(getLocalizedProductMaterial(variant, locale))}</dd></div>
                {!hideCoating ? <div><dt className="text-(--kh-muted)">{isZh ? "涂层" : "Coating"}</dt><dd className="mt-1 font-semibold text-(--kh-ink)">{valueOrDash(getLocalizedCatalogValue(variant.coating, locale))}</dd></div> : null}
                <div><dt className="text-(--kh-muted)">{isZh ? "克重" : "GSM"}</dt><dd className="mt-1 font-semibold text-(--kh-ink)">{valueOrDash(getLocalizedCatalogValue(variant.gsmOrThickness, locale))}</dd></div>
                <div><dt className="text-(--kh-muted)">{isZh ? "关键规格" : "Key specification"}</dt><dd className="mt-1 font-semibold text-(--kh-ink)">{valueOrDash(keySpecification)}</dd></div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
