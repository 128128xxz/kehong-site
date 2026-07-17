import CaseGallery from "@/components/site/CaseGallery";
import BakeryPackagingFocus from "@/components/site/BakeryPackagingFocus";
import B2BProcurementSections from "@/components/site/B2BProcurementSections";
import BuyerDecisionBrief from "@/components/site/BuyerDecisionBrief";
import CinematicHero from "@/components/site/CinematicHero";
import Header from "@/components/site/Header";
import InquiryBand from "@/components/site/InquiryBand";
import ProcurementAssurance from "@/components/site/ProcurementAssurance";
import ProcessPreview from "@/components/site/ProcessPreview";
import ProductShowcase from "@/components/site/ProductShowcase";
import Product3DStudio from "@/components/site/Product3DStudio";
import SiteMotion from "@/components/site/SiteMotion";
import SiteFooter from "@/components/site/SiteFooter";
import SolutionExplorer from "@/components/site/SolutionExplorer";

export default async function HomeIndex() {
  return (
    <div className="texture-paper min-h-screen bg-[#f6f4ec] text-[#171713]">
      <SiteMotion />
      <Header />
      <main>
        <CinematicHero />
        <ProductShowcase />
        <Product3DStudio />
        <BuyerDecisionBrief />
        <B2BProcurementSections />
        <BakeryPackagingFocus />
        <SolutionExplorer />
        <ProcessPreview />
        <CaseGallery />
        <ProcurementAssurance />
        <InquiryBand />
      </main>
      <SiteFooter />
    </div>
  );
}
