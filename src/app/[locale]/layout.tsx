import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  getMessages,
  getNow,
  getTimeZone,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  getAlternateLanguages,
  getLocaleUrl,
  openGraphLocales,
  siteConfig,
} from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import LocaleDocumentLanguage from "@/components/site/LocaleDocumentLanguage";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const timeZone = await getTimeZone();
  const now = await getNow();

  return <>
    <LocaleDocumentLanguage locale={locale} />
    <NextIntlClientProvider messages={messages} timeZone={timeZone} now={now}>
      {children}
    </NextIntlClientProvider>
    {process.env.VERCEL === "1" ? <><Analytics /><SpeedInsights /></> : null}
  </>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale);
  const languages = await getAlternateLanguages();

  return {
    metadataBase: new URL(siteConfig.url),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.author.name,
    applicationName: brand.name,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
      locale: openGraphLocales[locale] ?? locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    alternates: {
      canonical,
      languages,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
