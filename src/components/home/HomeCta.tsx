import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";
import WeChatContactButton from "@/components/site/WeChatContactButton";

const specRows = [
  { index: "01", en: "Product", zh: "产品" },
  { index: "02", en: "Dimensions", zh: "尺寸" },
  { index: "03", en: "Material", zh: "材料" },
  { index: "04", en: "Quantity", zh: "数量" },
  { index: "05", en: "Destination", zh: "目的地" },
] as const;

export default function HomeCta({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  return (
    <section className="kh-section kh-section-cta kh-home-cta">
      <Reveal mode="none"><div className="kh-keyline" aria-hidden="true" /></Reveal>
      <div className="kh-shell kh-cta-grid">
        <Reveal>
          <SectionKicker index="07" text={zh ? "询盘" : "Request a quote"} light />
          <h2 className="">{zh ? "提交项目资料，获取打样或报价建议" : "Share your packaging details for a quote"}</h2>
          <p className="kh-section-lede" style={{ color: "rgba(255,253,248,.75)" }}>
            {zh ? "请提供产品类型、尺寸、材料、数量和目的地。" : "Please include the product, dimensions, material, quantity and destination."}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="kh-spec-panel">
            <p className="kh-eyebrow kh-eyebrow-light">{zh ? "询盘准备" : "Inquiry checklist"}</p>
            <div role="list">
              {specRows.map((row) => (
                <div role="listitem" className="kh-spec-row" key={row.index}><b>{row.index}</b><span>{zh ? row.zh : row.en}</span></div>
              ))}
            </div>
            <div className="kh-cta-actions">
              <Link className="kh-button kh-button-light" href="/contact">{zh ? "立即询价" : "Request a quote"}<ArrowRight className="size-4" /></Link>
              {zh ? <><WeChatContactButton phone={contact.phone.zh} label="微信咨询" copiedLabel="手机号已复制" className="kh-button kh-button-ghost" /><a className="kh-button kh-button-ghost" href="tel:+8615888233221"><Phone className="size-4" />电话</a></> : <a className="kh-button kh-button-ghost" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />WhatsApp</a>}
            </div>
            <div className="kh-final-links">
              <Link href="/resources/artwork-guidelines">{zh ? "设计稿指南" : "Artwork guide"}</Link>
              <Link href="/resources/dielines-templates">{zh ? "申请刀模图" : "Dieline request"}</Link>
              <Link href="/resources">{zh ? "全部资源" : "All resources"}</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
