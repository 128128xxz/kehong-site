"use client";

import { track } from "@vercel/analytics/react";

const storageKey = "kehong-attribution-v1";
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

export type KehongAttribution = {
  firstLandingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  gclid: string;
  fbclid: string;
  firstTouch: AttributionTouch;
  latestTouch: AttributionTouch;
};

export type AttributionTouch = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  path: string;
};

const emptyTouch = (): AttributionTouch => ({ source: "", medium: "", campaign: "", content: "", term: "", path: "" });
const emptyAttribution = (): KehongAttribution => ({ firstLandingPath: "", referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "", gclid: "", fbclid: "", firstTouch: emptyTouch(), latestTouch: emptyTouch() });

function asTouch(value: Partial<AttributionTouch> | undefined, fallback: AttributionTouch) {
  return {
    source: value?.source || fallback.source,
    medium: value?.medium || fallback.medium,
    campaign: value?.campaign || fallback.campaign,
    content: value?.content || fallback.content,
    term: value?.term || fallback.term,
    path: value?.path || fallback.path,
  };
}

export function captureAttribution(): KehongAttribution {
  if (typeof window === "undefined") return emptyAttribution();
  let stored = emptyAttribution();
  try { stored = { ...stored, ...JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}") }; } catch { /* session storage is optional */ }
  const params = new URLSearchParams(window.location.search);
  const incoming = Object.fromEntries(attributionKeys.map((key) => [key, params.get(key) ?? ""]));
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const incomingTouch: AttributionTouch = {
    source: incoming.utm_source,
    medium: incoming.utm_medium,
    campaign: incoming.utm_campaign,
    content: incoming.utm_content,
    term: incoming.utm_term,
    path: currentPath,
  };
  const hasIncomingCampaign = attributionKeys.some((key) => Boolean(incoming[key]));
  const legacyFirstTouch = {
    source: stored.utmSource,
    medium: stored.utmMedium,
    campaign: stored.utmCampaign,
    content: stored.utmContent,
    term: stored.utmTerm,
    path: stored.firstLandingPath,
  };
  const firstTouch = asTouch(stored.firstTouch, legacyFirstTouch);
  const initialFirstTouch = firstTouch.source || firstTouch.medium || firstTouch.campaign || firstTouch.content || firstTouch.term
    ? firstTouch
    : incomingTouch;
  const priorLatestTouch = asTouch(stored.latestTouch, initialFirstTouch);
  const latestTouch = hasIncomingCampaign ? incomingTouch : priorLatestTouch;
  const next: KehongAttribution = {
    firstLandingPath: stored.firstLandingPath || currentPath,
    referrer: stored.referrer || document.referrer || "",
    // Retain the historical flat fields as the immutable first-touch values.
    utmSource: initialFirstTouch.source,
    utmMedium: initialFirstTouch.medium,
    utmCampaign: initialFirstTouch.campaign,
    utmContent: initialFirstTouch.content,
    utmTerm: initialFirstTouch.term,
    gclid: incoming.gclid || stored.gclid,
    fbclid: incoming.fbclid || stored.fbclid,
    firstTouch: initialFirstTouch,
    latestTouch,
  };
  try { window.sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* session storage is optional */ }
  return next;
}

export function appendAttribution(form: FormData, ctaLocation: string, locale: string) {
  const attribution = captureAttribution();
  form.set("firstLandingPath", attribution.firstLandingPath);
  form.set("conversionPath", window.location.pathname);
  form.set("referrer", attribution.referrer);
  form.set("utmSource", attribution.utmSource);
  form.set("utmMedium", attribution.utmMedium);
  form.set("utmCampaign", attribution.utmCampaign);
  form.set("utmContent", attribution.utmContent);
  form.set("utmTerm", attribution.utmTerm);
  form.set("gclid", attribution.gclid);
  form.set("fbclid", attribution.fbclid);
  form.set("ctaLocation", ctaLocation);
  form.set("locale", locale);
  form.set("firstTouchSource", attribution.firstTouch.source);
  form.set("firstTouchMedium", attribution.firstTouch.medium);
  form.set("firstTouchCampaign", attribution.firstTouch.campaign);
  form.set("firstTouchContent", attribution.firstTouch.content);
  form.set("firstTouchTerm", attribution.firstTouch.term);
  form.set("firstTouchPath", attribution.firstTouch.path);
  form.set("latestTouchSource", attribution.latestTouch.source);
  form.set("latestTouchMedium", attribution.latestTouch.medium);
  form.set("latestTouchCampaign", attribution.latestTouch.campaign);
  form.set("latestTouchContent", attribution.latestTouch.content);
  form.set("latestTouchTerm", attribution.latestTouch.term);
  form.set("latestTouchPath", attribution.latestTouch.path);
  form.set("inquiryType", ctaLocation);
}

export function trackKehongEvent(name: "quote_click" | "whatsapp_click" | "resource_open" | "product_view" | "packaging_category_view" | "inquiry_start" | "inquiry_submit", properties: Record<string, string | number | boolean | undefined> = {}) {
  try { track(name, properties); } catch { /* analytics is non-blocking */ }
}
