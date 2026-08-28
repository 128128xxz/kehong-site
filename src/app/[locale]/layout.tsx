import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
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
import {
  getAlternateLanguages,
  getLocaleUrl,
  openGraphLocales,
  siteConfig,
} from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import LocaleDocumentLanguage from "@/components/site/LocaleDocumentLanguage";
import MobileStickyActions from "@/components/site/MobileStickyActions";
import UIMaterialPreview from "@/components/site/UIMaterialPreview";
import AnalyticsConsent from "@/components/site/AnalyticsConsent";
import B2BVisitorTracking from "@/components/site/B2BVisitorTracking";
import "../globals.css";

const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"], weight: ["400", "500"], variable: "--font-noto-sans-thai", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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

  return <html lang={locale} dir="ltr" className={`dark ${notoSansThai.variable}`}>
    <head><meta name="theme-color" content="#171713" /></head>
    <body className="antialiased">
      <UIMaterialPreview />
      <LocaleDocumentLanguage locale={locale} />
      <NextIntlClientProvider messages={messages} timeZone={timeZone} now={now}>
        {children}
        <MobileStickyActions />
        <B2BVisitorTracking enabled={process.env.B2B_VISITOR_INTELLIGENCE_ENABLED === "true"} />
        <AnalyticsConsent enabled={process.env.VERCEL === "1"} />
      </NextIntlClientProvider>
    </body>
  </html>;
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
    icons: {
      icon: [
        { url: "/media/brand/kehong-favicon.ico", type: "image/x-icon", sizes: "any" },
        { url: "/media/brand/kehong-tab-icon-16.png", type: "image/png", sizes: "16x16" },
        { url: "/media/brand/kehong-tab-icon-32.png", type: "image/png", sizes: "32x32" },
        { url: "/media/brand/kehong-tab-icon-48.png", type: "image/png", sizes: "48x48" },
      ],
      shortcut: "/media/brand/kehong-favicon.ico",
      apple: [{ url: "/media/brand/kehong-apple-touch-icon-180.png", type: "image/png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
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
    verification: {
      google: "oGY3RMliU_f7XXUTFQX_T-9UkW6yIzlPy_0WYcGCsd8",
      other: {
        "baidu-site-verification": "codeva-TB3TYTpqex",
        "msvalidate.01": "6A7A8E9BDD4625F87D5C5D9BC1F2B9F2",
        sogou_site_verification: "vM7FyznlRH",
        "shenma-site-verification": "2f2b393302840051e4c514ee040eadda_1786519286",
        "yandex-verification": "8b57a719979b9bf4",
      },
    },
  };
}
