import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

export default function HomeBuyerSupport({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const workflow = zh ? ["项目需求", "材料/结构评审", "样品确认", "生产"] : ["Brief", "Material / structure review", "Sample", "Production"];
  const checklist = zh ? ["产品类型", "尺寸", "材料", "数量", "印刷", "目的市场"] : ["Product type", "Size", "Material", "Quantity", "Printing", "Target market"];
  return (
    <section className="kh-section kh-section-muted border-y border-(--kh-line)">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="07" text={zh ? "买家支持与采购准备" : "Buyer support & sourcing preparation"} />
              <h2>{zh ? "提交产品、尺寸、材料和数量后，我们会确认打样与报价需要哪些信息。" : "Prepare the key details needed for sampling and quotation."}</h2>
            </div>
            <Link href="/resources" className="kh-text-link">{zh ? "打开资料中心" : "Open resources"}<ArrowRight className="size-4" /></Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Reveal className="h-full"><article className="kh-panel h-full p-6"><p className="kh-eyebrow">{zh ? "为什么选科宏" : "Why work with Kehong"}</p><h3 className="mt-3 text-xl font-semibold">{zh ? "纸材、半成品与成品包装由同一团队对接。" : "Source paper materials, semi-finished components and finished packaging through one Foshan team."}</h3><p className="mt-4 text-sm leading-6 text-(--kh-muted)">{zh ? "根据产品、尺寸、材料和数量，确认打样方案、加工方式和报价。" : "Share the product type, dimensions, material and quantity so our team can confirm the sampling and quotation requirements."}</p></article></Reveal>
          <Reveal className="h-full" delay={90}><article className="kh-panel h-full p-6"><p className="kh-eyebrow">{zh ? "询盘需要哪些资料" : "Buyer-ready quote checklist"}</p><div className="mt-4 grid grid-cols-2 gap-2">{checklist.map((item, index) => <span key={item} className="rounded-md bg-(--kh-paper) px-3 py-2 text-sm font-semibold text-(--kh-ink)">{String(index + 1).padStart(2, "0")} · {item}</span>)}</div><Link href="/contact" className="kh-text-link mt-5">{zh ? "提交项目需求" : "Start your brief"}<ArrowRight className="size-4" /></Link></article></Reveal>
          <Reveal className="h-full" delay={180}><article className="kh-panel h-full p-6"><p className="kh-eyebrow">{zh ? "打样与开发流程" : "Sample & development workflow"}</p><ol className="mt-4 grid gap-3">{workflow.map((item, index) => <li key={item} className="flex items-center gap-3 text-sm font-semibold text-(--kh-ink)"><span className="kh-mono grid size-7 place-items-center rounded-full bg-(--kh-paper-deep) text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></article></Reveal>
        </div>
        <Reveal>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-(--kh-forest) px-5 py-4 text-(--kh-surface)">
            <p className="text-sm font-semibold">{zh ? "已有尺寸、数量或设计稿？直接通过表单、WhatsApp 或 Email 发起询盘。" : "Have size, quantity or artwork ready? Start by form, WhatsApp or email."}</p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold"><Link href="/contact" className="inline-flex items-center gap-2 text-(--kh-brass-soft)">{zh ? "获取报价" : "Request a quote"}<ArrowRight className="size-4" /></Link><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2"><MessageCircle className="size-4" />WhatsApp</a><a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2"><Mail className="size-4" />Email</a></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
