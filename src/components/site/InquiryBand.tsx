import Image from "next/image";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";

export default async function InquiryBand() {
  const t = await getTranslations("Site");

  return (
    <section id="inquiry" className="surface-paper bg-[#f1f0ea] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="premium-depth kh-micro-grid mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-[#d9d2be] bg-[#171713] text-white shadow-2xl shadow-[#171713]/18 lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-6 sm:p-8 lg:p-12">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
            {t("cta.quote")}
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            {t("inquiry.title")}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#f7f0df]/76">
            {t("inquiry.description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#e8c06c] text-[#171713] hover:bg-[#f3d182]"
            >
              <Link href="/contact">
                <Mail className="size-4" />
                {t("cta.quote")}
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[360px]">
          <Image
            src={showcaseImages.pinkBox}
            alt="Custom paper packaging sample"
            fill
            sizes="(min-width: 1024px) 44vw, 95vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,19,.52),rgba(23,23,19,.08))]" />
        </div>
      </div>
    </section>
  );
}
