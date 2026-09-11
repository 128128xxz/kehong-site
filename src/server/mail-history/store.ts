import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import { eventDedupeKey } from "./normalize";
import type { MailAuditLog, MailDataCoverage, MailDomainHold, MailEvent, MailMessage, MailStore, MailSuppression } from "./types";

const prefix = "mail:v1";
const allMessagesKey = prefix + ":messages";
const allEventsKey = prefix + ":events";
const allSuppressionsKey = prefix + ":suppressions";
const allDomainHoldsKey = prefix + ":domain-holds";
const allAuditLogsKey = prefix + ":audit-logs";
const allCoverageKey = prefix + ":coverage";
const messageKey = (id: string) => prefix + ":message:" + id;
const eventKey = (id: string) => prefix + ":event:" + id;
const suppressionKey = (email: string) => prefix + ":suppression:" + email;
const domainHoldKey = (domain: string) => prefix + ":domain-hold:" + domain;
const auditLogKey = (id: string) => prefix + ":audit-log:" + id;
const sendLockKey = (key: string) => prefix + ":send-lock:" + key;
const coverageKey = (id: string) => prefix + ":coverage:" + id;
const reportKey = (date: string) => prefix + ":report:" + date;
const eventDedupeRedisKey = (key: string) => prefix + ":event-dedupe:" + key;
const providerIndexKey = (provider: string, id: string) => prefix + ":provider-message:" + provider + ":" + id;

function credentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export class MemoryMailHistoryStore implements MailStore {
  private messages = new Map<string, MailMessage>();
  private events = new Map<string, MailEvent>();
  private eventDedupe = new Map<string, string>();
  private suppressions = new Map<string, MailSuppression>();
  private domainHolds = new Map<string, MailDomainHold>();
  private auditLogs = new Map<string, MailAuditLog>();
  private sendLocks = new Map<string, { token: string; expiresAt: number }>();
  private coverage = new Map<string, MailDataCoverage>();
  private reports = new Map<string, unknown>();
  async upsertMessage(message: MailMessage) { this.messages.set(message.id, message); return message; }
  async updateMessage(id: string, patch: Partial<MailMessage>) {
    const current = this.messages.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    this.messages.set(id, next);
    return next;
  }
  async getMessage(id: string) { return this.messages.get(id) ?? null; }
  async findMessagesByProviderId(provider: string, id: string) { return [...this.messages.values()].filter((item) => item.provider === provider && item.providerMessageId === id); }
  async findMessages() { return [...this.messages.values()]; }
  async appendEvent(event: MailEvent) {
    const key = eventDedupeKey(event);
    const existingId = this.eventDedupe.get(key);
    if (existingId) return { event: this.events.get(existingId)!, inserted: false };
    this.eventDedupe.set(key, event.id);
    this.events.set(event.id, event);
    return { event, inserted: true };
  }
  async getEvent(id: string) { return this.events.get(id) ?? null; }
  async findEvents(options: { from?: string; to?: string } = {}) {
    const from = options.from ? Date.parse(options.from) : Number.NEGATIVE_INFINITY;
    const to = options.to ? Date.parse(options.to) : Number.POSITIVE_INFINITY;
    return [...this.events.values()].filter((item) => { const time = Date.parse(item.eventTime); return time >= from && time < to; });
  }
  async upsertSuppression(item: MailSuppression) { this.suppressions.set(item.recipientNormalized, item); return item; }
  async getSuppression(email: string) { return this.suppressions.get(email) ?? null; }
  async findSuppressions(options: { activeOnly?: boolean } = {}) { return [...this.suppressions.values()].filter((item) => !options.activeOnly || item.active); }
  async upsertDomainHold(item: MailDomainHold) { this.domainHolds.set(item.domain, item); return item; }
  async getDomainHold(domain: string) { return this.domainHolds.get(domain.toLowerCase()) ?? null; }
  async findDomainHolds(options: { activeOnly?: boolean } = {}) { return [...this.domainHolds.values()].filter((item) => !options.activeOnly || (item.status === "active" && (!item.expiresAt || Date.parse(item.expiresAt) > Date.now()))); }
  async appendAuditLog(log: MailAuditLog) { this.auditLogs.set(log.id, log); return log; }
  async findAuditLogs(options: { from?: string; to?: string } = {}) {
    const from = options.from ? Date.parse(options.from) : Number.NEGATIVE_INFINITY;
    const to = options.to ? Date.parse(options.to) : Number.POSITIVE_INFINITY;
    return [...this.auditLogs.values()].filter((item) => Date.parse(item.createdAt) >= from && Date.parse(item.createdAt) < to);
  }
  async acquireSendLock(key: string, ttlSeconds: number) {
    const existing = this.sendLocks.get(key);
    if (existing && existing.expiresAt > Date.now()) return null;
    const token = randomUUID();
    this.sendLocks.set(key, { token, expiresAt: Date.now() + ttlSeconds * 1000 });
    return token;
  }
  async releaseSendLock(key: string, token: string) {
    const existing = this.sendLocks.get(key);
    if (!existing || existing.token !== token) return false;
    this.sendLocks.delete(key);
    return true;
  }
  async upsertCoverage(item: MailDataCoverage) { this.coverage.set(item.id, item); return item; }
  async findCoverage() { return [...this.coverage.values()]; }
  async saveReportSnapshot(date: string, report: unknown) { this.reports.set(date, report); }
  async getReportSnapshot(date: string) { return this.reports.get(date) ?? null; }
}

class UpstashMailHistoryStore implements MailStore {
  constructor(private readonly redis: Redis) {}
  async upsertMessage(message: MailMessage) {
    await this.redis.set(messageKey(message.id), message);
    await this.redis.sadd(allMessagesKey, message.id);
    if (message.provider && message.providerMessageId) await this.redis.sadd(providerIndexKey(message.provider, message.providerMessageId), message.id);
    return message;
  }
  async updateMessage(id: string, patch: Partial<MailMessage>) {
    const current = await this.getMessage(id);
    if (!current) return null;
    return this.upsertMessage({ ...current, ...patch, updatedAt: new Date().toISOString() });
  }
  async getMessage(id: string) { return this.redis.get<MailMessage>(messageKey(id)); }
  async findMessagesByProviderId(provider: string, id: string) {
    const ids = await this.redis.smembers<string[]>(providerIndexKey(provider, id));
    const rows = await Promise.all(ids.map((item) => this.getMessage(item)));
    return rows.filter((item): item is MailMessage => Boolean(item));
  }
  async findMessages() {
    const ids = await this.redis.smembers<string[]>(allMessagesKey);
    const rows = await Promise.all(ids.map((item) => this.getMessage(item)));
    return rows.filter((item): item is MailMessage => Boolean(item));
  }
  async appendEvent(event: MailEvent) {
    const key = eventDedupeRedisKey(eventDedupeKey(event));
    const inserted = await this.redis.set(key, event.id, { nx: true });
    if (!inserted) {
      const existingId = await this.redis.get<string>(key);
      const existing = existingId ? await this.getEvent(existingId) : null;
      return { event: existing ?? event, inserted: false };
    }
    await this.redis.set(eventKey(event.id), event);
    await this.redis.sadd(allEventsKey, event.id);
    return { event, inserted: true };
  }
  async getEvent(id: string) { return this.redis.get<MailEvent>(eventKey(id)); }
  async findEvents(options: { from?: string; to?: string } = {}) {
    const ids = await this.redis.smembers<string[]>(allEventsKey);
    const rows = await Promise.all(ids.map((item) => this.getEvent(item)));
    const from = options.from ? Date.parse(options.from) : Number.NEGATIVE_INFINITY;
    const to = options.to ? Date.parse(options.to) : Number.POSITIVE_INFINITY;
    return rows.filter((item): item is MailEvent => Boolean(item && Date.parse(item.eventTime) >= from && Date.parse(item.eventTime) < to));
  }
  async upsertSuppression(item: MailSuppression) { await this.redis.set(suppressionKey(item.recipientNormalized), item); await this.redis.sadd(allSuppressionsKey, item.recipientNormalized); return item; }
  async getSuppression(email: string) { return this.redis.get<MailSuppression>(suppressionKey(email)); }
  async findSuppressions(options: { activeOnly?: boolean } = {}) {
    const ids = await this.redis.smembers<string[]>(allSuppressionsKey);
    const rows = await Promise.all(ids.map((item) => this.getSuppression(item)));
    return rows.filter((item): item is MailSuppression => Boolean(item && (!options.activeOnly || item.active)));
  }
  async upsertDomainHold(item: MailDomainHold) { await this.redis.set(domainHoldKey(item.domain), item); await this.redis.sadd(allDomainHoldsKey, item.domain); return item; }
  async getDomainHold(domain: string) { return this.redis.get<MailDomainHold>(domainHoldKey(domain.toLowerCase())); }
  async findDomainHolds(options: { activeOnly?: boolean } = {}) {
    const ids = await this.redis.smembers<string[]>(allDomainHoldsKey);
    const rows = await Promise.all(ids.map((item) => this.getDomainHold(item)));
    return rows.filter((item): item is MailDomainHold => Boolean(item && (!options.activeOnly || (item.status === "active" && (!item.expiresAt || Date.parse(item.expiresAt) > Date.now())))));
  }
  async appendAuditLog(log: MailAuditLog) { await this.redis.set(auditLogKey(log.id), log); await this.redis.sadd(allAuditLogsKey, log.id); return log; }
  async findAuditLogs(options: { from?: string; to?: string } = {}) {
    const ids = await this.redis.smembers<string[]>(allAuditLogsKey);
    const rows = await Promise.all(ids.map((item) => this.redis.get<MailAuditLog>(auditLogKey(item))));
    const from = options.from ? Date.parse(options.from) : Number.NEGATIVE_INFINITY;
    const to = options.to ? Date.parse(options.to) : Number.POSITIVE_INFINITY;
    return rows.filter((item): item is MailAuditLog => Boolean(item && Date.parse(item.createdAt) >= from && Date.parse(item.createdAt) < to));
  }
  async acquireSendLock(key: string, ttlSeconds: number) {
    const token = randomUUID();
    const inserted = await this.redis.set(sendLockKey(key), token, { nx: true, ex: ttlSeconds });
    return inserted ? token : null;
  }
  async releaseSendLock(key: string, token: string) {
    const current = await this.redis.get<string>(sendLockKey(key));
    if (current !== token) return false;
    await this.redis.del(sendLockKey(key));
    return true;
  }
  async upsertCoverage(item: MailDataCoverage) { await this.redis.set(coverageKey(item.id), item); await this.redis.sadd(allCoverageKey, item.id); return item; }
  async findCoverage() { const ids = await this.redis.smembers<string[]>(allCoverageKey); const rows = await Promise.all(ids.map((item) => this.redis.get<MailDataCoverage>(coverageKey(item)))); return rows.filter((item): item is MailDataCoverage => Boolean(item)); }
  async saveReportSnapshot(date: string, report: unknown) { await this.redis.set(reportKey(date), report); }
  async getReportSnapshot(date: string) { return this.redis.get<unknown>(reportKey(date)); }
}

let memoryStore = new MemoryMailHistoryStore();
let upstashStore: UpstashMailHistoryStore | null = null;
let upstashIdentity = "";

export function isMailHistoryRedisConfigured() { return Boolean(credentials()); }
export function getMailHistoryStore(): MailStore {
  const current = credentials();
  if (!current) return memoryStore;
  const identity = current.url + ":" + current.token;
  if (!upstashStore || upstashIdentity !== identity) { upstashStore = new UpstashMailHistoryStore(new Redis(current)); upstashIdentity = identity; }
  return upstashStore;
}
export function resetMemoryMailHistoryStore() { memoryStore = new MemoryMailHistoryStore(); }
