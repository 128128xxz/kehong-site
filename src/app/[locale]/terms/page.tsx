import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { siteConfig, getLocaleUrl, getAlternateLanguages, type SiteHref } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "zh" ? "使用条款" : "Terms of Use";
  const canonical = await getLocaleUrl(locale, "/terms" as SiteHref);
  return { metadataBase: new URL(siteConfig.url), title: `${title} | ${siteConfig.name}`, description: locale === "zh" ? "Kehong 网站使用条款。" : "Terms for using the Kehong website and inquiry service.", alternates: { canonical, languages: await getAlternateLanguages("/terms") } };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  return (
    <div className="texture-paper min-h-screen bg-[#f6f4ec]"><Header /><main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9a6b1f]">{isZh ? "法律信息" : "Legal information"}</p><h1 className="mt-4 text-4xl font-black text-[#171713]">{isZh ? "使用条款" : "Terms of Use"}</h1><div className="prose prose-stone mt-8 max-w-none"><p>{isZh ? "本网站提供纸品包装材料、半成品与成品结构的产品信息，具体规格、价格、交期和可用性需以双方确认的报价和订单为准。" : "This website provides information about paper packaging materials, components and finished structures. Final specifications, pricing, lead time and availability are confirmed in the quotation and order agreed by both parties."}</p><h2>{isZh ? "产品信息" : "Product information"}</h2><p>{isZh ? "图片用于展示材料或结构方向，除非明确标注为精确产品图片，否则不应视为特定 SKU 的承诺。" : "Images may illustrate a material or structure direction. Unless explicitly identified as exact product photography, they are not a commitment for a specific SKU."}</p><h2>{isZh ? "联系我们" : "Contact"}</h2><p><a href={`mailto:${"info@kehong.tech"}`}>info@kehong.tech</a></p></div></main><SiteFooter /></div>
  );
}
