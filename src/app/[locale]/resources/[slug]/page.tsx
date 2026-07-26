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
import { resourceItems } from "@/data/siteContent";

export function generateStaticParams() { return ["en", "zh", "es", "th", "vi", "id", "ms"].flatMap((locale) => resourceItems.map((item) => ({ locale, slug: item.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; const item = resourceItems.find((resource) => resource.slug === slug); if (!item) return {}; const canonical = await getLocaleUrl(locale, `/resources/${slug}`); return { metadataBase: new URL(siteConfig.url), title: `${item.title} | Kehong`, description: item.summary, alternates: { canonical, languages: await getAlternateLanguages(`/resources/${slug}`) }, openGraph: { title: `${item.title} | Kehong`, description: item.summary, url: canonical, siteName: siteConfig.name, type: "article" } }; }

export default async function ResourceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const item = resourceItems.find((resource) => resource.slug === slug);
  if (!item) notFound();
  setRequestLocale(locale);
  const isZh = locale === "zh";
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={`Kehong · ${item.type === "request" ? "Request" : "Guide"}`}
          title={item.title}
          lede={item.summary}
          meta={[
            isZh ? `${item.topics.length} 个确认要点` : `${item.topics.length} checkpoints`,
            "OEM / ODM",
            isZh ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {item.type === "request"
              ? isZh ? "申请 dieline" : "Request a dieline"
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
                    {item.topics.map((topic) => (
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
                <Link href="/contact" className="kh-button kh-button-primary mt-8">
                  {item.type === "request"
                    ? isZh ? "申请 dieline" : "Request a dieline"
                    : isZh ? "咨询包装专家" : "Discuss this with a packaging expert"}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
