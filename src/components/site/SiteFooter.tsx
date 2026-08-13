import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyDisplayName, contact, socialLinks } from "@/data/company";
import { FACTORY_ADDRESS, getFactoryLocationUrl } from "@/data/companyLocation";
import LocationClickAnchor from "@/components/site/LocationClickAnchor";
import SiteLogo from "@/components/site/SiteLogo";
import WeChatContactButton from "@/components/site/WeChatContactButton";

type IconProps = { className?: string };

/** 品牌图标(当前 lucide 版本已移除品牌图标,统一内联简形) */
function LinkedinIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v2" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.5 17a24.1 24.1 0 0 0 0-10 2 2 0 0 0-1.4-1.4 49.6 49.6 0 0 0-18.2 0A2 2 0 0 0 1.5 7a24.1 24.1 0 0 0 0 10 2 2 0 0 0 1.4 1.4 49.6 49.6 0 0 0 18.2 0 2 2 0 0 0 1.4-1.4Z" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

/** X/Twitter(内联简形) */
function XIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

/** TikTok(lucide 无此品牌图标,内联简形) */
function TikTokIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const socialEntries = [
  { key: "linkedin", label: "LinkedIn", href: socialLinks.linkedin, Icon: LinkedinIcon },
  { key: "facebook", label: "Facebook", href: socialLinks.facebook, Icon: FacebookIcon },
  { key: "instagram", label: "Instagram", href: socialLinks.instagram, Icon: InstagramIcon },
  { key: "youtube", label: "YouTube", href: socialLinks.youtube, Icon: YoutubeIcon },
  { key: "x", label: "X (Twitter)", href: socialLinks.x, Icon: XIcon },
  { key: "tiktok", label: "TikTok", href: socialLinks.tiktok, Icon: TikTokIcon },
] as const;

export default async function SiteFooter() {
  const locale = await getLocale();
  const zh = locale === "zh";
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(zh ? "科宏纸品询盘" : "Kehong packaging inquiry")}`;

  return (
    <footer className="kh-footer">
      <div className="kh-shell kh-footer-grid">
        <div>
          <SiteLogo locale={locale} placement="footer" />
          <h2>{zh ? companyDisplayName.zh : companyDisplayName.en}</h2>
          <p className="kh-footer-note">
            {zh
              ? "纸材加工、结构打样和定制包装服务"
              : "Paper converting, structural sampling and custom packaging from our Foshan team."}
          </p>
          <div className="kh-footer-contact">
            <span>{zh ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}</span>
            <a href={emailHref} aria-label={zh ? `发送邮件至 ${contact.email}` : `Email ${contact.email}`}>{contact.email}</a>
            {zh ? <a href="tel:+8615888233221" aria-label={`拨打电话 ${contact.phone.zh}`}>{contact.phone.zh}</a> : <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Contact Kehong on WhatsApp">WhatsApp</a>}
          </div>
        </div>
        <div className="kh-footer-links">
            <details className="kh-footer-group" open>
            <summary>{zh ? "产品与解决方案" : "Products & solutions"}</summary>
            <div>
              <Link href="/products">{zh ? "产品目录" : "All products"}</Link>
              <Link href="/solutions">{zh ? "解决方案" : "Solutions"}</Link>
              <Link href="/industries">{zh ? "行业应用" : "Industries"}</Link>
            </div>
          </details>
            <details className="kh-footer-group" open>
            <summary>{zh ? "能力与资源" : "Capabilities & resources"}</summary>
            <div>
              <Link href="/capabilities">{zh ? "制造能力" : "Capabilities"}</Link>
              <Link href="/factory">{zh ? "工厂和流程" : "Factory & process"}</Link>
              <Link href="/news">{zh ? "新闻与洞察" : "News & Insights"}</Link>
              <Link href="/resources">{zh ? "资源中心" : "Design center"}</Link>
              <Link href="/model-preview">{zh ? "3D 结构预览" : "3D structure studio"}</Link>
            </div>
          </details>
        </div>
        <div className="kh-footer-quote">
          <p>{zh ? "准备启动项目？" : "Ready to discuss a project?"}</p>
          <Link data-testid="site-footer-quote" className="kh-button kh-button-light" href="/contact">
            {zh ? "提交询价" : "Request a quote"}
            <ArrowRight className="size-4" />
          </Link>
          <div className="kh-footer-actions">
            {zh ? <WeChatContactButton phone={contact.phone.zh} label="微信咨询" copiedLabel="手机号已复制" className="kh-footer-action-button" /> : <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Contact Kehong on WhatsApp"><MessageCircle className="size-4" />WhatsApp</a>}
            <a href={zh ? "tel:+8615888233221" : "tel:+447599669700"} aria-label={zh ? `拨打电话 ${contact.phone.zh}` : `Call ${contact.phone.en}`}>
              {zh ? "电话" : "Call"} · {zh ? contact.phone.zh : contact.phone.en}
            </a>
            <a href={emailHref} aria-label={zh ? `发送邮件至 ${contact.email}` : `Email ${contact.email}`}>
              <Mail className="size-4" />
              {zh ? "Email" : "Email"}
            </a>
            <LocationClickAnchor href={getFactoryLocationUrl(locale)} locale={locale} sourceBlock="footer" mapProvider={zh ? "baidu_geocoder" : "google_directions"} target="_blank" rel="noopener noreferrer" aria-label={zh ? "查看科宏纸品工厂位置" : "View Kehong factory location"}>
              {zh ? "查看位置" : "View location"}
            </LocationClickAnchor>
          </div>
          <div className="kh-social" aria-label={zh ? "社交媒体" : "Social media"}>
            {socialEntries.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href || `/${locale}`}
                aria-label={label}
                title={href ? label : `${label}${zh ? " · 返回首页" : " · Return home"}`}
                {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon className="size-4" />
              </a>
            ))}
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
