"use client";

import { useEffect } from "react";

/** Shared motion hook. Route changes stay native; no homepage hash scrolling is added. */
export default function SiteMotion() {
  useEffect(() => {
    document.documentElement.classList.add("site-ready");
  }, []);

  return null;
}
