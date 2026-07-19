import type { Metadata } from "next";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import InteractivePortalLab from "@/components/lab/InteractivePortalLab";

export const metadata: Metadata = {
  title: "Interactive Portal Lab | Kehong Paper",
  description: "A private interaction study for the Kehong Paper route-led portal.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.kehong.tech/en/lab/interactive-portal" },
};

export default function InteractivePortalPage() {
  return (
    <div className="kh-premium-site texture-paper min-h-screen bg-[#f6f4ec] text-[#171713]">
      <Header />
      <main>
        <InteractivePortalLab />
      </main>
      <SiteFooter />
    </div>
  );
}
