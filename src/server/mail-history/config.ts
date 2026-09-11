import { integerEnv } from "@/server/b2b-intelligence/config";

export const mailHistoryConfig = {
  timezone: process.env.MAIL_REPORT_TIMEZONE?.trim() || "Asia/Shanghai",
  retryMaxAttempts: integerEnv("MAIL_RETRY_MAX_ATTEMPTS", 3, 1, 10),
  retryMinDelayMinutes: integerEnv("MAIL_RETRY_MIN_DELAY_MINUTES", 30, 1, 1440),
  retryMaxDelayHours: integerEnv("MAIL_RETRY_MAX_DELAY_HOURS", 48, 1, 720),
  softBounceMaxAttempts: integerEnv("MAIL_SOFT_BOUNCE_MAX_ATTEMPTS", 1, 1, 10),
  repeatedSoftBounceThreshold: integerEnv("MAIL_REPEATED_SOFT_BOUNCE_THRESHOLD", 3, 2, 20),
  repeatedSoftBounceWindowDays: integerEnv("MAIL_REPEATED_SOFT_BOUNCE_WINDOW_DAYS", 30, 1, 365),
  temporaryMailboxHoldDays: integerEnv("MAIL_TEMPORARY_MAILBOX_HOLD_DAYS", 5, 1, 30),
  temporaryPolicyHoldHours: integerEnv("MAIL_TEMPORARY_POLICY_HOLD_HOURS", 24, 1, 168),
  temporaryDomainHoldHours: integerEnv("MAIL_TEMPORARY_DOMAIN_HOLD_HOURS", 48, 1, 168),
  domainPermanentFailureThreshold: integerEnv("MAIL_DOMAIN_PERMANENT_FAILURE_THRESHOLD", 3, 2, 20),
  duplicateSendWindowMinutes: integerEnv("MAIL_DUPLICATE_SEND_WINDOW_MINUTES", 10, 1, 1440),
  sendLockTtlSeconds: integerEnv("MAIL_SEND_LOCK_TTL_SECONDS", 300, 30, 3600),
  hardBounceRatePausePercent: Number(process.env.MAIL_HARD_BOUNCE_RATE_PAUSE_PERCENT || 2),
  totalBounceRatePausePercent: Number(process.env.MAIL_TOTAL_BOUNCE_RATE_PAUSE_PERCENT || 4),
  qualityWindowAttempts: integerEnv("MAIL_QUALITY_WINDOW_ATTEMPTS", 50, 10, 1000),
};

export function mailReportRecipients() {
  return (process.env.MAIL_REPORT_TO_EMAIL?.trim() || process.env.B2B_DIGEST_TO_EMAIL?.trim() || process.env.INQUIRY_TO_EMAIL?.trim() || process.env.EMAIL_TO?.trim() || "").split(/[;,\s]+/u).map((value) => value.trim()).filter(Boolean);
}

export function mailReportFrom() {
  return process.env.MAIL_REPORT_FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim() || process.env.INQUIRY_FROM_EMAIL?.trim() || "";
}
