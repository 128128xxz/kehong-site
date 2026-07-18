"use client";

import { FileText, MessageCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { contact } from "@/data/company";
import { Link, usePathname } from "@/i18n/navigation";

const stickyCopy = {
  zh: {
    whatsapp: "WhatsApp",
    quote: "获取报价",
    message: "你好科宏，我想咨询纸品包装报价。",
  },
  en: {
    whatsapp: "WhatsApp",
    quote: "Request a quote",
    message: "Hello Kehong, I would like a quote for paper packaging.",
  },
} as const;

type VisibilityState = {
  pastHero: boolean;
  finalCtaVisible: boolean;
  footerVisible: boolean;
  menuOpen: boolean;
  fieldFocused: boolean;
  keyboardOpen: boolean;
};

const initialVisibility: VisibilityState = {
  pastHero: false,
  finalCtaVisible: false,
  footerVisible: false,
  menuOpen: false,
  fieldFocused: false,
  keyboardOpen: false,
};

export default function MobileStickyActionBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const copy = stickyCopy[locale as keyof typeof stickyCopy] ?? stickyCopy.en;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(copy.message)}`;
  const [state, setState] = useState<VisibilityState>(initialVisibility);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("#home");
    const finalCta = document.querySelector<HTMLElement>("#inquiry");
    const footer = document.querySelector<HTMLElement>("footer");
    const mobileMenu = document.querySelector<HTMLDetailsElement>("header details.kh-compact-nav");

    const updateScrollState = () => {
      const pastHero = !hero || hero.getBoundingClientRect().bottom < 16;
      setState((current) => (current.pastHero === pastHero ? current : { ...current, pastHero }));
    };

    const updateMenuState = () => {
      const menuOpen = Boolean(mobileMenu?.open);
      setState((current) => (current.menuOpen === menuOpen ? current : { ...current, menuOpen }));
    };

    const updateKeyboardState = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const keyboardOpen = window.innerHeight - viewportHeight > 120;
      setState((current) => (current.keyboardOpen === keyboardOpen ? current : { ...current, keyboardOpen }));
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      const fieldFocused = target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
      if (fieldFocused) setState((current) => ({ ...current, fieldFocused: true }));
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        const active = document.activeElement;
        const fieldFocused = active instanceof HTMLElement && Boolean(active.closest("input, textarea, select, [contenteditable='true']"));
        setState((current) => ({ ...current, fieldFocused }));
      }, 0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === finalCta) {
            setState((current) => ({ ...current, finalCtaVisible: entry.isIntersecting }));
          }
          if (entry.target === footer) {
            setState((current) => ({ ...current, footerVisible: entry.isIntersecting }));
          }
        }
      },
      { threshold: 0.08 },
    );

    if (finalCta) observer.observe(finalCta);
    if (footer) observer.observe(footer);
    updateScrollState();
    updateMenuState();
    updateKeyboardState();

    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateKeyboardState);
    window.visualViewport?.addEventListener("resize", updateKeyboardState);
    mobileMenu?.addEventListener("toggle", updateMenuState);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateKeyboardState);
      window.visualViewport?.removeEventListener("resize", updateKeyboardState);
      mobileMenu?.removeEventListener("toggle", updateMenuState);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [pathname]);

  const isContactPage = pathname === "/contact" || pathname.endsWith("/contact");
  const visible = !isContactPage
    && state.pastHero
    && !state.finalCtaVisible
    && !state.footerVisible
    && !state.menuOpen
    && !state.fieldFocused
    && !state.keyboardOpen;

  return (
    <nav
      aria-label={locale === "zh" ? "移动端快速联系" : "Mobile quick contact"}
      aria-hidden={!visible}
      data-visible={visible ? "true" : "false"}
      className="mobile-sticky-action-bar fixed inset-x-0 bottom-0 z-50 border-t border-[#d9d2be]/70 bg-[#171713]/94 px-2 text-white shadow-[0_-8px_24px_rgba(0,0,0,.16)] lg:hidden"
      style={{ paddingTop: "0.375rem", paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-[36fr_64fr] gap-1.5">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-[.35rem] border border-white/16 bg-white/7 px-2 text-center text-xs font-black"
        >
          <MessageCircle className="size-4 text-[#e8c06c]" />
          {copy.whatsapp}
        </a>
        <Link
          href="/contact"
          tabIndex={visible ? 0 : -1}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-[.35rem] bg-[#e8c06c] px-2 text-center text-xs font-black text-[#171713]"
        >
          <FileText className="size-4" />
          {copy.quote}
        </Link>
      </div>
    </nav>
  );
}
