import { setRequestLocale, getTranslations } from "next-intl/server";
import HomeIndex from "@/components/pages/HomeIndex";
import { getLocaleUrl, siteConfig } from "@/lib/site";

function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const canonical = await getLocaleUrl(locale);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: t("description"),
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/kehong/factory.webp`,
    inLanguage: locale,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+447599669700",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: t("description"),
    url: canonical,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <HomeIndex />
    </>
  );
}
