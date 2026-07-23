import Header from "@/components/site/Header";
import ProductionPortalHome from "@/components/site/ProductionPortalHome";
import HomeBusinessSections from "@/components/pages/HomeBusinessSections";
import SiteFooter from "@/components/site/SiteFooter";
import { getLocale } from "next-intl/server";

export default async function HomeIndex() {
  const locale = await getLocale();

  return (
    <div className="kh-premium-site production-portal-page min-h-screen bg-[#f6f4ec] text-[#171713]">
      <Header />
      <main className="production-portal-main">
        <ProductionPortalHome locale={locale} />
        <HomeBusinessSections locale={locale} />
      </main>
      <SiteFooter />
    </div>
  );
}
