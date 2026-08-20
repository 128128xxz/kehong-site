"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isAnalyticsOptedOut, sanitizeAnalyticsEvent, sanitizeAnalyticsUrl } from "@/lib/analyticsPrivacy";

export default function AnalyticsConsent({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return <><Analytics beforeSend={(event) => isAnalyticsOptedOut() ? null : sanitizeAnalyticsEvent(event)} /><SpeedInsights beforeSend={(event) => isAnalyticsOptedOut() ? null : { ...event, url: sanitizeAnalyticsUrl(event.url) }} /></>;
}
