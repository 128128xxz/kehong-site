"use client";

import { useEffect } from "react";

/** Keeps the browser document language aligned with the active public locale. */
export default function LocaleDocumentLanguage({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
  }, [locale]);

  return null;
}
