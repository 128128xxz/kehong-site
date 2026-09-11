export type MailEventType =
  | "scheduled" | "queued" | "accepted" | "sent" | "delivered" | "deferred"
  | "soft_bounce" | "hard_bounce" | "rejected" | "blocked" | "failed"
  | "complaint" | "unsubscribe" | "reply" | "auto_reply" | "skipped" | "unknown";

export type MailSource =
  | "zoho_sent" | "zoho_inbox" | "zoho_bounce" | "zoho_deferred" | "zoho_reply"
  | "local_queue" | "local_send_log" | "resend_api" | "provider_webhook"
  | "historical_email" | "manual_import" | "mail_report";

export type MailConfidence = "confirmed" | "strong" | "partial" | "inferred" | "unknown";
export type MailMatchConfidence = "provider_id" | "message_id" | "thread" | "fallback" | "unmatched" | null;
export type BounceCategory = "hard_bounce" | "soft_bounce" | "deferred" | "policy_blocked" | "domain_error" | "unknown";
export type NormalizedBounceType = "hard_bounce_recipient" | "soft_bounce_mailbox" | "domain_infrastructure" | "policy_or_authentication" | "rate_limited_or_temporary_server" | "relay_or_configuration" | "unknown";
export type ReplyKind = "human" | "auto" | "unknown";
export type SuppressionType = "hard_bounce" | "permanent_hard_bounce" | "temporary_mailbox" | "temporary_policy" | "complaint" | "unsubscribe" | "repeated_soft_bounce" | "manual";
export type SuppressionStatus = "active" | "inactive" | "expired" | "superseded" | "migrated";
export type DomainHoldType = "temporary_dns" | "temporary_mx" | "temporary_server" | "permanent_invalid_domain" | "manual";
export type DomainHoldStatus = "active" | "expired" | "superseded" | "migrated";

export type MailMessage = {
  id: string;
  source: MailSource | string;
  provider: string | null;
  providerMessageId: string | null;
  messageId: string | null;
  threadId: string | null;
  recipient: string;
  recipients: string[];
  company: string | null;
  trackingId: string | null;
  recipientDomain: string | null;
  sender: string | null;
  senderDomain: string | null;
  subject: string | null;
  templateId: string | null;
  campaign: string | null;
  tag: string | null;
  scheduledAt: string | null;
  firstSentAt: string | null;
  lastEventAt: string | null;
  createdAt: string;
  updatedAt: string;
  historicalSource: string | null;
  confidence: MailConfidence;
  matchingConfidence: MailMatchConfidence;
  sourceRecord?: Record<string, string> | null;
  roleAddress?: boolean;
  queueStatus?: string | null;
  mxVerified?: string | null;
};

export type MailEvent = {
  id: string;
  mailMessageId: string | null;
  provider: string | null;
  providerEventId: string | null;
  eventType: MailEventType;
  eventTime: string;
  recipient: string | null;
  recipientDomain: string | null;
  smtpStatusCode: string | null;
  enhancedStatusCode: string | null;
  diagnosticCode: string | null;
  providerResponse: string | null;
  bounceCategory: BounceCategory | null;
  bounceReason: string | null;
  normalizedBounceType?: NormalizedBounceType | null;
  matchedRuleId?: string | null;
  classifierVersion?: string | null;
  classificationConfidence?: MailConfidence | null;
  classificationPriority?: number | null;
  replyKind: ReplyKind | null;
  attemptNumber: number | null;
  source: MailSource | string;
  confidence: MailConfidence;
  matchingConfidence: MailMatchConfidence;
  rawEventReference: string | null;
  retryable: boolean | null;
  retryAfter: string | null;
  sender?: string | null;
  senderDomain?: string | null;
  campaignId?: string | null;
  receivedAt?: string | null;
  rawPayload?: unknown | null;
  rawRecord?: Record<string, unknown> | null;
  createdAt: string;
};

export type MailSuppression = {
  id: string;
  recipient: string;
  recipientNormalized: string;
  recipientDomain: string;
  suppressionType: SuppressionType;
  status?: SuppressionStatus;
  reason: string;
  sourceEventId: string | null;
  firstSeenAt?: string;
  lastSeenAt?: string;
  retryCount?: number;
  createdAt: string;
  expiresAt: string | null;
  active: boolean;
  manuallyOverriddenAt: string | null;
  notes: string | null;
};

export type MailDomainHold = {
  id: string;
  domain: string;
  holdType: DomainHoldType;
  status: DomainHoldStatus;
  reason: string;
  sourceBounceEventId: string | null;
  firstSeenAt: string;
  lastCheckedAt: string | null;
  expiresAt: string | null;
  checkCount: number;
  consecutiveFailureCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MailAuditLog = {
  id: string;
  action: "suppression_created" | "suppression_updated" | "suppression_expired" | "domain_hold_created" | "domain_hold_updated" | "domain_hold_upgraded" | "historical_backfill" | "manual_change" | "retry_attempt" | "send_blocked" | "send_lock_denied";
  recipient: string | null;
  domain: string | null;
  sourceEventId: string | null;
  messageId: string | null;
  reason: string;
  before: unknown | null;
  after: unknown | null;
  createdAt: string;
};

export type MailDataCoverage = {
  id: string;
  source: string;
  startAt: string;
  endAt: string | null;
  sentAvailable: boolean | null;
  deliveredAvailable: boolean | null;
  bounceAvailable: boolean | null;
  replyAvailable: boolean | null;
  complaintAvailable: boolean | null;
  unsubscribeAvailable: boolean | null;
  deferredAvailable: boolean | null;
  notes: string;
  confidence: MailConfidence;
  createdAt: string;
};

export type MailStore = {
  upsertMessage(message: MailMessage): Promise<MailMessage>;
  updateMessage(id: string, patch: Partial<MailMessage>): Promise<MailMessage | null>;
  getMessage(id: string): Promise<MailMessage | null>;
  findMessagesByProviderId(provider: string, providerMessageId: string): Promise<MailMessage[]>;
  findMessages(): Promise<MailMessage[]>;
  appendEvent(event: MailEvent): Promise<{ event: MailEvent; inserted: boolean }>;
  getEvent(id: string): Promise<MailEvent | null>;
  findEvents(options?: { from?: string; to?: string }): Promise<MailEvent[]>;
  upsertSuppression(suppression: MailSuppression): Promise<MailSuppression>;
  getSuppression(recipientNormalized: string): Promise<MailSuppression | null>;
  findSuppressions(options?: { activeOnly?: boolean }): Promise<MailSuppression[]>;
  upsertDomainHold(hold: MailDomainHold): Promise<MailDomainHold>;
  getDomainHold(domain: string): Promise<MailDomainHold | null>;
  findDomainHolds(options?: { activeOnly?: boolean }): Promise<MailDomainHold[]>;
  appendAuditLog(log: MailAuditLog): Promise<MailAuditLog>;
  findAuditLogs(options?: { from?: string; to?: string }): Promise<MailAuditLog[]>;
  acquireSendLock(key: string, ttlSeconds: number): Promise<string | null>;
  releaseSendLock(key: string, token: string): Promise<boolean>;
  upsertCoverage(coverage: MailDataCoverage): Promise<MailDataCoverage>;
  findCoverage(): Promise<MailDataCoverage[]>;
  saveReportSnapshot(date: string, report: unknown): Promise<void>;
  getReportSnapshot(date: string): Promise<unknown | null>;
};

export type MailReportStats = {
  scheduled: number;
  queued: number;
  accepted: number;
  sent: number;
  delivered: number;
  deferred: number;
  softBounce: number;
  hardBounce: number;
  blocked: number;
  failed: number;
  rejected: number;
  complaint: number;
  unsubscribe: number;
  humanReplies: number;
  autoReplies: number;
  skipped: number;
};
