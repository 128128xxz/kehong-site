import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyLegalName, companyProfile, contact } from "@/data/company";

/** Chinese display form of `companyLegalName` (company.ts stores the English registration only). */
const companyLegalNameZh = "佛山科宏纸品有限公司";

export default async function SiteFooter() {
  const locale = await getLocale();
  const zh = locale === "zh";
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="kh-footer">
      <div className="kh-shell kh-footer-grid">
        <div>
          <p className="kh-footer-brand">KH</p>
          <h2>{zh ? companyLegalNameZh : companyLegalName}</h2>
          <p className="kh-footer-note">
            {zh
              ? "纸材加工、结构打样与定制包装，由佛山团队协调支持海外项目。"
              : "Paper converting, structural sampling and custom packaging coordinated by one Foshan team."}
          </p>
          <div className="kh-footer-contact">
            <span>{zh ? companyProfile.location.zh : companyProfile.location.en}</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
        <div className="kh-footer-links">
          <div>
            <p>{zh ? "产品与解决方案" : "Products & solutions"}</p>
            <Link href="/products">{zh ? "产品目录" : "All products"}</Link>
            <Link href="/solutions">{zh ? "解决方案" : "Solutions"}</Link>
            <Link href="/industries">{zh ? "行业应用" : "Industries"}</Link>
          </div>
          <div>
            <p>{zh ? "能力与资源" : "Capabilities & resources"}</p>
            <Link href="/capabilities">{zh ? "制造能力" : "Capabilities"}</Link>
            <Link href="/factory">{zh ? "工厂与流程" : "Factory & process"}</Link>
            <Link href="/resources">{zh ? "资源中心" : "Design center"}</Link>
            <Link href="/model-preview">{zh ? "3D 结构预览" : "3D structure studio"}</Link>
          </div>
        </div>
        <div className="kh-footer-quote">
          <p>{zh ? "准备开始一个项目？" : "Ready to discuss a project?"}</p>
          <Link className="kh-button kh-button-light" href="/contact">
            {zh ? "提交询盘" : "Request a quote"}
            <ArrowRight className="size-4" />
          </Link>
          <div className="kh-footer-actions">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
            <a href={`mailto:${contact.email}`}>
              <Mail className="size-4" />
              {zh ? "邮箱" : "Email"}
            </a>
          </div>
        </div>
      </div>
      <div className="kh-shell kh-footer-bottom">
        <span>© {new Date().getFullYear()} {zh ? "科宏纸品" : "Kehong"}</span>
        <Link href="/privacy">{zh ? "隐私政策" : "Privacy"}</Link>
        <Link href="/terms">{zh ? "使用条款" : "Terms"}</Link>
      </div>
    </footer>
  );
}
