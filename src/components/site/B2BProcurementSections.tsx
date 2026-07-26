import {
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Layers3,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import PageHero from "@/components/site/PageHero";
import { SectionKicker } from "@/components/home/annotations";
import { Reveal } from "@/components/home/interactive";
import { Link } from "@/i18n/navigation";

const capabilityItems = [
  { icon: ClipboardCheck, title: "Quote requirements", zh: "报价资料", detail: "Share the product use, dimensions, material or GSM target, quantity, and destination market.", detailZh: "提供产品用途、尺寸、材质或克重目标、数量和目的市场。" },
  { icon: Layers3, title: "Material and GSM", zh: "材质与克重", detail: "Paper grade, coating, board construction, and converting requirements are reviewed together.", detailZh: "结合纸张等级、涂层、纸板结构和加工要求进行确认。" },
  { icon: Boxes, title: "Sampling and OEM / ODM", zh: "打样与 OEM / ODM", detail: "Drawings, dimensions, folds, printing, and finishing can be confirmed through project samples.", detailZh: "可通过项目样品确认图纸、尺寸、折线、印刷与后工艺。" },
  { icon: Globe2, title: "Export packing and documents", zh: "出口包装与文件", detail: "Packing method, shipment preparation, and available project documents are confirmed before dispatch.", detailZh: "出货前确认包装方式、出货准备和可提供的项目文件。" },
];

const chooseItems = [
  { icon: PackageCheck, title: "MOQ by project", zh: "按项目确认 MOQ", detail: "MOQ depends on the material, structure, converting method, and production setup.", detailZh: "MOQ 根据材质、结构、加工方式和生产设置确认。" },
  { icon: ClipboardCheck, title: "Sample review", zh: "样品确认", detail: "Structural fit and key specifications are reviewed before batch production.", detailZh: "批量生产前确认结构贴合和关键规格。" },
  { icon: ShieldCheck, title: "Quality checkpoints", zh: "质量检查节点", detail: "Material, dimensions, finish, and packing requirements are checked at relevant stages.", detailZh: "在相应节点检查材料、尺寸、表面效果和包装要求。" },
  { icon: Globe2, title: "Destination requirements", zh: "目的市场要求", detail: "Tell us the destination market and any food-contact or documentation requirements for review.", detailZh: "请提供目的市场及食品接触或文件要求，以便核对。" },
];

const processSteps = {
  en: ["Requirements", "Specification", "Production", "Inspection", "Shipment"],
  zh: ["需求沟通", "规格确认", "批量生产", "质量检验", "安排出货"],
} as const;

export default async function B2BProcurementSections() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <>
      <PageHero
        index="01"
        kicker={isZh ? "工厂与服务能力" : "Manufacturing and service capabilities"}
        title={isZh ? "把采购要求整理成可确认的生产规格。" : "Turn your packaging brief into a quote-ready specification."}
        lede={
          isZh
            ? "从材料匹配、结构打样到批量生产与出口包装，科宏为每个项目提供清晰、连贯的交付支持。"
            : "Use this guide to prepare material, GSM, structure, sampling, quantity, destination, and document requirements before requesting a quote."
        }
        meta={[
          "OEM / ODM",
          isZh ? "MOQ 按项目确认" : "MOQ by project",
          isZh ? "中国广东佛山" : "Foshan, Guangdong, China",
        ]}
      >
        <Link href="/contact" className="kh-button kh-button-light">
          {isZh ? "提交询盘" : "Request a quote"}
        </Link>
        <Link href="/products" className="kh-button kh-button-ghost">
          {isZh ? "浏览产品目录" : "Browse the catalog"}
        </Link>
      </PageHero>

      <section data-visual-section="capability" className="kh-section kh-section-paper">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="02" text={isZh ? "报价资料" : "Quote preparation"} />
                <h2>{isZh ? "报价前，先备齐这四类信息。" : "Four inputs that make a quote move faster."}</h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {capabilityItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="kh-panel p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-md bg-(--kh-forest) text-(--kh-brass-soft)">
                        <Icon className="size-5" />
                      </span>
                      <h3 className="text-sm font-bold text-(--kh-ink)">
                        {isZh ? item.zh : item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-(--kh-muted)">{isZh ? item.detailZh : item.detail}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="kh-section kh-section-forest">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="03" text={isZh ? "采购确认事项" : "Procurement checkpoints"} light />
                <h2>{isZh ? "每个项目都会过一遍的确认清单。" : "The checklist every project runs through."}</h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {chooseItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-md border border-white/12 bg-white/8 p-5">
                    <div className="flex items-center gap-3">
                      <Icon className="size-5 text-(--kh-brass-soft)" />
                      <h3 className="text-sm font-bold text-white">{isZh ? item.zh : item.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/80">{isZh ? item.detailZh : item.detail}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="kh-section kh-section-muted">
        <div className="kh-shell">
          <Reveal>
            <div className="kh-section-heading">
              <div>
                <SectionKicker index="04" text={isZh ? "项目流程" : "Project process"} />
                <h2>{isZh ? "从需求沟通到安排出货的五个节点。" : "Five stages from brief to shipment."}</h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {(isZh ? processSteps.zh : processSteps.en).map((step, index) => (
                <div key={step} className="kh-panel p-4">
                  <span className="kh-mono text-(--kh-brass)">{`0${index + 1}`}</span>
                  <p className="mt-3 text-sm font-bold text-(--kh-ink)">{step}</p>
                  <CheckCircle2 className="mt-3 size-4 text-(--kh-brass)" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
