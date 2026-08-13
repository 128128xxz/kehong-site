"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { trackKehongEvent } from "@/lib/attribution";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  href: string;
  locale: string;
  sourceBlock: string;
  mapProvider: "baidu_directions" | "google_directions";
  action?: "view_location";
  children: ReactNode;
};

export type LocationActionContext = {
  locale: string;
  sourceBlock: string;
  mapProvider: "baidu_directions" | "google_directions";
  action: "view_location" | "copy_address";
};

export function trackLocationAction({ locale, sourceBlock, mapProvider, action }: LocationActionContext) {
  if (typeof window === "undefined") return;
  trackKehongEvent("location_click", {
    locale,
    page_path: window.location.pathname,
    source_block: sourceBlock,
    provider: mapProvider,
    action,
    device_type: window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop",
  });
}

export default function LocationClickAnchor({ href, locale, sourceBlock, mapProvider, action = "view_location", children, onClick, ...props }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    trackLocationAction({ locale, sourceBlock, mapProvider, action });
  };

  return <a {...props} href={href} data-location-source={sourceBlock} data-map-provider={mapProvider} data-location-action={action} onClick={handleClick}>{children}</a>;
}
