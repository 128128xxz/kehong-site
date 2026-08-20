import type { VisitorEventType } from "@/server/b2b-intelligence/types";

export type LeadEventPayload = {
  eventType: VisitorEventType;
  path: string;
  pageTitle?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  durationSeconds?: number;
};

export function shouldSendLeadEvent(enabled: boolean, optedOut: boolean) {
  return enabled && !optedOut;
}

export function trackLeadEvent(payload: LeadEventPayload) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  const body = JSON.stringify({ ...payload, eventId: typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}` });
  try {
    if (typeof navigator.sendBeacon === "function") {
      const accepted = navigator.sendBeacon("/api/lead-event", new Blob([body], { type: "application/json" }));
      if (accepted) return;
    }
    void fetch("/api/lead-event", { method: "POST", headers: { "Content-Type": "application/json" }, body, credentials: "same-origin", keepalive: true }).catch(() => undefined);
  } catch {
    // Visitor telemetry must never affect page interaction.
  }
}
