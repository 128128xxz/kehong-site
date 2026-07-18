import { ArrowRight, ClipboardCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { homeEnglish } from "@/content/en/home";

export default async function InquiryBand() {
  const t = await getTranslations("Site");
  const locale = await getLocale();

  return (
    <section id="inquiry" data-final-quote="true" className="bg-[#f3f0e8] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="premium-depth kh-micro-grid mx-auto grid max-w-7xl overflow-hidden rounded-[.5rem] border border-[#d9d2be] bg-[#171713] text-white shadow-[0_18px_48px_rgba(23,23,19,.13)] lg:grid-cols-[1.08fr_.92fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
            {t("cta.quote")}
          </p>
          <h2 className="kh-editorial-heading mt-4 text-3xl leading-tight tracking-[-.03em] sm:text-5xl">
            {locale === "zh" ? t("inquiry.title") : homeEnglish.inquiry.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#f7f0df]/76">
            {locale === "zh" ? t("inquiry.description") : homeEnglish.inquiry.body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-[.4rem] bg-[#e8c06c] text-[#171713] hover:bg-[#f3d182]"
            >
              <Link href="/contact">
                {t("cta.quote")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-[.4rem] border-white/24 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/procurement">
                <ClipboardCheck className="size-4" />
                {locale === "zh" ? "买家支持" : "Buyer support"}
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/14 pt-4 text-xs font-semibold text-[#f7f0df]/68">
            <span>Product photo or drawing</span><span>Size / GSM</span><span>Quantity</span><span>Destination market</span>
          </div>
        </div>
        <div className="kh-quote-drawing relative hidden min-h-[360px] overflow-hidden border-l border-white/10 lg:block" aria-hidden="true">
          <div className="kh-quote-drawing__sheet absolute inset-8">
            <div className="kh-quote-drawing__dieline">
              <span className="kh-quote-drawing__panel kh-quote-drawing__panel--one" />
              <span className="kh-quote-drawing__panel kh-quote-drawing__panel--two" />
              <span className="kh-quote-drawing__panel kh-quote-drawing__panel--three" />
              <span className="kh-quote-drawing__flap kh-quote-drawing__flap--top" />
              <span className="kh-quote-drawing__flap kh-quote-drawing__flap--bottom" />
              <span className="kh-quote-drawing__measure kh-quote-drawing__measure--width">Width</span>
              <span className="kh-quote-drawing__measure kh-quote-drawing__measure--depth">Depth</span>
            </div>
            <div className="kh-quote-drawing__fields">
              {(locale === "zh" ? ["需求简报", "材料", "尺寸", "数量"] : ["Brief", "Material", "Size", "Quantity"]).map((field, index) => (
                <span key={field}><b>0{index + 1}</b>{field}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
