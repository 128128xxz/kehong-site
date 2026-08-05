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
    : query.product || (interest ? (zh ? interest.label.zh : interest.label.en) : undefined);
  const initialProducts =
    query.sku || query.product || query.url || interest
      ? [
          {
            productGroupId: selectedGroup?.id,
            productGroupTitle: selectedGroup?.title,
            sku: query.sku || selectedSku?.sku,
            skuTitle: selectedSku ? getLocalizedProductTitle(selectedSku, locale) : undefined,
            name: selectedName,
            url: query.url,
            interestId: interest?.id,
            interestLabel: interest ? (zh ? interest.label.zh : interest.label.en) : undefined,
            interestProductType: interest?.formProductType,
          },
        ]
      : [];

  const channels = [
    { label: zh ? "海外销售 WhatsApp" : "Overseas Sales WhatsApp", value: contact.whatsapp },
    { label: "Email", value: contact.email },
  ];
  const checklist = [
    {
      index: "A",
      label: zh ? "报价资料" : "Quote details",
      body: zh ? "图片 / 尺寸 / 材质 / 数量" : "Photo / size / material / quantity",
    },
    {
      index: "B",
      label: zh ? "可沟通" : "On request",
      body: zh ? "目录、规格与项目所需文件" : "Catalog, specifications and project documents",
    },
    {
      index: "C",
      label: zh ? "支持" : "Support",
      body: zh ? "样品确认、OEM/ODM、出口包装" : "Sample approval, OEM/ODM and export packing",
    },
    {
      index: "D",
      label: zh ? "回复路径" : "Response channels",
      body: zh ? "WhatsApp / Email / 电话" : "WhatsApp / email / phone",
    },
  ];
  const serviceTags = [
    zh ? "销售跟进" : "Sales follow-up",
    zh ? "样品/打样" : "Sample support",
    zh ? "出口服务" : "Export service",
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
          <a href={`mailto:${contact.email}`} className="kh-button kh-button-ghost">
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
                    <p className="mt-2 text-sm font-semibold text-(--kh-ink)">{channel.value}</p>
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
                {zh ? "发送样品图、尺寸和数量，销售按配置报价。" : "Send sample photos, size and quantity for a tailored quotation."}
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
