"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";
import { showcaseImages } from "@/data/visuals";
import ResilientImage from "@/components/ui/ResilientImage";

type PortalRoute = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  imageAlt?: string;
  visual: "image" | "packaging" | "solutions" | "studio" | "checklist" | "brief";
  category: string;
  heading: string;
  description: string;
  cta: string;
};

type PortalLocale = "en" | "zh";

const routeContent: Record<PortalLocale, PortalRoute[]> = {
  en: [
    {
      id: "materials",
      number: "01",
      title: "Paper materials",
      subtitle: "Grades, GSM, coating, and converting.",
      href: "/products?system=materials",
      image: showcaseImages.portalSwatch,
      imageAlt: "Real corrugated paperboard edge and material layers",
      visual: "image",
      category: "Paper materials",
      heading: "Paper materials",
      description: "Select by paper grade, GSM, coating, and converting requirement.",
      cta: "Open materials",
    },
    {
      id: "packaging",
      number: "02",
      title: "Finished packaging",
      subtitle: "Boxes, trays, inserts, and custom structures.",
      href: "/products?system=packaging",
      visual: "packaging",
      category: "Finished packaging",
      heading: "Finished packaging",
      description: "Boxes, trays, inserts, and custom paper structures for practical production needs.",
      cta: "Explore packaging",
    },
    {
      id: "solutions",
      number: "03",
      title: "Packaging solutions",
      subtitle: "Choose by application and production need.",
      href: "/solutions",
      visual: "solutions",
      category: "Packaging solutions",
      heading: "Packaging solutions",
      description: "Find an appropriate structure by application, material, protection, and delivery requirement.",
      cta: "Explore solutions",
    },
    {
      id: "factory",
      number: "04",
      title: "Factory & process",
      subtitle: "Equipment, converting, inspection, and packing.",
      href: "/factory",
      image: showcaseImages.machineClose,
      imageAlt: "Kehong paper converting equipment detail",
      visual: "image",
      category: "Factory & process",
      heading: "Production you can verify",
      description: "Review converting equipment, production steps, and quality checkpoints.",
      cta: "Explore the factory",
    },
    {
      id: "studio",
      number: "05",
      title: "3D structure studio",
      subtitle: "Review panels, folds, inserts, and material layers.",
      href: "/model-preview",
      visual: "studio",
      category: "3D structure studio",
      heading: "Review the structure before production",
      description: "Inspect panel relationships, fold sequence, insert fit, and material layers.",
      cta: "Open 3D Studio",
    },
    {
      id: "support",
      number: "06",
      title: "Buyer support",
      subtitle: "Sampling, MOQ, documents, and export prep.",
      image: showcaseImages.structureMaterialReal,
      imageAlt: "Paper structure sample prepared for buyer review",
      href: "/procurement",
      visual: "checklist",
      category: "Buyer support",
      heading: "Prepare the right information earlier",
      description: "Understand quotation inputs, sampling, lead time, and export requirements.",
      cta: "Open buyer support",
    },
    {
      id: "project",
      number: "07",
      title: "Start a packaging project",
      subtitle: "Send specs, drawings, quantity, destination.",
      href: "/contact",
      visual: "brief",
      category: "Project brief",
      heading: "Move your packaging brief into production",
      description: "Send product information, specifications, quantity, attachments, and destination market.",
      cta: "Request a quote",
    },
  ],
  zh: [
    {
      id: "materials",
      number: "01",
      title: "纸材与材料",
      subtitle: "纸种、克重、涂层与加工。",
      href: "/products?system=materials",
      image: showcaseImages.portalSwatch,
      imageAlt: "真实瓦楞纸板边缘与材料层次",
      visual: "image",
      category: "纸材与材料",
      heading: "纸材与材料",
      description: "按纸种、克重、涂层与加工要求选择合适材料。",
      cta: "查看材料",
    },
    {
      id: "packaging",
      number: "02",
      title: "成品包装",
      subtitle: "纸盒、纸托、内衬与定制结构。",
      href: "/products?system=packaging",
      visual: "packaging",
      category: "成品包装",
      heading: "成品包装",
      description: "纸盒、纸托、内衬与定制纸结构，面向实际生产需求。",
      cta: "查看包装",
    },
    {
      id: "solutions",
      number: "03",
      title: "包装解决方案",
      subtitle: "按应用场景与生产需求选择。",
      href: "/solutions",
      visual: "solutions",
      category: "包装解决方案",
      heading: "包装解决方案",
      description: "按应用、材料、防护与交付要求寻找合适结构。",
      cta: "查看解决方案",
    },
    {
      id: "factory",
      number: "04",
      title: "工厂与流程",
      subtitle: "设备、加工、检验与包装。",
      href: "/factory",
      image: showcaseImages.machineClose,
      imageAlt: "科宏纸材加工设备细节",
      visual: "image",
      category: "工厂与流程",
      heading: "可验证的生产能力",
      description: "了解加工设备、生产步骤与质量检查节点。",
      cta: "探索工厂",
    },
    {
      id: "studio",
      number: "05",
      title: "3D 结构展厅",
      subtitle: "评审面板、折叠、内衬与材料层次。",
      href: "/model-preview",
      visual: "studio",
      category: "3D 结构展厅",
      heading: "在生产前评审结构",
      description: "检查面板关系、折叠顺序、内衬适配与材料层次。",
      cta: "打开 3D 展厅",
    },
    {
      id: "support",
      number: "06",
      title: "采购支持",
      subtitle: "打样、MOQ、文件与出口准备。",
      image: showcaseImages.structureMaterialReal,
      imageAlt: "用于采购评审的纸材结构样本",
      href: "/procurement",
      visual: "checklist",
      category: "采购支持",
      heading: "更早准备正确资料",
      description: "了解报价输入、打样、交期与出口要求。",
      cta: "查看采购支持",
    },
    {
      id: "project",
      number: "07",
      title: "启动包装项目",
      subtitle: "提交规格、图纸、数量与目的地。",
      href: "/contact",
      visual: "brief",
      category: "项目需求",
      heading: "让包装需求进入生产",
      description: "提交产品信息、规格、数量、附件与目标市场。",
      cta: "提交询盘",
    },
  ],
};

const copy = {
  en: {
    eyebrow: "FOSHAN · PAPER MATERIALS & CUSTOM PACKAGING · SINCE 2001",
    title: "Paper packaging,\nbuilt from the material up.",
    body: "From cupstock and corrugated board to custom boxes and inserts, Kehong brings material selection, structural sampling, paper converting, and production support into one coordinated workflow.",
    mobileBody: "Paper materials, custom packaging, structural sampling, and production support in one coordinated workflow.",
    explore: "Explore Kehong",
    quote: "Get a Quote",
    routes: "Explore Kehong",
    visualLabel: "Selected route",
    idleLabel: "Kehong production reference",
    openPanel: "Explore Kehong",
    closePanel: "Close Explore Kehong",
    panelTitle: "Explore Kehong",
    panelIntro: "Choose the route that matches your packaging brief.",
    location: "Foshan · Paper materials & custom packaging",
    privacy: "Privacy",
    terms: "Terms",
  },
  zh: {
    eyebrow: "佛山 · 纸材与定制包装 · 始于 2001",
    title: "从纸材开始，做好包装。",
    body: "从杯纸、瓦楞纸到定制纸盒与内衬，科宏将材料选择、结构打样、纸材加工和生产支持整合到一个清晰的项目流程中。",
    mobileBody: "纸材、定制包装、结构打样与生产支持，整合在一个清晰流程中。",
    explore: "探索科宏",
    quote: "获取报价",
    routes: "探索科宏",
    visualLabel: "当前路径",
    idleLabel: "科宏生产参考",
    openPanel: "探索科宏",
    closePanel: "关闭探索面板",
    panelTitle: "探索科宏",
    panelIntro: "选择与包装需求相匹配的路径。",
    location: "佛山 · 纸材与定制包装",
    privacy: "隐私政策",
    terms: "使用条款",
  },
} as const;

function getInitialRoute() {
  if (typeof window === "undefined") return "materials";
  return window.sessionStorage.getItem("kehong:portal-preview") || "materials";
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function PaperChecklist({ isZh }: { isZh: boolean }) {
  const rows = isZh
    ? ["材料与克重", "结构与尺寸", "打样与 MOQ", "出口文件"]
    : ["Material & GSM", "Structure & size", "Sampling & MOQ", "Export documents"];

  return (
    <div className="production-portal__checklist-visual" aria-label={isZh ? "采购准备清单" : "Buyer preparation checklist"}>
      <div className="production-portal__visual-paperclip" aria-hidden="true" />
      <p>{isZh ? "采购准备" : "BUYER PREPARATION"}</p>
      <ul>
        {rows.map((row) => <li key={row}><Check size={13} aria-hidden="true" />{row}<span>✓</span></li>)}
      </ul>
    </div>
  );
}

function BriefDiagram({ isZh }: { isZh: boolean }) {
  return (
    <div className="production-portal__brief-visual" aria-label={isZh ? "包装项目需求图示" : "Packaging project brief diagram"}>
      <div className="production-portal__brief-sheet">
        <span className="production-portal__brief-stamp">KH / {isZh ? "需求" : "BRIEF"}</span>
        <div className="production-portal__brief-dieline" aria-hidden="true"><i /><i /><i /><i /><b /></div>
        <div className="production-portal__brief-lines"><span>{isZh ? "尺寸" : "SIZE"}</span><span>{isZh ? "材料" : "MATERIAL"}</span><span>{isZh ? "数量" : "QUANTITY"}</span><span>{isZh ? "目的地" : "DESTINATION"}</span></div>
      </div>
    </div>
  );
}

function PackagingStructureVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="production-portal__technical-visual production-portal__technical-visual--packaging" aria-label={isZh ? "成品包装结构示意" : "Finished packaging structure diagram"}>
      <div className="production-portal__technical-grid" aria-hidden="true" />
      <div className="production-portal__package-drawing" aria-hidden="true">
        <span className="production-portal__package-panel production-portal__package-panel--back" />
        <span className="production-portal__package-panel production-portal__package-panel--base" />
        <span className="production-portal__package-panel production-portal__package-panel--lid" />
        <span className="production-portal__package-insert" />
        <span className="production-portal__technical-label production-portal__technical-label--back" data-technical-label="BACK">BACK</span>
        <span className="production-portal__technical-label production-portal__technical-label--base" data-technical-label="BASE">BASE</span>
        <span className="production-portal__technical-label production-portal__technical-label--lid" data-technical-label="LID">LID</span>
        <span className="production-portal__technical-label production-portal__technical-label--insert" data-technical-label="INSERT">INSERT</span>
      </div>
      <p className="production-portal__technical-caption">PANEL / FOLD / INSERT</p>
    </div>
  );
}

function SolutionsStructureVisual({ isZh }: { isZh: boolean }) {
  const layers = isZh ? ["食品纸盒", "烘焙托盒", "杯纸材料", "瓦楞结构", "纸内衬"] : ["FOOD BOX", "BAKERY TRAY", "CUPSTOCK", "CORRUGATED", "PAPER INSERT"];
  return (
    <div className="production-portal__technical-visual production-portal__technical-visual--solutions" aria-label={isZh ? "包装解决方案结构示意" : "Packaging solutions structure diagram"}>
      <div className="production-portal__technical-grid" aria-hidden="true" />
      <div className="production-portal__solution-stack">{layers.map((layer, index) => <span key={layer} style={{ "--layer-index": index } as CSSProperties}>{layer}</span>)}</div>
      <p className="production-portal__technical-caption">APPLICATION / PROTECTION / DELIVERY</p>
    </div>
  );
}

function StudioStructureVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="production-portal__technical-visual production-portal__technical-visual--studio" aria-label={isZh ? "纸包装结构技术示意" : "Paper packaging technical structure diagram"}>
      <div className="production-portal__technical-grid" aria-hidden="true" />
      <div className="production-portal__studio-drawing" aria-hidden="true">
        <span className="production-portal__studio-panel" />
        <span className="production-portal__studio-fold" />
        <span className="production-portal__studio-insert" />
        <i className="production-portal__dimension production-portal__dimension--width" data-technical-label="WIDTH">WIDTH</i>
        <i className="production-portal__dimension production-portal__dimension--depth" data-technical-label="DEPTH">DEPTH</i>
        <span className="production-portal__technical-label production-portal__technical-label--panel" data-technical-label="PANEL">PANEL</span>
        <span className="production-portal__technical-label production-portal__technical-label--fold" data-technical-label="FOLD">FOLD</span>
        <span className="production-portal__technical-label production-portal__technical-label--studio-insert" data-technical-label="INSERT">INSERT</span>
      </div>
      <p className="production-portal__technical-caption">STRUCTURE REVIEW / OPEN + CLOSED</p>
    </div>
  );
}

function PortalVisual({ route, isZh }: { route: PortalRoute; isZh: boolean }) {
  if (route.visual === "packaging") return <PackagingStructureVisual isZh={isZh} />;
  if (route.visual === "solutions") return <SolutionsStructureVisual isZh={isZh} />;
  if (route.visual === "studio") return <StudioStructureVisual isZh={isZh} />;
  if (route.visual === "checklist") return <PaperChecklist isZh={isZh} />;
  if (route.visual === "brief") return <BriefDiagram isZh={isZh} />;

  return (
    <ResilientImage
      src={route.image!}
      fallbackSrc={showcaseImages.foodOpen}
      alt={route.imageAlt!}
      fill
      preload={route.id === "materials"}
      loading={route.id === "materials" ? "eager" : "lazy"}
      fetchPriority={route.id === "materials" ? "high" : undefined}
      sizes="(max-width: 480px) 344px, (max-width: 767px) 100vw, (max-width: 1179px) 52vw, 42vw"
      quality={route.id === "materials" ? 54 : 68}
      unoptimized={route.id === "materials"}
      className="object-cover"
    />
  );
}

export default function ProductionPortalHome({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const language: PortalLocale = isZh ? "zh" : "en";
  const strings = copy[language];
  const routes = routeContent[language];
  const reduceMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
  const [selectedId] = useState(getInitialRoute);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDialogElement>(null);
  const panelTriggerRef = useRef<HTMLButtonElement>(null);
  const previousBodyOverflow = useRef("");
  const previousHtmlOverflow = useRef("");
  const routeRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const prefetched = useRef(new Set<string>());
  const activeId = previewId ?? selectedId;
  const activeRoute = useMemo(() => routes.find((route) => route.id === activeId) ?? routes[0], [activeId, routes]);

  const prefetchRoute = useCallback((route: PortalRoute) => {
    if (!route.image || route.visual !== "image" || prefetched.current.has(route.id)) return;
    prefetched.current.add(route.id);
    const image = new window.Image();
    image.decoding = "async";
    image.src = route.image;
  }, []);

  const previewRoute = useCallback((route: PortalRoute) => {
    setPreviewId(route.id);
    prefetchRoute(route);
  }, [prefetchRoute]);

  useEffect(() => {
    const idle = window.requestIdleCallback?.(() => routes.slice(1).forEach(prefetchRoute)) ?? window.setTimeout(() => routes.slice(1).forEach(prefetchRoute), 1400);
    return () => {
      if (typeof idle === "number") window.clearTimeout(idle);
    };
  }, [prefetchRoute, routes]);

  useEffect(() => {
    const dialog = panelRef.current;
    if (!dialog) return;
    if (panelOpen) {
      previousBodyOverflow.current = document.body.style.overflow;
      previousHtmlOverflow.current = document.documentElement.style.overflow;
      document.documentElement.classList.add("route-dialog-open");
      document.body.classList.add("route-dialog-open");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
    document.documentElement.classList.remove("route-dialog-open");
    document.body.classList.remove("route-dialog-open");
    document.documentElement.style.overflow = previousHtmlOverflow.current;
    document.body.style.overflow = previousBodyOverflow.current;
  }, [panelOpen]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  useEffect(() => {
    const onPageHide = () => setPanelOpen(false);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.documentElement.classList.remove("route-dialog-open");
      document.body.classList.remove("route-dialog-open");
      document.documentElement.style.overflow = previousHtmlOverflow.current;
      document.body.style.overflow = previousBodyOverflow.current;
    };
  }, []);

  useEffect(() => {
    if (!panelOpen) panelTriggerRef.current?.focus();
  }, [panelOpen]);

  const rememberAndNavigate = useCallback((route: PortalRoute) => {
    window.sessionStorage.setItem("kehong:portal-preview", route.id);
  }, []);

  const onRouteKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = routeRefs.current.findIndex((item) => item === document.activeElement);
    if (current < 0) return;
    let next = current;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = Math.min(routes.length - 1, current + 1);
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = Math.max(0, current - 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = routes.length - 1;
    if (next !== current) {
      event.preventDefault();
      routeRefs.current[next]?.focus();
    }
  };

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionConfig reducedMotion="user">
      <section className="production-portal" data-reduced-motion={reduceMotion ? "true" : "false"} data-dialog-open={panelOpen ? "true" : "false"} aria-label={isZh ? "科宏包装门户" : "Kehong route-led packaging portal"}>
        <div className="production-portal__inner">
          <div className="production-portal__brand-panel">
            <div>
              <p className="production-portal__eyebrow">{strings.eyebrow}</p>
              <h1>{strings.title.split("\n").map((line, index) => <span key={line}>{line}{index === 0 ? <br /> : null}</span>)}</h1>
              <p className="production-portal__body"><span className="production-portal__body-desktop">{strings.body}</span><span className="production-portal__body-mobile">{strings.mobileBody}</span></p>
            </div>
            <ul className="production-portal__proofs" aria-label={isZh ? "企业能力" : "Production proof points"}>
              {(isZh ? ["材料供应", "结构打样", "纸材加工与后工艺", "出口包装"] : ["Material supply", "Structural sampling", "Converting & finishing", "Export-ready packing"]).map((proof) => <li key={proof}><Check size={14} aria-hidden="true" />{proof}</li>)}
            </ul>
          </div>

          <div className="production-portal__stage" data-testid="production-portal-stage">
            <div className="production-portal__stage-media">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={activeRoute.id} className="production-portal__stage-visual" data-visual-route={activeRoute.id} initial={reduceMotion || !previewId ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={transition}>
                  <PortalVisual route={activeRoute} isZh={isZh} />
                  <span className="production-portal__stage-marker">{activeRoute.category}</span>
                  <span className="production-portal__stage-source">{strings.idleLabel}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="production-portal__stage-copy">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={activeRoute.id} initial={reduceMotion || !previewId ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={transition}>
                  <p className="production-portal__stage-category">{strings.visualLabel} / {activeRoute.category}</p>
                  <h2>{activeRoute.heading}</h2>
                  <p>{activeRoute.description}</p>
                  <Link href={activeRoute.href} className="production-portal__stage-cta" onClick={() => rememberAndNavigate(activeRoute)}>{activeRoute.cta}<ArrowRight size={16} aria-hidden="true" /></Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="production-portal__route-panel">
            <div className="production-portal__route-heading"><p>{strings.routes}</p><span>{String(routes.length).padStart(2, "0")}</span></div>
            <div className="production-portal__routes" onKeyDown={onRouteKeyDown}>
              {routes.map((route, index) => (
                <Link
                  key={route.id}
                  ref={(node) => { routeRefs.current[index] = node; }}
                  href={route.href}
                  className={`production-portal__route ${selectedId === route.id ? "is-selected" : ""}`}
                  data-route-id={route.id}
                  onMouseEnter={() => previewRoute(route)}
                  onMouseLeave={() => setPreviewId(null)}
                  onFocus={() => previewRoute(route)}
                  onBlur={() => setPreviewId(null)}
                  onClick={() => rememberAndNavigate(route)}
                >
                  <span className="production-portal__route-number">{route.number}</span>
                  <span className="production-portal__route-text"><strong>{route.title}</strong><small>{route.subtitle}</small></span>
                  <ArrowRight className="production-portal__route-arrow" size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div className="production-portal__mobile-actions">
            <button ref={panelTriggerRef} type="button" className="production-portal__explore-button" onClick={() => setPanelOpen(true)} aria-haspopup="dialog">{strings.explore}<ArrowRight size={16} aria-hidden="true" /></button>
            <Link href="/contact" className="production-portal__quote-button">{strings.quote}</Link>
          </div>

          <nav className="production-portal__bottom-rail" aria-label="Footer links">
            <span>{strings.location}</span>
            <span className="production-portal__rail-contact"><a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} aria-hidden="true" />WhatsApp</a><a href={`mailto:${contact.email}`}><Mail size={14} aria-hidden="true" />Email</a></span>
            <span className="production-portal__rail-legal"><Link href="/privacy">{strings.privacy}</Link><Link href="/terms">{strings.terms}</Link><span>© 2026 Kehong</span></span>
          </nav>
        </div>

        <dialog ref={panelRef} className="production-portal__dialog" aria-labelledby="production-portal-dialog-title" onCancel={(event) => { event.preventDefault(); closePanel(); }} onClose={() => { if (panelOpen) setPanelOpen(false); }} onClick={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
          <div className="production-portal__dialog-inner">
            <div className="production-portal__dialog-top"><span className="production-portal__dialog-logo">KH</span><span className="production-portal__dialog-name">{strings.panelTitle}</span><button type="button" aria-label={strings.closePanel} onClick={closePanel}><X size={20} /></button></div>
            <div className="production-portal__dialog-intro"><p className="production-portal__eyebrow">{strings.routes}</p><h2 id="production-portal-dialog-title">{strings.panelTitle}</h2><p>{strings.panelIntro}</p></div>
            <div className="production-portal__dialog-routes">
              {routes.map((route) => <Link key={route.id} href={route.href} data-route-id={route.id} onFocus={() => previewRoute(route)} onClick={() => { rememberAndNavigate(route); closePanel(); }}><span className="production-portal__route-number">{route.number}</span><span className="production-portal__route-text"><strong>{route.title}</strong><small>{route.subtitle}</small></span><ArrowRight size={17} aria-hidden="true" /></Link>)}
            </div>
            <div className="production-portal__dialog-footer"><div><a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} aria-hidden="true" />WhatsApp</a><a href={`mailto:${contact.email}`}><Mail size={14} aria-hidden="true" />Email</a></div><div><Link href="/privacy">{strings.privacy}</Link><Link href="/terms">{strings.terms}</Link></div></div>
          </div>
        </dialog>
      </section>
    </MotionConfig>
  );
}
