import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
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
  return <div className="kh-premium-site texture-paper min-h-screen bg-[#f6f4ec] text-[#171713]"><Header /><main><section className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20"><p className="text-xs font-black uppercase tracking-[.24em] text-[#9a6b1f]">Kehong · Industry applications</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">{isZh ? "按行业找到更合适的纸包装路径" : "Find the right paper packaging path by industry."}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#626156]">{isZh ? "按应用场景浏览材料、结构、内托和成品包装，再把明确的尺寸和图纸带入询价。" : "Browse materials, structures, inserts and finished packaging by application, then bring clear dimensions and drawings into the quotation process."}</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#171713] px-5 text-sm font-black text-white">{isZh ? "获取报价" : "Get a quote"}<ArrowRight className="size-4" /></Link><Link href="/products" className="inline-flex min-h-11 items-center rounded-full border border-[#171713]/20 bg-white/75 px-5 text-sm font-black">{isZh ? "浏览全部产品" : "Browse products"}</Link></div></section><section className="border-y border-[#d9d2be] bg-white/55"><div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">{industryGroups.map((group) => <article key={group.slug} className="rounded-lg border border-[#d9d2be] bg-[#fbfaf5] p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.18em] text-[#9a6b1f]">{group.slug.replaceAll("-", " ")}</p><h2 className="mt-3 text-2xl font-black">{group.title}</h2><p className="mt-3 text-sm leading-6 text-[#626156]">{group.description}</p><ul className="mt-5 grid gap-2">{group.applications.map((item) => <li key={item.slug} className="flex gap-2 text-sm font-semibold text-[#4e4b42]"><Check className="mt-1 size-4 shrink-0 text-[#9a6b1f]" />{item.title}</li>)}</ul><Link href="/products" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#805716]">Explore product ranges <ArrowRight className="size-4" /></Link></article>)}</div></section><section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-6 rounded-lg border border-[#171713]/10 bg-[#171713] p-7 text-white sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#e8c06c]">Buyer-ready brief</p><h2 className="mt-2 text-2xl font-black">Share the product, dimensions, quantity and destination.</h2></div><Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#e8c06c] px-5 text-sm font-black text-[#171713]">Talk to an expert <ArrowRight className="ml-2 size-4" /></Link></div></section></main><SiteFooter /></div>;
}
