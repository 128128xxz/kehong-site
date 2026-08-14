import {
  BookOpen,
  Factory,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Package,
  Phone,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { companyDisplayName, contact, socialLinks } from "@/data/company";
import { FACTORY_ADDRESS, getFactoryLocationUrl } from "@/data/companyLocation";
import LocationClickAnchor from "@/components/site/LocationClickAnchor";
import SiteLogo from "@/components/site/SiteLogo";
import WeChatContactButton from "@/components/site/WeChatContactButton";
import { GlassSurface } from "@/components/ui/glass/GlassSurface";

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
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(zh ? `${companyDisplayName.zh}询盘` : `${companyDisplayName.en} packaging inquiry`)}`;

  return (
    <footer className="kh-footer">
      <div className="kh-shell kh-footer-grid">
        <div className="kh-footer-brand-column">
          <SiteLogo locale={locale} placement="footer" />
          <h2>{zh ? companyDisplayName.zh : companyDisplayName.en}</h2>
          <p className="kh-footer-note">
            {zh
              ? "纸材加工、结构打样和定制包装服务"
              : "Paper converting, structural sampling and custom packaging from our Foshan team"}
          </p>
        </div>
        <div className="kh-footer-links">
            <details className="kh-footer-group" open>
            <summary><Package className="kh-footer-heading-icon" aria-hidden="true" />{zh ? "产品与解决方案" : "Products & solutions"}</summary>
            <div>
              <Link href="/products"><Package aria-hidden="true" />{zh ? "产品目录" : "All products"}</Link>
              <Link href="/solutions"><Lightbulb aria-hidden="true" />{zh ? "解决方案" : "Solutions"}</Link>
              <Link href="/industries"><Factory aria-hidden="true" />{zh ? "行业应用" : "Industries"}</Link>
            </div>
          </details>
            <details className="kh-footer-group" open>
            <summary><BookOpen className="kh-footer-heading-icon" aria-hidden="true" />{zh ? "能力与资源" : "Capabilities & resources"}</summary>
            <div>
              <Link href="/capabilities"><Factory aria-hidden="true" />{zh ? "制造能力" : "Capabilities"}</Link>
              <Link href="/factory"><MapPin aria-hidden="true" />{zh ? "工厂和流程" : "Factory & process"}</Link>
              <Link href="/news"><Newspaper aria-hidden="true" />{zh ? "新闻与洞察" : "News & Insights"}</Link>
              <Link href="/resources"><BookOpen aria-hidden="true" />{zh ? "资源中心" : "Design center"}</Link>
              <Link href="/model-preview"><Package aria-hidden="true" />{zh ? "3D结构展厅" : "3D Packaging Studio"}</Link>
            </div>
          </details>
        </div>
        <GlassSurface variant="contact-card" tone="dark" className="kh-footer-contact-column kh-glass-footer-card">
          <p className="kh-footer-column-label">{zh ? "联系我们" : "Contact us"}</p>
          <div className="kh-footer-contact">
            <LocationClickAnchor
              href={getFactoryLocationUrl(locale)}
              locale={locale}
              sourceBlock="footer"
              mapProvider={zh ? "baidu_directions" : "google_directions"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={zh ? `在地图中查看${FACTORY_ADDRESS.zh}` : `Open ${FACTORY_ADDRESS.en} in maps`}
              className="kh-footer-contact-link"
              data-testid="footer-address-link"
            >
              <MapPin aria-hidden="true" />
              <span>{zh ? FACTORY_ADDRESS.zh : FACTORY_ADDRESS.en}</span>
            </LocationClickAnchor>
            <a href={zh ? "tel:+8615888233221" : "tel:+447599669700"} aria-label={zh ? `拨打电话 ${contact.phone.zh}` : `Call ${contact.phone.en}`}><Phone aria-hidden="true" />{zh ? contact.phone.zh : contact.phone.en}</a>
            <a href={emailHref} aria-label={zh ? `发送邮件至 ${contact.email}` : `Email ${contact.email}`}><Mail aria-hidden="true" />{contact.email}</a>
            {zh ? <WeChatContactButton phone={contact.phone.zh} label="微信咨询" copiedLabel="手机号已复制" className="kh-footer-wechat inline-flex min-h-11 items-center gap-2 border-0 bg-transparent p-0" /> : <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`Contact ${companyDisplayName.en} on WhatsApp`}><MessageCircle className="size-4" />WhatsApp</a>}
          </div>
        </GlassSurface>
      </div>
      <div className="kh-shell kh-footer-bottom">
        <div className="kh-social" aria-label={zh ? "社交媒体" : "Social media"}>
          {socialEntries.map(({ key, label, href, Icon }) => (
            <a key={key} href={href || `/${locale}`} aria-label={label} title={href ? label : `${label}${zh ? " · 返回首页" : " · Return home"}`} {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <Icon className="size-4" />
            </a>
          ))}
        </div>
        <div className="kh-footer-legal-links">
          <span>© {new Date().getFullYear()} {zh ? companyDisplayName.zh : companyDisplayName.en}</span>
          <Link href="/privacy">{zh ? "隐私政策" : "Privacy"}</Link>
          <Link href="/terms">{zh ? "使用条款" : "Terms"}</Link>
        </div>
      </div>
    </footer>
  );
}
