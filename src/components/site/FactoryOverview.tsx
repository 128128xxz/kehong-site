import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyLegalName, companyProfile, FACTORY_ADDRESS, FACTORY_GOOGLE_MAPS_URL } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

const capabilityRows = [
  {
    title: "Material handling",
    titleZh: "材料处理",
    body: "Material, structure, converting, inspection and packing requirements are reviewed against the approved specification.",
    bodyZh: "按确认规格逐项核对材料、结构、加工、检验和包装要求。",
  },
  {
    title: "Converting equipment",
    titleZh: "加工设备",
    body: "Equipment and workflows are coordinated for each confirmed order.",
    bodyZh: "围绕已确认规格协调送料、分切、模切、压痕与裱纸。",
  },
  {
    title: "Structural sampling",
    titleZh: "结构打样",
    body: "Drawings, dimensions, folds and insert fit are reviewed through samples.",
    bodyZh: "批量生产前通过样品核对图纸、尺寸、折线与内衬贴合。",
  },
  {
    title: "Quality checkpoints",
    titleZh: "质检节点",
    body: "Key dimensions, finish, packing method and shipment preparation are confirmed step by step.",
    bodyZh: "在相应生产阶段确认关键尺寸、表面效果、装箱方式与出货准备。",
  },
] as const;

export default async function FactoryOverview() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <>
      <section className="kh-section">
        <div className="kh-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16">
          <Reveal>
            <SectionKicker index="02" text={isZh ? "厂区与设备" : "Site & equipment"} />
            <h2>{isZh ? "纸材加工、结构打样与成品包装，一体化交付。" : "From raw board to finished packaging in one plant."}</h2>
            <p className="kh-section-lede mt-5">
              {isZh
                ? "科宏可根据项目规格进行材料、结构、加工、检验与包装要求的核对与推进。"
                : `${companyLegalName} runs in-house lines for die-cutting, slitting, lamination, and corrugating, coordinating each project from material selection through shipment preparation.`}
            </p>
            <dl className="mt-8 grid gap-4 border-y border-(--kh-line) py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">{isZh ? "工厂所在地" : "Factory location"}</dt>
                <dd className="mt-1 text-(--kh-muted)">{isZh ? companyProfile.location.zh : companyProfile.location.en}</dd>
              </div>
              <div>
                <dt className="font-semibold">{isZh ? "生产支持" : "Production support"}</dt>
                <dd className="mt-1 text-(--kh-muted)">{isZh ? companyProfile.productionCapability.zh : companyProfile.productionCapability.en}</dd>
              </div>
            </dl>
            <a href={FACTORY_GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="kh-panel mt-4 flex items-start gap-3 p-4 transition hover:border-(--kh-forest)/45" aria-label={isZh ? "在 Google Maps 中查看科宏工厂位置" : "View Kehong factory location in Google Maps"}>
              <MapPin className="mt-0.5 size-5 shrink-0 text-(--kh-brass)" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-(--kh-ink)">{isZh ? "工厂地址" : "Factory address"}</span>
                <span className="mt-1 block text-sm leading-6 text-(--kh-muted)">{isZh ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}</span>
                <span className="mt-2 inline-flex text-sm font-semibold text-(--kh-forest)">{isZh ? "在 Google Maps 中查看" : "View in Google Maps"} <ArrowRight className="ml-1 size-4" /></span>
              </span>
            </a>
            <Link href="/process" className="kh-text-link mt-6 min-h-11 px-1">
              {isZh ? "查看生产流程" : "View production process"}
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-[1.25fr_.75fr] gap-3">
              <div className="kh-media-shade relative min-h-[430px] overflow-hidden rounded-lg border border-(--kh-line)">
                <Image
                  src={showcaseImages.machine}
                  alt={isZh ? "科宏自动送料与纸板加工设备" : "Kehong automatic feeding and paperboard converting equipment"}
                  fill
                  sizes="(min-width: 1024px) 42vw, 65vw"
                  className="object-cover"
                />
                <span className="kh-fig-caption kh-mono">{isZh ? "图01 — 自动送料产线" : "Fig.01 — Automatic feeder line"}</span>
              </div>
              <div className="grid gap-3">
                <div className="kh-media-shade relative min-h-0 overflow-hidden rounded-lg border border-(--kh-line)">
                  <Image
                    src={showcaseImages.machineClose}
                    alt={isZh ? "科宏纸张输送与模切设备细节" : "Kehong paper feeding and die-cutting equipment detail"}
                    fill
                    sizes="(min-width: 1024px) 22vw, 32vw"
                    className="object-cover"
                  />
                  <span className="kh-fig-caption kh-mono">{isZh ? "图02 — 模切细节" : "Fig.02 — Die-cutting detail"}</span>
                </div>
                <div className="kh-media-shade relative min-h-0 overflow-hidden rounded-lg border border-(--kh-line)">
                  <Image
                    src={showcaseImages.corrugatorHall}
                    alt={isZh ? "科宏瓦楞产线车间" : "Kehong corrugator hall"}
                    fill
                    sizes="(min-width: 1024px) 22vw, 32vw"
                    className="object-cover"
                  />
                  <span className="kh-fig-caption kh-mono">{isZh ? "图03 — 瓦楞产线" : "Fig.03 — Corrugator hall"}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="kh-section kh-section-forest">
        <div className="kh-shell">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <SectionKicker index="03" text={isZh ? "可核对的能力" : "Verified workflow points"} light />
                               <h2>{isZh ? "我们按确认规格逐项核对材料、加工、检验和包装要求。" : "We review material, structure, converting, inspection and packing requirements against the approved specification."}</h2>
              </div>
              <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                {isZh
                  ? "不展示未经核实的产能数据。我们按确认规格逐项核对材料、结构、加工与检验要求。"
                  : "We do not publish unverified capacity figures. We review material, structure, converting, inspection and packing requirements step by step against the confirmed specification."}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ol className="m-0 mt-10 list-none border-t border-white/15 p-0">
              {capabilityRows.map((item, index) => (
                <li key={item.title} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-white/15 py-6">
                  <b className="kh-mono text-(--kh-brass-soft)">{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <h3 className="m-0 text-xl font-semibold text-[#fffdf8]">{isZh ? item.titleZh : item.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{isZh ? item.bodyZh : item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>
    </>
  );
}
