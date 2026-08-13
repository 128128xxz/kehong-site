"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  phone: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

/**
 * A conservative Chinese contact action when no verified WeChat ID or QR code
 * is configured: copy the verified phone number for a WeChat search.
 */
export default function WeChatContactButton({
  phone,
  label = "微信咨询",
  copiedLabel = "手机号已复制",
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

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
    <button
      type="button"
      onClick={copyPhone}
      className={className || "kh-button kh-button-secondary"}
      aria-label={copied ? copiedLabel : `${label}：复制手机号`}
      data-testid="wechat-contact"
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
