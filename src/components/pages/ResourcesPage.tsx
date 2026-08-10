import { ArrowRight, FileText, Palette, Ruler, Scissors } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import { finishOptions, finishOptionsZh, resourceItems, resourceZhCopy } from "@/data/siteContent";

const icons = [Palette, FileText, Scissors, Ruler, FileText, FileText];

export default function ResourcesPage({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const guideCount = resourceItems.filter((item) => item.type === "guide").length;
  const requestCount = resourceItems.filter((item) => item.type === "request").length;
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "科宏 · 资源中心" : "Kehong · Packaging resources"}
          title={isZh ? "包装设计、材料与结构准备指南" : "Packaging guides for artwork, materials, structure and sampling."}
          lede={
            isZh
              ? "用于准备设计稿、材料选择、刀模图、表面工艺和打样资料。"
              : "Use these guides to prepare artwork, compare materials and finishes, request a dieline and organize sampling information before production."
          }
          meta={[
            isZh
              ? `${guideCount} 份指南 · ${requestCount} 个申请入口`
              : `${guideCount} guides · ${requestCount} request channels`,
            "OEM / ODM",
            isZh ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "咨询包装专家" : "Talk to a packaging expert"}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/capabilities" className="kh-button kh-button-ghost">
            {isZh ? "了解工厂能力" : "Explore capabilities"}
          </Link>
        </PageHero>

        <section className="kh-section kh-section-paper">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="02" text={isZh ? "指南与申请" : "Guides & requests"} />
                  <h2>
                  {isZh
                    ? "包装设计、材料与结构准备指南"
                    : "Practical guides for artwork, materials and packaging structure."}
                  </h2>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resourceItems.map((item, index) => {
                  const Icon = icons[index] ?? FileText;
                  const copy = isZh ? resourceZhCopy[item.slug] : item;
                  return (
                    <article key={item.slug} className="kh-panel p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="grid size-10 place-items-center rounded-full bg-(--kh-brass-soft)/35 text-(--kh-brass)">
                          <Icon className="size-5" />
                        </span>
                        <span className="kh-mono text-(--kh-brass)">{item.type === "request" ? (isZh ? "申请" : "Request") : (isZh ? "指南" : "Guide")}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-bold">{copy.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{copy.summary}</p>
                      <ul className="mt-4 grid gap-2">
                        {copy.topics.map((topic) => (
                          <li key={topic} className="flex gap-2 text-sm text-(--kh-muted)">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-(--kh-brass)" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <Link href={item.type === "request" ? "/contact" : `/resources/${item.slug}`} className="kh-text-link mt-5">
                        {item.type === "request" ? (isZh ? "提交申请" : "Send a request") : (isZh ? "阅读指南" : "Read guide")}
                        <ArrowRight className="size-4" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-muted">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="03" text={isZh ? "表面工艺" : "Finishing options"} />
                  <h2>{isZh ? "常用表面工艺一览。" : "Finishes at a glance."}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-6 lg:grid-cols-2">
              <Reveal>
                <div className="kh-panel h-full p-7">
                  <p className="kh-mono text-(--kh-brass)">{isZh ? "可选工艺" : "Finishing requirements"}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {(isZh ? finishOptionsZh : finishOptions).map((finish) => (
                      <p key={finish} className="rounded-md bg-(--kh-paper) px-4 py-3 text-sm font-medium text-(--kh-ink)">
                        {finish}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="h-full rounded-lg texture-ink p-7">
                  <h3 className="text-2xl font-semibold text-white">
                    {isZh ? "需要结构建议？" : "Need a structure recommendation?"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    {isZh
                      ? "如需结构建议，请提供产品尺寸、重量、使用方式和运输要求。"
                      : "Share the product use, contact conditions and specification details needed to select a suitable food-packaging material."}
                  </p>
                  <Link href="/contact" className="kh-button kh-button-light mt-5">
                    {isZh ? "发起引导式询盘" : "Start guided RFQ"}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
