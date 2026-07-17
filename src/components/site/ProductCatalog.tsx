"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Filter, Layers3, MessageCircle, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { contact } from "@/data/company";
import { Button } from "@/components/ui/button";
import ProductImageWithStatus from "@/components/site/ProductImageWithStatus";
import {
  getCommonGsmOptions,
  getCanonicalCategoryBySlug,
  getCatalogGroups,
  getLocalizedCatalogValue,
  getLocalizedProductMaterial,
  getLocalizedProductTitle,
  type CatalogFilterOptions,
  type ProductSku,
} from "@/lib/catalog";
import { getProductTypeLabel } from "@/lib/productImages";

type Props = {
  skus: ProductSku[];
  initialQuery?: string;
  filterOptions?: CatalogFilterOptions;
  siteOrigin?: string;
  pagination?: { page: number; totalPages: number; totalGroups: number; totalSkus: number; pageSize: number };
};

export default function ProductCatalog({ skus, initialQuery = "", filterOptions, pagination, siteOrigin = "https://www.kehong.tech" }: Props) {
  const t = useTranslations("Site");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("search") ?? initialQuery;
  const category = searchParams.get("category") ?? "";
  const productType = searchParams.get("productType") ?? "";
  const material = searchParams.get("material") ?? "";
  const coating = searchParams.get("coating") ?? "";
  const process = searchParams.get("process") ?? "";
  const gsm = searchParams.get("gsm") ?? "";
  const customOnly = searchParams.get("customizable") === "true";
  const [draftQuery, setDraftQuery] = useState(query);
  const [selected, setSelected] = useState<ProductSku[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const groups = useMemo(() => getCatalogGroups(skus), [skus]);
  const options = filterOptions ?? {
    categories: [],
    productTypes: Array.from(new Set(skus.map((sku) => sku.productType))),
    materials: Array.from(new Set(skus.flatMap((sku) => sku.materialIds ?? []).filter(Boolean))),
    gsm: getCommonGsmOptions(productType),
    coatings: Array.from(new Set(skus.map((sku) => sku.coating).filter(Boolean))),
    processes: Array.from(new Set(skus.flatMap((sku) => sku.process ?? [sku.surfaceProcess]).filter(Boolean))),
  };

  // URL changes should update the editable search field while preserving the current visual state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraftQuery(query), [query]);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem("kehong-selected-products");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSelected(JSON.parse(stored) as ProductSku[]);
    } catch {
      // Ignore unavailable storage in privacy-restricted browsers.
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem("kehong-selected-products", JSON.stringify(selected));
    } catch {
      // Ignore unavailable storage in privacy-restricted browsers.
    }
  }, [selected]);

  const updateUrl = (key: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (resetPage) params.delete("page");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}#catalog-list` : `${pathname}#catalog-list`);
    setMobileFiltersOpen(false);
  };

  const inquiryMessage = encodeURIComponent(
    `${t("inquiry.message")}\n${selected
      .map((sku) => `- ${sku.sku} ${getLocalizedProductTitle(sku, locale)} · ${new URL(`/${locale}/products/${sku.slug}`, siteOrigin).toString()}`)
      .join("\n")}`,
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${inquiryMessage}`;

  const addSku = (sku: ProductSku) => {
    setSelected((current) =>
      current.some((item) => item.sku === sku.sku) ? current : [...current, sku],
    );
  };

  const removeSku = (sku: ProductSku) => {
    setSelected((current) => current.filter((item) => item.sku !== sku.sku));
  };

  const reset = () => {
    router.push(`${pathname}#catalog-list`);
  };

  const quickFilters = [
    { label: locale === "zh" ? "食品包装" : "Food", value: "food" },
    { label: locale === "zh" ? "纸盒/内托" : "Boxes", value: "box" },
    { label: locale === "zh" ? "金银卡" : "Gold board", value: "gold" },
    { label: locale === "zh" ? "坑纸材料" : "Corrugated", value: "corrugated" },
  ];

  return (
    <div className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          aria-controls="catalog-filters"
          aria-expanded={mobileFiltersOpen}
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#171713]/18 bg-white px-4 text-sm font-black text-[#171713] shadow-sm"
        >
          <Filter className="size-4" />
          {locale === "zh" ? "筛选产品" : "Filter products"}
        </button>
        <span className="text-right text-xs font-bold leading-5 text-[#626156]">
          {pagination?.totalGroups ?? groups.length} {locale === "zh" ? "个产品组" : "product groups"}
        </span>
      </div>

      {mobileFiltersOpen ? (
        <button
          type="button"
          aria-label={locale === "zh" ? "关闭筛选背景" : "Close filter backdrop"}
          onClick={() => setMobileFiltersOpen(false)}
          className="fixed inset-0 z-40 bg-[#171713]/48 lg:hidden"
        />
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside
        id="catalog-filters"
        className={`kh-panel min-w-0 w-full max-w-full h-fit rounded-lg border border-[#d9d2be] bg-white/92 p-5 shadow-xl shadow-[#171713]/8 backdrop-blur-xl lg:sticky lg:top-20 ${mobileFiltersOpen ? "fixed inset-x-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto" : "hidden lg:block"}`}
        aria-label={locale === "zh" ? "产品筛选" : "Product filters"}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-sm font-black text-[#171713]">{locale === "zh" ? "筛选产品" : "Filter products"}</p>
          <button
            type="button"
            aria-label={locale === "zh" ? "关闭筛选" : "Close filters"}
            onClick={() => setMobileFiltersOpen(false)}
            className="grid size-10 place-items-center rounded-full border border-[#171713]/14 bg-white text-[#171713]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#626156]" />
          <input
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") updateUrl("search", draftQuery.trim());
            }}
            placeholder={t("catalog.search")}
            className="kh-input min-w-0 h-11 w-full max-w-full rounded-md pl-10 pr-3 text-sm outline-none"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setDraftQuery(filter.value);
                updateUrl("search", filter.value);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                query === filter.value
                  ? "border-[#171713] bg-[#171713] text-white"
                  : "border-[#d9d2be] bg-[#fbfaf5] text-[#626156] hover:border-[#171713]/40"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          <FilterSelect
            label={t("catalog.category")}
            value={category}
            options={options.categories}
            onChange={(value) => updateUrl("category", value)}
            allLabel={t("catalog.all")}
            formatOption={(value) => {
              const category = getCanonicalCategoryBySlug(value);
              return category ? (locale === "zh" ? category.localizedLabel.zh : category.localizedLabel.en) : value.replaceAll("-", " ");
            }}
          />
          <FilterSelect
            label={locale === "zh" ? "产品类型" : "Product type"}
            value={productType}
            options={options.productTypes}
            onChange={(value) => updateUrl("productType", value)}
            allLabel={t("catalog.all")}
            formatOption={(value) => getProductTypeLabel(value, locale)}
          />
          <FilterSelect
            label={t("catalog.material")}
            value={material}
            options={options.materials}
            onChange={(value) => updateUrl("material", value)}
            allLabel={t("catalog.all")}
            formatOption={(value) => getLocalizedCatalogValue(value, locale)}
          />
          <FilterSelect
            label={locale === "zh" ? "克重 / GSM" : "GSM / weight"}
            value={gsm}
            options={options.gsm}
            onChange={(value) => updateUrl("gsm", value)}
            allLabel={t("catalog.all")}
          />
          <FilterSelect
            label={locale === "zh" ? "涂层 / 淋膜" : "Coating"}
            value={coating}
            options={options.coatings}
            onChange={(value) => updateUrl("coating", value)}
            allLabel={t("catalog.all")}
          />
          <FilterSelect
            label={t("catalog.process")}
            value={process}
            options={options.processes}
            onChange={(value) => updateUrl("process", value)}
            allLabel={t("catalog.all")}
            formatOption={(value) => getLocalizedCatalogValue(value, locale)}
          />
          <label className="flex items-center gap-3 rounded-md border border-[#d9d2be] bg-[#fbfaf5] px-3 py-3 text-sm font-semibold text-[#171713] shadow-inner shadow-white/40">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(event) => updateUrl("customizable", event.target.checked ? "true" : "")}
              className="size-4 accent-[#171713]"
            />
            {t("catalog.customizable")}
          </label>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#171713]/30 text-[#171713]"
            onClick={reset}
          >
            <X className="size-4" />
            {t("catalog.reset")}
          </Button>
        </div>

        <div className="premium-depth kh-micro-grid mt-6 rounded-lg border border-[#171713]/10 bg-[#171713] p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">{t("inquiry.selected")}</p>
            <span className="kh-status-dot inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8c06c]">
              {selected.length}
            </span>
          </div>
          {selected.length === 0 ? (
            <div>
              <p className="mt-2 text-sm text-[#f7f0df]/70">{t("inquiry.empty")}</p>
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/18 px-4 py-2 text-sm font-bold text-white"
              >
                <MessageCircle className="size-4 text-[#e8c06c]" />
                {t("cta.whatsapp")}
              </a>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {selected.map((sku) => (
                <div key={sku.sku} className="flex items-center justify-between gap-2 rounded-md bg-white/8 px-2 py-1 text-xs leading-5 text-[#f7f0df]/78">
                  <span>{sku.sku}</span>
                  <button
                    type="button"
                    onClick={() => removeSku(sku)}
                    className="grid size-6 shrink-0 place-items-center rounded-full text-[#f7f0df]/70 transition hover:bg-white/10 hover:text-white"
                    aria-label={locale === "zh" ? `移除 ${sku.sku}` : `Remove ${sku.sku}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e8c06c] px-4 py-2 text-sm font-bold text-[#171713]"
              >
                <MessageCircle className="size-4" />
                {t("cta.whatsapp")}
              </a>
            </div>
          )}
        </div>
      </aside>

      <section className="min-w-0 max-w-full">
        <div className="mb-4 grid gap-3 rounded-lg border border-[#d9d2be] bg-white/86 p-4 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black text-[#171713]">
              {locale === "zh"
                ? `${pagination?.totalGroups ?? groups.length} 个产品组 / ${pagination?.totalSkus ?? skus.length} 个产品`
                : `${pagination?.totalGroups ?? groups.length} product groups / ${pagination?.totalSkus ?? skus.length} products`}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#626156]">
              {locale === "zh"
                ? "产品按系列展示，方便对比不同材质、克重、涂层和工艺选项。"
                : "Products are grouped by range so you can compare material, GSM, coating and process options more easily."}
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#171713] px-4 text-sm font-black text-white"
          >
            {locale === "zh" ? "提交询价需求" : "Request a quote"}
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-lg border border-[#d9d2be] bg-white p-8 text-center text-[#626156]">
            {t("catalog.noResults")}
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
            {groups.map((group, index) => {
              const sku = group.representative;

              return (
              <article
                key={group.id}
                className="premium-depth group min-w-0 max-w-full overflow-hidden rounded-lg border border-[#d9d2be] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#171713]/50 hover:shadow-xl hover:shadow-[#171713]/10"
              >
                <div className="relative h-52 overflow-hidden">
                  <ProductImageWithStatus
                    sku={sku}
                    locale={locale}
                    imageIndex={index}
                    sizes="(min-width: 1280px) 420px, 92vw"
                    className="object-cover transition duration-200 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(23,23,19,.58))]" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/18 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-black/12 backdrop-blur-xl">
                    {group.variants.length} {locale === "zh" ? "个变体" : group.variants.length === 1 ? "variant" : "variants"}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8c06c]">
                      {getProductTypeLabel(sku.productType, locale)}
                    </p>
                    <h2 className="mt-2 text-xl font-black text-white">
                      {getLocalizedProductTitle(sku, locale)}
                    </h2>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid gap-2 text-sm text-[#626156]">
                    <p className="inline-flex items-start gap-2">
                      <Layers3 className="mt-0.5 size-4 shrink-0 text-[#9a6b1f]" />
                      {getLocalizedProductMaterial(sku, locale) ||
                        (locale === "zh" ? "按项目确认" : "Custom material specification")}
                    </p>
                    <p>
                      {[
                        getLocalizedCatalogValue(sku.gsmOrThickness, locale),
                        getLocalizedCatalogValue(sku.coating, locale),
                      ]
                        .filter(Boolean)
                        .join(" / ") ||
                        getLocalizedCatalogValue(
                          sku.structureOrFlute,
                          locale,
                          locale === "zh" ? "按项目确认" : "Custom structure",
                        )}
                    </p>
                    <p>{getLocalizedCatalogValue(sku.applications, locale, locale === "zh" ? "按项目确认" : "Custom application")}</p>
                  </div>
                  <div className="mt-4 h-px bg-gradient-to-r from-[#171713]/16 via-[#e8c06c]/62 to-transparent" />
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="rounded-full bg-[#171713] text-white hover:bg-[#2b2b24]"
                      onClick={() => addSku(sku)}
                    >
                      {t("cta.add")}
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/products/${sku.slug}`}>
                        {locale === "zh" ? "查看产品规格" : "View product specifications"}
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
        {pagination && pagination.totalPages > 1 ? (
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label={locale === "zh" ? "产品分页" : "Product pagination"}>
            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => {
              const params = new URLSearchParams(searchParams.toString());
              if (page === 1) params.delete("page");
              else params.set("page", String(page));
              return (
                <Link
                  key={page}
                  href={`${pathname}?${params.toString()}#catalog-list`}
                  className={`grid size-10 place-items-center rounded-full border text-sm font-bold transition ${
                    page === pagination.page
                      ? "border-[#171713] bg-[#171713] text-white"
                      : "border-[#d9d2be] bg-white text-[#626156] hover:border-[#171713]/40"
                  }`}
                  aria-current={page === pagination.page ? "page" : undefined}
                >
                  {page}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </section>
    </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel,
  formatOption = (option) => option,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allLabel: string;
  formatOption?: (value: string) => string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#171713]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      className="kh-input min-w-0 h-11 w-full max-w-full rounded-md px-3 text-sm font-normal text-[#171713] outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
