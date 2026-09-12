"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { isAnalyticsOptedOut } from "@/lib/analyticsPrivacy";
import { shouldSendLeadEvent, trackLeadEvent, type LeadEventPayload } from "@/lib/leadEvent";

const eventTypes = new Set<LeadEventPayload["eventType"]>([
  "page_view", "product_view", "contact_view", "quote_view",
  "email_click", "whatsapp_click", "form_start", "form_submit",
  "engagement_ping",
]);

const HEARTBEAT_WINDOW_SECONDS = 15;
const HEARTBEAT_MAX_SECONDS = 30;

function cleanPath(pathname: string) {
  return pathname.split("?")[0].slice(0, 500) || "/";
}

function safeQueryValue(value: string | null) {
  if (!value || value.length > 120 || /@|\+?\d[\d .()_-]{6,}\d/u.test(value)) return undefined;
  return value;
}

function shouldTrackEngagement() {
  return document.visibilityState === "visible" && document.hasFocus() === true;
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
      referrer: document.referrer || undefined,
      utmSource: safeQueryValue(params.get("utm_source")),
      utmMedium: safeQueryValue(params.get("utm_medium")),
      utmCampaign: safeQueryValue(params.get("utm_campaign")),
      utmTerm: safeQueryValue(params.get("utm_term")),
      utmContent: safeQueryValue(params.get("utm_content")),
      automationHint: navigator.webdriver === true,
    };
    const sentEvents = sent.current;

    const send = (eventType: LeadEventPayload["eventType"], key: string = eventType, durationSeconds?: number, allowDuplicate = false) => {
      const eventKey = `${path}:${key}`;
      if (!allowDuplicate && sentEvents.has(eventKey)) return;
      if (!allowDuplicate) sentEvents.add(eventKey);
      trackLeadEvent({ eventType, ...common, ...(durationSeconds == null ? {} : { durationSeconds }) });
    };

    send("page_view");
    if (/\/products(?:\/|$)/u.test(path)) send("product_view");
    if (/\/contact(?:\/|$)/u.test(path)) {
      send("contact_view");
      if (params.has("product") || params.has("interest")) send("quote_view");
    }

    const heartbeatState = {
      accumulatedMs: 0,
      segmentStartMs: shouldTrackEngagement() ? performance.now() : null,
    };

    const addElapsed = () => {
      if (heartbeatState.segmentStartMs == null) return;
      heartbeatState.accumulatedMs += Math.max(0, performance.now() - heartbeatState.segmentStartMs);
      heartbeatState.segmentStartMs = null;
    };

    const resumeHeartbeat = () => {
      if (shouldTrackEngagement() && heartbeatState.segmentStartMs == null) {
        heartbeatState.segmentStartMs = performance.now();
      }
    };

    const flushHeartbeat = (force = false) => {
      addElapsed();

      const pendingSeconds = Math.floor(heartbeatState.accumulatedMs / 1000);
      if (pendingSeconds <= 0) {
        resumeHeartbeat();
        return;
      }

      const canSend = force || pendingSeconds >= HEARTBEAT_WINDOW_SECONDS;
      if (!canSend) {
        resumeHeartbeat();
        return;
      }

      const durationSeconds = Math.min(HEARTBEAT_MAX_SECONDS, pendingSeconds);
      heartbeatState.accumulatedMs -= durationSeconds * 1000;
      send("engagement_ping", `engagement:${Date.now()}:${durationSeconds}`, durationSeconds, true);
      resumeHeartbeat();
    };

    const onVisibilityChange = () => {
      if (shouldTrackEngagement()) {
        resumeHeartbeat();
      } else {
        flushHeartbeat(true);
      }
    };

    const onPageHide = () => {
      flushHeartbeat(true);
    };

    const tick = () => {
      flushHeartbeat();
    };

    const interval = window.setInterval(tick, 1000);
    const onFocusIn = (event: FocusEvent) => {
      const target = (event.target as Element | null)?.closest("form");
      if (target) send("form_start", `form-start:${target.getAttribute("id") || target.getAttribute("name") || ""}`);
    };
    const onSubmit = (event: Event) => {
      const target = (event.target as Element | null)?.closest("form");
      if (target) send("form_submit", `form-submit:${target.getAttribute("id") || target.getAttribute("name") || ""}`);
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
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("submit", onSubmit);
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      flushHeartbeat(true);
      sentEvents.clear();
    };
  }, [enabled, optedOut, pathname]);

  return null;
}
