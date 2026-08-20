"use client";

import Image from "next/image";
import { Check, Copy, Download, QrCode, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type Props = {
  phone: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

const WECHAT_QR_SRC = "/media/shared/wechat-qr.png";

/**
 * Opens the verified WeChat QR code while keeping phone-copy as a fallback.
 */
export default function WeChatContactButton({
  phone,
  label = "微信咨询",
  copiedLabel = "手机号已复制",
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogTitleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function copyPhone() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(phone);
      } else {
        const input = document.createElement("textarea");
        input.value = phone;
        input.setAttribute("readonly", "true");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "kh-button kh-button-secondary"}
        aria-label={`${label}：打开二维码`}
        data-testid="wechat-contact"
      >
        <QrCode className="size-4" aria-hidden="true" />
        <span>{label}</span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
          data-testid="wechat-qr-dialog-backdrop"
        >
          <section
            className="relative w-full max-w-sm rounded-2xl bg-(--kh-paper) p-5 text-(--kh-ink) shadow-2xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onClick={(event) => event.stopPropagation()}
            data-testid="wechat-qr-dialog"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-(--kh-muted) transition hover:bg-black/5 hover:text-(--kh-ink)"
              aria-label="关闭微信二维码"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <p id={dialogTitleId} className="pr-10 text-lg font-semibold">微信咨询</p>
            <p className="mt-1 text-sm text-(--kh-muted)">扫码添加微信，或下载二维码保存。</p>
            <div className="mx-auto mt-5 w-full max-w-[20rem] overflow-hidden rounded-xl bg-white p-3">
              <Image
                src={WECHAT_QR_SRC}
                alt="科宏微信二维码"
                width={650}
                height={650}
                className="h-auto w-full"
                priority
              />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={WECHAT_QR_SRC}
                download="kehong-wechat-qr.png"
                className="kh-button kh-button-primary flex-1 justify-center"
                data-testid="wechat-qr-download"
              >
                <Download className="size-4" aria-hidden="true" />
                下载二维码
              </a>
              <button
                type="button"
                onClick={copyPhone}
                className="kh-button kh-button-secondary flex-1 justify-center"
                aria-label={copied ? copiedLabel : "复制微信备用手机号"}
                data-testid="wechat-phone-copy"
              >
                {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                <span>{copied ? copiedLabel : "复制手机号"}</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
