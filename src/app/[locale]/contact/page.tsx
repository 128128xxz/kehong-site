import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import GuidedQuoteForm from "@/components/site/GuidedQuoteForm";
import QuickQuoteForm from "@/components/site/QuickQuoteForm";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { contact } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { getInterest } from "@/data/interests";
import { buildProductGroupSummary, getLocalizedProductTitle, getProductGroupId, getSkuBySlug, getSkusByGroupId } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const title = zh ? "联系科宏纸品 | 获取纸材与定制包装报价" : `${t("contact.title")} | ${brand.name}`;
  const description = t("contact.description");
  const canonical = await getLocaleUrl(locale, "/contact");

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical,
      languages: await getAlternateLanguages("/contact"),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: showcaseImages.webBakeryWindowBox,
          width: 1200,
          height: 630,
          alt: t("contact.title"),
        },
      ],
      locale: openGraphLocales[locale] ?? locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [showcaseImages.webBakeryWindowBox],
    },
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sku?: string; product?: string; url?: string; interest?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site" });
  const zh = locale === "zh";
  const interest = getInterest(query.interest);
  const selectedSku = query.product ? getSkuBySlug(query.product) : undefined;
  const selectedGroup = selectedSku
    ? buildProductGroupSummary({ id: getProductGroupId(selectedSku), representative: selectedSku, variants: getSkusByGroupId(getProductGroupId(selectedSku)) }, locale)
    : undefined;
  const selectedName = selectedSku
    ? selectedGroup?.title ?? getLocalizedProductTitle(selectedSku, locale)
    : query.product;
  const initialProducts =
    query.sku || query.product || query.url || interest
      ? [
          {
            productGroupId: selectedGroup?.id,
            productGroupTitle: selectedGroup?.title,
            sku: query.sku || selectedSku?.sku,
            skuTitle: selectedSku ? getLocalizedProductTitle(selectedSku, locale) : undefined,
            // An interest is context, never a product value. It must not prefill Products or SKUs.
            name: selectedName,
            url: query.url,
            interestId: interest?.id,
            interestLabel: interest ? (zh ? interest.label.zh : interest.label.en) : undefined,
            interestProductType: interest?.formProductType,
          },
        ]
      : [];

  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(zh ? "科宏纸品询盘" : "Kehong packaging inquiry")}`;
  const whatsappHref = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const channels = [
    { label: zh ? "海外销售 WhatsApp" : "Overseas Sales WhatsApp", value: contact.whatsapp, href: whatsappHref, external: true },
    { label: zh ? "邮箱" : "Email", value: contact.email, href: emailHref, external: false },
  ];
  const checklist = [
    {
      index: "A",
      label: zh ? "询价信息" : "Quote information",
      body: zh ? "参考图片、尺寸、材质和数量" : "Reference image, dimensions, material and quantity",
    },
    {
      index: "B",
      label: zh ? "可提供资料" : "Available documents",
      body: zh ? "产品目录、规格资料及项目文件" : "Reference images, dimensions, material and quantity",
    },
    {
      index: "C",
      label: zh ? "服务内容" : "Services",
      body: zh ? "样品与打样、OEM/ODM 和出口包装" : "Samples, OEM / ODM and export packing",
    },
    {
      index: "D",
      label: zh ? "回复方式" : "Response channels",
      body: zh ? "WhatsApp / 邮箱" : "WhatsApp / email",
    },
  ];
  const serviceTags = [
    zh ? "销售跟进" : "Sales follow-up",
    zh ? "样品与打样" : "Samples & prototyping",
    zh ? "出口包装" : "Export packing",
  ];

  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={t("cta.quote")}
          title={t("contact.title")}
          lede={t("contact.description")}
          meta={[
            `Email · ${contact.email}`,
            `WhatsApp · ${contact.whatsapp}`,
            zh ? "中国广东佛山" : "Foshan, Guangdong, China",
          ]}
        >
          <a href="#quote-form" className="kh-button kh-button-light">
            {zh ? "填写询价表单" : "Start the quote form"}
          </a>
          <a href={emailHref} className="kh-button kh-button-ghost">
            {t("cta.email")}
          </a>
        </PageHero>

        <div className="kh-shell py-[clamp(4rem,7vw,6.5rem)]">
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal>
              <SectionKicker index="02" text={zh ? "联系通道" : "Direct channels"} />
              <h2 className="mt-3 max-w-[20ch] text-3xl font-semibold tracking-tight text-(--kh-ink) sm:text-4xl">
                {zh ? "直接对接销售团队。" : "Talk directly to the sales team."}
              </h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {channels.map((channel) => (
                  <div key={channel.label} className="kh-panel p-4">
                    <p className="kh-mono text-(--kh-brass)">{channel.label}</p>
                    <a href={channel.href} {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-2 block text-sm font-semibold text-(--kh-ink) underline-offset-4 hover:underline">{channel.value}</a>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {checklist.map((item) => (
                  <div key={item.index} className="kh-panel p-4">
                    <p className="kh-mono text-(--kh-brass)">{`${item.index} · ${item.label}`}</p>
                    <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="kh-media-shade premium-depth relative mt-8 h-80 overflow-hidden rounded-lg border border-(--kh-line)">
                <Image
                  src={showcaseImages.webBakeryWindowBox}
                  alt={zh ? "科宏食品纸盒样品" : "Kehong food packaging sample"}
                  fill
                  sizes="(min-width: 1024px) 42vw, 90vw"
                  className="object-cover"
                />
                <span className="kh-fig-caption kh-mono">
                  {zh ? "图01 — 食品纸盒实拍" : "Fig.01 — Food paper box sample"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-(--kh-muted)">
                {zh ? "发送参考图片、尺寸和数量，销售将确认报价所需信息。" : "Send reference images, dimensions, and quantity, and our sales team will confirm the quotation requirements."}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div id="quote-form" className="kh-panel scroll-mt-24 p-5 text-(--kh-ink) sm:p-7">
                <div className="mb-5 flex flex-wrap gap-2">
                  {serviceTags.map((item) => (
                    <span
                      key={item}
                      className="kh-mono rounded-full border border-(--kh-line) bg-(--kh-paper) px-3 py-1.5 text-(--kh-forest)"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <QuickQuoteForm locale={locale} initialProducts={initialProducts} />
                <details className="mt-7 border-t border-(--kh-line) pt-5">
                  <summary className="cursor-pointer text-sm font-bold text-(--kh-forest)">
                    {zh ? "补充技术信息（材质、结构、印刷与交期）" : "Add technical details — material, structure, print and timing"}
                  </summary>
                  <div className="mt-6">
                    <GuidedQuoteForm locale={locale} initialProducts={initialProducts} />
                  </div>
                </details>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
