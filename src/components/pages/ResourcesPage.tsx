import { ArrowRight, Box, FileText, Palette, Ruler, Scissors, Send } from "lucide-react";
import Image from "next/image";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import NewsCard from "@/components/site/NewsCard";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import { resourceApplicationSlugs, resourceItems, resourceZhCopy } from "@/data/siteContent";
import { getPublishedNews, type NewsLocale } from "@/content/news";
import { getTranslations } from "next-intl/server";

const icons = [Palette, FileText, Scissors, Ruler, FileText, FileText];

export default async function ResourcesPage({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "Stage2.resources" });
  const guideCount = resourceItems.filter((item) => item.type === "guide").length;
  const requestCount = resourceItems.filter((item) => resourceApplicationSlugs.includes(item.slug as (typeof resourceApplicationSlugs)[number])).length;
  const articles = getPublishedNews(locale as NewsLocale).slice(0, 3);

  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("hero.kicker")}
          title={t("hero.title")}
          lede={t("hero.lede")}
          meta={[
            isZh
              ? `${guideCount} 份指南 · ${requestCount} 个申请入口`
              : `${guideCount} guides · ${requestCount} request channels`,
            t("hero.metaOem"),
            t("hero.metaLocation"),
          ]}
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {t("hero.ctaExpert")}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/capabilities" className="kh-button kh-button-ghost">
            {t("hero.ctaCapabilities")}
          </Link>
        </PageHero>

        <section className="kh-section kh-section-paper">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="02" text={t("guides.kicker")} />
                  <h2>{t("guides.title")}</h2>
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
                        <span className="kh-mono text-(--kh-brass)">{item.type === "request" ? t("guides.requestLabel") : t("guides.guideLabel")}</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold">{copy.title}</h3>
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
                        {item.type === "request" ? t("guides.sendRequest") : t("guides.readGuide")}
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
                  <SectionKicker index="03" text={t("news.kicker")} />
                  <h2>{t("news.title")}</h2>
                  <p className="kh-section-lede mt-5">{t("news.lede")}</p>
                </div>
                <div>
                  <Link href="/news" className="kh-button kh-button-outline">
                    {t("news.viewAll")}<ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-news-preview-grid>
                {articles.map((article) => <NewsCard key={article.slug} article={article} locale={locale} />)}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="04" text={t("studio.kicker")} />
                  <h2 className="kh-editorial-serif">{t("studio.title")}</h2>
                  <p className="kh-section-lede mt-5">{t("studio.lede")}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="kh-panel grid gap-6 p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
                <div>
                  <span className="grid size-12 place-items-center rounded-full bg-(--kh-brass-soft)/35 text-(--kh-brass)">
                    <Box className="size-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{isZh ? "结构参考工具" : "Structure reference tool"}</h3>
                  <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{t("studio.positioning")}</p>
                  <Link href="/model-preview" className="kh-button kh-button-dark mt-6">
                    {t("studio.explore")}<ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="kh-media-shade relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src="/media/shared/pizza-box-structure-preview-reference.png"
                    alt={isZh ? "3D 包装结构预览界面" : "3D packaging structure preview"}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-cta">
          <div className="kh-shell">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <SectionKicker index="05" text={t("reference.kicker")} light />
                <h2 className="kh-editorial-serif mt-4">{t("reference.title")}</h2>
                <p className="kh-section-lede mt-4 text-(--kh-muted)/80">{t("reference.lede")}</p>
                <div className="kh-cta-actions mt-6 justify-center">
                  <Link href="/contact" className="kh-button kh-button-light">
                    <Send className="size-4" />
                    {t("reference.sendFile")}
                  </Link>
                  <Link href="/contact" className="kh-button kh-button-ghost">
                    {t("reference.discuss")}<ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}