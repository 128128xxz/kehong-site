import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "zh" ? "隐私政策" : "Privacy Policy";
  const canonical = await getLocaleUrl(locale, "/privacy" as SiteHref);
  return { metadataBase: new URL(siteConfig.url), title: `${title} | ${siteConfig.name}`, description: locale === "zh" ? "Kehong 网站询盘信息处理说明。" : "How Kehong handles information submitted through this website.", alternates: { canonical, languages: await getAlternateLanguages("/privacy") } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  return (
    <div className="texture-paper min-h-screen bg-[#f6f4ec]"><Header /><main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9a6b1f]">{isZh ? "法律信息" : "Legal information"}</p><h1 className="mt-4 text-4xl font-black text-[#171713]">{isZh ? "隐私政策" : "Privacy Policy"}</h1><div className="prose prose-stone mt-8 max-w-none"><p>{isZh ? "当您通过 Kehong 网站提交询盘时，我们会使用您主动提供的姓名、公司、联系方式、产品需求和附件，仅用于回复咨询、确认规格与报价。" : "When you submit an inquiry through the Kehong website, we use the name, company, contact details, product requirements and attachments you provide to respond, confirm specifications and prepare a quotation."}</p><h2>{isZh ? "信息使用" : "Use of information"}</h2><p>{isZh ? "我们不会将询盘信息出售给第三方。为完成邮件发送、网站托管或安全防护，信息可能由必要的服务提供商按其职责处理。" : "We do not sell inquiry information. Information may be processed by service providers that are necessary for email delivery, hosting or security."}</p><h2>{isZh ? "联系我们" : "Contact"}</h2><p><a href={`mailto:${"info@kehong.tech"}`}>info@kehong.tech</a></p></div></main><SiteFooter /></div>
  );
}
