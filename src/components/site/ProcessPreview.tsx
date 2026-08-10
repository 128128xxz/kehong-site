import Image from "next/image";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

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
  const proofImages = [
    { src: showcaseImages.machine, alt: isZh ? "科宏自动送料生产线" : "Kehong automatic feeding line" },
    { src: showcaseImages.machineClose, alt: isZh ? "设备加工细节实拍" : "Machine process detail" },
    { src: showcaseImages.corrugatorHall, alt: isZh ? "瓦楞产线车间" : "Corrugator hall" },
    { src: showcaseImages.structureMaterialReal, alt: isZh ? "纸板加工阶段" : "Paperboard converting stage" },
  ] as const;

  return (
    <>
      <section id="process" className="kh-section">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="02" text={isZh ? "生产节点" : "Production stages"} />
                <h2>{isZh ? "六个节点，把要求落进产线。" : "Six stages carry the brief through the line."}</h2>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:gap-16">
            <Reveal>
              <div className="kh-panel relative overflow-hidden p-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  {proofImages.map((item, index) => (
                    <div key={item.src} className="kh-media-shade relative aspect-[4/3] overflow-hidden rounded-md">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(min-width: 1024px) 320px, 45vw"
                        className={`object-cover ${index === 0 ? "object-[50%_20%]" : ""}`}
                      />
                    </div>
                  ))}
                </div>
                <span className="kh-fig-caption kh-mono">{isZh ? "图01 — 车间实拍" : "Fig.01 — Factory floor"}</span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <ol className="m-0 list-none border-t border-(--kh-line) p-0">
                {processSteps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-(--kh-line) py-6">
                    <b className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</b>
                    <div>
                      <h3 className="m-0 text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="kh-section kh-section-cta">
        <Reveal mode="none">
          <div className="kh-keyline" aria-hidden="true" />
        </Reveal>
        <div className="kh-shell">
          <Reveal>
            <SectionKicker index="03" text={isZh ? "开始一个包装项目" : "Start a packaging project"} light />
            <h2>{isZh ? "把规格与目标市场交给同一条产线。" : "Put your spec and market on the same line."}</h2>
            <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
              {isZh
                ? "发送尺寸、材料和数量，科宏按流程回复打样和报价的下一步。"
                : "Send dimensions, material, and quantity, and the Kehong team replies with the next step for sampling or a quotation."}
            </p>
            <div className="kh-actions mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="kh-button kh-button-light">
                {isZh ? "提交询盘" : "Request a quote"}
              </Link>
              <Link href="/products" className="kh-button kh-button-ghost">
                {isZh ? "查看产品规格" : "Browse products"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
