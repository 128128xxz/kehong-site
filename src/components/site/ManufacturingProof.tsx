import { ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import ResilientImage from "@/components/ui/ResilientImage";
import { homeEnglish } from "@/content/en/home";

const proofSteps = [
  { number: "01", title: { en: "Board converting", zh: "纸板加工" }, body: { en: "Match paper grade, board construction, and flute direction to the intended structure.", zh: "根据结构要求匹配纸材、纸板和坑型方向。" } },
  { number: "02", title: { en: "Automatic die-cutting", zh: "自动模切" }, body: { en: "Review the drawing, fit, crease sequence, and assembly requirements before production.", zh: "生产前复核图纸、尺寸贴合、压痕顺序和组装要求。" } },
  { number: "03", title: { en: "Finishing & inspection", zh: "后工艺与检查" }, body: { en: "Confirm coatings, key dimensions, packing, and inspection checkpoints.", zh: "确认涂层、打样、关键尺寸和包装节点。" } },
] as const;

export default async function ManufacturingProof() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <section id="capabilities" className="texture-ink bg-[#102820] px-4 py-12 text-white sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end lg:gap-16">
          <div>
            <p className="kh-section-kicker text-[#e8c06c]">{isZh ? "制造能力预览" : "Manufacturing preview"}</p>
            <h2 className="kh-editorial-heading mt-4 max-w-xl text-4xl leading-[.98] tracking-[-.045em] sm:text-6xl">
              {isZh ? "每一步都能回到真实生产。" : "Production you can verify."}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
              {isZh
                ? `${companyProfile.location.zh}的团队围绕纸材、结构、加工和交付节点协同。`
                : homeEnglish.manufacturing.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/factory" className="inline-flex items-center gap-2 border-b border-[#e8c06c] pb-1.5 text-sm font-black text-[#e8c06c]">{isZh ? "查看工厂" : "Explore our factory"}<ArrowRight className="size-4" /></Link>
              <Link href="/process" className="inline-flex items-center gap-2 border-b border-white/30 pb-1.5 text-sm font-black text-white/84">{isZh ? "查看生产流程" : "View production process"}<ArrowRight className="size-4" /></Link>
            </div>
          </div>

          <div className="kh-manufacturing__media grid gap-3 sm:grid-cols-[1.35fr_.65fr]">
            <div className="kh-manufacturing__main-media relative overflow-hidden border border-white/15">
              <ResilientImage src={showcaseImages.machineClose} fallbackSrc={showcaseImages.structureMaterialReal} alt={isZh ? "科宏纸张输送与加工机械细节" : "Kehong paper feeding and converting machine detail"} fill sizes="(min-width: 1100px) 48vw, 90vw" className="object-cover object-[54%_52%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102820]/82 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#e8c06c]">{isZh ? "设备细节" : "Converting detail"}</p><p className="mt-1 text-lg font-black">{isZh ? "纸张走料与加工控制" : "Paper feeding and process control"}</p></div>
            </div>
            <div className="kh-manufacturing__detail-media relative overflow-hidden border border-white/15">
              <ResilientImage src={showcaseImages.structureMaterialReal} fallbackSrc={showcaseImages.sampleRoom} alt={isZh ? "科宏纸材加工生产线" : "Kehong paperboard converting line"} fill sizes="(min-width: 1100px) 22vw, 90vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102820]/82 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-black leading-5 text-white">{isZh ? "纸材加工与走料" : "Paperboard converting stage"}</p>
            </div>
          </div>
        </div>

        <div className="kh-manufacturing__steps mt-10 grid border-y border-white/15 md:grid-cols-3">
          {proofSteps.map((step) => (
            <article key={step.number} className="kh-manufacturing__step border-b border-white/15 p-3 last:border-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-5">
              <p className="font-mono text-xs font-bold tracking-[.18em] text-[#e8c06c]">{step.number}</p>
              <h3 className="mt-3 text-base font-black">{isZh ? step.title.zh : step.title.en}</h3>
              <p className="mt-2 text-sm leading-5 text-white/68">{isZh ? step.body.zh : step.body.en}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
