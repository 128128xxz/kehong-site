import {
  BadgeCheck,
  Boxes,
  ClipboardList,
  FileCheck2,
  HelpCircle,
  MessageCircle,
  PackageSearch,
  Ruler,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { contact } from "@/data/company";

const assuranceCopy = {
  zh: {
    eyebrow: "质量与交付保障",
    title: "把起订量、样品、交期和质检标准说清楚。",
    body: "从报价、打样到批量生产和出货，我们提供清晰的规格确认与质量控制信息。",
    procurement: "报价信息",
    quality: "质量控制",
    faq: "常见问题",
    actions: {
      whatsapp: "WhatsApp 发需求",
    },
    info: [
      { icon: Boxes, label: "MOQ", value: "按材料、工艺和规格确认，支持灵活订单沟通。" },
      { icon: Ruler, label: "样品政策", value: "先确认尺寸、结构、材质和用途，再安排打样或寄样。" },
      { icon: Timer, label: "交期", value: "根据产品类型、数量、印刷和后工艺评估，报价时同步交期。" },
      { icon: Truck, label: "包装/运输", value: "按出口或国内配送要求确认包装方式和运输方案。" },
      { icon: FileCheck2, label: "资料支持", value: "目录、规格与项目资料可按需确认。" },
      { icon: PackageSearch, label: "项目流程", value: "需求整理、结构确认、样品确认、批量生产、出货跟进。" },
    ],
    qcSteps: [
      "来料与纸材匹配确认",
      "尺寸、克重、坑型和结构复核",
      "模切、压线、裱纸、分切过程跟进",
      "样品或生产照片确认",
      "出货前包装和数量核对",
    ],
    faqs: [
      {
        q: "只有样品图，没有完整图纸，可以报价吗？",
        a: "可以。请发送样品图、目标尺寸、材质方向和预计数量，我们会据此确认规格并给出报价建议。",
      },
      {
        q: "可以支持食品接触类包装吗？",
        a: "可按项目确认食品级白卡、防油纸、内衬及相关文件要求，打样前会先确认应用场景。",
      },
      {
        q: "后续增加产品，会不会很麻烦？",
        a: "可以。我们可按产品类型、材质、工艺和应用持续扩展产品方案。",
      },
      {
        q: "可以先获取产品目录或规格资料吗？",
        a: "可以。通过 WhatsApp 或邮件告诉我们关注的产品类型，我们会发送相应目录或规格信息。",
      },
    ],
  },
  en: {
    eyebrow: "Quality and delivery assurance",
    title: "Clear information on MOQ, sampling, lead time and quality control.",
    body: "From quotation and sampling to batch production and shipment, we provide clear specifications and quality checkpoints.",
    procurement: "Quotation details",
    quality: "Quality control",
    faq: "FAQ",
    actions: {
      whatsapp: "Send requirements",
    },
    info: [
      { icon: Boxes, label: "MOQ", value: "Confirmed by material, process and specification. Flexible orders can be discussed." },
      { icon: Ruler, label: "Sample policy", value: "Size, structure, material and use case are confirmed before sampling." },
      { icon: Timer, label: "Lead time", value: "Confirmed by product type, quantity, printing and finishing, then included in the quotation." },
      { icon: Truck, label: "Packing / shipping", value: "Packing and logistics can be matched to export or domestic delivery needs." },
      { icon: FileCheck2, label: "Documents", value: "Catalogs, specifications and project documents can be reviewed on request." },
      { icon: PackageSearch, label: "Project flow", value: "Brief, structure review, sample approval, mass production and shipment follow-up." },
    ],
    qcSteps: [
      "Incoming material match check",
      "Size, GSM, flute and structure review",
      "Die-cutting, creasing, lamination and slitting follow-up",
      "Sample or production photo confirmation",
      "Packing and quantity check before shipment",
    ],
    faqs: [
      {
        q: "Can you quote from sample photos?",
        a: "Yes. Send sample photos, target size, material direction and estimated quantity, and we will confirm the specification and quotation scope.",
      },
      {
        q: "Can you support food-contact packaging?",
        a: "Food-grade white card, greaseproof paper, liners and related documents can be confirmed by project before sampling.",
      },
      {
        q: "Can we add more products later?",
        a: "Yes. We can extend the product range by type, material, process and application as your program grows.",
      },
      {
        q: "Can I request a catalog or specifications first?",
        a: "Yes. Tell us the product family by WhatsApp or email and we can send the relevant catalog or specifications.",
      },
    ],
  },
} as const;

export default async function ProcurementAssurance() {
  const locale = await getLocale();
  const copy = assuranceCopy[locale as keyof typeof assuranceCopy] ?? assuranceCopy.en;
  const message = encodeURIComponent(
    locale === "zh"
      ? "你好科宏，我想咨询产品报价：产品、数量、材质和交期要求如下。"
      : "Hello Kehong, I would like to request a quote with product, quantity, material and lead-time requirements.",
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`;

  return (
    <section id="procurement" className="surface-paper bg-[#f5f3ec] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9a6b1f]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#171713] sm:text-5xl">
              {copy.title}
            </h2>
          </div>
          <p className="text-base leading-8 text-[#626156]">
            {copy.body}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-5 shadow-xl shadow-[#171713]/10 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardList className="size-5 text-[#9a6b1f]" />
              <h3 className="text-xl font-black text-[#171713]">{copy.procurement}</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {copy.info.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.label} className="rounded-md border border-[#d9d2be] bg-[#fbfaf5] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-md bg-[#171713] text-[#e8c06c]">
                        <Icon className="size-4" />
                      </span>
                      <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#171713]">
                        {item.label}
                      </h4>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#626156]">{item.value}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="kh-panel rounded-lg border border-[#d9d2be] bg-[#171713] p-5 text-white shadow-xl shadow-[#171713]/12 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="size-5 text-[#e8c06c]" />
                <h3 className="text-xl font-black">{copy.quality}</h3>
              </div>
              <div className="grid gap-3">
                {copy.qcSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-3 rounded-md border border-white/12 bg-white/8 px-3 py-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#e8c06c] text-[11px] font-black text-[#171713]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-[#f7f0df]/82">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#d9d2be] bg-white p-5 shadow-lg shadow-[#171713]/8">
              <div className="mb-4 flex items-center gap-3">
                <HelpCircle className="size-5 text-[#9a6b1f]" />
                <h3 className="text-xl font-black text-[#171713]">{copy.faq}</h3>
              </div>
              <div className="grid gap-2">
                {copy.faqs.map((item) => (
                  <details key={item.q} className="group rounded-md border border-[#d9d2be] bg-[#fbfaf5] px-4 py-3">
                    <summary className="cursor-pointer list-none text-sm font-black text-[#171713] [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        <BadgeCheck className="size-4 text-[#9a6b1f]" />
                        {item.q}
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-[#626156]">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#d9d2be] bg-[#171713] p-4 text-white shadow-xl shadow-[#171713]/12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#f7f0df]/78">
            {locale === "zh" ? "准备好产品图片、尺寸、材质和数量后，即可发送给我们获取报价。" : "When your product photo, size, material and quantity are ready, send them to receive a quote."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e8c06c] px-4 text-sm font-black text-[#171713]">
              <MessageCircle className="size-4" />
              {copy.actions.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
