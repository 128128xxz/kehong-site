import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/components/site/Header";
import QuickQuoteForm from "@/components/site/QuickQuoteForm";
import GuidedQuoteForm from "@/components/site/GuidedQuoteForm";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { companyDisplayName } from "@/data/company";
import { FACTORY_ADDRESS, FACTORY_MAP_LABEL, getFactoryLocationUrl } from "@/data/companyLocation";
import FactoryLocationCard from "@/components/site/FactoryLocationCard";
import WeChatContactButton from "@/components/site/WeChatContactButton";
import { showcaseImages } from "@/data/visuals";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { getInterest, getInterestLabel } from "@/data/interests";
import { buildProductGroupSummary, getLocalizedProductTitle, getProductGroupId, getSkuBySlug, getSkusByGroupId } from "@/lib/catalog";
import { mailtoHref, publicContact, telHref, whatsappHref } from "@/config/company-public";

const contactPrivacyNotice = {
  en: "By submitting this form, you provide the information needed to process and reply to this inquiry. See the Privacy Policy for details.",
  zh: "提交此表单即表示你提供的信息将用于处理和回复本次询盘。详情请见隐私政策。",
  id: "Dengan mengirim formulir ini, Anda memberikan informasi untuk memproses dan menjawab pertanyaan ini. Lihat Kebijakan Privasi untuk detailnya.",
  vi: "Khi gửi biểu mẫu, bạn cung cấp thông tin cần thiết để xử lý và trả lời yêu cầu này. Xem Chính sách quyền riêng tư để biết thêm.",
  th: "การส่งแบบฟอร์มนี้เป็นการให้ข้อมูลเพื่อดำเนินการและตอบคำถามนี้ ดูรายละเอียดได้ที่นโยบายความเป็นส่วนตัว",
  ms: "Dengan menghantar borang ini, anda memberikan maklumat untuk memproses dan menjawab pertanyaan ini. Lihat Dasar Privasi untuk butiran.",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });
  const zh = locale === "zh";
  const brand = getBrandConfig(locale);
  const title = zh ? `联系${companyDisplayName.zh} | 获取纸材与定制包装报价` : `${t("contact.title")} | ${brand.name}`;
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
            interestLabel: interest ? getInterestLabel(interest.id, locale) : undefined,
            interestProductType: interest?.formProductType,
          },
        ]
      : [];

  const emailHref = mailtoHref(publicContact.email, zh ? `${companyDisplayName.zh}询盘` : `${companyDisplayName.en} packaging inquiry`);
  const whatsappLink = whatsappHref(publicContact.whatsapp);
  const channels = zh
    ? [
        { label: `${t("contact.factory")} · 电话`, value: publicContact.factoryPhone, href: telHref(publicContact.factoryPhone), external: false },
        { label: `${t("contact.generalInquiry")} · Email`, value: publicContact.email, href: emailHref, external: false },
      ]
    : [
        { label: `${t("contact.internationalSales")} · WhatsApp`, value: publicContact.whatsapp, href: whatsappLink, external: true },
        { label: `${t("contact.internationalSales")} · Call`, value: publicContact.internationalPhone, href: telHref(publicContact.internationalPhone), external: false },
        { label: `${t("contact.generalInquiry")} · Email`, value: publicContact.email, href: emailHref, external: false },
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
      body: zh ? "微信 / 电话 / Email" : "WhatsApp / phone / email",
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
            `Email · ${publicContact.email}`,
            zh ? `电话 · ${publicContact.factoryPhone}` : `WhatsApp · ${publicContact.whatsapp}`,
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
                {zh ? "直接对接销售团队" : "Talk directly to the sales team"}
              </h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {zh ? <div className="kh-panel p-4"><p className="kh-mono text-(--kh-brass)">微信咨询</p><WeChatContactButton phone={publicContact.factoryPhone} label="打开微信二维码" copiedLabel="手机号已复制" className="kh-button kh-button-secondary mt-2 min-h-11" /></div> : null}
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
              <FactoryLocationCard
                className="mt-3"
                locale={locale}
                sourceBlock="contact"
                mapProvider={zh ? "baidu_directions" : "google_directions"}
                href={getFactoryLocationUrl(locale)}
                title={zh ? "工厂位置" : "Factory location"}
                mapLabel={zh ? FACTORY_MAP_LABEL.zh : FACTORY_MAP_LABEL.en}
                address={zh ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}
                viewLabel={zh ? "查看位置" : "View location"}
                copyLabel={zh ? "复制地址" : "Copy address"}
                copiedLabel={zh ? "地址已复制" : "Copied"}
              />
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
                {zh ? "发送参考图片、尺寸和数量，销售确认报价需要哪些信息。" : "Send reference images, dimensions, and quantity, and our sales team will confirm the quotation requirements."}
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
                <p className="mt-4 text-xs leading-5 text-(--kh-muted)" data-testid="contact-privacy-notice">
                  {(contactPrivacyNotice[locale as keyof typeof contactPrivacyNotice] ?? contactPrivacyNotice.en)} {" "}
                  <Link href="/privacy" className="kh-inline-link">{zh ? "隐私政策" : "Privacy Policy"}</Link>
                </p>
                <details className="mt-7 border-t border-(--kh-line) pt-5">
                  <summary className="cursor-pointer text-sm font-semibold text-(--kh-forest)">
                    {zh ? "补充技术信息（材质、结构、印刷与交期）" : "Add technical details — material, structure, print and timing"}
                  </summary>
                  <div className="mt-4">
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
