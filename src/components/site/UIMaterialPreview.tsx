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

    // Keep the lens coordinate on the header itself. Writing the same pointer
    // values to every bubble made each control render its own moving hotspot,
    // so neighboring bubbles appeared to move in sync. The header is the
    // single optical surface; controls sit above it as static clear bubbles.
    const header = document.querySelector<HTMLElement>(".kh-header");
    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const applyPointer = () => {
      frame = 0;
      if (!lastEvent) return;

      const event = lastEvent;
      lastEvent = null;
      if (!header) return;

      const rect = header.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      header.style.setProperty("--glass-pointer-x", `${x.toFixed(2)}%`);
      header.style.setProperty("--glass-pointer-y", `${y.toFixed(2)}%`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastEvent = event;
      if (!frame) frame = window.requestAnimationFrame(applyPointer);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
      header?.style.removeProperty("--glass-pointer-x");
      header?.style.removeProperty("--glass-pointer-y");
      delete root.dataset.uiMaterial;
      delete root.dataset.navGlass;
    };
  }, []);

  return null;
}
