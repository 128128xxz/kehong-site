"use client";

import { Link } from "@/i18n/navigation";

/** Shared consent control so both quote journeys keep the same label semantics. */
export default function InquiryConsent({ locale, id }: { locale: string; id: string }) {
  const zh = locale === "zh";
  return (
    <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-(--kh-muted)">
      <input id={id} name="privacy" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-(--kh-forest)" required />
      <label htmlFor={id}>
        {zh ? "我同意科宏纸品根据" : "I agree that Kehong may process this inquiry under the "}
        <Link href="/privacy" className="kh-inline-link" onClick={(event) => event.stopPropagation()}>
          {zh ? "隐私政策" : "Privacy Policy"}
        </Link>
        {zh ? "处理我提交的信息，以便回复本次询盘。" : "."}
      </label>
    </div>
  );
}
