"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteLogo from "@/components/site/SiteLogo";
import { captureAttribution, trackKehongEvent } from "@/lib/attribution";

const headerCopy = {
  zh: { products: "产品", solutions: "解决方案", capabilities: "制造能力", factory: "工厂", resources: "资源", contact: "获取报价", menuOpen: "打开导航菜单", menuClose: "关闭导航菜单", menuTitle: "网站导航" },
  en: { products: "Products", solutions: "Solutions", capabilities: "Capabilities", factory: "Factory", resources: "Resources", contact: "Request a quote", menuOpen: "Open navigation menu", menuClose: "Close navigation menu", menuTitle: "Site navigation" },
  es: { products: "Productos", solutions: "Soluciones", capabilities: "Capacidades", factory: "Fábrica", resources: "Recursos", contact: "Solicitar cotización", menuOpen: "Abrir menú", menuClose: "Cerrar menú", menuTitle: "Navegación" },
  th: { products: "สินค้า", solutions: "โซลูชัน", capabilities: "ความสามารถ", factory: "โรงงาน", resources: "แหล่งข้อมูล", contact: "ขอใบเสนอราคา", menuOpen: "เปิดเมนู", menuClose: "ปิดเมนู", menuTitle: "เมนู" },
  vi: { products: "Sản phẩm", solutions: "Giải pháp", capabilities: "Năng lực", factory: "Nhà máy", resources: "Tài nguyên", contact: "Nhận báo giá", menuOpen: "Mở menu", menuClose: "Đóng menu", menuTitle: "Điều hướng" },
  id: { products: "Produk", solutions: "Solusi", capabilities: "Kemampuan", factory: "Pabrik", resources: "Sumber daya", contact: "Minta penawaran", menuOpen: "Buka menu", menuClose: "Tutup menu", menuTitle: "Navigasi" },
  ms: { products: "Produk", solutions: "Penyelesaian", capabilities: "Keupayaan", factory: "Kilang", resources: "Sumber", contact: "Dapatkan sebut harga", menuOpen: "Buka menu", menuClose: "Tutup menu", menuTitle: "Navigasi" },
} as const;

type NavItem = { href: string; zh: string; en: string };

const productLinks: NavItem[] = [
  { href: "/products", zh: "全部产品", en: "All products" },
  { href: "/packaging/cake-boxes", zh: "蛋糕盒", en: "Cake boxes" },
  { href: "/packaging/takeout-boxes", zh: "外带食品盒", en: "Takeout & food boxes" },
  { href: "/packaging/paper-bags", zh: "纸袋", en: "Paper bags" },
  { href: "/packaging/corrugated-mailer-boxes", zh: "瓦楞邮寄盒", en: "Corrugated mailers" },
  { href: "/packaging/labels-stickers", zh: "标签与贴纸", en: "Labels & stickers" },
  { href: "/packaging/cake-boards-cake-drums", zh: "蛋糕底托", en: "Cake boards & drums" },
];

const capabilityLinks: NavItem[] = [
  { href: "/capabilities", zh: "能力总览", en: "Capabilities overview" },
  { href: "/process", zh: "生产流程", en: "Production process" },
];

const resourceLinks: NavItem[] = [
  { href: "/resources", zh: "资源与设计中心", en: "Resources & design center" },
  { href: "/resources/artwork-guidelines", zh: "印刷文件指南", en: "Artwork guidelines" },
  { href: "/resources/dielines-templates", zh: "刀线模板申请", en: "Request a dieline" },
  { href: "/model-preview", zh: "3D 结构展厅", en: "3D structure studio" },
  { href: "/procurement", zh: "买家支持", en: "Buyer support" },
];

type HeaderProps = {
  /** cinema = 首页暗场:透明起始,滚过 Hero 后过渡为实底 */
  variant?: "solid" | "cinema";
};

export default function Header({ variant = "solid" }: HeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const copy = headerCopy[locale as keyof typeof headerCopy] ?? headerCopy.en;
  const isZh = locale === "zh";
  const label = (item: NavItem) => (isZh ? item.zh : item.en);

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(variant !== "cinema");
  const [lastPathname, setLastPathname] = useState(pathname);

  // cinema 变体:观察 Hero 底部哨兵,离开视口上沿即切换实底(IO,无 scroll 抖动)
  useEffect(() => {
    if (variant !== "cinema") return;
    const sentinel = document.querySelector("[data-kh-hero-sentinel]");
    if (!sentinel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 无哨兵页面直接回退实底态
      setScrolled(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // rootMargin 把根上沿下移了 73px:哨兵从上方离开时 top≈73 而非 <0
          setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 74);
        }
      },
      { rootMargin: "-73px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [variant]);

  const closeDesktopDropdowns = () => {
    headerRef.current?.querySelectorAll("details[open]").forEach((node) => node.removeAttribute("open"));
  };

  // 路由变化后收起所有菜单
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }
  useEffect(() => {
    closeDesktopDropdowns();
  }, [pathname]);

  // Capture the first landing URL before a visitor reaches a quote form.
  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  // 点击外部或 Escape 关闭桌面下拉
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const header = headerRef.current;
      if (!header) return;
      if (!header.contains(event.target as Node)) closeDesktopDropdowns();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDesktopDropdowns();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // 移动菜单:打开时聚焦关闭按钮,Escape 关闭并交还焦点,Tab 循环留在面板内
  useEffect(() => {
    if (!menuOpen) return;
    const panel = mobilePanelRef.current;
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panel) return;
      const target = event.target as Node;
      if (!panel.contains(target) && !menuButtonRef.current?.contains(target)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  const isProducts = pathname.startsWith("/products") || pathname.startsWith("/packaging");
  const isCapabilities = pathname.startsWith("/capabilities") || pathname.startsWith("/process");
  const isResources = pathname.startsWith("/resources") || pathname.startsWith("/model-preview") || pathname.startsWith("/procurement");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const navLinkClass = (active: boolean) => `kh-nav-link${active ? " is-active" : ""}`;

  return (
    <header
      ref={headerRef}
      className="kh-header"
      data-variant={variant}
      data-scrolled={String(variant !== "cinema" || scrolled || menuOpen)}
    >
      <div className="kh-shell kh-header-bar">
        <Link href="/" className="kh-header-brand">
          <SiteLogo locale={locale} placement="header" />
        </Link>

        <nav className="kh-desktop-nav" aria-label="Primary navigation">
          <details className="relative">
            <summary className={navLinkClass(isProducts)}>
              <span>{copy.products}</span>
              <ChevronDown className="kh-nav-chevron size-3.5" />
            </summary>
            <div className="kh-nav-panel">
              {productLinks.map((item) => (
                <Link key={item.href} href={item.href}>{label(item)}<span aria-hidden="true">→</span></Link>
              ))}
            </div>
          </details>

          <Link href="/solutions" aria-current={isActive("/solutions") ? "page" : undefined} className={navLinkClass(isActive("/solutions"))}>{copy.solutions}</Link>

          <details className="relative">
            <summary className={navLinkClass(isCapabilities)}>
              <span>{copy.capabilities}</span>
              <ChevronDown className="kh-nav-chevron size-3.5" />
            </summary>
            <div className="kh-nav-panel">
              {capabilityLinks.map((item) => (
                <Link key={item.href} href={item.href}>{label(item)}<span aria-hidden="true">→</span></Link>
              ))}
            </div>
          </details>

          <Link href="/factory" aria-current={isActive("/factory") ? "page" : undefined} className={navLinkClass(isActive("/factory"))}>{copy.factory}</Link>

          <details className="relative">
            <summary className={navLinkClass(isResources)}>
              <span>{copy.resources}</span>
              <ChevronDown className="kh-nav-chevron size-3.5" />
            </summary>
            <div className="kh-nav-panel">
              {resourceLinks.map((item) => (
                <Link key={item.href} href={item.href}>{label(item)}<span aria-hidden="true">→</span></Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="kh-header-actions">
          <LanguageSwitcher />
          <Link href="/contact" data-testid="site-header-quote" onClick={() => trackKehongEvent("quote_click", { locale, ctaLocation: "header" })} className="kh-button kh-button-primary kh-button-compact kh-header-cta">{copy.contact}</Link>
          <div className="kh-compact-nav">
            <button
              ref={menuButtonRef}
              type="button"
              className="kh-menu-toggle"
              aria-label={menuOpen ? copy.menuClose : copy.menuOpen}
              aria-expanded={menuOpen}
              aria-controls="kh-mobile-menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <Menu className="size-5" />
            </button>
            {menuOpen ? (
              <div ref={mobilePanelRef} id="kh-mobile-menu" className="kh-mobile-panel">
                <div className="kh-mobile-head">
                  <p className="kh-nav-panel-label m-0">{copy.menuTitle}</p>
                  <button type="button" className="kh-menu-toggle" aria-label={copy.menuClose} onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}>
                    <X className="size-5" />
                  </button>
                </div>
                <nav aria-label={copy.menuTitle}>
                  <p className="kh-nav-panel-label">{copy.products}</p>
                  {productLinks.slice(0, 5).map((item) => (
                    <Link key={item.href} href={item.href}>{label(item)}<span aria-hidden="true">→</span></Link>
                  ))}
                  <p className="kh-nav-panel-label">{copy.solutions}</p>
                  <Link href="/solutions">{copy.solutions}<span aria-hidden="true">→</span></Link>
                  <p className="kh-nav-panel-label">{copy.capabilities}</p>
                  {capabilityLinks.map((item) => (
                    <Link key={item.href} href={item.href}>{label(item)}<span aria-hidden="true">→</span></Link>
                  ))}
                  <Link href="/factory">{copy.factory}<span aria-hidden="true">→</span></Link>
                  <p className="kh-nav-panel-label">{copy.resources}</p>
                  {resourceLinks.map((item) => (
                    <Link key={item.href} href={item.href}>{label(item)}<span aria-hidden="true">→</span></Link>
                  ))}
                  <Link href="/contact" onClick={() => trackKehongEvent("quote_click", { locale, ctaLocation: "mobile_navigation" })} className="kh-button kh-button-primary kh-button-compact mt-2 justify-center">{copy.contact}</Link>
                </nav>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
