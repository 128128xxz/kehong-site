import { Redis } from "@upstash/redis";
import { scoreBehavior } from "./behavior-scoring";
import { integerEnv, visitorConfig } from "./config";
import type { BotStatus, DigestEventInput, VisitorDigestRecord } from "./digest-types";
import { digestCalendarDate, digestWindowsForDay } from "./service-window";

const RELEASE_LOCK_SCRIPT = 'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';
const RETENTION_SECONDS = () => visitorConfig.digestRetentionHours * 60 * 60;
const SCORE_THRESHOLD = () => integerEnv("B2B_DIGEST_SCORE_THRESHOLD", 50, 0, 500);

function resolveVisitorId(event: Pick<DigestEventInput, "visitorId" | "ipHash">) {
  return event.visitorId || event.ipHash || "visitor_unknown";
}

function windowKey(windowId: string) { return `b2b:digest:window:${windowId}`; }
function visitorKey(windowId: string, visitorId: string) { return `b2b:digest:visitor:${windowId}:${visitorId}`; }
function sentKey(windowId: string) { return `b2b:digest:sent:${windowId}`; }
function lockKey(windowId: string) { return `b2b:digest:lock:${windowId}`; }
function visitorLockKey(windowId: string, visitorId: string) { return `b2b:digest:visitor-lock:${windowId}:${visitorId}`; }
function token() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function safeSeconds(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

function clampDuration(event: DigestEventInput) {
  const raw = safeSeconds(event.durationSeconds);
  if (event.eventType === "engagement_ping") return Math.min(30, raw);
  return raw;
}

function normalizeBotStatus(value: unknown): BotStatus {
  if (value === "verified_bot" || value === "possible_bot" || value === "not_bot" || value === "probable_bot" || value === "unknown") return value;
  return "unknown";
}

function normalizeStoredRecord(row: Partial<VisitorDigestRecord> | null): VisitorDigestRecord | null {
  if (!row) return null;
  const visitorId = row.visitorId ?? row.ipHash ?? "visitor_unknown";
  const sessionId = row.sessionId ?? row.sessionKey ?? "legacy_session";
  const visitedPages = Array.isArray(row.visitedPages) ? row.visitedPages : [];
  const productPages = Array.isArray(row.productPages) ? row.productPages : [];
  const eventSummary = row.eventSummary ?? {};
  const totalSessionSeconds = safeSeconds(row.totalSessionSeconds);
  const engagementSeconds = safeSeconds(row.engagementSeconds ?? totalSessionSeconds);
  const sessionVisitedPages = Array.isArray(row.sessionVisitedPages) ? row.sessionVisitedPages : visitedPages;
  const sessionEventSummary = row.sessionEventSummary ?? eventSummary;
  const firstSeenAt = row.firstSeenAt ?? new Date(0).toISOString();
  const lastSeenAt = row.lastSeenAt ?? firstSeenAt;

  return {
    id: row.id ?? `legacy:${visitorId}`,
    rawIp: row.rawIp ?? null,
    ipHash: row.ipHash ?? null,
    visitorId,
    sessionId,
    identityMode: row.identityMode ?? "ip_fallback",
    sessionKey: row.sessionKey ?? sessionId,
    userAgent: row.userAgent ?? null,
    browser: row.browser ?? null,
    os: row.os ?? null,
    deviceType: row.deviceType ?? "unknown",
    countryCode: row.countryCode ?? null,
    region: row.region ?? null,
    city: row.city ?? null,
    asn: row.asn ?? null,
    asnOrg: row.asnOrg ?? null,
    isDatacenter: row.isDatacenter ?? null,
    cloudProvider: row.cloudProvider ?? null,
    botStatus: normalizeBotStatus(row.botStatus),
    botReasons: row.botReasons ?? [],
    firstSeenAt,
    lastSeenAt,
    totalEvents: row.totalEvents ?? 0,
    totalVisits: row.totalVisits ?? 0,
    totalSessionSeconds,
    visitedPages,
    productPages,
    eventSummary,
    sessionEngagementSeconds: safeSeconds(row.sessionEngagementSeconds ?? engagementSeconds),
    sessionUniquePageCount: row.sessionUniquePageCount ?? sessionVisitedPages.length,
    sessionVisitedPages,
    sessionEventSummary,
    engagementSeconds,
    uniquePageCount: row.uniquePageCount ?? visitedPages.length,
    referrer: row.referrer ?? null,
    utmSource: row.utmSource ?? null,
    utmMedium: row.utmMedium ?? null,
    utmCampaign: row.utmCampaign ?? null,
    utmTerm: row.utmTerm ?? null,
    utmContent: row.utmContent ?? null,
    behaviorScore: typeof row.behaviorScore === "number" && Number.isFinite(row.behaviorScore) ? row.behaviorScore : 0,
    scoreReasons: row.scoreReasons ?? [],
    validRepeatVisit: row.validRepeatVisit ?? false,
    leadLevel: row.leadLevel ?? "LOW",
    humanStatus: row.humanStatus ?? "unknown",
    digestWindow: row.digestWindow ?? "legacy",
    sentAt: row.sentAt ?? null,
    expiresAt: row.expiresAt ?? new Date(0).toISOString(),
  };
}

function nextRecord(current: VisitorDigestRecord | null, event: DigestEventInput): VisitorDigestRecord {
  const occurredAt = Date.parse(event.occurredAt);
  const currentLastSeen = current ? Date.parse(current.lastSeenAt) : Number.NaN;
  const sameExplicitSession = Boolean(current && event.sessionId && current.sessionId === event.sessionId);
  const currentSessionId = current?.sessionId ?? current?.sessionKey;
  const sameSession = Boolean(current && currentSessionId && (sameExplicitSession || (event.sessionId && event.sessionId === currentSessionId)));
  const eventSummary = { ...(current?.eventSummary ?? {}) };
  eventSummary[event.eventType] = (eventSummary[event.eventType] ?? 0) + 1;
  const visitedPages = current?.visitedPages.includes(event.path) ? current.visitedPages : [...(current?.visitedPages ?? []), event.path];
  const sessionEventSummary = sameSession ? { ...(current?.sessionEventSummary ?? {}) } : {};
  sessionEventSummary[event.eventType] = (sessionEventSummary[event.eventType] ?? 0) + 1;
  const previousSessionPages = sameSession ? (current?.sessionVisitedPages ?? []) : [];
  const sessionVisitedPages = previousSessionPages.includes(event.path)
    ? previousSessionPages
    : [...previousSessionPages, event.path];
  const productPages = /\/products?\//u.test(event.path) && !(current?.productPages.includes(event.path))
    ? [...(current?.productPages ?? []), event.path]
    : current?.productPages ?? [];
  const finalSessionId = event.sessionId ?? currentSessionId ?? `${resolveVisitorId(event)}:${event.occurredAt}`;
  const finalSessionStart = sameSession
    ? (current?.sessionId ?? currentSessionId ?? finalSessionId)
    : (sameExplicitSession ? finalSessionId : finalSessionId);
  const addSession = sameSession ? 0 : 1;
  const duration = clampDuration(event);
  const previousEngagement = current?.engagementSeconds ?? 0;
  const engagementSeconds = previousEngagement + duration;
  const totalSessionSeconds = (current?.totalSessionSeconds ?? 0) + duration;
  const uniquePageCount = Math.min(visitedPages.length, 10_000);
  const sessionEngagementSeconds = (sameSession ? current?.sessionEngagementSeconds ?? 0 : 0) + duration;
  const sessionUniquePageCount = Math.min(sessionVisitedPages.length, 10_000);

  const baseRecord: Omit<VisitorDigestRecord, "behaviorScore" | "scoreReasons" | "validRepeatVisit" | "leadLevel" | "humanStatus"> = {
    id: current?.id ?? event.eventId,
    rawIp: event.rawIp ?? current?.rawIp ?? null,
    ipHash: event.ipHash ?? current?.ipHash ?? null,
    visitorId: resolveVisitorId(event),
    sessionId: finalSessionId,
    identityMode: event.identityMode ?? current?.identityMode ?? "ip_fallback",
    sessionKey: finalSessionStart,
    userAgent: event.userAgent ?? current?.userAgent ?? null,
    browser: event.browser ?? current?.browser ?? null,
    os: event.os ?? current?.os ?? null,
    deviceType: event.deviceType ?? current?.deviceType ?? "unknown",
    countryCode: event.countryCode ?? current?.countryCode ?? null,
    region: event.region ?? current?.region ?? null,
    city: event.city ?? current?.city ?? null,
    asn: event.asn ?? current?.asn ?? null,
    asnOrg: event.asnOrg ?? current?.asnOrg ?? null,
    isDatacenter: event.isDatacenter ?? current?.isDatacenter ?? null,
    cloudProvider: event.cloudProvider ?? current?.cloudProvider ?? null,
    botStatus: normalizeBotStatus(event.botStatus ?? current?.botStatus),
    botReasons: event.botReasons ?? current?.botReasons ?? [],
    firstSeenAt: current?.firstSeenAt ?? event.occurredAt,
    lastSeenAt: current && occurredAt >= currentLastSeen ? event.occurredAt : current?.lastSeenAt ?? event.occurredAt,
    totalEvents: (current?.totalEvents ?? 0) + 1,
    totalVisits: (current?.totalVisits ?? 0) + addSession,
    totalSessionSeconds,
    visitedPages,
    productPages,
    eventSummary,
    engagementSeconds,
    uniquePageCount,
    sessionEngagementSeconds,
    sessionUniquePageCount,
    sessionVisitedPages,
    sessionEventSummary,
    referrer: event.referrer ?? current?.referrer ?? null,
    utmSource: event.utmSource ?? current?.utmSource ?? null,
    utmMedium: event.utmMedium ?? current?.utmMedium ?? null,
    utmCampaign: event.utmCampaign ?? current?.utmCampaign ?? null,
    utmTerm: event.utmTerm ?? current?.utmTerm ?? null,
    utmContent: event.utmContent ?? current?.utmContent ?? null,
    digestWindow: event.digestWindow,
    sentAt: current?.sentAt ?? null,
    expiresAt: event.expiresAt,
  };

  const repeatVisitScoreInput = {
    eventSummary: baseRecord.eventSummary,
    productPages,
    totalVisits: baseRecord.totalVisits,
    totalSessionSeconds: baseRecord.totalSessionSeconds,
    uniquePageCount,
    botStatus: baseRecord.botStatus,
    repeatSessionEngaged:
      sessionEngagementSeconds >= 15 ||
      sessionUniquePageCount >= 2 ||
      (sessionEventSummary.product_view ?? 0) > 0 ||
      (sessionEventSummary.email_click ?? 0) > 0 ||
      (sessionEventSummary.whatsapp_click ?? 0) > 0 ||
      (sessionEventSummary.form_start ?? 0) > 0 ||
      (sessionEventSummary.form_submit ?? 0) > 0,
  };
  const scored = scoreBehavior(repeatVisitScoreInput);

  return {
    ...baseRecord,
    behaviorScore: scored.score,
    scoreReasons: scored.reasons,
    validRepeatVisit: scored.validRepeatVisit,
    leadLevel: scored.leadLevel,
    humanStatus: scored.humanStatus,
  };
}

export type VisitorDigestStore = {
  upsertVisitor(event: DigestEventInput, sessionTimeoutMinutes: number): Promise<VisitorDigestRecord>;
  getWindowVisitors(windowId: string, now: string): Promise<VisitorDigestRecord[]>;
  getAllVisitors(now: string): Promise<VisitorDigestRecord[]>;
  getDayVisitors(day: string, now: string): Promise<VisitorDigestRecord[]>;
  getDailyVisitors(day: string, now: string): Promise<VisitorDigestRecord[]>;
  markWindowSent(windowId: string): Promise<boolean>;
  isWindowSent(windowId: string): Promise<boolean>;
  acquireDigestLock(windowId: string, ttlSeconds: number): Promise<string | null>;
  releaseDigestLock(windowId: string, token: string): Promise<void>;
  cleanupExpired(now: string): Promise<number>;
};

type MemoryState = { rows: Map<string, VisitorDigestRecord>; sent: Set<string>; locks: Map<string, { value: string; expiresAt: number }> };

export class MemoryVisitorDigestStore implements VisitorDigestStore {
  private readonly state: MemoryState = { rows: new Map(), sent: new Set(), locks: new Map() };

  async upsertVisitor(event: DigestEventInput, sessionTimeoutMinutes: number): Promise<VisitorDigestRecord> {
    void sessionTimeoutMinutes;
    const key = `${event.digestWindow}:${resolveVisitorId(event)}`;
    const current = normalizeStoredRecord(this.state.rows.get(key) ?? null);
    const row = nextRecord(current, event);
    this.state.rows.set(key, row);
    const day = digestCalendarDate(new Date(event.occurredAt));
    const dailyKey = `${day}:${resolveVisitorId(event)}`;
    const dailyCurrent = normalizeStoredRecord(this.state.rows.get(dailyKey) ?? null);
    const daily = nextRecord(dailyCurrent, { ...event, digestWindow: day });
    this.state.rows.set(dailyKey, daily);
    return row;
  }

  async getWindowVisitors(windowId: string, now: string) {
    const nowMs = Date.parse(now);
    return [...this.state.rows.values()].map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row))
      .filter((row) => row.digestWindow === windowId && !row.sentAt && Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs && row.behaviorScore >= SCORE_THRESHOLD())
      .sort((a, b) => b.behaviorScore - a.behaviorScore || b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async getAllVisitors(now: string) {
    const nowMs = Date.parse(now);
    return [...this.state.rows.values()].map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row))
      .filter((row) => !/^\d{4}-\d{2}-\d{2}$/u.test(row.digestWindow) && Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs)
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async getDayVisitors(day: string, now: string) {
    const windows = new Set(digestWindowsForDay(day));
    const nowMs = Date.parse(now);
    return [...this.state.rows.values()].map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row))
      .filter((row) => windows.has(row.digestWindow) && Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs)
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async getDailyVisitors(day: string, now: string) {
    const nowMs = Date.parse(now);
    return [...this.state.rows.values()].map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row))
      .filter((row) => row.digestWindow === day && !row.sentAt && Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs)
      .sort((a, b) => b.behaviorScore - a.behaviorScore || b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async markWindowSent(windowId: string) {
    if (this.state.sent.has(windowId)) return false;
    this.state.sent.add(windowId);
    return true;
  }

  async isWindowSent(windowId: string) { return this.state.sent.has(windowId); }

  async acquireDigestLock(windowId: string, ttlSeconds: number) {
    const key = lockKey(windowId);
    const now = Date.now();
    const existing = this.state.locks.get(key);
    if (existing && existing.expiresAt > now) return null;
    const value = token();
    this.state.locks.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
    return value;
  }

  async releaseDigestLock(windowId: string, value: string) {
    const key = lockKey(windowId);
    if (this.state.locks.get(key)?.value === value) this.state.locks.delete(key);
  }

  async cleanupExpired(now: string) {
    const nowMs = Date.parse(now);
    let removed = 0;
    for (const [key, row] of this.state.rows) {
      if (Date.parse(row.expiresAt) <= nowMs) { this.state.rows.delete(key); removed += 1; }
    }
    return removed;
  }
}

class UpstashVisitorDigestStore implements VisitorDigestStore {
  constructor(private readonly redis: Redis) {}

  private async acquireKey(key: string, ttlSeconds: number) {
    const value = token();
    const result = await this.redis.set(key, value, { nx: true, ex: ttlSeconds });
    return result ? value : null;
  }

  private async releaseKey(key: string, value: string) {
    await this.redis.eval(RELEASE_LOCK_SCRIPT, [key], [value]);
  }

  async upsertVisitor(event: DigestEventInput, sessionTimeoutMinutes: number): Promise<VisitorDigestRecord> {
    const visitor = resolveVisitorId(event);
    const key = visitorKey(event.digestWindow, visitor);
    const visitorLock = visitorLockKey("all", visitor);
    const lock = await this.acquireKey(visitorLock, 10);
    if (!lock) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      return this.upsertVisitor(event, sessionTimeoutMinutes);
    }
    try {
      const current = normalizeStoredRecord(await this.redis.get<Partial<VisitorDigestRecord>>(key));
      const row = nextRecord(current, event);
      await this.redis.set(key, row, { ex: RETENTION_SECONDS() });
      await this.redis.sadd(windowKey(event.digestWindow), visitor);
      await this.redis.expire(windowKey(event.digestWindow), RETENTION_SECONDS());
      const day = digestCalendarDate(new Date(event.occurredAt));
      const dailyKey = visitorKey(day, visitor);
      const dailyCurrent = normalizeStoredRecord(await this.redis.get<Partial<VisitorDigestRecord>>(dailyKey));
      const daily = nextRecord(dailyCurrent, { ...event, digestWindow: day });
      await this.redis.set(dailyKey, daily, { ex: RETENTION_SECONDS() });
      await this.redis.sadd(windowKey(day), visitor);
      await this.redis.expire(windowKey(day), RETENTION_SECONDS());
      return row;
    } finally {
      await this.releaseKey(visitorLock, lock);
    }
  }

  async getWindowVisitors(windowId: string, now: string) {
    const hashes = await this.redis.smembers<string[]>(windowKey(windowId));
    const rows = await Promise.all(hashes.map((hash) => this.redis.get<VisitorDigestRecord>(visitorKey(windowId, hash))));
    const nowMs = Date.parse(now);
    return rows
      .map(normalizeStoredRecord)
      .filter((row): row is VisitorDigestRecord => Boolean(row && !row.sentAt && Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs && row.behaviorScore >= SCORE_THRESHOLD()))
      .sort((a, b) => b.behaviorScore - a.behaviorScore || b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async getDailyVisitors(day: string, now: string) {
    const hashes = await this.redis.smembers<string[]>(windowKey(day));
    const rows = await Promise.all(hashes.map((hash) => this.redis.get<Partial<VisitorDigestRecord>>(visitorKey(day, hash))));
    const nowMs = Date.parse(now);
    return rows.map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row && !row.sentAt && Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs))
      .sort((a, b) => b.behaviorScore - a.behaviorScore || b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async getAllVisitors(now: string) {
    const windows = await this.redis.keys("b2b:digest:window:*");
    const rows: VisitorDigestRecord[] = [];
    for (const key of windows) {
      const windowId = key.replace("b2b:digest:window:", "");
      if (/^\d{4}-\d{2}-\d{2}$/u.test(windowId)) continue;
      const hashes = await this.redis.smembers<string[]>(key);
      const windowRows = await Promise.all(hashes.map((hash) => this.redis.get<VisitorDigestRecord>(visitorKey(windowId, hash))));
      rows.push(...windowRows.map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row)));
    }
    const nowMs = Date.parse(now);
    return rows.filter((row) => Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async getDayVisitors(day: string, now: string) {
    const rows: VisitorDigestRecord[] = [];
    for (const windowId of digestWindowsForDay(day)) {
      const hashes = await this.redis.smembers<string[]>(windowKey(windowId));
      const windowRows = await Promise.all(hashes.map((hash) => this.redis.get<VisitorDigestRecord>(visitorKey(windowId, hash))));
      rows.push(...windowRows.map(normalizeStoredRecord).filter((row): row is VisitorDigestRecord => Boolean(row)));
    }
    const nowMs = Date.parse(now);
    return rows.filter((row) => Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > nowMs).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async markWindowSent(windowId: string) {
    const result = await this.redis.set(sentKey(windowId), "1", { nx: true, ex: 7 * 24 * 60 * 60 });
    return Boolean(result);
  }

  async isWindowSent(windowId: string) { return Boolean(await this.redis.get(sentKey(windowId))); }

  acquireDigestLock(windowId: string, ttlSeconds: number) { return this.acquireKey(lockKey(windowId), ttlSeconds); }

  releaseDigestLock(windowId: string, value: string) { return this.releaseKey(lockKey(windowId), value); }

  async cleanupExpired(now: string) {
    const windows = await this.redis.keys("b2b:digest:window:*");
    let removed = 0;
    const nowMs = Date.parse(now);
    for (const key of windows) {
      const windowId = key.replace("b2b:digest:window:", "");
      const hashes = await this.redis.smembers<string[]>(key);
      for (const hash of hashes) {
        const row = await this.redis.get<VisitorDigestRecord>(visitorKey(windowId, hash));
        if (row && Date.parse(row.expiresAt) <= nowMs) {
          await this.redis.del(visitorKey(windowId, hash));
          removed += 1;
        }
      }
    }
    return removed;
  }
}

let memoryStore = new MemoryVisitorDigestStore();
let upstashStore: UpstashVisitorDigestStore | null = null;
let upstashIdentity = "";

export function isRedisConfigured() {
  return Boolean(redisCredentials());
}

function redisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export function getVisitorDigestStore(): VisitorDigestStore {
  if (!isRedisConfigured()) return memoryStore;
  const credentials = redisCredentials();
  if (!credentials) return memoryStore;
  const identity = `${credentials.url}:${credentials.token}`;
  if (!upstashStore || upstashIdentity !== identity) {
    upstashStore = new UpstashVisitorDigestStore(new Redis(credentials));
    upstashIdentity = identity;
  }
  return upstashStore;
}

export function resetMemoryVisitorDigestStore() { memoryStore = new MemoryVisitorDigestStore(); }
