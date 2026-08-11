import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { contact } from "@/data/company";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const brand = getBrandConfig(locale);
  const title = locale === "zh" ? "使用条款" : "Terms of Use";
  const description = locale === "zh" ? "科宏网站使用条款" : "Terms for using the Kehong website and inquiry service.";
  const canonical = await getLocaleUrl(locale, "/terms" as SiteHref);
  const metadataTitle = `${title} | ${brand.name}`;
  return { metadataBase: new URL(siteConfig.url), title: metadataTitle, description, alternates: { canonical, languages: await getAlternateLanguages("/terms") }, openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title: metadataTitle, description } };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(isZh ? "科宏纸品条款咨询" : "Kehong terms question")}`;
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="§"
          kicker={isZh ? "法律信息" : "Legal information"}
          title={isZh ? "使用条款" : "Terms of Use"}
          lede={isZh ? "科宏网站使用条款" : "Terms for using the Kehong website and inquiry service."}
        />
        <div className="kh-shell py-12 lg:py-16">
        <div className="prose prose-stone max-w-3xl">
          <p>{isZh ? "本网站提供纸品包装材料、半成品与成品结构的产品信息。具体规格、价格、交期和可用性以双方确认的报价和订单为准。" : "This website provides information about paper packaging materials, components and finished structures. Final specifications, pricing, lead time and availability are confirmed in the quotation and order agreed by both parties."}</p>
          <h2>{isZh ? "产品信息" : "Product information"}</h2>
          <p>{isZh ? "图片用于展示材料或结构示例，除非明确标注为精确产品图片，否则不应视为特定 SKU 的承诺。" : "Images may illustrate a material or structure example. Unless explicitly identified as exact product photography, they are not a commitment for a specific SKU."}</p>
          <h2>{isZh ? "联系我们" : "Contact"}</h2>
          <p><a className="kh-inline-link" href={emailHref} aria-label={isZh ? `发送邮件至 ${contact.email}` : `Email ${contact.email}`}>{contact.email}</a></p>
        </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
