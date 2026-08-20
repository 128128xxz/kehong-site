import { describe, expect, it } from "vitest";
import { analyticsOptOutStorageKey, isAnalyticsOptedOut, sanitizeAnalyticsProperties, sanitizeAnalyticsUrl, setAnalyticsOptOut } from "@/lib/analyticsPrivacy";

describe("analytics privacy boundary", () => {
  it("removes sensitive query keys and values while retaining safe campaign context", () => {
    expect(sanitizeAnalyticsUrl("https://www.kehong.tech/en?utm_source=google&email=buyer%40example.com&utm_campaign=spring")).toBe("/en?utm_source=google&utm_campaign=spring");
    expect(sanitizeAnalyticsUrl("/en?utm_campaign=buyer%40example.com&requestId=secret")).toBe("/en");
  });

  it("never sends form identity fields or PII-shaped event values", () => {
    expect(sanitizeAnalyticsProperties({ locale: "en", productGroupId: "paper-boxes", email: "buyer@example.com", campaign: "+44 7599669700", message: "private" })).toEqual({ locale: "en", productGroupId: "paper-boxes" });
  });

  it("uses an explicit opt-out without blocking anonymous measurement by default", () => {
    const originalWindow = globalThis.window;
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) } } });
    expect(isAnalyticsOptedOut()).toBe(false);
    setAnalyticsOptOut(true);
    expect(values.get(analyticsOptOutStorageKey)).toBe("1");
    expect(isAnalyticsOptedOut()).toBe(true);
    setAnalyticsOptOut(false);
    expect(isAnalyticsOptedOut()).toBe(false);
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  });
});
