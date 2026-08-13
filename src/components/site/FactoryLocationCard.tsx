"use client";

import { Check, Copy, MapPin } from "lucide-react";
import { useState } from "react";
import LocationClickAnchor, { trackLocationAction } from "@/components/site/LocationClickAnchor";
import { FACTORY_MAP_DESTINATION } from "@/data/companyLocation";

type Props = {
  locale: string;
  sourceBlock: string;
  mapProvider: "baidu_directions" | "google_directions";
  href: string;
  title: string;
  mapLabel: string;
  address: string;
  viewLabel: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
};

/** A keyboard-safe location card with separate map and copy actions. */
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

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(FACTORY_MAP_DESTINATION);
      } else {
        const input = document.createElement("textarea");
        input.value = FACTORY_MAP_DESTINATION;
        input.setAttribute("readonly", "true");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopied(true);
      trackLocationAction({ locale, sourceBlock, mapProvider, action: "copy_address" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`kh-panel p-4 ${className}`.trim()} data-location-card>
      <div className="group block min-h-11">
        <span className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-(--kh-brass)" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-semibold text-(--kh-ink)">{title}</span>
            <span className="mt-1 block text-xs font-medium text-(--kh-brass)">{mapLabel}</span>
            <span className="mt-1 block text-sm leading-6 text-(--kh-muted)">{address}</span>
          </span>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <LocationClickAnchor
          href={href}
          locale={locale}
          sourceBlock={sourceBlock}
          mapProvider={mapProvider}
          action="view_location"
          target="_blank"
          rel="noopener noreferrer"
          className="kh-button kh-button-primary kh-button-compact min-h-11"
          aria-label={viewLabel}
        >
          <MapPin className="size-4" aria-hidden="true" />
          {viewLabel}
        </LocationClickAnchor>
        <button
          type="button"
          className="kh-button kh-button-secondary kh-button-compact min-h-11"
          onClick={handleCopyAddress}
          aria-label={copied ? copiedLabel : copyLabel}
        >
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
    </div>
  );
}
