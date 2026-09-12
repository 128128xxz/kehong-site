import { describe, expect, it } from "vitest";
import { getNewsArticle, getNewsSlugs, getPublishedNews, getNewsTranslation } from "@/content/news";

describe("News & Insights content source", () => {
  it("publishes the current paired, non-company guide articles", () => {
    expect(getNewsSlugs()).toHaveLength(5);
    expect(getPublishedNews("en")).toHaveLength(5);
    expect(getPublishedNews("zh")).toHaveLength(5);
    expect(getPublishedNews("en").every((article) => article.type !== "company-news")).toBe(true);
    expect(new Set(getPublishedNews("en").map((article) => article.slug)).size).toBe(5);
  });

  it("keeps each article pair and internal paths buyer-relevant", () => {
    for (const article of getPublishedNews("en")) {
      const zh = getNewsTranslation("zh", article.translationKey);
      expect(zh).toBeDefined();
      expect(article.relatedLinks.some((link) => link.href.startsWith("/products") || link.href.startsWith("/packaging"))).toBe(true);
      expect(article.relatedLinks.some((link) => link.href.startsWith("/resources") || link.href.startsWith("/factory") || link.href.startsWith("/packaging"))).toBe(true);
      expect(article.relatedLinks.some((link) => link.href.startsWith("/contact"))).toBe(true);
      expect(getNewsArticle("en", article.slug)?.published).toBe(true);
    }
  });

  it("does not expose draft content through the published selector", () => {
    expect(getPublishedNews("en").every((article) => article.published)).toBe(true);
    expect(getPublishedNews("zh").every((article) => article.published)).toBe(true);
  });

  it("publishes citation-ready direct answers, comparison tables and buyer sources", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const article of getPublishedNews(locale)) {
        expect(article.directAnswer).toBeTruthy();
        expect(article.comparisonColumns?.length).toBeGreaterThanOrEqual(3);
        expect(article.comparisonRows?.length).toBeGreaterThanOrEqual(3);
        expect(article.buyerChecklist?.length).toBeGreaterThanOrEqual(4);
        expect(article.sources?.length).toBeGreaterThanOrEqual(1);
        expect(article.directAnswer).not.toMatch(/内容由\s*AI\s*生成|人工智能|仅供参考/iu);
      }
    }
  });
});
