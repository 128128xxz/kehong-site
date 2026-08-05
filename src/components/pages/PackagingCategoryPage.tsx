import { type ReactNode } from "react";
import { ArrowRight, Check, ClipboardCheck, Factory, MessageCircle } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import ProductCatalog from "@/components/site/ProductCatalog";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import RelatedLinks from "@/components/site/RelatedLinks";
import { getAllSkus, getCatalogFilterOptions, getLocalizedProductSku, getProductGroupId, type ProductSku } from "@/lib/catalog";
import { getPackagingInquiryLabel, type PackagingCategory } from "@/data/packagingCategories";

const packagingSectionNumbers = {
  hero: "01",
  selection: "02",
  catalog: "03",
  production: "04",
  faq: "05",
  related: "06",
  project: "07",
} as const;

function matchesCategory(sku: ProductSku, category: PackagingCategory) {
  const typeMatches = category.productTypes?.length ? category.productTypes.includes(sku.productType) : false;
  const haystack = [sku.title.en, sku.englishName, sku.applications, sku.productType, ...(sku.applicationsList ?? [])].join(" ").toLocaleLowerCase();
  return typeMatches || category.searchTerms.some((term) => haystack.includes(term.toLocaleLowerCase()));
}

export default function PackagingCategoryPage({ locale, category }: { locale: string; category: PackagingCategory }) {
  const isZh = locale === "zh";
  const sourceSkus = getAllSkus().filter((sku) => matchesCategory(sku, category));
  const isTakeoutBoxes = category.slug === "takeout-boxes";
  // A raw paper material can support a takeout project, but is not itself a
  // finished takeout-box SKU. This category currently has no approved public
  // finished structures, so show the project-confirmed state instead.
  const skus = (isTakeoutBoxes ? [] : sourceSkus).map((sku) => getLocalizedProductSku(sku, locale));
  const subcategories = isZh ? category.subcategories.zh : category.subcategories.en;
  const applications = isZh ? category.applications.zh : category.applications.en;
  const filters = isZh ? category.filters.zh : category.filters.en;
  const pagePath = `/packaging/${category.slug}`;
  const inquiryLabel = getPackagingInquiryLabel(category, locale);
  const contactHref = `/contact?product=${encodeURIComponent(inquiryLabel)}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: `https://www.kehong.tech/${locale}` },
      { "@type": "ListItem", position: 2, name: isZh ? "成品包装" : "Packaging", item: `https://www.kehong.tech/${locale}/packaging` },
      { "@type": "ListItem", position: 3, name: isZh ? category.title.zh : category.title.en, item: `https://www.kehong.tech/${locale}${pagePath}` },
    ],
  };
  const faqEntries = getCategoryFaq(category.slug, isZh);

  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <Header />
      <main>
        <PageHero
          index={packagingSectionNumbers.hero}
          kicker={isZh ? "科宏 · B2B 纸品包装" : "Kehong · B2B paper packaging"}
          title={isZh ? category.title.zh : category.title.en}
          lede={isZh ? category.shortDescription.zh : category.shortDescription.en}
          image={{ src: category.image, alt: `${category.title.en} packaging reference` }}
          meta={
            isZh
              ? [`${subcategories.length} 个子类方向`, "OEM / ODM", "中国广东佛山"]
              : [`${subcategories.length} subcategory directions`, "OEM / ODM", "Foshan, Guangdong, China"]
          }
        >
          <Link href={contactHref} className="kh-button kh-button-light">
            {isZh ? "获取定制报价" : "Get a custom quote"}
            <ArrowRight className="size-4" />
          </Link>
          <a href="#catalog-list" className="kh-button kh-button-ghost">
            {isZh ? "浏览产品" : "Browse products"}
          </a>
          {isTakeoutBoxes ? <span className="text-xs font-semibold tracking-[.08em] text-white/80">{isZh ? "概念示意" : "Concept visualization"}</span> : null}
        </PageHero>

        <div className="kh-shell pt-7">
          <nav aria-label={isZh ? "面包屑" : "Breadcrumb"} className="kh-mono text-(--kh-muted)">
            <Link href="/" className="hover:text-(--kh-ink)">{isZh ? "首页" : "Home"}</Link>
            <span className="mx-2 text-(--kh-ink)/35">/</span>
            <Link href="/packaging" className="hover:text-(--kh-ink)">{isZh ? "成品包装" : "Packaging"}</Link>
            <span className="mx-2 text-(--kh-ink)/35">/</span>
            <span className="text-(--kh-ink)">{isZh ? category.title.zh : category.title.en}</span>
          </nav>
        </div>

        <section id="packaging-selection" aria-labelledby="packaging-selection-title" className="kh-section">
          <div className="kh-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <Reveal>
              <SectionKicker index={packagingSectionNumbers.selection} text={isZh ? "快速选择" : "Quick selection"} />
              <h2 id="packaging-selection-title">{isZh ? "从项目需求开始" : "Start with the project brief"}</h2>
              <p className="kh-section-lede mt-5">{isZh ? category.description.zh : category.description.en}</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="grid gap-3 sm:grid-cols-2">
                {subcategories.map((item, index) => (
                  <div key={item} className="flex items-baseline gap-3 rounded-md border border-(--kh-line) bg-(--kh-surface) px-4 py-3 text-sm font-semibold text-(--kh-ink)">
                    <span className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</span>
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="catalog-list" aria-labelledby="packaging-catalog-title" className="kh-section kh-section-paper scroll-mt-24 border-y border-(--kh-line)">
          <div className="kh-shell">
            <Reveal>
              <div className="mb-9 max-w-3xl">
                <SectionKicker index={packagingSectionNumbers.catalog} text={isTakeoutBoxes ? (isZh ? "项目确认" : "Project confirmation") : (isZh ? "已确认目录" : "Confirmed catalog")} />
                <h2 id="packaging-catalog-title">{isTakeoutBoxes ? (isZh ? "成品结构按项目确认" : "Finished structures confirmed by project") : (isZh ? "产品范围" : "Product range")}</h2>
                <p className="kh-section-lede mt-4">
                  {isTakeoutBoxes
                    ? (isZh
                      ? "外带盒结构、尺寸、材料和印刷根据项目需求确认。请提交参考图、尺寸与目标数量，以便评估和报价。"
                      : "Takeout box structures, sizes, materials and printing are confirmed against the project brief. Send a reference image, dimensions and target quantity for evaluation.")
                    : isZh
                    ? "只展示当前公开目录中已确认的产品记录；定制结构可直接提交项目需求。"
                    : "Only confirmed public product records are shown here. Send a project brief for a custom structure or an unlisted format."}
                </p>
              </div>
            </Reveal>
            {skus.length > 0 ? (
              <ProductCatalog skus={skus} filterOptions={getCatalogFilterOptions(locale)} siteOrigin="https://www.kehong.tech" pagination={{ page: 1, totalPages: 1, totalGroups: new Set(skus.map((sku) => getProductGroupId(sku))).size, totalSkus: skus.length, pageSize: 24 }} />
            ) : (
              <div className="kh-panel max-w-3xl p-7">
                <p className="text-sm leading-6 text-(--kh-muted)">{isTakeoutBoxes ? (isZh ? "请提交参考图、尺寸与目标数量，以便开始结构评估和报价。" : "Send a reference image, dimensions and target quantity to start the structure review and quotation.") : (isZh ? "当前公开目录没有可直接比较的 SKU。请发送尺寸、用途、数量和参考资料，我们会确认合适的材料或结构方向。" : "There are no public SKUs to compare for this direction. Send dimensions, application, quantity and a reference so the suitable material or structure can be reviewed.")}</p>
                <Link href={contactHref} className="kh-button kh-button-primary mt-5">{isZh ? "提交项目需求" : "Discuss this requirement"}<ArrowRight className="size-4" /></Link>
              </div>
            )}
          </div>
        </section>

        <section id="packaging-production" aria-labelledby="packaging-production-title" className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index={packagingSectionNumbers.production} text={isZh ? "定制与生产" : "Customization & production"} />
                  <h2 id="packaging-production-title">{isZh ? "定制、应用与生产质量" : "Customization, applications and production quality"}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              <Reveal className="h-full">
                <InfoPanel icon={<ClipboardCheck className="size-5" />} title={isZh ? "定制选项" : "Customization options"} items={filters} />
              </Reveal>
              <Reveal className="h-full" delay={100}>
                <InfoPanel icon={<MessageCircle className="size-5" />} title={isZh ? "应用场景" : "Applications"} items={applications} />
              </Reveal>
              <Reveal className="h-full" delay={200}>
                <InfoPanel icon={<Factory className="size-5" />} title={isZh ? "生产与质量" : "Production & quality"} items={isZh ? ["规格评审", "结构打样", "加工与后处理", "出货前检验"] : ["Specification review", "Structural sampling", "Converting and finishing", "Inspection before shipment"]} />
              </Reveal>
            </div>
          </div>
        </section>

        <section id="packaging-faq" aria-labelledby="packaging-faq-title" className="kh-section kh-section-muted border-y border-(--kh-line)">
          <div className="kh-shell grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <Reveal>
              <SectionKicker index={packagingSectionNumbers.faq} text={isZh ? "答疑" : "FAQ"} />
              <h2 id="packaging-faq-title">{isZh ? "从规格确认开始" : "Start with a clear specification brief"}</h2>
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

        <RelatedLinks
          locale={locale}
          index={packagingSectionNumbers.related}
          sectionId="packaging-related"
          title={{ en: "Related materials, industries & resources", zh: "相关材料、行业与资料" }}
          links={[
            ...(isTakeoutBoxes ? [{ href: "/products/kh-fd-trayp-150350-pe-290-food-tray-paper-material", en: "Food Tray Paper Material", zh: "食品纸托材料" }] : []),
            { href: "/products?collection=materials", en: "Related paper materials", zh: "相关纸材" },
            { href: "/industries", en: "Recommended industries", zh: "推荐行业" },
            { href: "/resources/packaging-selection-guide", en: "Packaging selection guide", zh: "包装选型指南" },
            { href: "/contact?interest=structure-review", en: "Start your project brief", zh: "提交项目需求" },
          ]}
        />

        <section id="packaging-project" aria-labelledby="packaging-project-title" className="kh-section kh-section-cta">
          <div className="kh-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <Reveal>
              <SectionKicker index={packagingSectionNumbers.project} text={isZh ? "项目协作" : "Project collaboration"} light />
              <h2 id="packaging-project-title">{isZh ? "把尺寸、图纸和目标市场发给我们" : "Send dimensions, drawings and target market"}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
                {isZh ? "我们会围绕材料、结构、印刷与交付要求确认下一步。" : "Kehong will review material, structure, print and delivery requirements before recommending the next step."}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <Link href={contactHref} className="kh-button kh-button-light">
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

function getCategoryFaq(slug: string, isZh: boolean): [string, string][] {
  const categorySpecific: Record<string, { en: [string, string][]; zh: [string, string][] }> = {
    "cake-boards-cake-drums": {
      en: [["How do cake boards and cake drums differ?", "Cake boards are commonly selected for everyday support and display. Cake drums are reviewed when a project needs a thicker support format."], ["What should be confirmed before quoting?", "Share the cake footprint, target support requirement, quantity, finish direction and destination."], ["Can the shape and edge be customized?", "Shape, diameter, edge and finish are reviewed against the approved project brief."]],
      zh: [["Cake Board 与 Cake Drum 有什么区别？", "Cake Board 通常用于日常承托与展示；项目需要更厚承托时会评审 Cake Drum 方向。"], ["报价前需要确认什么？", "请提供蛋糕尺寸、承托需求、数量、表面效果和目的地。"], ["形状和边缘可以定制吗？", "形状、直径、边缘与表面效果会按确认后的项目需求评审。"]],
    },
    "corrugated-mailer-boxes": {
      en: [["What is needed to review a mailer structure?", "Share the product dimensions, protective points, quantity and dispatch workflow."], ["Can inserts be included with a mailer?", "Paper inserts and dividers can be reviewed together with the mailer structure."], ["When is sampling needed?", "Sampling is considered when fit, closure or protection needs to be confirmed before production."]],
      zh: [["评审邮寄盒结构需要什么信息？", "请提供产品尺寸、需要保护的位置、数量和发货流程。"], ["邮寄盒可以搭配内托吗？", "纸内托和隔板可以与邮寄盒结构一起评审。"], ["什么时候需要打样？", "需要确认适配、闭合或保护需求时，可评估是否进行打样。"]],
    },
    "takeout-boxes": {
      en: [["Which details matter for a takeaway box?", "Product footprint, use case, closure, quantity and print needs guide the first structure review."], ["Can bakery and takeaway structures be developed together?", "A project can cover related boxes, liners, pads and inserts in one brief."], ["How is a food-contact claim confirmed?", "Any food-contact, grease or barrier claim is confirmed only against the project specification and supporting evidence."]],
      zh: [["外带盒评审重点是什么？", "产品尺寸、使用场景、闭合方式、数量和印刷需求会决定首次结构评审。"], ["烘焙与外带结构可以一起开发吗？", "一个项目可同时涵盖相关盒型、垫纸、纸垫和内托。"], ["食品接触相关声明如何确认？", "食品接触、防油或阻隔等声明，仅在项目规格和支持资料确认后使用。"]],
    },
  };
  return categorySpecific[slug]?.[isZh ? "zh" : "en"] ?? (isZh
    ? [["询盘需要提供哪些信息？", "建议提供尺寸、材料、数量、印刷或后处理要求和目标市场。"], ["可以定制结构和表面效果吗？", "结构、尺寸、印刷和后处理方案会在项目评审中确认。"], ["如何确认最终规格？", "我们会根据项目资料进行规格评审，并在需要时安排结构打样。"]]
    : [["What should a buyer include in a brief?", "Share dimensions, material, quantity, print or finishing needs, and target market where available."], ["Can the structure and finish be customized?", "Structure, size, printing and finishing options are confirmed during project review."], ["How are final specifications confirmed?", "Kehong reviews the project brief and can coordinate structural sampling when required."]]);
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
