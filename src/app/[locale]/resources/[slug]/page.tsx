import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { resourceItems, resourceZhCopy } from "@/data/siteContent";
import RelatedLinks from "@/components/site/RelatedLinks";
import { locales } from "@/i18n/locales";
import { buildInquiryContactHref } from "@/lib/inquiryContext";

export function generateStaticParams() { return locales.flatMap((locale) => resourceItems.map((item) => ({ locale, slug: item.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; const item = resourceItems.find((resource) => resource.slug === slug); if (!item) return {}; const zh = locale === "zh"; const brand = getBrandConfig(locale); const copy = zh ? resourceZhCopy[item.slug] : item; const canonical = await getLocaleUrl(locale, `/resources/${slug}`); const title = `${copy.title} | ${brand.name}`; return { metadataBase: new URL(siteConfig.url), title, description: copy.summary, alternates: { canonical, languages: await getAlternateLanguages(`/resources/${slug}`) }, openGraph: { title, description: copy.summary, url: canonical, siteName: brand.name, type: "article" }, twitter: { card: "summary_large_image", title, description: copy.summary } }; }

export default async function ResourceDetailPage({ params, searchParams }: { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { locale, slug } = await params;
  const query = await searchParams;
  const item = resourceItems.find((resource) => resource.slug === slug);
  if (!item) notFound();
  setRequestLocale(locale);
  const isZh = locale === "zh";
  const copy = isZh ? resourceZhCopy[item.slug] : item;
  const interest = slug === "artwork-guidelines" ? "artwork-review" : slug === "dielines-templates" || slug === "dieline-template-request" ? "dieline-request" : "structure-review";
  const contactHref = buildInquiryContactHref({
    interest,
    utm_source: query.utm_source,
    utm_medium: query.utm_medium,
    utm_campaign: query.utm_campaign,
    utm_content: query.utm_content,
    utm_term: query.utm_term,
    gclid: query.gclid,
    fbclid: query.fbclid,
  });
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? `科宏 · ${item.type === "request" ? "申请" : "指南"}` : `Kehong · ${item.type === "request" ? "Request" : "Guide"}`}
          title={copy.title}
          lede={copy.summary}
          meta={[
            isZh ? `${copy.topics.length} 个确认要点` : `${copy.topics.length} checkpoints`,
            "OEM / ODM",
            isZh ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <Link href={contactHref} className="kh-button kh-button-light">
            {item.type === "request"
              ? isZh ? "申请刀模图" : "Request a dieline"
              : isZh ? "咨询包装专家" : "Discuss this with a packaging expert"}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/resources" className="kh-button kh-button-ghost">
            <ArrowLeft className="size-4" />
            {isZh ? "返回设计中心" : "Back to Design Center"}
          </Link>
        </PageHero>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="max-w-3xl">
                <SectionKicker index="02" text={isZh ? "交接清单" : "Handoff checklist"} />
                <h2>{isZh ? "需要准备的内容" : "What to prepare"}</h2>
                <div className="kh-panel mt-8 p-6 sm:p-8">
                  <ul className="grid gap-3">
                    {copy.topics.map((topic) => (
                      <li key={topic} className="flex gap-3 text-sm leading-6 text-(--kh-muted)">
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-(--kh-brass)" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-(--kh-line) pt-5 text-sm leading-6 text-(--kh-muted)">
                    {isZh
                      ? "科宏按双方确认的项目要求核对具体技术参数，在获得可公开的公司文件之前，本页不展示公开下载。"
                      : "Kehong confirms project-specific technical parameters against the approved brief. No public download is shown until a verified company file is available."}
                  </p>
                </div>
                <Link href={contactHref} className="kh-button kh-button-primary mt-8">
                  {item.type === "request"
                    ? isZh ? "申请刀模图" : "Request a dieline"
                    : isZh ? "咨询包装专家" : "Discuss this with a packaging expert"}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
        <RelatedLinks
          locale={locale}
          index="03"
          title={{ en: "Related products & project support", zh: "相关产品与项目支持" }}
          links={[
            { href: "/products?collection=materials", en: "Related paper materials", zh: "相关纸材" },
            { href: "/packaging", en: "Packaging formats", zh: "成品包装类型" },
            { href: "/industries", en: "Industry applications", zh: "行业应用" },
            { href: contactHref, en: "Send this brief", zh: "提交这份需求" },
          ]}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
