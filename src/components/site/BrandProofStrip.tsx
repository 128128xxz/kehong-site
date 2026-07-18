import { ArrowUpRight, Factory, Globe2, Layers3, ShieldCheck } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyLegalName, companyProfile } from "@/data/company";

const proofItems = [
  { icon: Factory, value: "Since 2001", en: "paper converting and packaging support", zh: "纸材加工与包装支持" },
  { icon: Layers3, value: "OEM / ODM", en: "materials to finished packs", zh: "从材料到成品包装" },
  { icon: Globe2, value: "Export-ready", en: "support for overseas B2B orders", zh: "支持海外 B2B 订单" },
  { icon: ShieldCheck, value: "Project-led", en: "specification and QC checkpoints", zh: "规格与质检节点确认" },
] as const;

export default async function BrandProofStrip() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <section
      aria-label={isZh ? "科宏制造与服务概览" : "Kehong manufacturing and service overview"}
      className="kh-proof-strip border-y border-[#d9d2be] bg-[#fbfaf5] px-4 py-4 sm:px-6 lg:px-12"
    >
      <div className="mx-auto grid max-w-[90rem] gap-6 lg:grid-cols-[1.15fr_2fr_auto] lg:items-center">
        <div>
          <p className="kh-section-kicker">{isZh ? "制造伙伴" : "Manufacturing partner"}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#626156]">
            {isZh
              ? `${companyLegalName}，位于${companyProfile.location.zh}，为海外项目提供材料、结构与生产协同。`
              : `${companyLegalName}, based in ${companyProfile.location.en}, coordinating materials, structures and production for overseas projects.`}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {proofItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.value} className="kh-proof-item flex items-start gap-3 border-l border-[#d9d2be] pl-4">
                <Icon className="mt-0.5 size-4 shrink-0 text-[#9a6b1f]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-black tracking-[-0.01em] text-[#171713]">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-[#626156]">{isZh ? item.zh : item.en}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/factory" className="kh-inline-link whitespace-nowrap">
          {isZh ? "了解工厂" : "View factory"}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
