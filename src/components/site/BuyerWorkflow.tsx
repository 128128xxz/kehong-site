import { ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const steps = [
  { number: "01", en: { title: "Requirements", body: "Photo, drawing, target use, size, material direction and quantity." }, zh: { title: "需求沟通", body: "产品图片、图纸、用途、尺寸、材质方向和数量。" } },
  { number: "02", en: { title: "Specification", body: "Confirm GSM, coating, structure, print, finishing and destination market." }, zh: { title: "规格确认", body: "确认克重、涂层、结构、印刷、后工艺和目标市场。" } },
  { number: "03", en: { title: "Sampling", body: "Review dimensions, structure, material and visual details." }, zh: { title: "打样确认", body: "确认尺寸、结构、材料和外观细节。" } },
  { number: "04", en: { title: "Production & inspection", body: "Follow converting, finishing, quantity and packing checkpoints." }, zh: { title: "生产与检验", body: "跟进加工、后工艺、数量和包装节点。" } },
  { number: "05", en: { title: "Packing & shipment", body: "Prepare packing and delivery requirements for export or domestic orders." }, zh: { title: "包装与出货", body: "根据出口或国内订单准备包装和交付要求。" } },
] as const;

export default async function BuyerWorkflow() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <section id="workflow" className="bg-[#f6f4ec] px-4 py-20 sm:px-6 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col justify-between gap-6 border-b border-[#d9d2be] pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="kh-section-kicker">{isZh ? "采购流程" : "Buyer workflow"}</p>
            <h2 className="kh-editorial-heading mt-5 text-4xl leading-[.98] tracking-[-.045em] text-[#171713] sm:text-6xl">{isZh ? "从需求到出货。" : "From requirement to shipment."}</h2>
          </div>
          <Link href="/procurement" className="kh-inline-link">{isZh ? "查看买家支持" : "Open buyer support"}<ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-10 grid border-t border-l border-[#d9d2be] sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => {
            const copy = isZh ? step.zh : step.en;
            return <article key={step.number} className="min-h-[210px] border-b border-r border-[#d9d2be] bg-[#faf8f3] p-5 sm:min-h-[230px]"><p className="font-mono text-xs font-bold tracking-[.2em] text-[#9a6b1f]">{step.number}</p><h3 className="mt-10 text-lg font-black text-[#171713]">{copy.title}</h3><p className="mt-3 text-sm leading-6 text-[#626156]">{copy.body}</p></article>;
          })}
        </div>
      </div>
    </section>
  );
}
