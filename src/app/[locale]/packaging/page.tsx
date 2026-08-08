import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import PageHero from "@/components/site/PageHero";
import SiteFooter from "@/components/site/SiteFooter";
import { Link } from "@/i18n/navigation";
import { packagingCategories } from "@/data/packagingCategories";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";

// The overview is intentionally limited to the five current packaging categories.
// used throughout the site navigation. Pillow boxes remain available as a
// specific format, but are reached through the relevant packaging routes.
const overviewCategorySlugs = new Set([
  "cake-boxes",
  "takeout-boxes",
  "paper-bags",
  "corrugated-mailer-boxes",
  "cake-boards-cake-drums",
]);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const title = zh ? "成品纸包装分类总览" : "Finished Paper Packaging";
  const description = zh ? "浏览蛋糕盒、外带食品盒、纸袋、瓦楞邮寄盒与蛋糕底托等成品包装分类。" : "Browse cake boxes, takeout boxes, paper bags, corrugated mailer boxes and cake boards by packaging category.";
  const canonical = await getLocaleUrl(locale, "/packaging");
  const metadataTitle = `${title} | ${brand.name}`;
  return { metadataBase: new URL(siteConfig.url), title: metadataTitle, description, alternates: { canonical, languages: await getAlternateLanguages("/packaging") }, openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, locale: openGraphLocales[locale] ?? locale, type: "website" }, twitter: { card: "summary_large_image", title: metadataTitle, description } };
}

export default async function PackagingOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const zh = locale === "zh";
  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={zh ? "科宏 · 成品纸包装" : "Kehong · Finished packaging"}
          title={zh ? "成品纸包装分类总览" : "Finished paper packaging"}
          lede={zh
            ? "按包装结构与应用场景浏览，公开目录与项目化需求分开展示。"
            : "Browse packaging by structure and use case, with public catalog options and project-based requirements separated."}
          meta={[zh ? "公开目录" : "Public catalog", "OEM / ODM", zh ? "中国广东佛山" : "Foshan, Guangdong, China"]}
        />
        <section className="kh-section">
          <div className="kh-shell">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packagingCategories.filter((category) => overviewCategorySlugs.has(category.slug)).map((category) => (
                <Link
                  key={category.slug}
                  href={`/packaging/${category.slug}`}
                  className="group overflow-hidden rounded-lg border border-(--kh-line) bg-(--kh-surface) transition hover:-translate-y-1 hover:border-(--kh-forest)/45 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={category.image} alt={zh ? category.title.zh : category.title.en} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover transition duration-300 group-hover:scale-[1.025]" />
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-(--kh-ink)">{zh ? category.title.zh : category.title.en}</h2>
                    <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{zh ? category.shortDescription.zh : category.shortDescription.en}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-(--kh-forest)">
                      {zh ? "查看分类" : "View category"}
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
