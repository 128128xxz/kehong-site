const sensitiveQueryKey = /^(?:e?-?mail|phone|tel|telephone|mobile|whatsapp|name|company|message|notes?|token|access[_-]?token|refresh[_-]?token|request[_-]?id|password|secret|code)$/iu;
const emailValue = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/iu;
const phoneValue = /(?:\+?\d[\d .()_-]{6,}\d)/u;
export const analyticsOptOutStorageKey = "kehong-analytics-optout-v1";

export type AnalyticsEvent = { type: "pageview" | "event"; url: string };

export function isAnalyticsOptedOut() {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(analyticsOptOutStorageKey) === "1"; } catch { return false; }
}

export function setAnalyticsOptOut(optedOut: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (optedOut) window.localStorage.setItem(analyticsOptOutStorageKey, "1");
    else window.localStorage.removeItem(analyticsOptOutStorageKey);
  } catch { /* opt-out remains best effort if storage is unavailable */ }
}

export function isSensitiveAnalyticsValue(value: string) {
  return emailValue.test(value) || phoneValue.test(value);
}

export function sanitizeAnalyticsUrl(value: string) {
  try {
    const parsed = new URL(value, "https://www.kehong.tech");
    for (const [key, parameterValue] of [...parsed.searchParams.entries()]) {
      if (sensitiveQueryKey.test(key) || isSensitiveAnalyticsValue(parameterValue)) parsed.searchParams.delete(key);
    }
    return `${parsed.origin === "https://www.kehong.tech" ? "" : parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return value.split(/[?#]/u)[0] || "/";
  }
}

export function sanitizeAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
  return { ...event, url: sanitizeAnalyticsUrl(event.url) };
}

export function sanitizeAnalyticsProperties(properties: Record<string, string | number | boolean | undefined>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (value === undefined || sensitiveQueryKey.test(key)) return false;
      return typeof value !== "string" || !isSensitiveAnalyticsValue(value);
    }),
  ) as Record<string, string | number | boolean>;
}
