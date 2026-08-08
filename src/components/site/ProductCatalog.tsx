"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Filter, Layers3, MessageCircle, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { contact } from "@/data/company";
import ProductImageWithStatus from "@/components/site/ProductImageWithStatus";
import {
  getCommonGsmOptions,
  getCanonicalCategoryBySlug,
  getCatalogGroups,
  getProductGroupSummary,
  getLocalizedCatalogValue,
  getLocalizedProductMaterial,
  getLocalizedProductTitle,
  type CatalogFilterOptions,
  type ProductSku,
} from "@/lib/catalog";
import { getProductTypeLabel } from "@/lib/productImages";
import { formatProductFieldValue } from "@/lib/productPresentation";

type Props = {
  skus: ProductSku[];
  initialQuery?: string;
  initialFilters?: Record<string, string>;
  filterOptions?: CatalogFilterOptions;
  siteOrigin?: string;
  pagination?: { page: number; totalPages: number; totalGroups: number; totalSkus: number; pageSize: number };
  invalidFilters?: boolean;
};

export default function ProductCatalog({ skus, initialQuery = "", initialFilters = {}, filterOptions, pagination, siteOrigin = "https://www.kehong.tech", invalidFilters = false }: Props) {
  const t = useTranslations("Site");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const query = initialFilters.search ?? initialQuery;
  const category = initialFilters.category ?? "";
  const productType = initialFilters.productType ?? "";
  const material = initialFilters.material ?? "";
  const coating = initialFilters.coating ?? "";
  const process = initialFilters.process ?? "";
  const gsm = initialFilters.gsm ?? "";
  const customOnly = initialFilters.customizable === "true";
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
    const params = new URLSearchParams(initialFilters);
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
          className="kh-button kh-button-secondary kh-button-compact bg-(--kh-surface)"
        >
          <Filter className="size-4" />
          {locale === "zh" ? "筛选产品" : "Filter products"}
        </button>
        <span className="text-right text-xs font-bold leading-5 text-(--kh-muted)">
          {(pagination?.totalGroups ?? groups.length) > 0
            ? `${pagination?.totalGroups ?? groups.length} ${locale === "zh" ? "个产品组" : "product groups"}`
            : (locale === "zh" ? "暂无可显示目录" : "No public catalog yet")}
        </span>
      </div>

      {mobileFiltersOpen ? (
        <button
          type="button"
          aria-label={locale === "zh" ? "关闭筛选背景" : "Close filter backdrop"}
          onClick={() => setMobileFiltersOpen(false)}
          className="fixed inset-0 z-40 bg-(--kh-ink)/45 lg:hidden"
        />
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <aside
        id="catalog-filters"
        className={`kh-panel min-w-0 w-full max-w-full h-fit p-5 lg:sticky lg:top-20 ${mobileFiltersOpen ? "fixed inset-x-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto" : "hidden lg:block"}`}
        aria-label={locale === "zh" ? "产品筛选" : "Product filters"}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-sm font-bold text-(--kh-ink)">{locale === "zh" ? "筛选产品" : "Filter products"}</p>
          <button
            type="button"
            aria-label={locale === "zh" ? "关闭筛选" : "Close filters"}
            onClick={() => setMobileFiltersOpen(false)}
            className="grid size-10 place-items-center rounded-full border border-(--kh-line) bg-(--kh-surface) text-(--kh-ink)"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--kh-muted)" />
          <input
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") updateUrl("search", draftQuery.trim());
            }}
            placeholder={t("catalog.search")}
            className="kh-input min-w-0 h-11 w-full max-w-full pl-10 pr-3 text-sm"
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
                  ? "border-(--kh-forest) bg-(--kh-forest) text-(--kh-surface)"
                  : "border-(--kh-line) bg-(--kh-surface) text-(--kh-muted) hover:border-(--kh-forest)/40"
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
          <label className="flex items-center gap-3 rounded-md border border-(--kh-line) bg-(--kh-surface) px-3 py-3 text-sm font-semibold text-(--kh-ink)">
            <input
              type="checkbox"
              checked={customOnly}
              onChange={(event) => updateUrl("customizable", event.target.checked ? "true" : "")}
              className="size-4 accent-(--kh-forest)"
            />
            {t("catalog.customizable")}
          </label>
          <button
            type="button"
            className="kh-button kh-button-secondary kh-button-compact"
            onClick={reset}
          >
            <X className="size-4" />
            {t("catalog.reset")}
          </button>
        </div>

        {selected.length > 0 ? (
          <div className="premium-depth kh-micro-grid texture-ink mt-6 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{t("inquiry.selected")}</p>
              <span className="kh-status-dot rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-(--kh-brass-soft)">
                {selected.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {selected.map((sku) => (
                <div key={sku.sku} className="flex items-center justify-between gap-2 rounded-md bg-white/10 px-2 py-1 text-xs leading-5 text-white/80">
                  <span>{sku.sku}</span>
                  <button
                    type="button"
                    onClick={() => removeSku(sku)}
                    className="grid size-6 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
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
                className="kh-button kh-button-light kh-button-compact mt-3"
              >
                <MessageCircle className="size-4" />
                {t("cta.whatsapp")}
              </a>
            </div>
          </div>
        ) : null}
      </aside>

      <section className="min-w-0 max-w-full">
        <div className="kh-panel mb-4 grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold text-(--kh-ink)">
              {(pagination?.totalGroups ?? groups.length) > 0
                ? (locale === "zh"
                  ? `${pagination?.totalGroups ?? groups.length} 个产品组 / ${pagination?.totalSkus ?? skus.length} 个产品`
                  : `${pagination?.totalGroups ?? groups.length} product groups / ${pagination?.totalSkus ?? skus.length} products`)
                : (locale === "zh" ? "该分类目前暂无公开 SKU" : "No public SKUs in this range yet")}
            </p>
            <p className="mt-1 text-sm leading-6 text-(--kh-muted)">
              {locale === "zh"
                ? "产品按系列展示，方便对比不同材质、克重、涂层和工艺选项。"
                : "Products are grouped by range so you can compare material, GSM, coating and process options more easily."}
            </p>
          </div>
          <Link
            href="/contact"
            className="kh-button kh-button-primary kh-button-compact"
          >
            {locale === "zh" ? "提交询价需求" : "Request a quote"}
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="kh-panel p-8 text-center text-(--kh-muted)">
            <p>{t("catalog.noResults")}</p>
            {invalidFilters ? <p className="mt-2 text-sm font-semibold text-(--kh-ink)">{locale === "zh" ? "筛选参数无效。请清除筛选后重新浏览。" : "This filter is not valid. Clear filters to browse the current range."}</p> : null}
            <p className="mt-2 text-sm">{locale === "zh" ? "如果您正在寻找定制包装结构，请直接提交需求。" : "If you are looking for a custom packaging structure, send the requirement directly."}</p>
            <button type="button" onClick={reset} className="kh-button kh-button-secondary kh-button-compact mt-5">{locale === "zh" ? "清除筛选" : "Clear filters"}</button>
            <Link href="/contact" className="kh-button kh-button-primary kh-button-compact mt-5">{locale === "zh" ? "提交项目需求" : "Start a packaging project"}</Link>
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
            {groups.map((group, index) => {
                const sku = group.representative;
                const summary = getProductGroupSummary(group, locale);
                const summaryMaterial = summary.materials[0] || getLocalizedProductMaterial(sku, locale);
                const summaryStructure = [summary.gsm, summary.coating]
                  .filter((item): item is string => Boolean(item))
                  .join(" / ");
                const summaryApplication = formatProductFieldValue(summary.applications[0] || "", "application", locale);

              return (
              <article
                key={group.id}
                data-product-group-id={group.id}
                className="premium-depth group min-w-0 max-w-full overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) transition hover:-translate-y-1 hover:border-(--kh-forest)/45 hover:shadow-lg"
              >
                <div className="relative h-52 overflow-hidden">
                  <ProductImageWithStatus
                    sku={sku}
                    locale={locale}
                    imageIndex={index}
                    sizes="(min-width: 1280px) 420px, 92vw"
                    className="object-cover transition duration-200 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-(--kh-ink)/60 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-(--kh-ink)/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {summary.variantCount} {locale === "zh" ? "个变体" : summary.variantCount === 1 ? "variant" : "variants"}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="kh-eyebrow kh-eyebrow-light">
                      {summary.familyLabel || getProductTypeLabel(sku.productType, locale)}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {summary.title}
                    </h2>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid gap-2 text-sm text-(--kh-muted)">
                    {summaryMaterial ? (
                      <p className="inline-flex items-start gap-2">
                        <Layers3 className="mt-0.5 size-4 shrink-0 text-(--kh-brass)" />
                        {summaryMaterial}
                      </p>
                    ) : null}
                    <p>
                      {[summaryStructure, getLocalizedCatalogValue(sku.structureOrFlute, locale)]
                        .filter((item): item is string => Boolean(item))
                        .join(" / ") || "-"}
                    </p>
                    {summaryApplication ? <p>{summaryApplication}</p> : null}
                  </div>
                  <div className="mt-4 h-px bg-(--kh-line)" />
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="kh-button kh-button-primary kh-button-compact"
                      onClick={() => addSku(sku)}
                    >
                      {t("cta.add")}
                    </button>
                    <Link href={`/products/${sku.slug}`} className="kh-button kh-button-secondary kh-button-compact">
                      {locale === "zh" ? "查看产品规格" : "View product specifications"}
                      <ArrowUpRight className="size-4" />
                    </Link>
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
              const params = new URLSearchParams(initialFilters);
              if (page === 1) params.delete("page");
              else params.set("page", String(page));
              return (
                <Link
                  key={page}
                  href={`${pathname}?${params.toString()}#catalog-list`}
                  className={`grid size-10 place-items-center rounded-full border text-sm font-bold transition ${
                    page === pagination.page
                      ? "border-(--kh-forest) bg-(--kh-forest) text-(--kh-surface)"
                      : "border-(--kh-line) bg-(--kh-surface) text-(--kh-muted) hover:border-(--kh-forest)/40"
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
    <label className="grid gap-2 text-sm font-semibold text-(--kh-ink)">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      className="kh-input min-w-0 h-11 w-full max-w-full px-3 text-sm font-normal"
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
