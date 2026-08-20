"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { isAnalyticsOptedOut } from "@/lib/analyticsPrivacy";
import { shouldSendLeadEvent, trackLeadEvent, type LeadEventPayload } from "@/lib/leadEvent";

const eventTypes = new Set<LeadEventPayload["eventType"]>([
  "page_view", "product_view", "contact_view", "quote_view",
  "email_click", "whatsapp_click", "form_start", "form_submit",
]);

function cleanPath(pathname: string) {
  return pathname.split("?")[0].slice(0, 500) || "/";
}

function safeQueryValue(value: string | null) {
  if (!value || value.length > 120 || /@|\+?\d[\d .()_-]{6,}\d/u.test(value)) return undefined;
  return value;
}

export default function B2BVisitorTracking({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const sent = useRef(new Set<string>());
  const [optedOut, setOptedOut] = useState(() => isAnalyticsOptedOut());

  useEffect(() => {
    const onPreferenceChange = () => setOptedOut(isAnalyticsOptedOut());
    window.addEventListener("kehong-analytics-preference-changed", onPreferenceChange);
    return () => window.removeEventListener("kehong-analytics-preference-changed", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (!shouldSendLeadEvent(enabled, optedOut)) return;
    const path = cleanPath(pathname);
    const params = new URLSearchParams(window.location.search);
    const common = {
      path,
      pageTitle: document.title.slice(0, 200),
      utmSource: safeQueryValue(params.get("utm_source")),
      utmMedium: safeQueryValue(params.get("utm_medium")),
      utmCampaign: safeQueryValue(params.get("utm_campaign")),
      utmTerm: safeQueryValue(params.get("utm_term")),
      utmContent: safeQueryValue(params.get("utm_content")),
    };
    const send = (eventType: LeadEventPayload["eventType"], key: string = eventType) => {
      const eventKey = `${path}:${key}`;
      if (sent.current.has(eventKey)) return;
      sent.current.add(eventKey);
      trackLeadEvent({ eventType, ...common });
    };

    send("page_view");
    if (/\/products(?:\/|$)/u.test(path)) send("product_view");
    if (/\/contact(?:\/|$)/u.test(path)) {
      send("contact_view");
      if (params.has("product") || params.has("interest")) send("quote_view");
    }

    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as Element | null)?.closest("form")) send("form_start");
    };
    const onSubmit = (event: Event) => {
      if ((event.target as Element | null)?.closest("form")) send("form_submit");
    };
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest("a,button");
      if (!target) return;
      const declared = target.getAttribute("data-b2b-event");
      if (declared && eventTypes.has(declared as LeadEventPayload["eventType"])) {
        send(declared as LeadEventPayload["eventType"], `${declared}:${target.textContent?.slice(0, 80) ?? ""}`);
        return;
      }
      const href = target instanceof HTMLAnchorElement ? target.href : "";
      if (href.startsWith("mailto:")) send("email_click");
      else if (/whatsapp|wa\.me/u.test(href)) send("whatsapp_click");
      else if (/\/contact(?:\/|$)/u.test(href)) send("quote_view");
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("submit", onSubmit);
      document.removeEventListener("click", onClick);
    };
  }, [enabled, optedOut, pathname]);

  return null;
}
