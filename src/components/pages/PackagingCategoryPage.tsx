import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, Check, ClipboardCheck, Factory, MessageCircle } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import ProductCatalog from "@/components/site/ProductCatalog";
import { Link } from "@/i18n/navigation";
import { getAllSkus, getCatalogFilterOptions, getLocalizedProductSku, type ProductSku } from "@/lib/catalog";
import type { PackagingCategory } from "@/data/packagingCategories";

function matchesCategory(sku: ProductSku, category: PackagingCategory) {
  if (category.slug === "all-products") return true;
  const typeMatches = category.productTypes?.length ? category.productTypes.includes(sku.productType) : false;
  const haystack = [sku.title.en, sku.englishName, sku.applications, sku.productType, ...(sku.applicationsList ?? [])].join(" ").toLocaleLowerCase();
  return typeMatches || category.searchTerms.some((term) => haystack.includes(term.toLocaleLowerCase()));
}

export default function PackagingCategoryPage({ locale, category }: { locale: string; category: PackagingCategory }) {
  const isZh = locale === "zh";
  const sourceSkus = getAllSkus().filter((sku) => matchesCategory(sku, category));
  const skus = sourceSkus.map((sku) => getLocalizedProductSku(sku, locale));
  const pagePath = `/packaging/${category.slug}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: `https://www.kehong.tech/${locale}` },
      { "@type": "ListItem", position: 2, name: isZh ? "包装产品" : "Packaging products", item: `https://www.kehong.tech/${locale}/packaging/all-products` },
      { "@type": "ListItem", position: 3, name: isZh ? category.title.zh : category.title.en, item: `https://www.kehong.tech/${locale}${pagePath}` },
    ],
  };

  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-16">
          <div>
            <nav aria-label={isZh ? "面包屑" : "Breadcrumb"} className="kh-eyebrow">
              <Link href="/" className="hover:text-(--kh-ink)">{isZh ? "首页" : "Home"}</Link><span className="mx-2 text-(--kh-ink)/35">/</span><Link href="/packaging/all-products" className="hover:text-(--kh-ink)">{isZh ? "包装产品" : "Packaging"}</Link><span className="mx-2 text-(--kh-ink)/35">/</span>{isZh ? category.title.zh : category.title.en}
            </nav>
            <p className="kh-eyebrow mt-8">{isZh ? "科宏 · B2B 纸品包装" : "Kehong · B2B paper packaging"}</p>
            <h1 className="kh-editorial-heading mt-4 max-w-3xl text-4xl sm:text-6xl">{isZh ? category.title.zh : category.title.en}</h1>
            <p className="kh-lede mt-5">{isZh ? category.shortDescription.zh : category.shortDescription.en}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-(--kh-muted)">{isZh ? category.description.zh : category.description.en}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="kh-button kh-button-primary">{isZh ? "获取定制报价" : "Get a custom quote"}<ArrowRight className="size-4" /></Link>
              <a href="#catalog-list" className="kh-button kh-button-secondary">{isZh ? "浏览产品" : "Browse products"}</a>
            </div>
          </div>
          <div className="premium-depth relative min-h-[280px] overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-brass-soft)/30 lg:min-h-[390px]">
            <Image src={category.image} alt={`${category.title.en} packaging reference`} fill priority sizes="(min-width: 1024px) 46vw, 96vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-(--kh-ink)/55 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 text-xs font-semibold uppercase tracking-[.08em] text-white">{isZh ? "定制结构 · 按项目确认" : "Custom structure · Confirmed by project"}</p>
          </div>
        </section>

        <section className="border-y border-(--kh-line) bg-(--kh-surface)/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="kh-section-kicker">{isZh ? "快速选择" : "Quick selection"}</p>
              <h2 className="kh-editorial-heading mt-3 text-3xl">{isZh ? "从项目需求开始" : "Start with the project brief"}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.subcategories.map((item) => <div key={item} className="rounded-md border border-(--kh-line) bg-(--kh-surface) px-4 py-3 text-sm font-semibold text-(--kh-muted)">{item}</div>)}
            </div>
          </div>
        </section>

        <div id="catalog-list" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-7 max-w-2xl"><p className="kh-section-kicker">{isZh ? "已确认目录" : "Confirmed catalog"}</p><h2 className="kh-editorial-heading mt-3 text-3xl">{isZh ? "产品范围" : "Product range"}</h2><p className="mt-3 text-base leading-7 text-(--kh-muted)">{isZh ? "只展示当前公开目录中已确认的产品记录；定制结构可直接提交项目需求。" : "Only confirmed public product records are shown here. Send a project brief for a custom structure or an unlisted format."}</p></div>
          <Suspense fallback={<div className="kh-panel p-8 text-sm text-(--kh-muted)">{isZh ? "正在加载产品范围…" : "Loading product range…"}</div>}>
            <ProductCatalog skus={skus} filterOptions={getCatalogFilterOptions(locale)} siteOrigin="https://www.kehong.tech" pagination={{ page: 1, totalPages: 1, totalGroups: new Set(skus.map((sku) => sku.groupId ?? sku.sku)).size, totalSkus: skus.length, pageSize: 24 }} />
          </Suspense>
        </div>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 md:grid-cols-3 lg:px-8 lg:pb-16">
          <InfoPanel icon={<ClipboardCheck className="size-5" />} title={isZh ? "定制选项" : "Customization options"} items={category.filters} />
          <InfoPanel icon={<MessageCircle className="size-5" />} title={isZh ? "应用场景" : "Applications"} items={category.applications} />
          <InfoPanel icon={<Factory className="size-5" />} title={isZh ? "生产与质量" : "Production & quality"} items={isZh ? ["规格评审", "结构打样", "加工与后处理", "出货前检验"] : ["Specification review", "Structural sampling", "Converting and finishing", "Inspection before shipment"]} />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="kh-panel grid gap-4 p-6 sm:p-8 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="kh-section-kicker">{isZh ? "常见问题" : "Frequently asked questions"}</p><h2 className="kh-editorial-heading mt-3 text-3xl">{isZh ? "从规格确认开始" : "Start with a clear specification brief"}</h2></div>
            <div className="grid gap-3">
              {(isZh ? [
                ["询盘需要提供哪些信息？", "建议提供尺寸、材料、数量、印刷/后处理要求和目标市场。"],
                ["可以定制结构和表面效果吗？", "可以在项目评审中确认结构、尺寸、印刷与后处理方案。"],
                ["如何确认最终规格？", "我们会根据项目资料进行规格评审，并在需要时安排结构打样。"],
              ] : [
                ["What should a buyer include in a brief?", "Share dimensions, material, quantity, print or finishing needs, and target market where available."],
                ["Can the structure and finish be customized?", "Structure, size, printing and finishing options are confirmed during project review."],
                ["How are final specifications confirmed?", "Kehong reviews the project brief and can coordinate structural sampling when required."],
              ]).map(([question, answer]) => <details key={question} className="rounded-md border border-(--kh-line) bg-(--kh-paper) px-4 py-3"><summary className="cursor-pointer list-none font-semibold text-(--kh-ink)">{question}</summary><p className="mt-2 text-sm leading-6 text-(--kh-muted)">{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="premium-depth grid gap-4 rounded-lg bg-(--kh-forest) p-6 text-(--kh-surface) sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="kh-eyebrow kh-eyebrow-light">{isZh ? "项目协作" : "Project collaboration"}</p><h2 className="kh-editorial-heading mt-2 text-2xl">{isZh ? "把尺寸、图纸和目标市场发给我们" : "Send dimensions, drawings and target market"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{isZh ? "我们会围绕材料、结构、印刷与交付要求确认下一步。" : "Kehong will review material, structure, print and delivery requirements before recommending the next step."}</p></div>
            <Link href="/contact" className="kh-button kh-button-light">{isZh ? "提交询盘" : "Request a quote"}<ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoPanel({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return <article className="kh-panel p-5"><div className="flex items-center gap-3 text-(--kh-brass)"><span className="grid size-9 place-items-center rounded-full bg-(--kh-brass-soft)/30">{icon}</span><h2 className="text-lg font-semibold text-(--kh-ink)">{title}</h2></div><ul className="mt-4 grid gap-2 text-sm leading-6 text-(--kh-muted)">{items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-(--kh-brass)" />{item}</li>)}</ul></article>;
}
