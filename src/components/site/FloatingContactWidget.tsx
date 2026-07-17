"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { contact } from "@/data/company";

const contactCopy = {
  zh: {
    trigger: "询盘",
    title: "告诉我们你的包装需求",
    body: "发尺寸、材料、数量或样品图，销售会按配置跟进报价。",
    whatsapp: "WhatsApp",
    close: "关闭联系面板",
    hint: "点击联系",
    response: "报价咨询",
  },
  en: {
    trigger: "Inquiry",
    title: "Send your packaging brief",
    body: "Share size, material, quantity or sample photos and our team will follow up with a tailored quotation.",
    whatsapp: "WhatsApp",
    close: "Close contact panel",
    hint: "Contact us",
    response: "Quote support",
  },
  es: {
    trigger: "Consulta",
    title: "Enviar solicitud",
    body: "Elige WeChat o WhatsApp para enviar tu solicitud de empaque.",
    whatsapp: "WhatsApp",
    close: "Cerrar panel",
    hint: "Contactar",
    response: "Cotizacion rapida",
  },
  id: {
    trigger: "Inquiry",
    title: "Hubungi sales",
    body: "Pilih WeChat atau WhatsApp untuk mengirim kebutuhan packaging.",
    whatsapp: "WhatsApp",
    close: "Tutup panel",
    hint: "Kontak",
    response: "Quote cepat",
  },
  vi: {
    trigger: "Inquiry",
    title: "Gặp sales",
    body: "Chọn WeChat hoặc WhatsApp để gửi yêu cầu bao bì.",
    whatsapp: "WhatsApp",
    close: "Đóng bảng",
    hint: "Lien he",
    response: "Bao gia nhanh",
  },
  th: {
    trigger: "Inquiry",
    title: "คุยกับฝ่ายขาย",
    body: "เลือก WeChat หรือ WhatsApp เพื่อส่งความต้องการบรรจุภัณฑ์.",
    whatsapp: "WhatsApp",
    close: "ปิดแผง",
    hint: "Contact",
    response: "Fast quote",
  },
  ms: {
    trigger: "Inquiry",
    title: "Hubungi jualan",
    body: "Pilih WeChat atau WhatsApp untuk hantar keperluan pembungkusan.",
    whatsapp: "WhatsApp",
    close: "Tutup panel",
    hint: "Hubungi",
    response: "Quote pantas",
  },
} as const;

export default function FloatingContactWidget() {
  const locale = useLocale();
  const copy = contactCopy[locale as keyof typeof contactCopy] ?? contactCopy.en;
  const [open, setOpen] = useState(false);
  const quoteMessage = encodeURIComponent(
    locale === "zh"
      ? "你好科宏，我想咨询纸品包装定制报价。"
      : "Hello Kehong, I would like a quotation for custom paper packaging.",
  );
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=${quoteMessage}`;

  return (
    <div className="fixed right-3 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
      {open ? (
        <div className="premium-depth absolute right-0 top-14 w-[min(calc(100vw-2rem),21rem)] overflow-hidden rounded-lg border border-white/55 bg-white/88 text-[#171713] shadow-2xl shadow-black/20 backdrop-blur-2xl sm:right-0">
          <div className="kh-micro-grid border-b border-black/8 bg-[#f6f4ec]/62 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kh-status-dot inline-flex items-center gap-2 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9a6b1f]">
                  {copy.response}
                </p>
                <p className="mt-2 text-base font-black">{copy.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#414238]/72">{copy.body}</p>
              </div>
              <button
                type="button"
                aria-label={copy.close}
                onClick={() => setOpen(false)}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 bg-white/60 text-[#171713] transition hover:bg-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-2 p-3">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-md bg-[#171713] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#171713]/14 transition hover:-translate-y-0.5 hover:bg-[#2b2b24]"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4 text-[#e8c06c]" />
                {copy.whatsapp}
              </span>
              <Send className="size-4 text-[#e8c06c]" />
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="premium-depth group flex items-center gap-2 rounded-full border border-white/48 bg-white/82 px-2 py-2 text-[#171713] shadow-2xl shadow-black/14 backdrop-blur-2xl transition hover:scale-[1.03] hover:bg-white xl:px-3"
      >
        <span className="grid size-8 place-items-center rounded-full bg-[#171713] text-[#e8c06c] shadow-lg shadow-[#171713]/20">
          <MessageCircle className="size-4 transition group-hover:scale-110" />
        </span>
        <span className="hidden text-left xl:block">
          <span className="block text-sm font-black leading-4">{copy.trigger}</span>
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#626156]">
            {copy.hint}
          </span>
        </span>
      </button>
    </div>
  );
}
