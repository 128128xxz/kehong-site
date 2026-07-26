import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import { capabilities, complianceDocuments, processSteps } from "@/data/siteContent";

const capabilityZh: Record<string, { title: string; summary: string; buyerValue: string; input: string }> = {
  "structural-design": {
    title: "结构设计",
    summary: "报价前核对产品占位、开合、支撑与装箱顺序。",
    buyerValue: "更清晰的结构简报，减少贴合与组装意外。",
    input: "产品尺寸、参考图或现有刀线图。",
  },
  "artwork-prepress": {
    title: "稿件与印前",
    summary: "对照已确认结构核对稿件、印刷区域与版本记录。",
    buyerValue: "生产文件推进前，团队清楚哪些点需要确认。",
    input: "稿件、品牌色、Logo 文件与目标印刷方式。",
  },
  "prototyping": {
    title: "打样",
    summary: "通过结构样核对尺寸、贴合、开合与手感后再投产。",
    buyerValue: "样品把包装想法变成可评审的实物方向。",
    input: "目标尺寸、产品样或参考结构。",
  },
  "printing-finishing": {
    title: "印刷与后工艺",
    summary: "围绕材料与结构确认印刷方向与可用表面处理。",
    buyerValue: "工艺决定与基材、稿件和使用场景保持一致。",
    input: "印刷颜色、参考工艺与应用优先级。",
  },
  "die-cutting-assembly": {
    title: "模切与组装",
    summary: "把版面、折线、切线、粘合与组装要求当作一个流程核对。",
    buyerValue: "清晰的结构交接支撑可重复的加工与装箱。",
    input: "刀线图、结构图或实物参考。",
  },
  "quality-control": {
    title: "质量控制",
    summary: "贯穿项目的规格、稿件、尺寸、后工艺与终检核对。",
    buyerValue: "质检节点对应项目简报，而非泛泛承诺。",
    input: "已确认规格、稿件与检验优先级。",
  },
  "packing-export-support": {
    title: "包装与出口支持",
    summary: "为海外 B2B 项目协调装箱信息与目的地要求。",
    buyerValue: "产品、装箱与目的地信息保持对齐交接。",
    input: "目的国、装箱偏好与运输简报。",
  },
};

const processZh: Record<string, { title: string; body: string }> = {
  "01": { title: "询盘", body: "提供产品、尺寸、数量与目标市场。" },
  "02": { title: "结构评审", body: "确认材料方向、形式、开合、贴合与项目约束。" },
  "03": { title: "打样", body: "按项目需要评审结构样或项目样。" },
  "04": { title: "生产", body: "把已确认规格投入印刷、加工与组装。" },
  "05": { title: "质量检验", body: "装箱与出货前核对既定检验节点。" },
  "06": { title: "出口交接", body: "对齐装箱、目的地与单证细节后发货。" },
};

export default function CapabilitiesPage({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const qualityChecks = isZh
    ? ["来料检验", "稿件与尺寸核对", "装箱终检"]
    : ["Incoming material inspection", "Artwork and dimension check", "Final packing inspection"];

  return (
    <div className="kh-premium-site texture-paper min-h-screen text-(--kh-ink)">
      <Header />
      <main>
        <PageHero
          index="01"
          kicker={isZh ? "科宏 · 制造能力" : "Kehong · Manufacturing capabilities"}
          title={isZh ? "把包装需求拆成可确认的制造步骤" : "Capabilities that turn a packaging brief into a production path."}
          lede={
            isZh
              ? "从结构、文件和打样，到印刷、后加工、质检和出口协作，按项目需求确认每个环节。"
              : "From structure, artwork and sampling through printing, finishing, quality checks and export coordination, each capability is reviewed around the project brief."
          }
          meta={
            isZh
              ? [`${capabilities.length} 项核心能力`, "OEM / ODM", "中国广东佛山"]
              : [`${capabilities.length} core capabilities`, "OEM / ODM", "Foshan, Guangdong, China"]
          }
        >
          <Link href="/contact" className="kh-button kh-button-light">
            {isZh ? "获取定制报价" : "Get a custom quote"}
          </Link>
          <Link href="/process" className="kh-button kh-button-ghost">
            {isZh ? "查看生产流程" : "View production process"}
          </Link>
        </PageHero>

        <section className="kh-section">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="02" text={isZh ? "制造能力" : "Manufacturing capabilities"} />
                  <h2>{isZh ? "七项能力，覆盖从简报到出货。" : "Seven capabilities, from brief to dispatch."}</h2>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <ol className="m-0 grid list-none gap-x-14 border-t border-(--kh-line) p-0 md:grid-cols-2">
                {capabilities.map((item, index) => {
                  const zh = capabilityZh[item.slug];
                  return (
                    <li key={item.slug} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-(--kh-line) py-6">
                      <b className="kh-mono text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</b>
                      <div>
                        <h3 className="m-0 text-xl font-semibold">{isZh && zh ? zh.title : item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{isZh && zh ? zh.summary : item.summary}</p>
                        <p className="mt-2 border-l-2 border-(--kh-brass-soft) pl-3 text-sm font-semibold leading-6">
                          {isZh && zh ? zh.buyerValue : item.buyerValue}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-(--kh-muted)">
                          <strong>{isZh ? "需提供：" : "Bring: "}</strong>
                          {isZh && zh ? zh.input : item.input}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-muted">
          <div className="kh-shell">
            <Reveal>
              <div className="kh-section-heading">
                <div>
                  <SectionKicker index="03" text={isZh ? "定制包装流程" : "Custom packaging process"} />
                  <h2>{isZh ? "从询盘到出货，每一步都可追踪" : "A clear path from inquiry to export handoff."}</h2>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <ol className="m-0 grid list-none gap-x-14 border-t border-(--kh-line) p-0 md:grid-cols-2">
                {processSteps.map((step) => {
                  const zh = processZh[step.number];
                  return (
                    <li key={step.number} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-(--kh-line) py-6">
                      <b className="kh-mono text-(--kh-brass)">{step.number}</b>
                      <div>
                        <h3 className="m-0 text-xl font-semibold">{isZh && zh ? zh.title : step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-(--kh-muted)">{isZh && zh ? zh.body : step.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-forest">
          <div className="kh-shell">
            <Reveal>
              <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
                <div>
                  <SectionKicker index="04" text={isZh ? "质量与合规" : "Quality & compliance"} light />
                  <h2>{isZh ? "质量控制与第三方检测" : "Quality control and third-party testing"}</h2>
                </div>
                <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                  {isZh
                    ? "合规文件可按需提供。分享前将根据项目记录确认检测范围、出具机构与日期。"
                    : "Compliance documents are available upon request. Test scope, issuing body and date are confirmed against relevant project records before sharing."}
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <ol className="m-0 mt-10 list-none border-t border-white/15 p-0">
                {qualityChecks.map((item, index) => (
                  <li key={item} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-white/15 py-5">
                    <b className="kh-mono text-(--kh-brass-soft)">{String(index + 1).padStart(2, "0")}</b>
                    <h3 className="m-0 text-lg font-semibold text-[#fffdf8]">{item}</h3>
                  </li>
                ))}
              </ol>
              <p className="kh-mono mt-6 text-white/60">
                {isZh
                  ? `已配置 ${complianceDocuments.length} 条合规文件通道，不公开展示未经核实的证书`
                  : `${complianceDocuments.length} compliance document pathway configured; no unverified certificate is displayed publicly`}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="kh-section kh-section-cta">
          <Reveal mode="none">
            <div className="kh-keyline" aria-hidden="true" />
          </Reveal>
          <div className="kh-shell">
            <Reveal>
              <SectionKicker index="05" text={isZh ? "开始一个包装项目" : "Start a packaging project"} light />
              <h2>{isZh ? "准备好评审一个结构了吗？" : "Ready to review a structure?"}</h2>
              <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
                {isZh
                  ? "发来尺寸、图纸、材料偏好与目的地信息，科宏会确认下一步的实际动作。"
                  : "Send dimensions, drawings, material preferences and destination details. Kehong will confirm the next practical step."}
              </p>
              <div className="kh-actions mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="kh-button kh-button-light">
                  {isZh ? "提交项目需求" : "Start a packaging project"}
                </Link>
                <Link href="/products" className="kh-button kh-button-ghost">
                  {isZh ? "查看产品规格" : "Browse products"}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
