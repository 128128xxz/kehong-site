import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import IndustrySeoPage from "@/components/pages/IndustrySeoPage";
import { industrySeoPages } from "@/data/industrySeoPages";
import { getAlternateLanguages, getLocaleUrl, openGraphLocales, siteConfig } from "@/lib/site";

const page = industrySeoPages.paperCupFanManufacturer;

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  const title = isZh ? page.zhTitle : page.title;
  const description = isZh ? page.zhDescription : page.description;
  const canonical = await getLocaleUrl(locale, page.href);

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical,
      languages: await getAlternateLanguages(page.href),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: ["/og-image.png"],
      locale: openGraphLocales[locale] ?? locale,
      type: "website",
    },
  };
}

export default async function PaperCupFanManufacturerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <IndustrySeoPage locale={locale} page={page} />
    </>
  );
}
