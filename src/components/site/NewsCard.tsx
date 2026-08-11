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

export default function NewsCard({ article, locale }: { article: NewsArticle; locale: string }) {
  const zh = locale === "zh";
  return (
    <article className="kh-news-card kh-panel overflow-hidden p-3" data-news-card data-news-category={article.category}>
      <Link href={`/news/${article.slug}`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--kh-brass)">
        <span className="kh-news-card-media block">
          <Image src={article.coverImage} alt={article.coverAlt} fill sizes="(max-width: 760px) 92vw, (max-width: 1100px) 45vw, 30vw" className="object-cover" />
        </span>
        <span className="mt-4 flex items-center justify-between gap-3 px-2">
          <span className="kh-mono text-xs uppercase tracking-[.12em] text-(--kh-brass)">{article.category}</span>
          <time className="text-xs text-(--kh-muted)" dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt, locale)}</time>
        </span>
        <span className="mt-2 block px-2 text-xl font-semibold tracking-tight text-(--kh-ink)">{article.title}</span>
        <span className="mt-2 block px-2 text-sm leading-6 text-(--kh-muted)">{article.excerpt}</span>
        <span className="kh-text-link mt-4 px-2 pb-2 text-sm">{zh ? "阅读全文" : "Read article"}<ArrowRight className="size-4" /></span>
      </Link>
    </article>
  );
}
