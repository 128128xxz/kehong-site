import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/site/Header";
import GuidedQuoteForm from "@/components/site/GuidedQuoteForm";
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
    <div className="texture-ink min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div>
          <p className="kh-eyebrow kh-eyebrow-light">
            {t("cta.quote")}
          </p>
          <h1 className="kh-editorial-heading mt-4 text-4xl sm:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-(--kh-paper-deep)">
            {t("contact.description")}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-(--kh-paper-deep) sm:grid-cols-3 lg:grid-cols-1">
            {[
              `${locale === "zh" ? "海外销售 WhatsApp" : "Overseas Sales WhatsApp"}: ${contact.whatsapp}`,
              `Email: ${contact.email}`,
            ].map((item) => (
              <p
                key={item}
                className="rounded-md border border-white/15 bg-white/8 px-4 py-2 font-semibold"
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
                className="rounded-md border border-white/15 bg-white/8 px-4 py-3 text-sm font-medium leading-6 text-(--kh-paper-deep)"
              >
                {item}
              </p>
            ))}
          </div>
          <div className="premium-depth relative mt-10 h-80 overflow-hidden rounded-lg border border-white/15">
            <Image
              src={showcaseImages.webBakeryWindowBox}
              alt="Kehong food packaging sample"
              fill
              sizes="(min-width: 1024px) 42vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,33,29,0),rgba(29,33,29,.62))]" />
            <div className="absolute bottom-4 left-4 right-4 rounded-md border border-white/15 bg-[rgba(29,33,29,.72)] p-3 text-sm font-semibold text-(--kh-surface)">
              {locale === "zh" ? "发送样品图、尺寸和数量，销售按配置报价。" : "Send sample photos, size and quantity for a tailored quotation."}
            </div>
          </div>
        </div>

        <div className="kh-panel p-5 text-(--kh-ink) sm:p-7">
          <div className="mb-5 flex flex-wrap gap-2">
            {[locale === "zh" ? "销售跟进" : "Sales follow-up", locale === "zh" ? "样品/打样" : "Sample support", locale === "zh" ? "出口服务" : "Export service"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-(--kh-paper-deep) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-(--kh-brass)"
              >
                {item}
              </span>
            ))}
          </div>
          <GuidedQuoteForm locale={locale} initialProducts={initialProducts} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
