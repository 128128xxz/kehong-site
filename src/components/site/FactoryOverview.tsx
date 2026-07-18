import Image from "next/image";
import { ArrowRight, ClipboardCheck, Factory, Layers3, PackageCheck } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyLegalName, companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";

const capabilityCards = [
  { icon: Layers3, title: "Material handling", body: "Paper grade, board construction, coating, and converting requirements are reviewed against the intended packaging structure." },
  { icon: Factory, title: "Converting equipment", body: "Paper feeding, slitting, die-cutting, creasing, and lamination are coordinated around the approved specification." },
  { icon: PackageCheck, title: "Structural sampling", body: "Drawings, dimensions, folds, and insert fit are checked through samples before batch production." },
  { icon: ClipboardCheck, title: "Quality checkpoints", body: "Key dimensions, finish, packing method, and shipment preparation are confirmed at the relevant production stages." },
] as const;

export default async function FactoryOverview() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <div className="bg-[#f6f3eb] text-[#171713]">
      <section className="px-4 py-12 sm:px-6 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="kh-section-kicker">{isZh ? "佛山工厂" : "Foshan production site"}</p>
            <h1 className="kh-editorial-heading mt-4 max-w-[12ch] text-5xl leading-[.94] tracking-[-.05em] sm:text-7xl">
              {isZh ? "真实生产能力，支持清晰的项目交付。" : "Production capability you can inspect."}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#5e5a50]">
              {isZh
                ? "科宏位于广东佛山，围绕纸材选择、结构打样、纸材加工、后工艺和出货准备协同纸包装项目。"
                : `${companyLegalName} is based in ${companyProfile.location.en}. The team coordinates material selection, structural sampling, paper converting, finishing, and shipment preparation for paper packaging projects.`}
            </p>
            <dl className="mt-8 grid gap-4 border-y border-[#171713]/14 py-5 text-sm sm:grid-cols-2">
              <div><dt className="font-black">{isZh ? "工厂所在地" : "Factory location"}</dt><dd className="mt-1 text-[#656157]">{isZh ? companyProfile.location.zh : companyProfile.location.en}</dd></div>
              <div><dt className="font-black">{isZh ? "生产支持" : "Production support"}</dt><dd className="mt-1 text-[#656157]">{isZh ? companyProfile.productionCapability.zh : companyProfile.productionCapability.en}</dd></div>
            </dl>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-[.4rem] bg-[#18372e] px-5 text-sm font-black text-white">{isZh ? "提交项目需求" : "Start a packaging project"}<ArrowRight className="size-4" /></Link>
              <Link href="/process" className="inline-flex min-h-11 items-center gap-2 border-b border-[#18372e]/35 px-1 text-sm font-black text-[#18372e]">{isZh ? "查看生产流程" : "View production process"}<ArrowRight className="size-4" /></Link>
            </div>
          </div>
          <div className="grid grid-cols-[1.25fr_.75fr] gap-3">
            <div className="relative min-h-[430px] overflow-hidden border border-[#cfc5b3]"><Image src={showcaseImages.machine} alt={isZh ? "科宏自动送料与纸板加工设备" : "Kehong automatic feeding and paperboard converting equipment"} fill priority sizes="(min-width: 1024px) 42vw, 65vw" className="object-cover" /></div>
            <div className="grid gap-3">
              <div className="relative min-h-0 overflow-hidden border border-[#cfc5b3]"><Image src={showcaseImages.machineClose} alt={isZh ? "科宏纸张输送与模切设备细节" : "Kehong paper feeding and die-cutting equipment detail"} fill sizes="(min-width: 1024px) 22vw, 32vw" className="object-cover" /></div>
              <div className="relative min-h-0 overflow-hidden border border-[#cfc5b3]"><Image src={showcaseImages.sampleRoom} alt={isZh ? "科宏包装样品展示" : "Kehong packaging sample display"} fill sizes="(min-width: 1024px) 22vw, 32vw" className="object-cover" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#132b24] px-4 py-12 text-white sm:px-6 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <div><p className="kh-section-kicker text-[#e8c06c]">{isZh ? "可核对的能力" : "Verified workflow points"}</p><h2 className="kh-editorial-heading mt-4 text-4xl leading-none sm:text-6xl">{isZh ? "把每个要求落到生产节点。" : "Requirements tied to production stages."}</h2></div>
            <p className="max-w-2xl text-base leading-8 text-white/70">{isZh ? "我们不展示未经证实的产能数字。项目确认基于材料、结构、加工与检验要求。" : "Project review is based on the material, structure, converting, and inspection requirements that can be confirmed for the order—without unsupported capacity claims."}</p>
          </div>
          <div className="mt-9 grid border-y border-white/15 md:grid-cols-2 xl:grid-cols-4">
            {capabilityCards.map((item) => { const Icon = item.icon; return <article key={item.title} className="border-b border-white/15 p-5 md:border-r xl:border-b-0"><Icon className="size-5 text-[#e8c06c]" /><h3 className="mt-5 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/68">{item.body}</p></article>; })}
          </div>
        </div>
      </section>
    </div>
  );
}
