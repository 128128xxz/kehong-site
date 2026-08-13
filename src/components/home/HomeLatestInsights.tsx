import { Link } from "@/i18n/navigation";
import NewsCard from "@/components/site/NewsCard";
import { getPublishedNews, type NewsLocale } from "@/content/news";
import { Reveal } from "@/components/home/interactive";

export default function HomeLatestInsights({ locale }: { locale: string }) {
  const newsLocale = (locale === "zh" ? "zh" : "en") as NewsLocale;
  const zh = newsLocale === "zh";
  const articles = getPublishedNews(newsLocale).slice(0, 3);
  return (
    <section className="kh-section kh-section-muted kh-home-insights" data-testid="home-latest-insights">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <p className="kh-eyebrow">{zh ? "新闻与洞察" : "News & Insights"}</p>
              <h2>{zh ? "最新内容" : "Latest insights"}</h2>
            </div>
            <Link href="/news" className="kh-text-link">{zh ? "查看全部" : "View all"}</Link>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article, index) => <Reveal key={article.slug} delay={index * 70}><NewsCard article={article} locale={newsLocale} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}
