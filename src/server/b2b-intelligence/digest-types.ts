export type DigestWindowKind = "noon" | "evening";

export type DigestEventInput = {
  eventId: string;
  eventType: string;
  path: string;
  pageTitle: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  durationSeconds: number | null;
  rawIp: string;
  ipHash: string;
  occurredAt: string;
  digestWindow: string;
  expiresAt: string;
  sessionKey?: string;
};

export type DigestScoreReason = { code: string; points: number; label: string };

export type VisitorDigestRecord = {
  id: string;
  rawIp: string;
  ipHash: string;
  sessionKey: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalEvents: number;
  totalVisits: number;
  totalSessionSeconds: number;
  visitedPages: string[];
  productPages: string[];
  eventSummary: Record<string, number>;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  behaviorScore: number;
  scoreReasons: DigestScoreReason[];
  digestWindow: string;
  sentAt: string | null;
  expiresAt: string;
};
