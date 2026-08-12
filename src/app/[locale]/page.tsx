import { setRequestLocale, getTranslations } from "next-intl/server";
import HomeIndex from "@/components/pages/HomeIndex";
import { getLocaleUrl } from "@/lib/site";
import { getBrandConfig } from "@/lib/site-config";
import { buildLocalBusinessJsonLd, buildOrganizationJsonLd, buildWebPageJsonLd, buildWebsiteJsonLd } from "@/lib/aiEntities";

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
  const brand = getBrandConfig(locale);
  const canonical = await getLocaleUrl(locale);

  const organizationJsonLd = buildOrganizationJsonLd(locale, t("description"));
  const localBusinessJsonLd = buildLocalBusinessJsonLd(locale);
  const websiteJsonLd = buildWebsiteJsonLd(locale, canonical, t("description"));
  const webPageJsonLd = buildWebPageJsonLd(locale, canonical, brand.name, t("description"));

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }}
      />
      <HomeIndex />
    </>
  );
}
