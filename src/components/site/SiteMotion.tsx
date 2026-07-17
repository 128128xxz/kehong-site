"use client";

import { useEffect } from "react";

const reduceMotionQuery = "(prefers-reduced-motion: reduce)";
const precisePointerQuery = "(min-width: 1024px) and (pointer: fine)";

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

function getHeaderOffset() {
  const header = document.querySelector<HTMLElement>("header");
  return Math.ceil(header?.getBoundingClientRect().height ?? 0);
}

function getHashTarget(hash: string) {
  if (!hash || hash === "#") return null;

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return document.getElementById(hash.slice(1));
  }
}

function getScrollTop(target: HTMLElement, hash: string) {
  if (hash === "#home") return 0;

  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  if (hash === "#studio") {
    return Math.min(maxScroll, Math.max(0, targetTop + Math.min(window.innerHeight * 0.32, 300)));
  }

  return Math.min(maxScroll, Math.max(0, targetTop - getHeaderOffset() - 18));
}

function scrollToHash(hash: string, mode: ScrollBehavior = "smooth") {
  const target = getHashTarget(hash);
  if (!target) return false;

  if (hash === "#studio") {
    window.dispatchEvent(new CustomEvent("kehong:request-3d"));
  }

  const shouldAnimate = mode === "smooth"
    && window.matchMedia(precisePointerQuery).matches
    && !window.matchMedia(reduceMotionQuery).matches;

  window.scrollTo({
    top: getScrollTop(target, hash),
    behavior: shouldAnimate ? "smooth" : "auto",
  });

  return true;
}

export default function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("site-ready");
  }, []);

  useEffect(() => {
    const handleHashLink = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href*='#']");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      const url = new URL(href, window.location.href);
      if (
        url.origin !== window.location.origin
        || normalizePath(url.pathname) !== normalizePath(window.location.pathname)
        || !url.hash
      ) return;
      if (!getHashTarget(url.hash)) return;

      event.preventDefault();
      link.closest("details")?.removeAttribute("open");
      window.history.pushState(null, "", url.hash);
      scrollToHash(url.hash);
    };

    const handlePopState = () => {
      if (window.location.hash) scrollToHash(window.location.hash, "auto");
    };

    const alignInitialHash = window.setTimeout(() => {
      if (window.location.hash) scrollToHash(window.location.hash, "auto");
    }, 80);

    document.addEventListener("click", handleHashLink);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.clearTimeout(alignInitialHash);
      document.removeEventListener("click", handleHashLink);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
