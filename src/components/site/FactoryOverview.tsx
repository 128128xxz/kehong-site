import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyProfile } from "@/data/company";
import { FACTORY_ADDRESS, FACTORY_MAP_LABEL, getFactoryLocationUrl } from "@/data/companyLocation";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import FactoryLocationCard from "@/components/site/FactoryLocationCard";

const capabilityRows = [
  {
    title: "Material handling",
    titleZh: "材料处理",
    body: "Prepare material, structure, converting, inspection and packing against the approved specification.",
    bodyZh: "按确认的材料、结构、加工、检验和包装要求组织生产。",
  },
  {
    title: "Converting process",
    titleZh: "加工工序",
    body: "Arrange feeding, slitting, die-cutting, creasing and paper mounting for the required structure.",
    bodyZh: "根据产品结构安排送料、分切、模切、压痕和裱纸。",
  },
  {
    title: "Structural sampling",
    titleZh: "结构打样",
    body: "Check drawings, dimensions, fold lines and insert fit before mass production.",
    bodyZh: "批量生产前通过样品核对图纸、尺寸、折线和内托配合。",
  },
  {
    title: "Quality checkpoints",
    titleZh: "质检节点",
    body: "Inspect key dimensions, surface finish, forming and packing at the relevant production stages.",
    bodyZh: "在模切、成型和装箱阶段检查关键尺寸、表面效果和包装方式。",
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
            <h2>{isZh ? "按确认规格安排纸材加工与包装工序。" : "Paper converting and packaging stages arranged to the approved specification."}</h2>
            <p className="kh-section-lede mt-5">
              {isZh
                ? "科宏位于广东佛山，可根据产品结构和规格要求安排选材、结构打样、纸材加工、后道工艺、质量检查和出货准备。"
                : "Kehong is based in Foshan and arranges material selection, structural sampling, paper converting, finishing, quality checks and shipment preparation according to product structure and specification requirements."}
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
            <FactoryLocationCard
              className="mt-4"
              locale={locale}
              sourceBlock="factory"
              mapProvider={isZh ? "baidu_geocoder" : "google_directions"}
              href={getFactoryLocationUrl(locale)}
              title={isZh ? "工厂地址" : "Factory address"}
              mapLabel={isZh ? FACTORY_MAP_LABEL.zh : FACTORY_MAP_LABEL.en}
              address={isZh ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}
              viewLabel={isZh ? "查看位置" : "View location"}
              copyLabel={isZh ? "复制地址" : "Copy address"}
              copiedLabel={isZh ? "地址已复制" : "Copied"}
            />
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
                <SectionKicker index="03" text={isZh ? "生产与质量控制" : "Production & quality control"} light />
                <h2>{isZh ? "按图纸和规格组织加工，并在关键工序完成检查。" : "Production follows the approved drawing and specification, with checks at key stages."}</h2>
              </div>
              <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                {isZh
                  ? "生产过程中检查材料、尺寸、表面效果、成型状态和装箱方式。"
                  : "Inspect material, dimensions, surface finish, forming and packing at the relevant production stages."}
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
