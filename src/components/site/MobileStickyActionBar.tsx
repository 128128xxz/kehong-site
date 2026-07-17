import { FileText, MessageCircle } from "lucide-react";
import { getLocale } from "next-intl/server";
import { contact } from "@/data/company";
import { Link } from "@/i18n/navigation";

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

export default async function MobileStickyActionBar() {
  const locale = await getLocale();
  const copy = stickyCopy[locale as keyof typeof stickyCopy] ?? stickyCopy.en;
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(copy.message)}`;

  return (
    <nav
      aria-label={locale === "zh" ? "移动端快速联系" : "Mobile quick contact"}
      className="mobile-sticky-action-bar fixed inset-x-0 bottom-0 z-50 border-t border-[#d9d2be] bg-[#171713]/96 px-3 pt-2 text-white shadow-2xl shadow-black/28 lg:hidden"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="grid min-h-12 place-items-center rounded-md border border-white/12 bg-white/8 px-2 text-center text-xs font-black"
        >
          <MessageCircle className="mb-1 size-4 text-[#e8c06c]" />
          {copy.whatsapp}
        </a>
        <Link
          href="/contact"
          className="grid min-h-12 place-items-center rounded-md bg-[#e8c06c] px-2 text-center text-xs font-black text-[#171713]"
        >
          <FileText className="mb-1 size-4" />
          {copy.quote}
        </Link>
      </div>
    </nav>
  );
}
