import {
  ClipboardCheck,
  Factory,
  FileText,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { companyLegalName, companyProfile, contact } from "@/data/company";
import { Link } from "@/i18n/navigation";

const briefCopy = {
  zh: {
    eyebrow: "合作信心",
    title: "在选择产品前，先了解我们的工厂与服务能力。",
    body: "从生产能力、产品范围、样品流程到质量控制，快速了解与科宏合作所需的信息。",
    quote: "提交询价",
    catalog: "获取目录 / 规格",
    cards: [
      {
        icon: Factory,
        title: "生产能力",
        body: "佛山纸品包装工厂，覆盖纸材加工、模切、分切、裱纸和定制结构打样。",
        meta: "纸品包装生产场地",
      },
      {
        icon: PackageCheck,
        title: "产品范围",
        body: "瓦楞纸、特种纸、食品纸盒、蛋糕盒、纸杯扇形片、内托和展示包装。",
        meta: "材料 + 成品包装",
      },
      {
        icon: Truck,
        title: "报价支持",
        body: "根据材质、尺寸、数量、工艺与目标市场提供报价建议，支持样品及 OEM/ODM 项目。",
        meta: "MOQ 按项目确认",
      },
      {
        icon: ShieldCheck,
        title: "质量保障",
        body: "从来料、生产到出货进行节点确认，支持样品、照片与文件核验。",
        meta: "项目资料可按需确认",
      },
    ],
    checklistTitle: "为了更快获得报价，建议提供",
    checklist: ["产品用途或图片", "尺寸 / 克重 / 材质", "印刷颜色和后工艺", "预计数量和目标市场"],
  },
  en: {
    eyebrow: "Buyer support",
    title: "The information you need to choose a reliable packaging partner.",
    body: "Review our production capability, product range, sampling process and quality controls before you request a quote.",
    quote: "Request a quote",
    catalog: "Request catalog / specifications",
    cards: [
      {
        icon: Factory,
        title: "Manufacturing capability",
        body: "Paper packaging manufacturer in Foshan, covering board converting, die-cutting, slitting, lamination and custom sampling.",
        meta: "Paper packaging production site",
      },
      {
        icon: PackageCheck,
        title: "Product range",
        body: "Corrugated paper, specialty paper, food boxes, cake boxes, cup fan blanks, inserts and display packaging.",
        meta: "Materials + finished packaging",
      },
      {
        icon: Truck,
        title: "Quote support",
        body: "We prepare recommendations by material, size, quantity, finish, destination market and OEM/ODM requirements.",
        meta: "MOQ confirmed by project",
      },
      {
        icon: ShieldCheck,
        title: "Quality assurance",
        body: "We confirm materials and key production stages, with sample, photo and document support before shipment.",
        meta: "Project documents reviewed on request",
      },
    ],
    checklistTitle: "For a faster quote, send",
    checklist: ["Product use or sample photo", "Size / GSM / material", "Print colors and finishing", "Quantity and destination market"],
  },
} as const;

export default async function BuyerDecisionBrief() {
  const locale = await getLocale();
  const copy = briefCopy[locale as keyof typeof briefCopy] ?? briefCopy.en;
  const quoteMessage = encodeURIComponent(
    locale === "zh"
      ? "你好科宏，我想获取产品目录和规格资料，并咨询纸品包装报价。"
      : "Hello Kehong, I would like to request your product catalog and specifications, along with a paper packaging quote.",
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${quoteMessage}`;

  return (
    <section id="buyer-brief" data-visual-section="trust" className="kh-trust-section texture-paper relative bg-[#f6f4ec] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <span id="factory" className="absolute left-0 top-0" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.82fr_1.18fr] lg:items-stretch">
        <div className="kh-panel rounded-lg border border-[#d9d2be] bg-white/88 p-5 shadow-xl shadow-[#171713]/8 sm:p-7 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a6b1f]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-[#171713] sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#626156]">
            {copy.body}
          </p>
          <div className="mt-6 grid gap-2 text-sm font-semibold text-[#171713]">
            <div className="flex items-center gap-2 rounded-md bg-[#f1e7cf] px-3 py-2">
              <Globe2 className="size-4 text-[#9a6b1f]" />
              {locale === "zh" ? "面向海外与东南亚客户的出口服务" : "Export service for overseas and Southeast Asia customers"}
            </div>
            <div className="flex items-center gap-2 rounded-md bg-[#f1e7cf] px-3 py-2">
              <ClipboardCheck className="size-4 text-[#9a6b1f]" />
              {locale === "zh" ? "按材质、尺寸、工艺和数量准备报价" : "Quote preparation by material, size, process and quantity"}
            </div>
          </div>
          <div className="mt-6 border-t border-[#d9d2be] pt-5 text-sm">
            <p className="font-black text-[#171713]">{companyLegalName}</p>
            <dl className="mt-3 grid gap-2 text-[#626156]">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="font-bold text-[#171713]">{locale === "zh" ? "工厂所在地" : "Factory location"}</dt>
                <dd>{locale === "zh" ? companyProfile.location.zh : companyProfile.location.en}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="font-bold text-[#171713]">{locale === "zh" ? "生产能力" : "Production capability"}</dt>
                <dd>{locale === "zh" ? companyProfile.productionCapability.zh : companyProfile.productionCapability.en}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="font-bold text-[#171713]">{locale === "zh" ? "出口经验" : "Export experience"}</dt>
                <dd>{locale === "zh" ? companyProfile.exportExperience.zh : companyProfile.exportExperience.en}</dd>
              </div>
            </dl>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#171713] px-5 text-sm font-black text-white"
            >
              {copy.quote}
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#171713]/18 bg-white px-5 text-sm font-black text-[#171713]"
            >
              <FileText className="size-4 text-[#9a6b1f]" />
              {copy.catalog}
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {copy.cards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="premium-depth rounded-lg border border-[#d9d2be] bg-white p-4 shadow-lg shadow-[#171713]/8 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#171713] text-[#e8c06c]">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-[#f1e7cf] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a6b1f]">
                    {item.meta}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-[#171713]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#626156]">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-[#d9d2be] bg-[#171713] p-4 text-white shadow-xl shadow-[#171713]/12">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm font-black text-[#e8c06c]">
                {copy.checklistTitle}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {copy.checklist.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/12 bg-white/8 px-3 py-2 text-xs font-bold text-[#f7f0df]/86"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
