import { ArrowRight, Check, Factory } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Button } from "@/components/ui/button";
import ResilientImage from "@/components/ui/ResilientImage";

export default async function CinematicHero() {
  const locale = await getLocale();
  const isZh = locale === "zh";
  const capabilities = isZh
    ? ["材料供应", "结构打样", "纸材加工与后工艺", "出口包装"]
    : ["Material supply", "Structural sampling", "Converting & finishing", "Export-ready packing"];

  return (
    <section id="home" className="kh-hero relative isolate overflow-hidden bg-[#f3f0e7] text-[#171713]">

      <div className="kh-hero__inner mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-12">
        <div className="kh-hero__copy relative z-10 flex max-w-2xl flex-col justify-center">
          <p className="kh-hero__eyebrow mb-5 inline-flex w-fit items-center gap-2 text-[11px] font-black uppercase tracking-[.2em] text-[#9a6b1f]">
            <Factory className="size-4" aria-hidden="true" />
            {isZh ? "佛山 · 纸材与包装制造商 · 始于 2001" : "Foshan · Paper material & packaging manufacturer · Since 2001"}
          </p>
          <h1 className="kh-editorial-heading max-w-[11ch] text-[clamp(3.7rem,6vw,7rem)] leading-[.88] tracking-[-.065em] text-[#171713] animate-hero-rise">
            {isZh ? "从纸材开始，做好包装。" : "Paper packaging, built from the material up."}
          </h1>
          <p className="kh-hero__supporting mt-6 max-w-[57ch] text-base leading-7 text-[#31322b]/78 animate-hero-rise sm:text-lg sm:leading-8" style={{ animationDelay: "120ms" }}>
            {isZh
              ? "从杯纸、瓦楞纸到定制纸盒与内托，科宏将材料供应、结构打样、纸材加工和生产支持整合到一个清晰的项目流程中。"
              : "From cupstock and corrugated board to custom boxes and inserts, Kehong combines material supply, structural sampling, paper converting and production support in one practical workflow."}
          </p>

          <div className="kh-hero__actions mt-7 flex flex-col gap-3 animate-hero-rise sm:flex-row" style={{ animationDelay: "220ms" }}>
            <Button asChild size="lg" className="min-h-11 rounded-[.45rem] bg-[#18372e] px-7 text-white hover:bg-[#102820]">
              <Link href="/products">
                {isZh ? "探索产品" : "Explore products"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-11 rounded-[.45rem] border-[#18372e]/24 bg-white/42 px-7 text-[#18372e] hover:bg-white/70 hover:text-[#18372e]">
              <Link href="/contact">{isZh ? "启动包装项目" : "Start a packaging project"}</Link>
            </Button>
          </div>

          <div className="kh-hero__capabilities mt-8 grid max-w-xl grid-cols-2 gap-x-5 gap-y-2 border-t border-[#171713]/14 pt-4 sm:grid-cols-4 animate-hero-rise" style={{ animationDelay: "320ms" }}>
            {capabilities.map((item) => (
              <span key={item} className="flex items-start gap-2 text-xs font-bold leading-5 text-[#4b4537]">
                <Check className="mt-0.5 size-3.5 shrink-0 text-[#b66d47]" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="kh-hero__visual hero-visual-depth relative block animate-hero-rise" style={{ animationDelay: "160ms" }}>
          <div className="kh-hero__frame premium-depth relative overflow-hidden border-[3px] border-[#f5efe2] bg-[#e6dccb] p-[3px]">
            <div className="relative h-full overflow-hidden rounded-[.3rem] bg-[#171713]">
              <ResilientImage
                src={showcaseImages.machine}
                fallbackSrc={showcaseImages.machineClose}
                alt={isZh ? "科宏自动送料生产设备" : "Kehong automatic feeding equipment"}
                fill
                priority
                sizes="(min-width: 1100px) 54vw, 94vw"
                className="object-cover animate-kenburns-subtle"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72)),linear-gradient(90deg,rgba(0,0,0,.42),transparent_58%)]" />
              <div className="absolute left-5 top-5 border border-white/24 bg-[#102820]/84 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white">
                {isZh ? "真实设备" : "Real equipment"}
              </div>
              <div className="kh-hero__caption absolute bottom-5 left-5 right-5 max-w-xl text-white sm:bottom-7 sm:left-7 sm:right-auto">
                <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#e8c06c]">Foshan Kehong</p>
                <p className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                  {isZh ? "纸板加工与稳定交付能力" : "Converting capacity built for dependable delivery."}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/72 sm:text-sm">
                  {isZh ? "自动送料 · 纸板加工 · 过程控制" : "Automatic feeding · board converting · process control"}
                </p>
                <Link href="/factory" className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-[#e8c06c] pb-1.5 text-sm font-black text-[#e8c06c] transition hover:text-white">
                  {isZh ? "探索工厂" : "Explore our factory"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
