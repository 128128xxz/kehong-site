import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
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
  const applicationCount = industryGroups.reduce((count, group) => count + group.applications.length, 0);
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker="Kehong · Industry applications"
          title={isZh ? "按行业找到更合适的纸包装路径" : "Find the right paper packaging path by industry."}
          lede={
            isZh
              ? "按应用场景浏览材料、结构、内托和成品包装，再把明确的尺寸和图纸带入询价。"
              : "Browse materials, structures, inserts and finished packaging by application, then bring clear dimensions and drawings into the quotation process."
          }
          meta={
            isZh
              ? [`${industryGroups.length} 个行业组`, `${applicationCount} 个应用场景`, "OEM / ODM"]
              : [`${industryGroups.length} industry groups`, `${applicationCount} applications`, "OEM / ODM"]
          }
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "获取报价" : "Get a quote"}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/products" className="kh-button kh-button-ghost">
            {isZh ? "浏览全部产品" : "Browse products"}
          </Link>
        </PageHero>

        <section className="kh-section kh-section-paper border-b border-(--kh-line)">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="02" text={isZh ? "行业矩阵" : "Industry matrix"} />
                  <h2>{isZh ? "每个应用场景，都有入口。" : "Every application has an entry point."}</h2>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 lg:grid-cols-3">
              {industryGroups.map((group, index) => (
                <Reveal key={group.slug} className="h-full" delay={(index % 3) * 80}>
                  <article className="kh-panel h-full p-6">
                    <p className="kh-mono text-(--kh-brass)">{`0${index + 1} · ${group.slug.replaceAll("-", " ")}`}</p>
                    <h3 className="mt-3 text-2xl font-semibold">{group.title}</h3>
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="kh-section kh-section-cta">
          <div className="kh-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <Reveal>
              <SectionKicker index="03" text="Buyer-ready brief" light />
              <h2>Share the product, dimensions, quantity and destination.</h2>
            </Reveal>
            <Reveal delay={120}>
              <Link href="/contact" className="kh-button kh-button-light">
                Talk to an expert <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
