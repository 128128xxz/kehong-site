import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { NewsArticle } from "@/content/news";

export function formatNewsDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function NewsCard({
  article,
  locale,
  eager = false,
  featured = false,
}: {
  article: NewsArticle;
  locale: string;
  eager?: boolean;
  featured?: boolean;
}) {
  const zh = locale === "zh";
  return (
    <article
      className={`kh-news-card${featured ? " kh-news-card--featured" : ""}`}
      data-news-card
      data-news-category={article.category}
    >
      <Link href={`/news/${article.slug}`} className="kh-news-card-link">
        <span className="kh-news-card-media">
          <Image
            src={article.coverImage}
            alt={article.coverAlt}
            fill
            sizes={featured ? "(max-width: 760px) 100vw, 60vw" : "(max-width: 760px) 100vw, 30vw"}
            className="object-cover"
            loading={eager ? "eager" : "lazy"}
          />
        </span>
        <span className="kh-news-card-meta">
          <span className="kh-mono kh-news-card-category">{article.category}</span>
          <time className="kh-news-card-date" dateTime={article.publishedAt}>
            {formatNewsDate(article.publishedAt, locale)}
          </time>
        </span>
        <span className="kh-news-card-title">{article.title}</span>
        {featured && <span className="kh-news-card-excerpt">{article.excerpt}</span>}
        <span className="kh-news-card-read">
          {zh ? "阅读全文" : "Read article"}
          <ArrowRight className="kh-news-card-read-arrow size-4" aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}
