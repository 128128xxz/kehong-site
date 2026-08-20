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
import { companyDisplayName, socialLinks } from "@/data/company";
import { FACTORY_ADDRESS, getFactoryLocationUrl } from "@/data/companyLocation";
import LocationClickAnchor from "@/components/site/LocationClickAnchor";
import SiteLogo from "@/components/site/SiteLogo";
import WeChatContactButton from "@/components/site/WeChatContactButton";
import PrivacySettingsButton from "@/components/site/PrivacySettingsButton";
import { GlassSurface } from "@/components/ui/glass/GlassSurface";
import { mailtoHref, publicContact, telHref, whatsappHref } from "@/config/company-public";

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

const footerCopy = {
  en: { note: "Paper converting, structural sampling and custom packaging from our Foshan team", products: "Products & solutions", allProducts: "All products", solutions: "Solutions", industries: "Industries", capabilities: "Capabilities & resources", capabilitiesLink: "Capabilities", factory: "Factory & process", news: "News & Insights", resources: "Design center", studio: "3D Packaging Studio", contact: "Contact us", social: "Social media", returnHome: " · Return home", privacy: "Privacy", terms: "Terms", trackingSettings: "Privacy settings" },
  zh: { note: "纸材加工、结构打样和定制包装服务", products: "产品与解决方案", allProducts: "产品目录", solutions: "解决方案", industries: "行业应用", capabilities: "能力与资源", capabilitiesLink: "制造能力", factory: "工厂和流程", news: "新闻与洞察", resources: "资源中心", studio: "3D结构展厅", contact: "联系我们", social: "社交媒体", returnHome: " · 返回首页", privacy: "隐私政策", terms: "使用条款", trackingSettings: "隐私设置" },
  id: { note: "Pengolahan kertas, pembuatan struktur dan pembungkusan tersuai daripada pasukan Foshan kami", products: "Produk & solusi", allProducts: "Semua produk", solutions: "Solusi", industries: "Industri", capabilities: "Keupayaan & sumber", capabilitiesLink: "Keupayaan", factory: "Kilang & proses", news: "Berita & wawasan", resources: "Pusat sumber", studio: "Studio pembungkusan 3D", contact: "Hubungi kami", social: "Media sosial", returnHome: " · Kembali ke beranda", privacy: "Privasi", terms: "Ketentuan", trackingSettings: "Pengaturan privasi" },
  vi: { note: "Gia công giấy, làm mẫu cấu trúc và bao bì tùy chỉnh từ đội ngũ Foshan", products: "Sản phẩm & giải pháp", allProducts: "Tất cả sản phẩm", solutions: "Giải pháp", industries: "Ngành ứng dụng", capabilities: "Năng lực & tài nguyên", capabilitiesLink: "Năng lực", factory: "Nhà máy & quy trình", news: "Tin tức & insights", resources: "Trung tâm tài nguyên", studio: "Studio bao bì 3D", contact: "Liên hệ", social: "Mạng xã hội", returnHome: " · Về trang chủ", privacy: "Quyền riêng tư", terms: "Điều khoản", trackingSettings: "Cài đặt quyền riêng tư" },
  th: { note: "การแปรรูปกระดาษ การทำตัวอย่างโครงสร้าง และบรรจุภัณฑ์สั่งทำจากทีม Foshan", products: "สินค้าและโซลูชัน", allProducts: "สินค้าทั้งหมด", solutions: "โซลูชัน", industries: "อุตสาหกรรม", capabilities: "ความสามารถและแหล่งข้อมูล", capabilitiesLink: "ความสามารถ", factory: "โรงงานและกระบวนการ", news: "ข่าวสารและข้อมูลเชิงลึก", resources: "ศูนย์ทรัพยากร", studio: "สตูดิโอบรรจุภัณฑ์ 3D", contact: "ติดต่อเรา", social: "โซเชียลมีเดีย", returnHome: " · กลับหน้าแรก", privacy: "ความเป็นส่วนตัว", terms: "ข้อกำหนด", trackingSettings: "การตั้งค่าความเป็นส่วนตัว" },
  ms: { note: "Pemprosesan kertas, pensampelan struktur dan pembungkusan tersuai daripada pasukan Foshan kami", products: "Produk & penyelesaian", allProducts: "Semua produk", solutions: "Penyelesaian", industries: "Industri", capabilities: "Keupayaan & sumber", capabilitiesLink: "Keupayaan", factory: "Kilang & proses", news: "Berita & pandangan", resources: "Pusat sumber", studio: "Studio pembungkusan 3D", contact: "Hubungi kami", social: "Media sosial", returnHome: " · Kembali ke laman utama", privacy: "Privasi", terms: "Terma", trackingSettings: "Tetapan privasi" },
} as const;

export default async function SiteFooter() {
  const locale = await getLocale();
  const zh = locale === "zh";
  const copy = footerCopy[locale as keyof typeof footerCopy] ?? footerCopy.en;
  const whatsapp = whatsappHref(publicContact.whatsapp);
  const emailHref = mailtoHref(publicContact.email, zh ? `${companyDisplayName.zh}询盘` : `${companyDisplayName.en} packaging inquiry`);

  return (
    <footer className="kh-footer">
      <div className="kh-shell kh-footer-grid">
        <div className="kh-footer-brand-column">
          <SiteLogo locale={locale} placement="footer" />
          <h2>{zh ? companyDisplayName.zh : companyDisplayName.en}</h2>
          <p className="kh-footer-note">
            {copy.note}
          </p>
        </div>
        <div className="kh-footer-links">
            <details className="kh-footer-group" open>
            <summary><Package className="kh-footer-heading-icon" aria-hidden="true" />{copy.products}</summary>
            <div>
              <Link href="/products"><Package aria-hidden="true" />{copy.allProducts}</Link>
              <Link href="/solutions"><Lightbulb aria-hidden="true" />{copy.solutions}</Link>
              <Link href="/industries"><Factory aria-hidden="true" />{copy.industries}</Link>
            </div>
          </details>
            <details className="kh-footer-group" open>
            <summary><BookOpen className="kh-footer-heading-icon" aria-hidden="true" />{copy.capabilities}</summary>
            <div>
              <Link href="/capabilities"><Factory aria-hidden="true" />{copy.capabilitiesLink}</Link>
              <Link href="/factory"><MapPin aria-hidden="true" />{copy.factory}</Link>
              <Link href="/news"><Newspaper aria-hidden="true" />{copy.news}</Link>
              <Link href="/resources"><BookOpen aria-hidden="true" />{copy.resources}</Link>
              <Link href="/model-preview"><Package aria-hidden="true" />{copy.studio}</Link>
            </div>
          </details>
        </div>
        <GlassSurface variant="contact-card" tone="dark" className="kh-footer-contact-column kh-glass-footer-card">
          <p className="kh-footer-column-label">{copy.contact}</p>
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
            <a href={telHref(zh ? publicContact.factoryPhone : publicContact.internationalPhone)} aria-label={zh ? `拨打电话 ${publicContact.factoryPhone}` : `Call ${publicContact.internationalPhone}`}><Phone aria-hidden="true" />{zh ? publicContact.factoryPhone : publicContact.internationalPhone}</a>
            <a href={emailHref} aria-label={zh ? `发送邮件至 ${publicContact.email}` : `Email ${publicContact.email}`}><Mail aria-hidden="true" />{publicContact.email}</a>
            {zh ? <WeChatContactButton phone={publicContact.factoryPhone} label="微信咨询" copiedLabel="手机号已复制" className="kh-footer-wechat inline-flex min-h-11 items-center gap-2 border-0 bg-transparent p-0" /> : <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`Contact ${companyDisplayName.en} on WhatsApp`}><MessageCircle className="size-4" />WhatsApp</a>}
          </div>
        </GlassSurface>
      </div>
      <div className="kh-shell kh-footer-bottom">
        <div className="kh-social" aria-label={copy.social}>
          {socialEntries.map(({ key, label, href, Icon }) => (
            <a key={key} href={href || `/${locale}`} aria-label={label} title={href ? label : `${label}${copy.returnHome}`} {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <Icon className="size-4" />
            </a>
          ))}
        </div>
        <div className="kh-footer-legal-links">
          <span>© {new Date().getFullYear()} {zh ? companyDisplayName.zh : companyDisplayName.en}</span>
          <Link href="/privacy">{copy.privacy}</Link>
          <Link href="/terms">{copy.terms}</Link>
          <PrivacySettingsButton label={copy.trackingSettings} />
        </div>
      </div>
    </footer>
  );
}
