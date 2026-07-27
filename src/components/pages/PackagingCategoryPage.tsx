import { Suspense, type ReactNode } from "react";
import { ArrowRight, Check, ClipboardCheck, Factory, MessageCircle } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import ProductCatalog from "@/components/site/ProductCatalog";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
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
  const faqEntries: [string, string][] = isZh
    ? [
        ["询盘需要提供哪些信息？", "建议提供尺寸、材料、数量、印刷/后处理要求和目标市场。"],
        ["可以定制结构和表面效果吗？", "可以在项目评审中确认结构、尺寸、印刷与后处理方案。"],
        ["如何确认最终规格？", "我们会根据项目资料进行规格评审，并在需要时安排结构打样。"],
      ]
    : [
        ["What should a buyer include in a brief?", "Share dimensions, material, quantity, print or finishing needs, and target market where available."],
        ["Can the structure and finish be customized?", "Structure, size, printing and finishing options are confirmed during project review."],
        ["How are final specifications confirmed?", "Kehong reviews the project brief and can coordinate structural sampling when required."],
      ];

  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "科宏 · B2B 纸品包装" : "Kehong · B2B paper packaging"}
          title={isZh ? category.title.zh : category.title.en}
          lede={isZh ? category.shortDescription.zh : category.shortDescription.en}
          image={{ src: category.image, alt: `${category.title.en} packaging reference` }}
          meta={
            isZh
              ? [`${category.subcategories.length} 个子类方向`, "OEM / ODM", "中国广东佛山"]
              : [`${category.subcategories.length} subcategory directions`, "OEM / ODM", "Foshan, Guangdong, China"]
          }
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "获取定制报价" : "Get a custom quote"}
            <ArrowRight className="size-4" />
          </Link>
          <a href="#catalog-list" className="kh-button kh-button-ghost">
            {isZh ? "浏览产品" : "Browse products"}
          </a>
        </PageHero>

        <div className="kh-shell pt-7">
          <nav aria-label={isZh ? "面包屑" : "Breadcrumb"} className="kh-mono text-(--kh-muted)">
            <Link href="/" className="hover:text-(--kh-ink)">{isZh ? "首页" : "Home"}</Link>
            <span className="mx-2 text-(--kh-ink)/35">/</span>
            <Link href="/packaging/all-products" className="hover:text-(--kh-ink)">{isZh ? "包装产品" : "Packaging"}</Link>
            <span className="mx-2 text-(--kh-ink)/35">/</span>
            <span className="text-(--kh-ink)">{isZh ? category.title.zh : category.title.en}</span>
          </nav>
        </div>

        <section className="kh-section">
          <div className="kh-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <Reveal>
              <SectionKicker index="02" text={isZh ? "快速选择" : "Quick selection"} />
              <h2>{isZh ? "从项目需求开始" : "Start with the project brief"}</h2>
              <p className="kh-section-lede mt-5">{isZh ? category.description.zh : category.description.en}</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="grid gap-3 sm:grid-cols-2">
                {category.subcategories.map((item, index) => (
                  <div key={item} className="flex items-baseline gap-3 rounded-md border border-(--kh-line) bg-(--kh-surface) px-4 py-3 text-sm font-semibold text-(--kh-ink)">
                    <span className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</span>
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="catalog-list" className="kh-section kh-section-paper scroll-mt-24 border-y border-(--kh-line)">
          <div className="kh-shell">
            <Reveal>
              <div className="mb-9 max-w-3xl">
                <SectionKicker index="03" text={isZh ? "已确认目录" : "Confirmed catalog"} />
                <h2>{isZh ? "产品范围" : "Product range"}</h2>
                <p className="kh-section-lede mt-4">
                  {isZh
                    ? "只展示当前公开目录中已确认的产品记录；定制结构可直接提交项目需求。"
                    : "Only confirmed public product records are shown here. Send a project brief for a custom structure or an unlisted format."}
                </p>
              </div>
            </Reveal>
            <Suspense fallback={<div className="kh-panel p-8 text-sm text-(--kh-muted)">{isZh ? "正在加载产品范围…" : "Loading product range…"}</div>}>
              <ProductCatalog skus={skus} filterOptions={getCatalogFilterOptions(locale)} siteOrigin="https://www.kehong.tech" pagination={{ page: 1, totalPages: 1, totalGroups: new Set(skus.map((sku) => sku.groupId ?? sku.sku)).size, totalSkus: skus.length, pageSize: 24 }} />
            </Suspense>
          </div>
        </section>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="04" text={isZh ? "定制与生产" : "Customization & production"} />
                  <h2>{isZh ? "定制、应用与生产质量" : "Customization, applications and production quality"}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              <Reveal className="h-full">
                <InfoPanel icon={<ClipboardCheck className="size-5" />} title={isZh ? "定制选项" : "Customization options"} items={category.filters} />
              </Reveal>
              <Reveal className="h-full" delay={100}>
                <InfoPanel icon={<MessageCircle className="size-5" />} title={isZh ? "应用场景" : "Applications"} items={category.applications} />
              </Reveal>
              <Reveal className="h-full" delay={200}>
                <InfoPanel icon={<Factory className="size-5" />} title={isZh ? "生产与质量" : "Production & quality"} items={isZh ? ["规格评审", "结构打样", "加工与后处理", "出货前检验"] : ["Specification review", "Structural sampling", "Converting and finishing", "Inspection before shipment"]} />
              </Reveal>
            </div>
          </div>
        </section>

        <section className="kh-section kh-section-muted border-y border-(--kh-line)">
          <div className="kh-shell grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <Reveal>
              <SectionKicker index="05" text={isZh ? "答疑" : "FAQ"} />
              <h2>{isZh ? "从规格确认开始" : "Start with a clear specification brief"}</h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="grid gap-3">
                {faqEntries.map(([question, answer]) => (
                  <details key={question} className="rounded-md border border-(--kh-line) bg-(--kh-paper) px-4 py-3">
                    <summary className="cursor-pointer list-none font-semibold text-(--kh-ink)">{question}</summary>
                    <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{answer}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-cta">
          <div className="kh-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <Reveal>
              <SectionKicker index="06" text={isZh ? "项目协作" : "Project collaboration"} light />
              <h2>{isZh ? "把尺寸、图纸和目标市场发给我们" : "Send dimensions, drawings and target market"}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
                {isZh ? "我们会围绕材料、结构、印刷与交付要求确认下一步。" : "Kehong will review material, structure, print and delivery requirements before recommending the next step."}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <Link href="/contact" className="kh-button kh-button-light">
                {isZh ? "提交询盘" : "Request a quote"}
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoPanel({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <article className="kh-panel h-full p-5">
      <div className="flex items-center gap-3 text-(--kh-brass)">
        <span className="grid size-9 place-items-center rounded-full bg-(--kh-brass-soft)/30">{icon}</span>
        <h3 className="text-lg font-semibold text-(--kh-ink)">{title}</h3>
      </div>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-(--kh-muted)">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-1 size-4 shrink-0 text-(--kh-brass)" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
