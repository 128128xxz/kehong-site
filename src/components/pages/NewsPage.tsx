import { ArrowRight } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import NewsArchiveGrid from "@/components/site/NewsArchiveGrid";
import { getPublishedNews, NEWS_CATEGORIES, type NewsLocale } from "@/content/news";
import { Link } from "@/i18n/navigation";

export default function NewsPage({ locale }: { locale: NewsLocale }) {
  const zh = locale === "zh";
  const articles = getPublishedNews(locale);
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={zh ? "科宏 · 新闻与洞察" : "Kehong · News & Insights"}
          title={zh ? "围绕材料、结构与包装采购的实用内容" : "Practical content for materials, structure and packaging procurement"}
          lede={zh ? "阅读材料形态、包装结构、设计稿和打样准备指南，把包装需求整理得更清楚" : "Read practical guides on material formats, packaging structure, artwork and sampling so your packaging requirements start with clearer information"}
          meta={[zh ? `${articles.length} 篇已发布内容` : `${articles.length} published articles`, "OEM / ODM", zh ? "中国广东佛山" : "Foshan, Guangdong, China"]}
        >
          <Link href="/contact" className="kh-button kh-button-light">{zh ? "立即询价" : "Request a quote"}<ArrowRight className="size-4" /></Link>
          <Link href="/resources" className="kh-button kh-button-ghost">{zh ? "查看资源中心" : "Open the resource center"}</Link>
        </PageHero>
        <section className="kh-section kh-section-paper">
          <div className="kh-shell">
            <NewsArchiveGrid articles={articles} categories={[...NEWS_CATEGORIES[locale]]} locale={locale} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
