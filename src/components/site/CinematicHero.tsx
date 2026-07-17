import { ArrowRight, Building2, ChevronDown, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Button } from "@/components/ui/button";

export default async function CinematicHero() {
  const t = await getTranslations("Site");
  const locale = await getLocale();
  const isZh = locale === "zh";
  const productChips = isZh
    ? [
        { label: "纸盒 / 纸托", href: "/products/paper-boxes" },
        { label: "烘焙包装", href: "/products/food-packaging-boxes" },
        { label: "纸杯扇形片", href: "/products/food-grade-paper" },
        { label: "瓦楞 / 特种纸", href: "/products/corrugated-paper" },
      ]
    : [
        { label: "Paper boxes / trays", href: "/products/paper-boxes" },
        { label: "Bakery packaging", href: "/products/food-packaging-boxes" },
        { label: "Paper cup fan blanks", href: "/products/food-grade-paper" },
        { label: "Corrugated / specialty paper", href: "/products/corrugated-paper" },
      ];

  return (
    <section
      id="home"
      className="texture-paper relative isolate overflow-hidden bg-[#ece9df] text-[#171713] lg:h-[calc(100svh-4.5rem)] lg:min-h-[640px]"
    >
      <div
        className="hero-parallax-bg absolute inset-0 -z-30 hidden bg-cover bg-center opacity-28 animate-hero-fade md:block"
        style={{ backgroundImage: `url(${showcaseImages.machineClose})` }}
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(248,247,241,.92),rgba(245,241,226,.64)_45%,rgba(95,65,38,.2)),linear-gradient(180deg,rgba(255,255,255,.12),rgba(166,108,48,.14))]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-32 bg-gradient-to-t from-[#9f6a35]/18 via-[#ece1c6]/20 to-transparent lg:block" />
      <div className="pointer-events-none absolute -left-24 top-20 hidden h-64 w-64 rounded-full border border-[#c69a48]/25 lg:block" />
      <div className="pointer-events-none absolute right-[7%] top-[18%] hidden h-28 w-28 rounded-full border border-white/50 lg:block" />

      <div className="mx-auto grid max-w-[90rem] gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:h-full lg:grid-cols-[.98fr_1.02fr] lg:gap-16 lg:px-12 lg:py-10">
        <div className="relative z-10 flex max-w-2xl flex-col justify-center">
          <p className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/52 px-3.5 py-2.5 text-xs font-black uppercase tracking-[0.22em] text-[#9a6b1f] shadow-xl shadow-black/8 backdrop-blur-xl sm:mb-9">
            <Building2 className="size-3.5" />
            {isZh ? "佛山纸品包装工厂" : "Paper packaging manufacturer in Foshan"}
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.045em] text-[#171713] animate-hero-rise sm:text-7xl lg:text-[clamp(4.5rem,6.2vw,7.4rem)]">
            {isZh ? "先看工厂，再谈包装方案。" : "Factory first. Packaging solutions next."}
          </h1>
          <p
            className="mt-8 max-w-lg text-base leading-8 text-[#31322b]/78 animate-hero-rise sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {isZh
              ? "科宏始于 2001 年，生产瓦楞纸、特种纸、纸盒、内托、纸杯扇形片及定制包装结构。通过厂区、设备、材料和打样能力，帮助海外客户快速了解我们的交付实力。"
              : "Kehong has manufactured corrugated paper, specialty paper, boxes, inserts, cup fan blanks and custom paper structures since 2001. Factory capability, materials and sampling experience are presented clearly so buyers can assess our delivery strength before requesting a quote."}
          </p>
          <p
            className="mt-7 hidden max-w-lg items-start gap-3 text-sm font-semibold leading-6 text-[#796024] animate-hero-rise sm:flex"
            style={{ animationDelay: "210ms" }}
          >
            <ShieldCheck className="mt-1 size-5 shrink-0 text-[#b98628]" />
            {isZh
              ? "稳定供料、快速打样、严格品控、灵活订单，面向品牌方、加工厂、贸易商和东南亚客户。"
              : "Reliable material supply, responsive sampling, consistent quality and flexible quantities for brands, converters, distributors and buyers across Southeast Asia."}
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5 animate-hero-rise" style={{ animationDelay: "250ms" }}>
            {productChips.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-black/10 bg-white/68 px-4 py-2.5 text-xs font-black text-[#31322b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#171713]/30 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div
            className="mt-9 flex flex-col gap-3 animate-hero-rise sm:mt-11 sm:flex-row"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#171713] px-7 text-white hover:bg-[#2a2a23]"
            >
              <Link href="/contact">
                {t("cta.quote")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-black/15 bg-white/40 px-7 text-[#171713] backdrop-blur-xl hover:bg-white/65 hover:text-[#171713]"
            >
              <Link href="/products">{isZh ? "查看产品规格" : "View product specifications"}</Link>
            </Button>
          </div>

          <div
            className="mt-8 animate-hero-rise lg:mt-11"
            style={{ animationDelay: "390ms" }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/52 px-4 py-2 text-sm font-bold text-[#4b4537] shadow-sm backdrop-blur-xl">
              <ShieldCheck className="size-4 text-[#b98628]" />
              {isZh ? "工厂实景 · 快速打样 · 出口服务" : "Factory views · Fast sampling · Export service"}
            </div>
          </div>
        </div>

        <div className="hero-visual-depth relative mt-8 block min-h-[22rem] self-center animate-hero-rise lg:mt-0 lg:min-h-0 lg:block" style={{ animationDelay: "180ms" }}>
          <div className="premium-depth relative h-[min(72vh,680px)] overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/35 p-3 shadow-2xl shadow-black/16 backdrop-blur-2xl">
            <div className="relative h-full overflow-hidden rounded-[1.25rem] bg-[#171713]">
              <Image
                src={showcaseImages.machine}
                alt={isZh ? "科宏自动上料生产线实拍" : "Kehong automatic feeding line"}
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 90vw"
                className="object-cover animate-kenburns-subtle"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.58)),linear-gradient(90deg,rgba(0,0,0,.5),transparent_45%)]" />
              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/18 px-3.5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-black/15 backdrop-blur-xl">
                {isZh ? "工厂实景" : "Factory view"}
              </div>
              <div className="absolute bottom-7 left-7 max-w-xl text-white">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#e8c06c]">Foshan Kehong</p>
                <p className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  {isZh ? "自动化纸品加工与稳定交付能力" : "Automated converting and stable delivery capacity"}
                </p>
              </div>
            </div>
          </div>

          <div className="premium-depth absolute bottom-8 left-8 flex w-56 items-center justify-between rounded-2xl border border-black/10 bg-white/78 px-4 py-3.5 shadow-2xl shadow-black/16 backdrop-blur-2xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a6b1f]">
                {isZh ? "生产场地" : "Production site"}
              </p>
              <p className="mt-1 text-xl font-black tracking-[-0.03em] text-[#171713]">
                {isZh ? "纸品包装" : "Paper packaging"}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-[#171713] text-xs font-black text-[#e8c06c]">01</span>
          </div>

        </div>
      </div>

      <Link
        href="/#studio"
        className="absolute bottom-6 right-8 z-20 hidden flex-col items-center gap-2 rounded-full border border-black/10 bg-white/50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#31322b]/78 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:bg-white/80 hover:text-[#171713] lg:flex"
      >
        {isZh ? "查看 3D 产品" : "Explore 3D products"}
        <ChevronDown className="size-4 animate-bounce" />
      </Link>
    </section>
  );
}
