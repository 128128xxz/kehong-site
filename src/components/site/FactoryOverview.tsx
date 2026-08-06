import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyLegalName, companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

const capabilityRows = [
  {
    title: "Material handling",
    titleZh: "材料处理",
    body: "Paper grade, board construction, coating, and converting requirements are reviewed against the intended packaging structure.",
    bodyZh: "按目标包装结构核对纸张等级、纸板结构、涂层与加工要求。",
  },
  {
    title: "Converting equipment",
    titleZh: "加工设备",
    body: "Paper feeding, slitting, die-cutting, creasing, and lamination are coordinated around the approved specification.",
    bodyZh: "围绕已确认规格协调送料、分切、模切、压痕与裱纸。",
  },
  {
    title: "Structural sampling",
    titleZh: "结构打样",
    body: "Drawings, dimensions, folds, and insert fit are checked through samples before batch production.",
    bodyZh: "批量生产前，通过样品核对图纸、尺寸、折线与内衬贴合。",
  },
  {
    title: "Quality checkpoints",
    titleZh: "质检节点",
    body: "Key dimensions, finish, packing method, and shipment preparation are confirmed at the relevant production stages.",
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
            <h2>{isZh ? "从纸材到成品，同一座工厂完成。" : "From raw board to finished packaging in one plant."}</h2>
            <p className="kh-section-lede mt-5">
              {isZh
                ? "从选材、结构打样到加工和出货准备，科宏按项目规格跟进纸包装项目；模切、分切、裱纸和瓦楞成型能力以具体项目确认为准。"
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
                <h2>{isZh ? "逐项确认材料、加工、检验和包装要求。" : "Confirm material, converting, inspection and packing requirements step by step."}</h2>
              </div>
              <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                {isZh
                  ? "我们不展示未经证实的产能数字。项目确认基于材料、结构、加工与检验要求。"
                  : "Project review is based on the material, structure, converting, and inspection requirements that can be confirmed for the order, without unsupported capacity claims."}
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
