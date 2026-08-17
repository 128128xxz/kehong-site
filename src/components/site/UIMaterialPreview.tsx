"use client";

import { useEffect } from "react";

const PREVIEW_MATERIALS = new Set(["glass-a", "glass-b", "glass-c"]);

/**
 * The query switch controls the broader material preview. The navigation
 * bubbles are live UI, so their pointer coordinates are kept active on the
 * production header as well; no routing or server data is changed.
 */
export default function UIMaterialPreview() {
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("uiMaterial") ?? "current";
    const material = PREVIEW_MATERIALS.has(requested) ? requested : "current";
    const root = document.documentElement;
    root.dataset.uiMaterial = material;
    root.dataset.navGlass = "true";

    const surfaceSelector = ".kh-header, .kh-nav-panel, .kh-language-menu, .kh-mobile-panel";
    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const applyPointer = () => {
      frame = 0;
      if (!lastEvent) return;

      const event = lastEvent;
      lastEvent = null;
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(surfaceSelector)
        : null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      target.style.setProperty("--glass-pointer-x", `${x.toFixed(2)}%`);
      target.style.setProperty("--glass-pointer-y", `${y.toFixed(2)}%`);
      target.style.setProperty("--glass-tilt-x", `${((x - 50) * 0.06).toFixed(2)}deg`);
      target.style.setProperty("--glass-tilt-y", `${((50 - y) * 0.04).toFixed(2)}deg`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastEvent = event;
      if (!frame) frame = window.requestAnimationFrame(applyPointer);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
      delete root.dataset.uiMaterial;
      delete root.dataset.navGlass;
    };
  }, []);

  return null;
}
