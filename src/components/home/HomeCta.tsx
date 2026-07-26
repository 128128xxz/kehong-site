import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contact, companyProfile } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

const specRows = [
  { index: "01", en: "Dimensions & structure", zh: "尺寸与结构" },
  { index: "02", en: "Material & grammage", zh: "材料与克重" },
  { index: "03", en: "Quantity & schedule", zh: "数量与交期" },
  { index: "04", en: "Target market", zh: "目标市场" },
] as const;

export default function HomeCta({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <section className="kh-section kh-section-cta">
      <Reveal mode="none">
        <div className="kh-keyline" aria-hidden="true" />
      </Reveal>
      <div className="kh-cta-watermark" aria-hidden="true">
        <Image src={showcaseImages.honeycomb} alt="" width={340} height={425} className="object-cover" />
      </div>

      <div className="kh-shell kh-cta-grid">
        <Reveal>
          <SectionKicker index="07" text={zh ? "开始一个包装项目" : "Start a packaging project"} light />
          <h2>
            {zh
              ? "把尺寸、材料和目标市场，交给一张规格单。"
              : "Put dimensions, material and market on one spec sheet."}
          </h2>
          <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
            {zh
              ? "发来基础参数，科宏团队按项目流程回复打样与报价的下一步。"
              : "Send the basics and the Kehong team replies with the next step for sampling or a quotation."}
          </p>
          <p className="kh-cta-note kh-mono">
            {contact.email} · {zh ? companyProfile.location.zh : companyProfile.location.en}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="kh-spec-panel">
            <p className="kh-eyebrow kh-eyebrow-light">{zh ? "报价所需信息" : "Quote checklist"}</p>
            <div role="list">
              {specRows.map((row) => (
                <div role="listitem" className="kh-spec-row" key={row.index}>
                  <b>{row.index}</b>
                  <span>{zh ? row.zh : row.en}</span>
                </div>
              ))}
            </div>
            <div className="kh-cta-actions">
              <Link className="kh-button kh-button-light" href="/contact">
                {zh ? "提交询盘" : "Request a quote"}
                <ArrowRight className="size-4" />
              </Link>
              <a className="kh-button kh-button-ghost" href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
