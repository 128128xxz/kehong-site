import {
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Globe2,
  Layers3,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { getLocale } from "next-intl/server";

const capabilityItems = [
  { icon: Factory, title: "Packaging manufacturing experience", zh: "纸品包装制造经验", detail: "Paper materials, packaging structures and batch production coordinated by an experienced factory team.", detailZh: "由经验丰富的工厂团队协同材料、包装结构与批量生产。" },
  { icon: Boxes, title: "Production capability", zh: "生产能力", detail: "Material matching, cutting, forming, packing and clear project follow-up from sampling to delivery.", detailZh: "覆盖材料匹配、模切、成型、包装，并从打样跟进至交付。" },
  { icon: Layers3, title: "OEM / ODM support", zh: "OEM / ODM 定制", detail: "Material, GSM, structure, size, printing and finishing options for custom projects.", detailZh: "支持材质、克重、结构、尺寸、印刷与后加工定制。" },
  { icon: Globe2, title: "Export service", zh: "出口服务", detail: "Clear communication, sample confirmation and delivery-ready packing support for overseas orders.", detailZh: "为海外订单提供清晰沟通、样品确认与出口包装支持。" },
];

const chooseItems = [
  { icon: PackageCheck, title: "Reliable supply", zh: "稳定供应", detail: "Consistent material matching and production coordination for repeat orders.", detailZh: "为持续采购提供稳定的材料匹配与生产协同。" },
  { icon: ClipboardCheck, title: "Custom packaging", zh: "定制包装", detail: "Adjust size, material, coating and packaging structure to suit your project.", detailZh: "可按项目调整尺寸、材质、涂层与包装结构。" },
  { icon: ShieldCheck, title: "Quality assurance", zh: "质量保障", detail: "Material, GSM, structure and finishing details are confirmed before production.", detailZh: "生产前确认材料、克重、结构与后加工细节。" },
  { icon: Globe2, title: "International service", zh: "国际服务", detail: "Multilingual communication, WhatsApp support and export-ready documentation.", detailZh: "提供多语言沟通、WhatsApp 支持与出口文件协助。" },
];

const processSteps = {
  en: ["Requirements", "Specification", "Production", "Inspection", "Shipment"],
  zh: ["需求沟通", "规格确认", "批量生产", "质量检验", "安排出货"],
} as const;

export default async function B2BProcurementSections() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <section data-visual-section="capability" className="kh-capability-section bg-[#f6f4ec] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-5 shadow-xl shadow-[#171713]/8 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a6b1f]">
                {isZh ? "工厂与服务能力" : "Manufacturing and service capabilities"}
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#171713] sm:text-4xl">
              {isZh ? "为食品、烘焙和零售包装项目提供稳定的生产支持" : "Production support for food, bakery and retail packaging projects"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#626156]">
              {isZh
                ? "从材料匹配、结构打样到批量生产与出口包装，科宏为每个项目提供清晰、连贯的交付支持。"
                : "From material matching and structural sampling to batch production and export packing, Kehong provides clear coordination from sampling to delivery."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {capabilityItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-md bg-[#171713] text-[#e8c06c]">
                        <Icon className="size-5" />
                      </span>
                      <h3 className="text-sm font-black text-[#171713]">
                        {isZh ? item.zh : item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#626156]">{isZh ? item.detailZh : item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="premium-depth rounded-lg border border-[#d9d2be] bg-[#171713] p-5 text-white shadow-xl shadow-[#171713]/10 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e8c06c]">
                {isZh ? "客户选择科宏的理由" : "Why customers choose Kehong"}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {chooseItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-md border border-white/12 bg-white/8 p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="size-5 text-[#e8c06c]" />
                        <h3 className="text-sm font-black">{isZh ? item.zh : item.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#f7f0df]/78">{isZh ? item.detailZh : item.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-5 shadow-xl shadow-[#171713]/8 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a6b1f]">
                {isZh ? "项目流程" : "Project process"}
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-5">
                {(isZh ? processSteps.zh : processSteps.en).map((step, index) => (
                  <div key={step} className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] p-4">
                    <span className="grid size-8 place-items-center rounded-full bg-[#e8c06c] text-xs font-black text-[#171713]">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-sm font-black text-[#171713]">{step}</p>
                    <CheckCircle2 className="mt-3 size-4 text-[#9a6b1f]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
