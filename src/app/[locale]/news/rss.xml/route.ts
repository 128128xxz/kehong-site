import { getPublishedNews, type NewsLocale } from "@/content/news";
import { siteConfig } from "@/lib/site-config";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const newsLocale = (locale === "zh" ? "zh" : "en") as NewsLocale;
  const articles = getPublishedNews(newsLocale);
  const siteTitle = newsLocale === "zh" ? "科宏纸品 · 新闻与洞察" : "Kehong Paper Products · News & Insights";
  const siteDescription = newsLocale === "zh" ? "围绕纸材、包装结构、设计稿和采购准备的实用内容。" : "Practical insights on paper materials, packaging structure, artwork and procurement preparation.";
  const origin = siteConfig.url;
  const items = articles.map((article) => {
    const url = `${origin}/${newsLocale}/news/${article.slug}`;
    return `<item><title>${escapeXml(article.title)}</title><description>${escapeXml(article.description)}</description><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><pubDate>${new Date(`${article.publishedAt}T00:00:00Z`).toUTCString()}</pubDate><lastBuildDate>${new Date(`${article.updatedAt}T00:00:00Z`).toUTCString()}</lastBuildDate><category>${escapeXml(article.category)}</category><enclosure url="${escapeXml(`${origin}${article.coverImage}`)}" type="image/jpeg" /></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteTitle)}</title><link>${escapeXml(`${origin}/${newsLocale}/news`)}</link><description>${escapeXml(siteDescription)}</description><language>${newsLocale === "zh" ? "zh-CN" : "en"}</language><lastBuildDate>${new Date(`${articles[0]?.updatedAt ?? "2026-01-01"}T00:00:00Z`).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
