"use client";

import { MessageCircle, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { contact } from "@/data/company";

/** A compact mobile-only action bar that appears after the first viewport. */
export default function MobileStickyActions() {
  const locale = useLocale();
  const zh = locale === "zh";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.72);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`;
  return (
    <div className="kh-mobile-sticky-actions" data-testid="mobile-sticky-actions">
      <Link href="/contact" className="kh-button kh-button-primary">
        <Quote className="size-4" />
        {zh ? "提交询价" : "Get a quote"}
      </Link>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="kh-button kh-button-secondary">
        <MessageCircle className="size-4" />
        WhatsApp
      </a>
    </div>
  );
}
