import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { companyDisplayName, contact } from "@/data/company";
import { termsCopy } from "@/lib/legalContent";
import type { AppLocale } from "@/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const brand = getBrandConfig(locale);
  const copy = termsCopy[locale as AppLocale] ?? termsCopy.en;
  const title = copy.title;
  const description = copy.lede;
  const canonical = await getLocaleUrl(locale, "/terms" as SiteHref);
  const metadataTitle = `${title} | ${brand.name}`;
  return { metadataBase: new URL(siteConfig.url), title: metadataTitle, description, alternates: { canonical, languages: await getAlternateLanguages("/terms") }, openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title: metadataTitle, description } };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = termsCopy[locale as AppLocale] ?? termsCopy.en;
  const isZh = locale === "zh";
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(isZh ? `${companyDisplayName.zh}条款咨询` : `${companyDisplayName.en} terms question`)}`;
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="§"
          kicker={isZh ? "法律信息" : "Legal information"}
          title={copy.title}
          lede={copy.lede}
        />
        <div className="kh-shell py-12 lg:py-16">
        <div className="prose prose-stone max-w-3xl">
          <p>{copy.intro}</p>
          {copy.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
          <p><a className="kh-inline-link" href={emailHref} aria-label={isZh ? `发送邮件至 ${contact.email}` : `Email ${contact.email}`}>{contact.email}</a></p>
        </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
