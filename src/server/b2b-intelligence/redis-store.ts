import { Redis } from "@upstash/redis";
import { scoreBehavior } from "./behavior-scoring";
import { integerEnv, visitorConfig } from "./config";
import type { DigestEventInput, VisitorDigestRecord } from "./digest-types";

const RELEASE_LOCK_SCRIPT = 'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';
const RETENTION_SECONDS = () => visitorConfig.digestRetentionHours * 60 * 60;
const SCORE_THRESHOLD = () => integerEnv("B2B_DIGEST_SCORE_THRESHOLD", 50, 0, 500);

export type VisitorDigestStore = {
  upsertVisitor(event: DigestEventInput, sessionTimeoutMinutes: number): Promise<VisitorDigestRecord>;
  getWindowVisitors(windowId: string, now: string): Promise<VisitorDigestRecord[]>;
  markWindowSent(windowId: string): Promise<boolean>;
  isWindowSent(windowId: string): Promise<boolean>;
  acquireDigestLock(windowId: string, ttlSeconds: number): Promise<string | null>;
  releaseDigestLock(windowId: string, token: string): Promise<void>;
  cleanupExpired(now: string): Promise<number>;
};

function windowKey(windowId: string) { return `b2b:digest:window:${windowId}`; }
function visitorKey(windowId: string, ipHash: string) { return `b2b:digest:visitor:${windowId}:${ipHash}`; }
function sentKey(windowId: string) { return `b2b:digest:sent:${windowId}`; }
function lockKey(windowId: string) { return `b2b:digest:lock:${windowId}`; }
function visitorLockKey(windowId: string, ipHash: string) { return `b2b:digest:visitor-lock:${windowId}:${ipHash}`; }
function token() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function isProductPath(path: string) { return /\/products?\//u.test(path); }

function nextRecord(current: VisitorDigestRecord | null, event: DigestEventInput, sessionTimeoutMinutes: number): VisitorDigestRecord {
  const occurredAt = Date.parse(event.occurredAt);
  const currentLastSeen = current ? Date.parse(current.lastSeenAt) : Number.NaN;
  const withinInactivityWindow = current !== null && Number.isFinite(currentLastSeen) && occurredAt - currentLastSeen <= sessionTimeoutMinutes * 60 * 1000;
  const sameExplicitSession = Boolean(current && event.sessionKey && current.sessionKey === event.sessionKey);
  const sameSession = Boolean(current && (sameExplicitSession || withinInactivityWindow));
  const eventSummary = { ...(current?.eventSummary ?? {}) };
  eventSummary[event.eventType] = (eventSummary[event.eventType] ?? 0) + 1;
  const visitedPages = current?.visitedPages.includes(event.path) ? current.visitedPages : [...(current?.visitedPages ?? []), event.path];
  const productPages = isProductPath(event.path) && !current?.productPages.includes(event.path)
    ? [...(current?.productPages ?? []), event.path]
    : current?.productPages ?? [];
  const record: VisitorDigestRecord = {
    id: current?.id ?? event.eventId,
    rawIp: event.rawIp,
    ipHash: event.ipHash,
    sessionKey: sameSession ? current?.sessionKey ?? event.sessionKey ?? `${event.ipHash}:${event.occurredAt}` : event.sessionKey ?? `${event.ipHash}:${event.occurredAt}`,
    firstSeenAt: current?.firstSeenAt ?? event.occurredAt,
    lastSeenAt: current && occurredAt >= currentLastSeen ? event.occurredAt : current?.lastSeenAt ?? event.occurredAt,
    totalEvents: (current?.totalEvents ?? 0) + 1,
    totalVisits: (current?.totalVisits ?? 0) + (current && sameSession ? 0 : 1),
    totalSessionSeconds: (current?.totalSessionSeconds ?? 0) + Math.max(0, event.durationSeconds ?? 0),
    visitedPages,
    productPages,
    eventSummary,
    referrer: event.referrer ?? current?.referrer ?? null,
    utmSource: event.utmSource ?? current?.utmSource ?? null,
    utmMedium: event.utmMedium ?? current?.utmMedium ?? null,
    utmCampaign: event.utmCampaign ?? current?.utmCampaign ?? null,
    behaviorScore: 0,
    scoreReasons: [],
    digestWindow: event.digestWindow,
    sentAt: null,
    expiresAt: event.expiresAt,
  };
  const scored = scoreBehavior(record);
  record.behaviorScore = scored.score;
  record.scoreReasons = scored.reasons;
  return record;
}

type MemoryState = { rows: Map<string, VisitorDigestRecord>; sent: Set<string>; locks: Map<string, { value: string; expiresAt: number }> };

export class MemoryVisitorDigestStore implements VisitorDigestStore {
  private readonly state: MemoryState = { rows: new Map(), sent: new Set(), locks: new Map() };

  async upsertVisitor(event: DigestEventInput, sessionTimeoutMinutes: number): Promise<VisitorDigestRecord> {
    const key = `${event.digestWindow}:${event.ipHash}`;
    const row = nextRecord(this.state.rows.get(key) ?? null, event, sessionTimeoutMinutes);
    this.state.rows.set(key, row);
    return row;
  }

  async getWindowVisitors(windowId: string, now: string) {
    const nowMs = Date.parse(now);
    return [...this.state.rows.values()]
      .filter((row) => row.digestWindow === windowId && !row.sentAt && Date.parse(row.expiresAt) > nowMs && row.behaviorScore >= SCORE_THRESHOLD())
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
    const key = visitorKey(event.digestWindow, event.ipHash);
    const lock = await this.acquireKey(visitorLockKey(event.digestWindow, event.ipHash), 10);
    if (!lock) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      return this.upsertVisitor(event, sessionTimeoutMinutes);
    }
    try {
      const current = await this.redis.get<VisitorDigestRecord>(key);
      const row = nextRecord(current, event, sessionTimeoutMinutes);
      await this.redis.set(key, row, { ex: RETENTION_SECONDS() });
      await this.redis.sadd(windowKey(event.digestWindow), event.ipHash);
      await this.redis.expire(windowKey(event.digestWindow), RETENTION_SECONDS());
      return row;
    } finally {
      await this.releaseKey(visitorLockKey(event.digestWindow, event.ipHash), lock);
    }
  }

  async getWindowVisitors(windowId: string, now: string) {
    const hashes = await this.redis.smembers<string[]>(windowKey(windowId));
    const rows = await Promise.all(hashes.map((hash) => this.redis.get<VisitorDigestRecord>(visitorKey(windowId, hash))));
    const nowMs = Date.parse(now);
    return rows.filter((row): row is VisitorDigestRecord => Boolean(row && !row.sentAt && Date.parse(row.expiresAt) > nowMs && row.behaviorScore >= SCORE_THRESHOLD()))
      .sort((a, b) => b.behaviorScore - a.behaviorScore || b.lastSeenAt.localeCompare(a.lastSeenAt));
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
        if (row && Date.parse(row.expiresAt) <= nowMs) { await this.redis.del(visitorKey(windowId, hash)); removed += 1; }
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
