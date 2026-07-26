import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import HomeHero from "@/components/home/HomeHero";
import HomeProductSystems from "@/components/home/HomeProductSystems";
import HomeCapabilities from "@/components/home/HomeCapabilities";
import HomeFactoryProof from "@/components/home/HomeFactoryProof";
import HomeIndustries from "@/components/home/HomeIndustries";
import HomeCta from "@/components/home/HomeCta";
import { getLocale } from "next-intl/server";

export default async function HomeIndex() {
  const locale = await getLocale();

  return (
    <div className="kh-premium-site min-h-screen">
      <Header />
      <main>
        <HomeHero locale={locale} />
        <HomeProductSystems locale={locale} />
        <HomeCapabilities locale={locale} />
        <HomeFactoryProof locale={locale} />
        <HomeIndustries locale={locale} />
        <HomeCta locale={locale} />
      </main>
      <SiteFooter />
    </div>
  );
}
