import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { companyDisplayName, contact } from "@/data/company";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const brand = getBrandConfig(locale);
  const title = locale === "zh" ? "隐私政策" : "Privacy Policy";
  const description = locale === "zh" ? "科宏网站询盘信息处理说明" : "How Kehong handles information submitted through this website.";
  const canonical = await getLocaleUrl(locale, "/privacy" as SiteHref);
  const metadataTitle = `${title} | ${brand.name}`;
  return { metadataBase: new URL(siteConfig.url), title: metadataTitle, description, alternates: { canonical, languages: await getAlternateLanguages("/privacy") }, openGraph: { title: metadataTitle, description, url: canonical, siteName: brand.name, type: "website" }, twitter: { card: "summary_large_image", title: metadataTitle, description } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(isZh ? `${companyDisplayName.zh}隐私咨询` : `${companyDisplayName.en} privacy question`)}`;
  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="§"
          kicker={isZh ? "法律信息" : "Legal information"}
          title={isZh ? "隐私政策" : "Privacy Policy"}
          lede={isZh ? "科宏网站询盘信息处理说明" : "How Kehong handles information submitted through this website."}
        />
        <div className="kh-shell py-12 lg:py-16">
        <div className="prose prose-stone max-w-3xl">
          <p>{isZh ? "通过科宏网站提交询盘时，您提供的姓名、公司、联系方式、产品需求和附件仅用于回复咨询、确认规格和报价。" : "When you submit an inquiry through the Kehong website, we use the name, company, contact details, product requirements and attachments you provide to respond, confirm specifications and prepare a quotation."}</p>
          <h2>{isZh ? "信息使用" : "Use of information"}</h2>
          <p>{isZh ? "询盘信息不会出售给第三方。为完成邮件发送、网站托管或安全防护，信息可能由必要的服务提供商按其职责处理。" : "We do not sell inquiry information. Information may be processed by service providers that are necessary for email delivery, hosting or security."}</p>
          <h2>{isZh ? "来源归因" : "Attribution"}</h2>
          <p>{isZh ? "访问链接包含 UTM 参数或广告点击标识时，网站将首触和最近一次来源信息保存在本次浏览器会话的 sessionStorage 中（不使用 Cookie），在提交询盘时随表单发送。当前实现不保存归因时间戳，也没有代码定义的过期期限。网站使用 Vercel Analytics 记录站内事件。" : "When a visit contains UTM parameters or ad-click identifiers, the site keeps first-touch and latest-touch attribution in this browser session's sessionStorage (not a cookie) and includes it with an inquiry submission. The current implementation stores no attribution timestamp and defines no expiry period in code. The site uses Vercel Analytics for on-site event measurement."}</p>
          <h2>{isZh ? "联系我们" : "Contact"}</h2>
          <p><a className="kh-inline-link" href={emailHref} aria-label={isZh ? `发送邮件至 ${contact.email}` : `Email ${contact.email}`}>{contact.email}</a></p>
        </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
