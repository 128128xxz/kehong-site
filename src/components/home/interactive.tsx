"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** 进入视口前的额外延迟(ms),用于同屏元素 stagger,上限约 400ms */
  delay?: number;
  /** rise = 自身位移入场;none = 自身不动,只向子元素广播 kh-reveal-in(供 keyline 等自定义动画) */
  mode?: "rise" | "none";
};

/**
 * 滚动入场原语。服务端渲染即终态,JS 挂载后才对"仍在视口外"的元素布防,
 * 因此 no-JS、爬虫和 e2e 始终看到完整内容;reduced-motion 下完全不启用。
 */
export function Reveal({ children, className = "", delay = 0, mode = "rise" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("in");
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const armedClass = mode === "rise" ? "kh-reveal-armed" : "kh-reveal-watch";
  const stateClass = state === "idle" ? "" : `${armedClass}${state === "in" ? " kh-reveal-in" : ""}`;
  return (
    <div
      ref={ref}
      className={`${className} ${stateClass}`.trim()}
      style={delay ? { transitionDelay: `${Math.min(delay, 400)}ms` } : undefined}
    >
      {children}
    </div>
  );
}

type CountUpProps = {
  /** 数字终值,如 20、8000 */
  to: number;
  suffix?: string;
  durationMs?: number;
};

/** 服务端直接渲染终值;挂载后若允许动效,则从 0 数到终值(进入视口触发一次)。 */
export function CountUp({ to, suffix = "", durationMs = 900 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (startedRef.current || !entries.some((entry) => entry.isIntersecting)) return;
        startedRef.current = true;
        observer.disconnect();
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.round(to * eased).toLocaleString("en-US")}${suffix}`;
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, suffix, durationMs]);

  return <span ref={ref}>{`${to.toLocaleString("en-US")}${suffix}`}</span>;
}

type MetricRevealProps = {
  children: ReactNode;
  className?: string;
};

/** One-shot reveal for the homepage metric row; final text remains in the SSR DOM. */
export function MetricReveal({ children, className = "" }: MetricRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    let raf = 0;
    let started = false;
    const reveal = () => {
      if (started) return;
      started = true;
      setState("in");
    };
    if (element.getBoundingClientRect().top < window.innerHeight * 0.94) {
      raf = requestAnimationFrame(reveal);
      return () => cancelAnimationFrame(raf);
    }
    setState("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          reveal();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const motionClass = state === "idle" ? "" : `kh-metric-motion kh-metric-motion-${state}`;
  return (
    <div ref={ref} className={`${className} ${motionClass}`.trim()}>
      {children}
    </div>
  );
}

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** 视差强度:元素随滚动的最大位移(px),正值同向、负值反向 */
  strength?: number;
};

/** 轻量滚动视差:仅 transform、仅 pointer:fine、reduced-motion 下不启用。 */
export function Parallax({ children, className, strength = 12 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let active = false;
    let elementTop = 0;
    let elementHeight = 0;

    // Measure layout only when it can change. Reading getBoundingClientRect
    // inside every scroll frame forces a synchronous layout and is visible
    // as a hitch when the factory section enters the viewport.
    const measure = () => {
      const rect = element.getBoundingClientRect();
      elementTop = rect.top + window.scrollY;
      elementHeight = rect.height;
    };

    const update = () => {
      raf = 0;
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = elementTop + elementHeight / 2 - window.scrollY;
      const ratio = Math.max(-1, Math.min(1, (elementCenter - viewportCenter) / viewportCenter));
      element.style.transform = `translateY(${(ratio * strength).toFixed(1)}px)`;
    };
    const onScroll = () => {
      if (active && !raf) raf = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver((entries) => {
      active = entries.some((entry) => entry.isIntersecting);
      if (active) {
        measure();
        onScroll();
      }
    });
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      measure();
      if (active) onScroll();
    });
    measure();
    resizeObserver?.observe(element);
    element.style.willChange = "transform";
    observer.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      element.style.transform = "";
      element.style.willChange = "";
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
