import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { Reveal } from "@/components/home/interactive";
import { SectionKicker } from "@/components/home/annotations";

export default function HomeBuyerSupport({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const workflow = zh ? ["项目需求", "材料 / 结构评审", "样品确认", "生产协同"] : ["Brief", "Material / structure review", "Sample", "Production"];
  const checklist = zh ? ["产品类型", "尺寸", "材料", "数量", "印刷", "目的市场"] : ["Product type", "Size", "Material", "Quantity", "Printing", "Target market"];
  return (
    <section className="kh-section kh-section-muted border-y border-(--kh-line)">
      <div className="kh-shell">
        <Reveal>
          <div className="kh-section-heading">
            <div>
              <SectionKicker index="07" text={zh ? "买家支持与采购准备" : "Buyer support & sourcing preparation"} />
              <h2>{zh ? "从首次需求到打样，信息始终在同一条路径里。" : "Move from first brief to sample with one clear handoff path."}</h2>
            </div>
            <Link href="/resources" className="kh-text-link">{zh ? "打开资料中心" : "Open resources"}<ArrowRight className="size-4" /></Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Reveal className="h-full"><article className="kh-panel h-full p-6"><p className="kh-eyebrow">{zh ? "为什么选择科宏" : "Why work with Kehong"}</p><h3 className="mt-3 text-xl font-semibold">{zh ? "纸材与成品包装，在一个项目窗口协同。" : "Paper materials and finished packaging, coordinated in one project window."}</h3><p className="mt-4 text-sm leading-6 text-(--kh-muted)">{zh ? "从加工、结构打样到 OEM / ODM 与出口协同，先围绕项目需求确认下一步。" : "In-house converting support, structural sampling, OEM / ODM and export coordination begin with the project brief."}</p></article></Reveal>
          <Reveal className="h-full" delay={90}><article className="kh-panel h-full p-6"><p className="kh-eyebrow">{zh ? "询盘资料清单" : "Buyer-ready quote checklist"}</p><div className="mt-4 grid grid-cols-2 gap-2">{checklist.map((item, index) => <span key={item} className="rounded-md bg-(--kh-paper) px-3 py-2 text-sm font-semibold text-(--kh-ink)">{String(index + 1).padStart(2, "0")} · {item}</span>)}</div><Link href="/contact" className="kh-text-link mt-5">{zh ? "提交项目需求" : "Start your brief"}<ArrowRight className="size-4" /></Link></article></Reveal>
          <Reveal className="h-full" delay={180}><article className="kh-panel h-full p-6"><p className="kh-eyebrow">{zh ? "打样与开发流程" : "Sample & development workflow"}</p><ol className="mt-4 grid gap-3">{workflow.map((item, index) => <li key={item} className="flex items-center gap-3 text-sm font-semibold text-(--kh-ink)"><span className="kh-mono grid size-7 place-items-center rounded-full bg-(--kh-paper-deep) text-(--kh-brass)">{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></article></Reveal>
        </div>
        <Reveal>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-(--kh-forest) px-5 py-4 text-(--kh-surface)">
            <p className="text-sm font-semibold">{zh ? "准备好尺寸、数量或设计稿？可从表单、WhatsApp 或邮箱开始。" : "Have size, quantity or artwork ready? Start by form, WhatsApp or email."}</p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold"><Link href="/contact" className="inline-flex items-center gap-2 text-(--kh-brass-soft)">{zh ? "获取报价" : "Request a quote"}<ArrowRight className="size-4" /></Link><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2"><MessageCircle className="size-4" />WhatsApp</a><a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2"><Mail className="size-4" />Email</a></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
