import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import HomeHero from "@/components/home/HomeHero";
import HomeProcess from "@/components/home/HomeProcess";
import HomeFactoryProof from "@/components/home/HomeFactoryProof";
import HomeIndustries from "@/components/home/HomeIndustries";
import HomeCta from "@/components/home/HomeCta";
import HomeResources from "@/components/home/HomeResources";
import { getLocale } from "next-intl/server";

export default async function HomeIndex() {
  const locale = await getLocale();

  return (
    <div className="kh-premium-site min-h-screen">
      <Header variant="cinema" />
      <main>
        <HomeHero locale={locale} />
        {/* 页头透明态哨兵:滚过 Hero 后 Header 切换为实底 */}
        <div data-kh-hero-sentinel aria-hidden="true" style={{ height: 1 }} />
        <HomeProcess locale={locale} />
        <HomeFactoryProof locale={locale} />
        <HomeIndustries locale={locale} />
        <HomeResources locale={locale} />
        <HomeCta locale={locale} />
      </main>
      <SiteFooter />
    </div>
  );
}
