"use client";

import { Check, Copy, MapPin } from "lucide-react";
import { useState } from "react";
import LocationClickAnchor from "@/components/site/LocationClickAnchor";

type Props = {
  locale: string;
  sourceBlock: string;
  mapProvider: "baidu" | "google";
  href: string;
  title: string;
  mapLabel: string;
  address: string;
  viewLabel: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
};

/** A keyboard-safe location card: the card opens the map, while the separate
 * copy action never nests a button inside the tracked map anchor. */
export default function FactoryLocationCard({
  locale,
  sourceBlock,
  mapProvider,
  href,
  title,
  mapLabel,
  address,
  viewLabel,
  copyLabel,
  copiedLabel,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const input = document.createElement("textarea");
        input.value = address;
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
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <LocationClickAnchor
        href={href}
        locale={locale}
        sourceBlock={sourceBlock}
        mapProvider={mapProvider}
        target="_blank"
        rel="noopener noreferrer"
        className="kh-panel group block min-h-11 p-4 pr-36 transition hover:border-(--kh-forest)/45 focus-visible:border-(--kh-forest)/65"
        aria-label={title}
      >
        <span className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-(--kh-brass)" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-semibold text-(--kh-ink)">{title}</span>
            <span className="mt-1 block text-xs font-medium text-(--kh-brass)">{mapLabel}</span>
            <span className="mt-1 block text-sm leading-6 text-(--kh-muted)">{address}</span>
            <span className="mt-2 inline-flex items-center text-sm font-semibold text-(--kh-forest)">{viewLabel}</span>
          </span>
        </span>
      </LocationClickAnchor>
      <button
        type="button"
        className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-(--kh-line) bg-(--kh-surface) px-3 text-sm font-semibold text-(--kh-forest) shadow-sm transition hover:border-(--kh-forest)/45 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--kh-brass)"
        onClick={copyAddress}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        <span>{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}
