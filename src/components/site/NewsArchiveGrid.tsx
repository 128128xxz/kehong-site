"use client";

import { useMemo, useState } from "react";
import NewsCard from "@/components/site/NewsCard";
import type { NewsArticle } from "@/content/news";

export default function NewsArchiveGrid({ articles, categories, locale }: { articles: NewsArticle[]; categories: string[]; locale: string }) {
  const zh = locale === "zh";
  const [category, setCategory] = useState("all");
  const filtered = useMemo(() => category === "all" ? articles : articles.filter((article) => article.category === category), [articles, category]);
  return (
    <>
      <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label={zh ? "按分类筛选文章" : "Filter articles by category"}>
        <button type="button" className={`kh-news-share-button${category === "all" ? " border-(--kh-forest) bg-(--kh-forest) text-white" : ""}`} onClick={() => setCategory("all")} aria-pressed={category === "all"}>{zh ? "全部" : "All"}</button>
        {categories.filter((item) => articles.some((article) => article.category === item)).map((item) => (
          <button key={item} type="button" className={`kh-news-share-button${category === item ? " border-(--kh-forest) bg-(--kh-forest) text-white" : ""}`} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-news-archive-grid>
        {filtered.map((article) => <NewsCard key={article.slug} article={article} locale={locale} />)}
      </div>
      {!filtered.length ? <p className="kh-panel p-6 text-(--kh-muted)">{zh ? "该分类暂时没有已发布内容。" : "No published articles are available in this category yet."}</p> : null}
    </>
  );
}
