import CinematicHero from "@/components/site/CinematicHero";
import Header from "@/components/site/Header";
import InquiryBand from "@/components/site/InquiryBand";
import ManufacturingProof from "@/components/site/ManufacturingProof";
import ProductShowcase from "@/components/site/ProductShowcase";
import Product3DStudio from "@/components/site/Product3DStudio";
import SelectedSolutions from "@/components/site/SelectedSolutions";
import SiteMotion from "@/components/site/SiteMotion";
import SiteFooter from "@/components/site/SiteFooter";

export default async function HomeIndex() {
  return (
    <div className="kh-premium-site texture-paper min-h-screen bg-[#f6f4ec] text-[#171713]">
      <SiteMotion />
      <Header />
      <main>
        <CinematicHero />
        <ProductShowcase />
        <SelectedSolutions />
        <ManufacturingProof />
        <Product3DStudio />
        <InquiryBand />
      </main>
      <SiteFooter />
    </div>
  );
}
