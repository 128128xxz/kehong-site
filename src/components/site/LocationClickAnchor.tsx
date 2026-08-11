"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { trackKehongEvent } from "@/lib/attribution";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  href: string;
  locale: string;
  sourceBlock: string;
  mapProvider: "baidu" | "google";
  children: ReactNode;
};

export default function LocationClickAnchor({ href, locale, sourceBlock, mapProvider, children, onClick, ...props }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    trackKehongEvent("location_click", {
      locale,
      path: window.location.pathname,
      sourceBlock,
      mapProvider,
      device: window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop",
    });
  };

  return <a {...props} href={href} data-location-source={sourceBlock} data-map-provider={mapProvider} onClick={handleClick}>{children}</a>;
}
