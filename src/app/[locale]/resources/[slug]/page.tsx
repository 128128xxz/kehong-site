import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
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
  return (
    <div className="texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Link href="/resources" className="kh-text-link">
          <ArrowLeft className="size-4" />
          Resources & Design Center
        </Link>
        <p className="kh-eyebrow mt-10">Kehong · {item.type === "request" ? "Request" : "Guide"}</p>
        <h1 className="kh-editorial-heading mt-3 text-4xl sm:text-5xl">{item.title}</h1>
        <p className="kh-lede mt-6">{item.summary}</p>
        <section className="kh-panel mt-10 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">What to prepare</h2>
          <ul className="mt-5 grid gap-3">
            {item.topics.map((topic) => (
              <li key={topic} className="flex gap-3 text-sm leading-6 text-(--kh-muted)">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-(--kh-brass)" />
                {topic}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-(--kh-line) pt-5 text-sm leading-6 text-(--kh-muted)">
            Kehong confirms project-specific technical parameters against the approved brief. No public download is shown until a verified company file is available.
          </p>
        </section>
        <Link href="/contact" className="kh-button kh-button-primary mt-8">
          {item.type === "request" ? "Request a dieline" : "Discuss this with a packaging expert"}
          <ArrowRight className="size-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
