"use client";

import { BookOpen, Box, ChevronDown, Factory, Layers3, Lightbulb, Menu, Settings2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteLogo from "@/components/site/SiteLogo";
import { captureAttribution, trackAiReferralEvent, trackKehongEvent } from "@/lib/attribution";
import { productCatalogSections } from "@/data/productDirectory";

const headerCopy = {
  zh: { products: "产品", solutions: "解决方案", capabilities: "制造能力", factory: "工厂", modelPreview: "3D结构展厅", resources: "资源", contact: "提交询价", menuOpen: "打开导航菜单", menuClose: "关闭导航菜单", menuTitle: "网站导航" },
  en: { products: "Products", solutions: "Solutions", capabilities: "Capabilities", factory: "Factory", modelPreview: "3D Packaging Studio", resources: "Resources", contact: "Request a quote", menuOpen: "Open navigation menu", menuClose: "Close navigation menu", menuTitle: "Site navigation" },
  es: { products: "Productos", solutions: "Soluciones", capabilities: "Capacidades", factory: "Fábrica", modelPreview: "3D Packaging Studio", resources: "Recursos", contact: "Solicitar cotización", menuOpen: "Abrir menú", menuClose: "Cerrar menú", menuTitle: "Navegación" },
  th: { products: "สินค้า", solutions: "โซลูชัน", capabilities: "ความสามารถ", factory: "โรงงาน", modelPreview: "3D Packaging Studio", resources: "แหล่งข้อมูล", contact: "ขอใบเสนอราคา", menuOpen: "เปิดเมนู", menuClose: "ปิดเมนู", menuTitle: "เมนู" },
  vi: { products: "Sản phẩm", solutions: "Giải pháp", capabilities: "Năng lực", factory: "Nhà máy", modelPreview: "3D Packaging Studio", resources: "Tài nguyên", contact: "Nhận báo giá", menuOpen: "Mở menu", menuClose: "Đóng menu", menuTitle: "Điều hướng" },
  id: { products: "Produk", solutions: "Solusi", capabilities: "Kemampuan", factory: "Pabrik", modelPreview: "3D Packaging Studio", resources: "Sumber daya", contact: "Minta penawaran", menuOpen: "Buka menu", menuClose: "Tutup menu", menuTitle: "Navigasi" },
  ms: { products: "Produk", solutions: "Penyelesaian", capabilities: "Keupayaan", factory: "Kilang", modelPreview: "3D Packaging Studio", resources: "Sumber", contact: "Dapatkan sebut harga", menuOpen: "Buka menu", menuClose: "Tutup menu", menuTitle: "Navigasi" },
} as const;

type NavItem = { href: string; zh: string; en: string };

const capabilityLinks: NavItem[] = [
  { href: "/capabilities", zh: "能力总览", en: "Capabilities overview" },
  { href: "/process", zh: "生产流程", en: "Production process" },
];

const resourceOverview: NavItem = { href: "/resources", zh: "资源中心", en: "Resource Center" };
const resourceGroups = [
  {
    id: "artwork-sampling",
    zh: "设计与打样",
    en: "Artwork & Sampling",
    links: [
      { href: "/resources/artwork-guidelines", zh: "设计稿指南", en: "Artwork Guide", zhDescription: "准备印刷文件、颜色和出血信息", enDescription: "Prepare print files, colors and bleed settings" },
      { href: "/resources/dielines-templates", zh: "刀模图与模板", en: "Dielines & Templates", zhDescription: "申请包装结构对应的刀模图和模板", enDescription: "Request dielines and templates for confirmed structures" },
    ],
  },
  {
    id: "buying-insights",
    zh: "采购与内容",
    en: "Buying & Insights",
    links: [
      { href: "/procurement", zh: "采购与询价指南", en: "Buying & Quotation Guide", zhDescription: "准备尺寸、材料、数量和打样信息", enDescription: "Prepare dimensions, materials, quantities and sampling details" },
      { href: "/news", zh: "新闻与洞察", en: "News & Insights", zhDescription: "查看材料、包装和采购相关文章", enDescription: "Read packaging, material and sourcing articles" },
    ],
  },
] as const;

type HeaderProps = {
  /** cinema = 首页暗场:透明起始,滚过 Hero 后过渡为实底 */
  variant?: "solid" | "cinema";
};

function directoryLabel(item: { en: string; zh: string }, zh: boolean) {
  return zh ? item.zh : item.en;
}

function ResourceMegaMenu({ zh, close, pathname }: { zh: boolean; close: () => void; pathname: string }) {
  const label = (item: { en: string; zh: string }) => directoryLabel(item, zh);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <div id="header-resources-menu" className="kh-nav-panel kh-resource-mega" data-testid="header-resources-menu" aria-label={zh ? "资源中心" : "Resource Center"}>
      <Link href={resourceOverview.href} onClick={close} className={`kh-resource-overview${isActive(resourceOverview.href) ? " is-active" : ""}`}>
        <span>
          <small>{zh ? "资源中心" : "Resource Center"}</small>
          <strong>{zh ? "资源中心" : "Resource Center"}</strong>
          <em>{zh ? "查看全部设计、材料与采购资料" : "Browse all artwork, material and buying resources"}</em>
        </span>
      </Link>
      <div className="kh-resource-groups">
        {resourceGroups.map((group) => (
          <section key={group.id} className="kh-resource-group">
            <p>{label(group)}</p>
            <div>
              {group.links.map((item) => (
                <Link key={item.href} href={item.href} onClick={close} className={isActive(item.href) ? "is-active" : undefined}>
                  <strong>{label(item)}</strong>
                  <span>{zh ? item.zhDescription : item.enDescription}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MobileResourceDirectory({ zh, close, pathname }: { zh: boolean; close: () => void; pathname: string }) {
  const label = (item: { en: string; zh: string }) => directoryLabel(item, zh);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <details className="kh-mobile-resource-directory">
      <summary>{zh ? "资源" : "Resources"}<ChevronDown className="size-4" /></summary>
      <div>
        <Link href={resourceOverview.href} onClick={close} className={isActive(resourceOverview.href) ? "is-active" : undefined}>{label(resourceOverview)}</Link>
        {resourceGroups.map((group) => (
          <section key={group.id}>
            <p>{label(group)}</p>
            {group.links.map((item) => <Link key={item.href} href={item.href} onClick={close} className={isActive(item.href) ? "is-active" : undefined}>{label(item)}</Link>)}
          </section>
        ))}
      </div>
    </details>
  );
}

function ProductMegaMenu({ zh, close, firstLinkRef }: { zh: boolean; close: () => void; firstLinkRef?: (node: HTMLAnchorElement | null) => void }) {
  return (
    <div id="header-products-menu" className="kh-nav-panel kh-product-mega" data-testid="header-product-mega-menu" aria-label={zh ? "产品目录" : "Product directory"}>
      <div className="kh-product-mega-grid">
        {productCatalogSections.map((section, sectionIndex) => (
          <section key={section.id} className="kh-product-mega-section" data-system={section.id} aria-labelledby={`header-${section.id}-title`}>
            <div className="kh-product-mega-head">
              <p className="kh-product-mega-kicker">{String(sectionIndex + 1).padStart(2, "0")} · {zh ? "产品系统" : "Product system"}</p>
              <div className="kh-product-mega-head-row">
                <div className="kh-product-mega-heading">
                  <h3 id={`header-${section.id}-title`}>{directoryLabel(section.label, zh)}</h3>
                  <p className="kh-product-mega-description">{directoryLabel(section.description, zh)}</p>
                </div>
                <Link ref={section.id === "materials" ? firstLinkRef : undefined} className="kh-product-mega-cta" href={section.href} onClick={close}>
                  <span>{directoryLabel(section.cta, zh)}</span>
                </Link>
              </div>
            </div>
            <div className="kh-product-mega-groups">
              {section.groups.map((group, groupIndex) => (
                <div key={group.id} className="kh-product-mega-group">
                  <div className="kh-product-mega-group-heading">
                    <span className="kh-product-mega-group-index">{String(groupIndex + 1).padStart(2, "0")}</span>
                    <h4>{directoryLabel(group, zh)}</h4>
                  </div>
                  <ul className="kh-product-mega-items">
                    {group.links.map((item) => (
                      <li key={item.id}>
                        <Link href={item.href} onClick={close}>
                          <span>{directoryLabel(item, zh)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Link className="kh-product-mega-all" href="/products" onClick={close}>
        <span><small>{zh ? "总目录" : "Directory"}</small>{zh ? "查看完整产品目录" : "View the complete product directory"}</span>
      </Link>
    </div>
  );
}

function MobileProductDirectory({ zh, close }: { zh: boolean; close: () => void }) {
  return (
    <div className="kh-mobile-product-directory" data-testid="mobile-product-directory">
      {productCatalogSections.map((section, sectionIndex) => (
        <details key={section.id} className="kh-mobile-product-section">
          <summary>
            <span className="kh-mobile-product-kicker">{String(sectionIndex + 1).padStart(2, "0")}</span>
            <span className="kh-mobile-product-section-title">{directoryLabel(section.label, zh)}</span>
            <ChevronDown className="size-4" />
          </summary>
          <div className="kh-mobile-product-section-body">
            <p className="kh-mobile-product-description">{directoryLabel(section.description, zh)}</p>
            <Link className="kh-mobile-product-cta" href={section.href} onClick={close}>{directoryLabel(section.cta, zh)}</Link>
            {section.groups.map((group, groupIndex) => (
              <div key={group.id} className="kh-mobile-product-group">
                <p><span>{String(groupIndex + 1).padStart(2, "0")}</span>{directoryLabel(group, zh)}</p>
                {group.links.map((item) => <Link key={item.id} href={item.href} onClick={close}>{directoryLabel(item, zh)}</Link>)}
              </div>
            ))}
          </div>
        </details>
      ))}
      <Link className="kh-mobile-product-all" href="/products" onClick={close}><span>{zh ? "查看完整产品目录" : "View the complete product directory"}</span></Link>
    </div>
  );
}

export default function Header({ variant = "solid" }: HeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const copy = headerCopy[locale as keyof typeof headerCopy] ?? headerCopy.en;
  const isZh = locale === "zh";
  const label = (item: NavItem) => (isZh ? item.zh : item.en);

  const headerRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const desktopCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardProductsActivationRef = useRef<"Enter" | " " | null>(null);
  const focusFirstProductLinkRef = useRef(false);
  const firstProductMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const setFirstProductMenuLinkRef = (node: HTMLAnchorElement | null) => {
    firstProductMenuLinkRef.current = node;
  };
  const [firstProductFocusRequest, setFirstProductFocusRequest] = useState(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const restoreMobileFocusRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"products" | "capabilities" | "resources" | null>(null);
  const [scrolled, setScrolled] = useState(variant !== "cinema");
  const [lastPathname, setLastPathname] = useState(pathname);

  const closeMobileMenu = () => {
    restoreMobileFocusRef.current = true;
    setMenuOpen(false);
  };

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

  const clearDesktopCloseTimer = () => {
    if (desktopCloseTimerRef.current) {
      clearTimeout(desktopCloseTimerRef.current);
      desktopCloseTimerRef.current = null;
    }
  };

  const closeDesktopDropdowns = (restoreProductsFocus = false) => {
    clearDesktopCloseTimer();
    setOpenMenu(null);
    if (restoreProductsFocus) requestAnimationFrame(() => productsButtonRef.current?.focus());
  };

  const openDesktopMenu = (menu: "products" | "capabilities" | "resources") => {
    clearDesktopCloseTimer();
    setOpenMenu(menu);
  };

  const scheduleDesktopClose = (menu: "products" | "capabilities" | "resources") => {
    clearDesktopCloseTimer();
    desktopCloseTimerRef.current = setTimeout(() => {
      setOpenMenu((current) => current === menu ? null : current);
      desktopCloseTimerRef.current = null;
    }, 180);
  };

  // 路由变化后收起所有菜单
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setOpenMenu(null);
  }
  useEffect(() => () => {
    if (desktopCloseTimerRef.current) clearTimeout(desktopCloseTimerRef.current);
  }, []);

  useEffect(() => {
    if (openMenu !== "products") {
      focusFirstProductLinkRef.current = false;
      return;
    }
    if (!focusFirstProductLinkRef.current) return;
    const frame = requestAnimationFrame(() => {
      const firstLink = firstProductMenuLinkRef.current
        ?? desktopNavRef.current?.querySelector<HTMLAnchorElement>("#header-products-menu a");
      if (!firstLink || !focusFirstProductLinkRef.current) return;
      focusFirstProductLinkRef.current = false;
      firstLink.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [openMenu, firstProductFocusRequest]);

  // Capture the first landing URL before a visitor reaches a quote form.
  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (/^mailto:/iu.test(href)) {
        trackAiReferralEvent("ai_referral_email_click", { conversionAction: "email_click" });
      } else if (/wa\.me|whatsapp/iu.test(href)) {
        trackAiReferralEvent("ai_referral_whatsapp_click", { conversionAction: "whatsapp_click" });
      } else if (/\/products\//u.test(href) || /\/packaging\//u.test(href)) {
        trackAiReferralEvent("ai_referral_product_click", { conversionAction: "product_click" });
      } else if (/\/contact(?:[/?#]|$)/u.test(href)) {
        trackAiReferralEvent("ai_referral_quote_start", { conversionAction: "quote_start" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // 点击外部或 Escape 关闭桌面下拉
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        if (desktopCloseTimerRef.current) clearTimeout(desktopCloseTimerRef.current);
        desktopCloseTimerRef.current = null;
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const expanded = desktopNavRef.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]');
      if (!expanded) return;
      event.preventDefault();
      if (desktopCloseTimerRef.current) clearTimeout(desktopCloseTimerRef.current);
      desktopCloseTimerRef.current = null;
      setOpenMenu(null);
      if (expanded === productsButtonRef.current) {
        requestAnimationFrame(() => productsButtonRef.current?.focus());
      }
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
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeMobileMenu();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>("a[href], button, summary");
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
      if (!panel.contains(target) && !menuButtonRef.current?.contains(target)) closeMobileMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [menuOpen]);

  // Restore focus after the drawer has actually unmounted. A touch click can
  // otherwise leave focus on the dismissed backdrop between the state update
  // and the next paint.
  useEffect(() => {
    if (menuOpen || !restoreMobileFocusRef.current) return;
    restoreMobileFocusRef.current = false;
    const frame = requestAnimationFrame(() => menuButtonRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [menuOpen]);

  const isProducts = pathname.startsWith("/products") || pathname.startsWith("/packaging");
  const isCapabilities = pathname.startsWith("/capabilities") || pathname.startsWith("/process");
  const isResources = pathname.startsWith("/resources") || pathname.startsWith("/news") || pathname.startsWith("/procurement");
  const isModelPreview = pathname.startsWith("/model-preview");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const navLinkClass = (active: boolean) => `kh-nav-link${active ? " is-active" : ""}`;

  return (
    <header
      ref={headerRef}
      className="kh-header"
      data-variant={variant}
      data-scrolled={String(Boolean(variant !== "cinema" || scrolled || menuOpen || openMenu))}
    >
      <div className="kh-shell kh-header-bar">
        <Link href="/" className="kh-header-brand">
          <SiteLogo locale={locale} placement="header" />
        </Link>

        <nav ref={desktopNavRef} className="kh-desktop-nav" aria-label="Primary navigation">
          <div className="kh-desktop-menu" onPointerEnter={() => openDesktopMenu("products")} onPointerLeave={() => scheduleDesktopClose("products")} onFocusCapture={clearDesktopCloseTimer} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) scheduleDesktopClose("products"); }}>
            <button ref={productsButtonRef} type="button" className={navLinkClass(isProducts)} aria-expanded={openMenu === "products"} aria-controls="header-products-menu" aria-haspopup="true" onClick={(event) => { if (keyboardProductsActivationRef.current) { event.preventDefault(); event.stopPropagation(); keyboardProductsActivationRef.current = null; return; } if (openMenu === "products") { closeDesktopDropdowns(); return; } openDesktopMenu("products"); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); if (event.repeat) return; keyboardProductsActivationRef.current = event.key; if (openMenu === "products") { closeDesktopDropdowns(); return; } openDesktopMenu("products"); return; } if (event.key !== "ArrowDown") return; event.preventDefault(); event.stopPropagation(); focusFirstProductLinkRef.current = true; setFirstProductFocusRequest((request) => request + 1); openDesktopMenu("products"); }} onKeyUp={(event) => { if (event.key !== keyboardProductsActivationRef.current) return; event.preventDefault(); event.stopPropagation(); requestAnimationFrame(() => { keyboardProductsActivationRef.current = null; }); }}>
              <Layers3 className="kh-nav-icon size-3.5" aria-hidden="true" />
              <span>{copy.products}</span>
              <ChevronDown className="kh-nav-chevron size-3.5" />
            </button>
            {openMenu === "products" ? <ProductMegaMenu zh={isZh} close={closeDesktopDropdowns} firstLinkRef={setFirstProductMenuLinkRef} /> : null}
          </div>

          <Link href="/solutions" aria-current={isActive("/solutions") ? "page" : undefined} className={navLinkClass(isActive("/solutions"))}>
            <Lightbulb className="kh-nav-icon size-3.5" aria-hidden="true" />
            <span>{copy.solutions}</span>
          </Link>

          <div className="kh-desktop-menu" onPointerEnter={() => openDesktopMenu("capabilities")} onPointerLeave={() => scheduleDesktopClose("capabilities")} onFocusCapture={() => openDesktopMenu("capabilities")} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) scheduleDesktopClose("capabilities"); }}>
            <button type="button" className={navLinkClass(isCapabilities)} aria-expanded={openMenu === "capabilities"} aria-controls="header-capabilities-menu" aria-haspopup="true" onClick={() => openMenu === "capabilities" ? closeDesktopDropdowns() : openDesktopMenu("capabilities")}>
              <Settings2 className="kh-nav-icon size-3.5" aria-hidden="true" />
              <span>{copy.capabilities}</span>
              <ChevronDown className="kh-nav-chevron size-3.5" />
            </button>
            {openMenu === "capabilities" ? <div id="header-capabilities-menu" className="kh-nav-panel">
              {capabilityLinks.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => closeDesktopDropdowns()}>{label(item)}</Link>
              ))}
            </div> : null}
          </div>

          <Link href="/factory" aria-current={isActive("/factory") ? "page" : undefined} className={navLinkClass(isActive("/factory"))}>
            <Factory className="kh-nav-icon size-3.5" aria-hidden="true" />
            <span>{copy.factory}</span>
          </Link>

          <Link href="/model-preview" aria-current={isModelPreview ? "page" : undefined} className={`${navLinkClass(isModelPreview)} kh-nav-link-3d`} data-testid="header-model-preview-link">
            <Box className="kh-nav-3d-icon size-3.5" aria-hidden="true" />
            <span>{copy.modelPreview}</span>
          </Link>

          <div className="kh-desktop-menu" onPointerEnter={() => openDesktopMenu("resources")} onPointerLeave={() => scheduleDesktopClose("resources")} onFocusCapture={() => openDesktopMenu("resources")} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) scheduleDesktopClose("resources"); }}>
            <button type="button" className={navLinkClass(isResources)} aria-expanded={openMenu === "resources"} aria-controls="header-resources-menu" aria-haspopup="true" onClick={() => openMenu === "resources" ? closeDesktopDropdowns() : openDesktopMenu("resources")}>
              <BookOpen className="kh-nav-icon size-3.5" aria-hidden="true" />
              <span>{copy.resources}</span>
              <ChevronDown className="kh-nav-chevron size-3.5" />
            </button>
            {openMenu === "resources" ? <ResourceMegaMenu zh={isZh} close={closeDesktopDropdowns} pathname={pathname} /> : null}
          </div>
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
              <>
                <button type="button" tabIndex={-1} className="kh-mobile-backdrop" aria-label={copy.menuClose} onClick={closeMobileMenu} />
              <div ref={mobilePanelRef} id="kh-mobile-menu" className="kh-mobile-panel" role="dialog" aria-modal="true" aria-label={copy.menuTitle}>
                <div className="kh-mobile-head">
                  <p className="kh-nav-panel-label m-0">{copy.menuTitle}</p>
                  <button type="button" className="kh-menu-toggle" aria-label={copy.menuClose} onClick={closeMobileMenu}>
                    <X className="size-5" />
                  </button>
                </div>
                <nav aria-label={copy.menuTitle}>
                  <p className="kh-nav-panel-label">{copy.products}</p>
                  <MobileProductDirectory zh={isZh} close={closeMobileMenu} />
                  <p className="kh-nav-panel-label">{copy.solutions}</p>
                  <Link href="/solutions">{copy.solutions}</Link>
                  <p className="kh-nav-panel-label">{copy.capabilities}</p>
                  {capabilityLinks.map((item) => (
                    <Link key={item.href} href={item.href}>{label(item)}</Link>
                  ))}
                  <Link href="/factory">{copy.factory}</Link>
                  <Link href="/model-preview" className="kh-mobile-model-link" onClick={closeMobileMenu} data-testid="mobile-model-preview-link">
                    <Box className="kh-nav-3d-icon size-4" aria-hidden="true" />
                    {copy.modelPreview}
                  </Link>
                  <MobileResourceDirectory zh={isZh} close={closeMobileMenu} pathname={pathname} />
                  <Link href="/contact" onClick={() => trackKehongEvent("quote_click", { locale, ctaLocation: "mobile_navigation" })} className="kh-button kh-button-primary kh-button-compact mt-2 justify-center">{copy.contact}</Link>
                </nav>
              </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
