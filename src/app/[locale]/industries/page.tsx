import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { Link } from "@/i18n/navigation";
import { industryGroups } from "@/data/industries";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = await getLocaleUrl(locale, "/industries");
  const title = "Industries We Serve | Kehong Paper Packaging";
  const description = "Explore paper materials, boxes, inserts and protective packaging by industry application.";
  return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages("/industries") }, openGraph: { title, description, url: canonical, siteName: siteConfig.name, locale: openGraphLocales[locale] ?? locale, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function IndustriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  return (
    <div className="kh-premium-site min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <p className="kh-eyebrow">Kehong · Industry applications</p>
          <h1 className="kh-editorial-heading mt-4 max-w-4xl text-4xl sm:text-6xl">
            {isZh ? "按行业找到更合适的纸包装路径" : "Find the right paper packaging path by industry."}
          </h1>
          <p className="kh-lede mt-6 max-w-2xl">
            {isZh
              ? "按应用场景浏览材料、结构、内托和成品包装，再把明确的尺寸和图纸带入询价。"
              : "Browse materials, structures, inserts and finished packaging by application, then bring clear dimensions and drawings into the quotation process."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact" className="kh-button kh-button-primary">
              {isZh ? "获取报价" : "Get a quote"}
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/products" className="kh-button kh-button-secondary">
              {isZh ? "浏览全部产品" : "Browse products"}
            </Link>
          </div>
        </section>
        <section className="border-y border-(--kh-line) bg-(--kh-surface)">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
            {industryGroups.map((group) => (
              <article key={group.slug} className="rounded-lg border border-(--kh-line) bg-(--kh-paper) p-5">
                <p className="kh-eyebrow">{group.slug.replaceAll("-", " ")}</p>
                <h2 className="mt-3 text-2xl font-semibold">{group.title}</h2>
                <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{group.description}</p>
                <ul className="mt-5 grid gap-2">
                  {group.applications.map((item) => (
                    <li key={item.slug} className="flex gap-2 text-sm font-medium text-(--kh-ink)">
                      <Check className="mt-1 size-4 shrink-0 text-(--kh-brass)" />
                      {item.title}
                    </li>
                  ))}
                </ul>
                <Link href="/products" className="kh-text-link mt-6">
                  Explore product ranges <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-lg texture-ink p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="kh-eyebrow kh-eyebrow-light">Buyer-ready brief</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Share the product, dimensions, quantity and destination.</h2>
            </div>
            <Link href="/contact" className="kh-button kh-button-light">
              Talk to an expert <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
