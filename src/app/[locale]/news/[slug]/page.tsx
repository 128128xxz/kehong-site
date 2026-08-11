import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import NewsShareTools from "@/components/site/NewsShareTools";
import NewsCard, { formatNewsDate } from "@/components/site/NewsCard";
import { getNewsArticle, getNewsSlugs, getNewsTranslation, getPublishedNews, type NewsLocale } from "@/content/news";
import { Link } from "@/i18n/navigation";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { locales } from "@/i18n/locales";

function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function generateStaticParams() {
  return locales.flatMap((locale) => getNewsSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getNewsArticle((locale === "zh" ? "zh" : "en") as NewsLocale, slug);
  if (!article) return {};
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale, `/news/${slug}`);
  return {
    metadataBase: new URL(siteConfig.url), title: `${article.title} | ${brand.name}`, description: article.description,
    alternates: { canonical, languages: await getAlternateLanguages(`/news/${slug}`) },
    openGraph: { title: article.title, description: article.description, url: canonical, siteName: brand.name, type: "article", publishedTime: article.publishedAt, modifiedTime: article.updatedAt, authors: [article.author], images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.coverAlt }] },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [article.coverImage] },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const newsLocale = (locale === "zh" ? "zh" : "en") as NewsLocale;
  const article = getNewsArticle(newsLocale, slug);
  if (!article) notFound();
  setRequestLocale(locale);
  const zh = newsLocale === "zh";
  const canonical = await getLocaleUrl(locale, `/news/${slug}`);
  const translation = getNewsTranslation(newsLocale === "zh" ? "en" : "zh", article.translationKey);
  const related = getPublishedNews(newsLocale).filter((item) => item.translationKey !== article.translationKey).slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": article.type === "company-news" ? "NewsArticle" : "Article",
    headline: article.title,
    description: article.description,
    image: [new URL(article.coverImage, siteConfig.url).toString()],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: locale,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: zh ? "首页" : "Home", item: await getLocaleUrl(locale) },
      { "@type": "ListItem", position: 2, name: zh ? "新闻与洞察" : "News & Insights", item: await getLocaleUrl(locale, "/news") },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero index="01" kicker={article.category} title={article.title} lede={article.description} meta={[formatNewsDate(article.publishedAt, locale), article.author, zh ? "新闻与洞察" : "News & Insights"]}>
          <Link href="/contact" className="kh-button kh-button-light">{zh ? "提交询盘" : "Start a project brief"}<ArrowRight className="size-4" /></Link>
          <Link href="/news" className="kh-button kh-button-ghost">{zh ? "返回新闻与洞察" : "Back to News & Insights"}</Link>
        </PageHero>
        <article className="kh-news-article kh-section">
          <div className="kh-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div>
              <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-7 flex flex-wrap items-center gap-2 text-sm text-(--kh-muted)">
                <Link href="/news" className="hover:text-(--kh-ink)">{zh ? "新闻与洞察" : "News & Insights"}</Link><ChevronRight className="size-4" aria-hidden="true" /><span>{article.category}</span>
              </nav>
              <div className="relative aspect-[1200/630] overflow-hidden rounded-lg border border-(--kh-line)">
                <Image src={article.coverImage} alt={article.coverAlt} fill priority sizes="(max-width: 1024px) 92vw, 65vw" className="object-cover" />
              </div>
              <p className="mt-7 text-lg font-medium leading-8 text-(--kh-ink)">{article.excerpt}</p>
              <div className="mt-8">
                {article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
              </div>
              <div className="mt-10"><NewsShareTools canonical={canonical} slug={article.slug} title={article.title} locale={locale} /></div>
              {translation ? <p className="mt-5 text-sm text-(--kh-muted)">{zh ? "English version available:" : "中文版本："} <Link className="underline underline-offset-4" href={`/news/${translation.slug}`}>{translation.title}</Link></p> : null}
            </div>
            <aside className="kh-panel p-5 lg:sticky lg:top-24">
              <p className="kh-mono text-(--kh-brass)">{zh ? "项目入口" : "Project paths"}</p>
              <h2 className="mt-3 text-2xl font-semibold">{zh ? "把内容带回项目" : "Bring this into a project"}</h2>
              <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{zh ? "准备好产品、尺寸、材料和数量后，可以直接提交需求。" : "Share the product, dimensions, material and quantity when you are ready to discuss the brief."}</p>
              <div className="mt-5 grid gap-3">{article.relatedLinks.map((link) => <Link key={link.href} href={link.href} className="kh-text-link min-h-11">{zh ? link.zh : link.en}<ArrowRight className="size-4" /></Link>)}</div>
              <Link href={article.cta.href} className="kh-button kh-button-primary mt-6 w-full justify-center">{zh ? article.cta.zh : article.cta.en}<ArrowRight className="size-4" /></Link>
            </aside>
          </div>
        </article>
        <section className="kh-section kh-section-muted">
          <div className="kh-shell">
            <div className="kh-section-heading"><div><p className="kh-eyebrow">{zh ? "相关阅读" : "Related insights"}</p><h2>{zh ? "继续阅读" : "Keep reading"}</h2></div></div>
            <div className="grid gap-5 md:grid-cols-3">{related.map((item) => <NewsCard key={item.slug} article={item} locale={locale} />)}</div>
          </div>
        </section>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      </main>
      <SiteFooter />
    </div>
  );
}
