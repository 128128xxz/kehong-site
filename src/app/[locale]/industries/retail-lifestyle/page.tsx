import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import IndustrySeoPage from "@/components/pages/IndustrySeoPage";
import { industrySeoPages } from "@/data/industrySeoPages";
import { getAlternateLanguages, getLocaleUrl, siteConfig } from "@/lib/site";

export function generateStaticParams() { return ["en", "zh", "es", "th", "vi", "id", "ms"].map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = industrySeoPages.retailLifestyle;
  const canonical = await getLocaleUrl(locale, page.href);
  const title = locale === "zh" ? `${page.zhTitle} | 科宏纸品` : `${page.title} | ${siteConfig.name}`;
  const description = locale === "zh" ? page.zhDescription : page.description;
  return { metadataBase: new URL(siteConfig.url), title, description, alternates: { canonical, languages: await getAlternateLanguages(page.href) }, openGraph: { title, description, url: canonical, siteName: siteConfig.name, type: "website" } };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <IndustrySeoPage locale={locale} page={industrySeoPages.retailLifestyle} />; }
