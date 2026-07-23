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
    <div className="kh-premium-site texture-paper min-h-screen bg-[#f6f4ec] text-[#171713]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <Header />
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-16">
          <div>
            <nav aria-label={isZh ? "面包屑" : "Breadcrumb"} className="text-xs font-black uppercase tracking-[.16em] text-[#9a6b1f]">
              <Link href="/" className="hover:text-[#171713]">{isZh ? "首页" : "Home"}</Link><span className="mx-2 text-[#171713]/35">/</span><Link href="/packaging/all-products" className="hover:text-[#171713]">{isZh ? "包装产品" : "Packaging"}</Link><span className="mx-2 text-[#171713]/35">/</span>{isZh ? category.title.zh : category.title.en}
            </nav>
            <p className="mt-8 text-xs font-black uppercase tracking-[.25em] text-[#9a6b1f]">Kehong · B2B paper packaging</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[.98] tracking-[-.04em] sm:text-6xl">{isZh ? category.title.zh : category.title.en}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d5b52]">{isZh ? category.shortDescription.zh : category.shortDescription.en}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5d5b52]">{isZh ? category.description.zh : category.description.en}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white">{isZh ? "获取定制报价" : "Get a custom quote"}<ArrowRight className="size-4" /></Link>
              <a href="#catalog-list" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#171713]/20 bg-white/70 px-5 text-sm font-black">{isZh ? "浏览产品" : "Browse products"}</a>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-[#d9d2be] bg-[#e8c06c]/30 shadow-xl lg:min-h-[390px]">
            <Image src={category.image} alt={`${category.title.en} packaging reference`} fill priority sizes="(min-width: 1024px) 46vw, 96vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171713]/50 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 text-xs font-black uppercase tracking-[.18em] text-white">Custom structure · Confirmed by project</p>
          </div>
        </section>

        <section className="border-y border-[#d9d2be] bg-white/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#9a6b1f]">{isZh ? "快速选择" : "Quick selection"}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.03em]">{isZh ? "从项目需求开始" : "Start with the project brief"}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.subcategories.map((item) => <div key={item} className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] px-4 py-3 text-sm font-bold text-[#4e4b42]">{item}</div>)}
            </div>
          </div>
        </section>

        <div id="catalog-list" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-7 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.22em] text-[#9a6b1f]">{isZh ? "已确认目录" : "Confirmed catalog"}</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em]">{isZh ? "产品范围" : "Product range"}</h2><p className="mt-3 text-base leading-7 text-[#626156]">{isZh ? "只展示当前公开目录中已确认的产品记录；定制结构可直接提交项目需求。" : "Only confirmed public product records are shown here. Send a project brief for a custom structure or an unlisted format."}</p></div>
          <Suspense fallback={<div className="rounded-lg border border-[#d9d2be] bg-white/70 p-8 text-sm text-[#626156]">{isZh ? "正在加载产品范围…" : "Loading product range…"}</div>}>
            <ProductCatalog skus={skus} filterOptions={getCatalogFilterOptions(locale)} siteOrigin="https://www.kehong.tech" pagination={{ page: 1, totalPages: 1, totalGroups: new Set(skus.map((sku) => sku.groupId ?? sku.sku)).size, totalSkus: skus.length, pageSize: 24 }} />
          </Suspense>
        </div>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 md:grid-cols-3 lg:px-8 lg:pb-16">
          <InfoPanel icon={<ClipboardCheck className="size-5" />} title={isZh ? "定制选项" : "Customization options"} items={category.filters} />
          <InfoPanel icon={<MessageCircle className="size-5" />} title={isZh ? "应用场景" : "Applications"} items={category.applications} />
          <InfoPanel icon={<Factory className="size-5" />} title={isZh ? "生产与质量" : "Production & quality"} items={["Specification review", "Structural sampling", "Converting and finishing", "Inspection before shipment"]} />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-lg border border-[#d9d2be] bg-white/60 p-6 sm:p-8 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-xs font-black uppercase tracking-[.22em] text-[#9a6b1f]">{isZh ? "常见问题" : "Frequently asked questions"}</p><h2 className="mt-3 text-3xl font-black tracking-[-.03em]">{isZh ? "从规格确认开始" : "Start with a clear specification brief"}</h2></div>
            <div className="grid gap-3">
              {(isZh ? [
                ["询盘需要提供哪些信息？", "建议提供尺寸、材料、数量、印刷/后处理要求和目标市场。"],
                ["可以定制结构和表面效果吗？", "可以在项目评审中确认结构、尺寸、印刷与后处理方案。"],
                ["如何确认最终规格？", "我们会根据项目资料进行规格评审，并在需要时安排结构打样。"],
              ] : [
                ["What should a buyer include in a brief?", "Share dimensions, material, quantity, print or finishing needs, and target market where available."],
                ["Can the structure and finish be customized?", "Structure, size, printing and finishing options are confirmed during project review."],
                ["How are final specifications confirmed?", "Kehong reviews the project brief and can coordinate structural sampling when required."],
              ]).map(([question, answer]) => <details key={question} className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] px-4 py-3"><summary className="cursor-pointer list-none font-black text-[#171713]">{question}</summary><p className="mt-2 text-sm leading-6 text-[#626156]">{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-lg border border-[#171713]/10 bg-[#171713] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#e8c06c]">{isZh ? "项目协作" : "Project collaboration"}</p><h2 className="mt-2 text-2xl font-black">{isZh ? "把尺寸、图纸和目标市场发给我们" : "Send dimensions, drawings and target market"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{isZh ? "我们会围绕材料、结构、印刷与交付要求确认下一步。" : "Kehong will review material, structure, print and delivery requirements before recommending the next step."}</p></div>
            <Link href="/contact" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e8c06c] px-5 text-sm font-black text-[#171713]">{isZh ? "提交询盘" : "Request a quote"}<ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoPanel({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return <article className="rounded-lg border border-[#d9d2be] bg-white/75 p-5 shadow-sm"><div className="flex items-center gap-3 text-[#9a6b1f]"><span className="grid size-9 place-items-center rounded-full bg-[#e8c06c]/25">{icon}</span><h2 className="text-lg font-black text-[#171713]">{title}</h2></div><ul className="mt-4 grid gap-2 text-sm leading-6 text-[#626156]">{items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-[#9a6b1f]" />{item}</li>)}</ul></article>;
}
