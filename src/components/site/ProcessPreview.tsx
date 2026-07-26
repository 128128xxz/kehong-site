import { Factory, Gauge, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { showcaseImages } from "@/data/visuals";

export default async function ProcessPreview() {
  const locale = await getLocale();
  const isZh = locale === "zh";
  const processSteps = isZh ? [
    { title: "材料与规格确认", text: "确认纸张等级、克重、涂层、尺寸和目标包装结构。" },
    { title: "分切与走料", text: "根据后续加工方向确认纸材宽度、走料和排版要求。" },
    { title: "纸板加工", text: "匹配纸板结构、坑型方向和目标强度。" },
    { title: "模切与压痕", text: "核对刀模、尺寸贴合、折线顺序和组装要求。" },
    { title: "裱纸与后工艺", text: "按已确认的产品要求完成裱纸、涂层或相关后加工。" },
    { title: "检验、包装与出货", text: "检查关键尺寸、表面效果、包装方式和出货准备。" },
  ] : [
    { title: "Material confirmation", text: "Confirm paper grade, GSM, coating, dimensions, and the intended packaging structure." },
    { title: "Cutting and slitting", text: "Set material width, feed direction, and layout requirements for the next converting stage." },
    { title: "Board converting", text: "Match board construction, flute direction, and required strength to the approved structure." },
    { title: "Die-cutting and creasing", text: "Check the cutting form, dimensional fit, fold sequence, and assembly requirements." },
    { title: "Lamination and finishing", text: "Apply the confirmed lamination, coating, or finishing requirement for the product." },
    { title: "Inspection, packing, and shipment", text: "Review key dimensions, surface finish, packing method, and shipment preparation." },
  ];
  const proofBadges = [
    { icon: Factory, label: isZh ? "工厂实景" : "Factory views" },
    { icon: Gauge, label: isZh ? "流程可追踪" : "Production traceability" },
    { icon: ShieldCheck, label: isZh ? "质量确认" : "Quality assurance" },
  ] as const;
  const proofImages = [
    { src: showcaseImages.machine, alt: isZh ? "科宏自动送料生产线" : "Kehong automatic feeding line" },
    { src: showcaseImages.machineClose, alt: isZh ? "设备加工细节实拍" : "Machine process detail" },
    { src: showcaseImages.sampleRoom, alt: isZh ? "样品与包装展示实拍" : "Sample and packaging display" },
    { src: showcaseImages.structureMaterialReal, alt: isZh ? "纸板加工阶段" : "Paperboard converting stage" },
  ] as const;

  return (
    <section id="process" className="texture-ink px-4 py-16 sm:px-6 lg:px-8 lg:py-18">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.95fr_1.05fr]">
        <div>
          <p className="kh-eyebrow kh-eyebrow-light">
            {isZh ? "受控生产" : "Controlled production"}
          </p>
          <h1 className="kh-editorial-heading mt-4 text-4xl sm:text-5xl">
            {isZh ? "从材料确认到包装出货。" : "From material confirmation to finished packaging."}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-(--kh-paper-deep)">
            {isZh ? "每个项目将材料、结构、加工和检验要求对应到清晰的生产节点。" : "Each project connects material, structure, converting, and inspection requirements to a clear production stage."}
          </p>
          <div className="premium-depth relative mt-8 h-[320px] overflow-hidden rounded-lg border border-white/15 bg-white/5 sm:h-[420px]">
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
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,33,29,.04),rgba(29,33,29,.42))]" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 grid gap-2 sm:grid-cols-3">
              {proofBadges.map((item) => {
                const Icon = item.icon;

                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[rgba(29,33,29,.65)] px-3 py-2 text-xs font-semibold text-(--kh-surface)"
                  >
                    <Icon className="size-4 text-(--kh-brass-soft)" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative grid content-center gap-4">
          <div className="absolute left-[27px] top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-(--kh-brass-soft)/45 to-transparent sm:block" />
          {processSteps.map((step, index) => (
            <article
              key={step.title}
              className="grid grid-cols-[52px_1fr] gap-4 rounded-lg border border-white/15 bg-white/8 p-5 transition hover:border-(--kh-brass-soft)/50 hover:bg-white/12"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-(--kh-brass-soft) text-sm font-semibold text-(--kh-ink)">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-(--kh-surface)">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--kh-paper-deep)">
                  {step.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
