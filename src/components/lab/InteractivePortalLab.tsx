"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResilientImage from "@/components/ui/ResilientImage";
import { showcaseImages } from "@/data/visuals";

const InteractivePortalScene = dynamic(() => import("./InteractivePortalScene"), {
  ssr: false,
  loading: () => <div className="interactive-portal__canvas-fallback" aria-label="Loading packaging preview" />,
});

type PortalRoute = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  marker: string;
};

const routes: PortalRoute[] = [
  {
    id: "materials",
    eyebrow: "01 / Product system",
    title: "Paper materials",
    summary: "Kraft, card and specialty stocks matched to the converting process and end use.",
    href: "/products?system=materials",
    cta: "Open materials",
    image: showcaseImages.swatch,
    imageAlt: "Kehong paperboard material samples",
    marker: "MATERIALS",
  },
  {
    id: "packaging",
    eyebrow: "02 / Product system",
    title: "Finished packaging",
    summary: "Food boxes, inserts and custom structures prepared for sampling and production review.",
    href: "/products?system=packaging",
    cta: "Open packaging",
    image: showcaseImages.webOpenBox,
    imageAlt: "Open custom paper packaging box",
    marker: "PACKAGING",
  },
  {
    id: "solutions",
    eyebrow: "03 / Solution route",
    title: "Food & bakery",
    summary: "Oil-resistant paper structures, cup fan blanks and bakery formats for repeat programs.",
    href: "/products?search=food",
    cta: "Explore food packaging",
    image: showcaseImages.webBakeryWindowBox,
    imageAlt: "Food and bakery paper packaging",
    marker: "FOOD / BAKERY",
  },
  {
    id: "factory",
    eyebrow: "04 / Manufacturing",
    title: "Factory capability",
    summary: "Automatic feeding, die-cutting and converting supported by a clear sampling workflow.",
    href: "/factory",
    cta: "See factory capability",
    image: showcaseImages.machineClose,
    imageAlt: "Kehong precision paper converting equipment",
    marker: "FACTORY",
  },
  {
    id: "studio",
    eyebrow: "05 / Structure review",
    title: "3D Studio",
    summary: "Review the panel, fold and insert relationship before the project moves to quotation.",
    href: "/model-preview",
    cta: "Open 3D studio",
    image: showcaseImages.modelTechnicalPreview,
    imageAlt: "Kehong packaging structure technical preview",
    marker: "3D STUDIO",
  },
  {
    id: "quote",
    eyebrow: "06 / Project start",
    title: "Request a quote",
    summary: "Share dimensions, material targets and expected volumes with the Kehong project team.",
    href: "/contact",
    cta: "Start an inquiry",
    image: showcaseImages.sampleRoom,
    imageAlt: "Paper packaging samples prepared for buyer review",
    marker: "PROJECT START",
  },
];

type Version = "a" | "b";

function routeFromQuery() {
  if (typeof window === "undefined") return routes[0].id;
  const requested = new URLSearchParams(window.location.search).get("portal");
  return routes.some((route) => route.id === requested) ? requested! : routes[0].id;
}

export default function InteractivePortalLab() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [version, setVersion] = useState<Version>("a");
  const [selectedId, setSelectedId] = useState(routeFromQuery);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const activeId = previewId ?? selectedId;
  const activeRoute = useMemo(() => routes.find((route) => route.id === activeId) ?? routes[0], [activeId]);

  const setRoute = useCallback((id: string, push = true) => {
    setSelectedId(id);
    setPreviewId(null);
    if (typeof window !== "undefined" && push) {
      const url = new URL(window.location.href);
      url.searchParams.set("portal", id);
      window.history.pushState({ portal: id }, "", url);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => setSelectedId(routeFromQuery());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [mobileOpen]);

  const closeMobilePanel = () => {
    setMobileOpen(false);
    window.setTimeout(() => mobileTriggerRef.current?.focus(), 0);
  };

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionConfig reducedMotion="user">
      <div className={`interactive-portal interactive-portal--${version}`} data-reduced-motion={reduceMotion ? "true" : "false"} data-portal-pathname={pathname}>
        <div className="interactive-portal__grain" aria-hidden="true" />
        <section className="interactive-portal__intro" aria-labelledby="interactive-portal-title">
          <div className="interactive-portal__intro-copy">
            <p className="interactive-portal__eyebrow">Interaction study / Kehong Paper</p>
            <h1 id="interactive-portal-title">A clearer way into the paper system.</h1>
            <p className="interactive-portal__lede">A route-led portal for buyers who need the right material, packaging family, factory proof or structure review without searching a long page.</p>
          </div>
          <div className="interactive-portal__controls" aria-label="Experiment controls">
            <span className="interactive-portal__control-label">Interaction direction</span>
            <div className="interactive-portal__toggle" role="group" aria-label="Choose visual direction">
              <button type="button" aria-pressed={version === "a"} onClick={() => setVersion("a")}>A / restrained</button>
              <button type="button" aria-pressed={version === "b"} onClick={() => setVersion("b")}>B / editorial</button>
            </div>
            <span className="interactive-portal__motion-note">{reduceMotion ? "Reduced motion fallback" : "Motion enabled · focus and hover supported"}</span>
          </div>
        </section>

        <section className="interactive-portal__workspace" aria-label="Interactive route portal">
          <div className="interactive-portal__route-column">
            <div className="interactive-portal__route-heading">
              <p className="interactive-portal__eyebrow">Choose a route</p>
              <span>Hover or focus to preview</span>
            </div>
            <nav className="interactive-portal__routes" aria-label="Portal destinations">
              {routes.map((route, index) => (
                <button
                  type="button"
                  key={route.id}
                  className={`interactive-portal__route ${selectedId === route.id ? "is-selected" : ""}`}
                  data-route-id={route.id}
                  aria-pressed={selectedId === route.id}
                  onMouseEnter={() => setPreviewId(route.id)}
                  onMouseLeave={() => setPreviewId(null)}
                  onFocus={() => setPreviewId(route.id)}
                  onBlur={() => setPreviewId(null)}
                  onClick={() => setRoute(route.id)}
                >
                  <span className="interactive-portal__route-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="interactive-portal__route-copy"><strong>{route.title}</strong><small>{route.eyebrow.split(" / ")[1]}</small></span>
                  <ChevronRight className="interactive-portal__route-arrow" aria-hidden="true" />
                </button>
              ))}
            </nav>
            <button ref={mobileTriggerRef} type="button" className="interactive-portal__mobile-trigger" aria-haspopup="dialog" onClick={() => setMobileOpen(true)}>
              <Menu size={18} aria-hidden="true" /> Open route panel
            </button>
          </div>

          <div className="interactive-portal__stage" data-testid="dynamic-visual-stage">
            <div className="interactive-portal__stage-topline"><span>Selected destination</span><span>{activeRoute.marker}</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeRoute.id} className="interactive-portal__visual" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={transition}>
                {activeRoute.id === "studio" ? (
                  <InteractivePortalScene active={selectedId === "studio"} />
                ) : (
                  <ResilientImage src={activeRoute.image} fallbackSrc={showcaseImages.foodOpen} alt={activeRoute.imageAlt} fill sizes="(max-width: 767px) 100vw, 56vw" className="object-cover" priority={activeRoute.id === routes[0].id} />
                )}
                <div className="interactive-portal__visual-wash" aria-hidden="true" />
                <span className="interactive-portal__visual-label">{activeRoute.marker}</span>
                <p className="interactive-portal__visual-caption">Local asset · Kehong reference material</p>
              </motion.div>
            </AnimatePresence>
            <div className="interactive-portal__stage-content">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={activeRoute.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ ...transition, delay: reduceMotion ? 0 : 0.04 }}>
                  <p className="interactive-portal__eyebrow">{activeRoute.eyebrow}</p>
                  <h2>{activeRoute.title}</h2>
                  <p>{activeRoute.summary}</p>
                  <Link className="interactive-portal__cta" href={activeRoute.href} data-testid="real-route-link">
                    {activeRoute.cta}<ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="interactive-portal__stage-footer"><span>Keyboard: Tab to preview · Enter to select</span><span>{version === "a" ? "A / restrained B2B" : "B / editorial impact"}</span></div>
          </div>
        </section>

        <section className="interactive-portal__principles" aria-label="Interaction principles">
          <div><span>01</span><strong>Route clarity</strong><p>Every tile has a real destination, not a dead-end visual.</p></div>
          <div><span>02</span><strong>Progressive detail</strong><p>Preview first; load the heavy 3D viewer only when selected.</p></div>
          <div><span>03</span><strong>Quiet motion</strong><p>Hover and focus reinforce the same route state with a reduced-motion fallback.</p></div>
          <div><span>04</span><strong>Buyer-ready</strong><p>Images stay grounded in Kehong&apos;s existing local factory and product assets.</p></div>
        </section>

        <dialog ref={dialogRef} className="interactive-portal__dialog" onCancel={closeMobilePanel} aria-label="Mobile route panel">
          <div className="interactive-portal__dialog-head"><p className="interactive-portal__eyebrow">Route panel</p><button type="button" aria-label="Close route panel" onClick={closeMobilePanel}><X size={20} /></button></div>
          <p className="interactive-portal__dialog-title">Where should we take you?</p>
          <div className="interactive-portal__dialog-list">
            {routes.map((route) => <button type="button" key={route.id} onClick={() => { setRoute(route.id); closeMobilePanel(); }}><span><small>{route.eyebrow}</small><strong>{route.title}</strong></span><ArrowRight size={18} aria-hidden="true" /></button>)}
          </div>
        </dialog>
      </div>
    </MotionConfig>
  );
}
