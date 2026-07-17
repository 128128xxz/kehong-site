import { Factory, Gauge, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { processSteps } from "@/data/company";
import { showcaseImages } from "@/data/visuals";

export default async function ProcessPreview() {
  const t = await getTranslations("Site");
  const locale = await getLocale();
  const isZh = locale === "zh";
  const proofBadges = [
    { icon: Factory, label: isZh ? "工厂实景" : "Factory views" },
    { icon: Gauge, label: isZh ? "流程可追踪" : "Production traceability" },
    { icon: ShieldCheck, label: isZh ? "质量确认" : "Quality assurance" },
  ] as const;
  const proofImages = [
    { src: showcaseImages.factoryPoster, alt: isZh ? "科宏厂区实拍" : "Kehong factory exterior" },
    { src: showcaseImages.machine, alt: isZh ? "自动上料设备实拍" : "Automatic feeding equipment" },
    { src: showcaseImages.machineClose, alt: isZh ? "设备加工细节实拍" : "Machine process detail" },
    { src: showcaseImages.sampleRoom, alt: isZh ? "样品与包装展示实拍" : "Sample and packaging display" },
  ] as const;

  return (
    <section id="process" className="texture-ink bg-[#171713] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-18">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.95fr_1.05fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8c06c]">
            {t("process.eyebrow")}
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            {t("process.title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#f7f0df]/76">
            {t("process.description")}
          </p>
          <div className="premium-depth relative mt-8 h-[320px] overflow-hidden rounded-lg border border-white/12 bg-[#24231d] shadow-2xl shadow-black/30 sm:h-[420px]">
            <div className="grid h-full grid-cols-2 gap-1.5 p-1.5">
              {proofImages.map((item, index) => (
                <div key={item.src} className="relative overflow-hidden rounded-md bg-white/8">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 320px, 45vw"
                    className={`object-cover ${index === 0 ? "object-[50%_20%]" : ""}`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,23,19,.04),rgba(23,23,19,.42))]" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 grid gap-2 sm:grid-cols-3">
              {proofBadges.map((item) => {
                const Icon = item.icon;

                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/14 px-3 py-2 text-xs font-black text-white shadow-xl shadow-black/20 backdrop-blur-xl"
                  >
                    <Icon className="size-4 text-[#e8c06c]" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative grid content-center gap-4">
          <div className="absolute left-[27px] top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[#e8c06c]/45 to-transparent sm:block" />
          {processSteps.map((step, index) => (
            <article
              key={step.id}
              className="kh-panel grid grid-cols-[52px_1fr] gap-4 rounded-lg border border-white/12 bg-white/7 p-5 backdrop-blur-xl transition hover:border-[#e8c06c]/48 hover:bg-white/10"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-[#e8c06c] text-sm font-black text-[#171713]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#f7f0df]/72">
                  {t(step.textKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
