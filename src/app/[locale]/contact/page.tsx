import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import InquiryForm from "@/components/site/InquiryForm";
import SiteFooter from "@/components/site/SiteFooter";
import { contact } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });
  const title = `${t("contact.title")} | ${siteConfig.name}`;
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
      siteName: siteConfig.name,
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
  searchParams: Promise<{ sku?: string; product?: string; url?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site" });
  const initialProducts =
    query.sku || query.product || query.url
      ? [
          {
            sku: query.sku,
            name: query.product,
            url: query.url,
          },
        ]
      : [];

  return (
    <div className="texture-ink min-h-screen bg-[#171713] text-white">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
            {t("cta.quote")}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#f7f0df]/78">
            {t("contact.description")}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-[#f7f0df]/82 sm:grid-cols-3 lg:grid-cols-1">
            {[
              `${locale === "zh" ? "海外销售 WhatsApp" : "Overseas Sales WhatsApp"}: ${contact.whatsapp}`,
              `Email: ${contact.email}`,
            ].map((item) => (
              <p
                key={item}
                className="rounded-full border border-white/12 bg-white/8 px-4 py-2 font-semibold shadow-lg shadow-black/10 backdrop-blur-xl"
              >
                {item}
              </p>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              locale === "zh" ? "报价所需资料：图片 / 尺寸 / 材质 / 数量" : "Quote details: photo / size / material / quantity",
              locale === "zh" ? "可沟通：目录、规格与项目所需文件" : "Catalog, specifications and project documents can be reviewed per request",
              locale === "zh" ? "支持：样品确认、OEM/ODM、出口包装" : "Support: sample approval, OEM/ODM and export packing",
              locale === "zh" ? "回复路径：WhatsApp / Email / 电话" : "Response channels: WhatsApp / email / phone",
            ].map((item) => (
              <p
                key={item}
                className="rounded-md border border-white/12 bg-white/8 px-4 py-3 text-sm font-bold leading-6 text-[#f7f0df]/82"
              >
                {item}
              </p>
            ))}
          </div>
          <div className="premium-depth relative mt-10 h-80 overflow-hidden rounded-lg border border-white/12 shadow-2xl shadow-black/20">
            <Image
              src={showcaseImages.webBakeryWindowBox}
              alt="Kehong food packaging sample"
              fill
              sizes="(min-width: 1024px) 42vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(23,23,19,.62))]" />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/16 bg-[#171713]/62 p-3 text-sm font-black text-white shadow-xl shadow-black/18 backdrop-blur-xl">
              {locale === "zh" ? "发送样品图、尺寸和数量，销售按配置报价。" : "Send sample photos, size and quantity for a tailored quotation."}
            </div>
          </div>
        </div>

        <div className="kh-panel rounded-lg border border-white/12 bg-white/92 p-5 text-[#171713] shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7">
          <div className="mb-5 flex flex-wrap gap-2">
            {[locale === "zh" ? "销售跟进" : "Sales follow-up", locale === "zh" ? "样品/打样" : "Sample support", locale === "zh" ? "出口服务" : "Export service"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#f1e7cf] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#9a6b1f]"
              >
                {item}
              </span>
            ))}
          </div>
          <InquiryForm
            locale={locale}
            initialProducts={initialProducts}
            title={locale === "zh" ? "快速报价表单" : "Quick quote form"}
            description={
              locale === "zh"
                ? "填写产品、数量、尺寸和目标市场，科宏团队会按项目配置回复报价。"
                : "Add product, quantity, size and destination market so Kehong can reply with a tailored quotation."
            }
            compact
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
