import type { BounceCategory, MailConfidence, MailEventType, NormalizedBounceType, ReplyKind } from "./types";

export const BOUNCE_CLASSIFIER_VERSION = "2026-08-30.1";

type BounceInput = {
  smtpStatusCode?: string | null;
  enhancedStatusCode?: string | null;
  diagnosticCode?: string | null;
  providerResponse?: string | null;
  eventType?: MailEventType | null;
};

export type BounceClassification = {
  normalizedType: NormalizedBounceType;
  category: BounceCategory;
  reason: string;
  retryable: boolean;
  eventType: MailEventType;
  matchedRuleId: string;
  classifierVersion: string;
  confidence: MailConfidence;
  priority: number;
};

function combined(input: BounceInput) {
  return [input.smtpStatusCode, input.enhancedStatusCode, input.diagnosticCode, input.providerResponse].filter(Boolean).join(" ").toLocaleLowerCase();
}

function result(normalizedType: NormalizedBounceType, reason: string, retryable: boolean, eventType: MailEventType, matchedRuleId: string, confidence: MailConfidence, priority: number): BounceClassification {
  const legacy: Record<NormalizedBounceType, BounceCategory> = {
    hard_bounce_recipient: "hard_bounce",
    soft_bounce_mailbox: "soft_bounce",
    domain_infrastructure: "domain_error",
    policy_or_authentication: "policy_blocked",
    rate_limited_or_temporary_server: "deferred",
    relay_or_configuration: "unknown",
    unknown: "unknown",
  };
  return { normalizedType, category: legacy[normalizedType], reason, retryable, eventType, matchedRuleId, classifierVersion: BOUNCE_CLASSIFIER_VERSION, confidence, priority };
}

export function classifyBounce(input: BounceInput): BounceClassification {
  const text = combined(input);
  const smtp = input.smtpStatusCode?.trim() ?? "";
  const enhanced = input.enhancedStatusCode?.trim() ?? "";
  const codeText = enhanced + " " + smtp + " " + text;

  if (/relay\s+(?:access\s+)?denied|unable\s+to\s+relay|open\s+relay\s+denied|relay\s+not\s+permitted/iu.test(text)) {
    return result("relay_or_configuration", "Relay or recipient-server relay configuration rejected the message", false, "failed", "RELAY_CONFIGURATION", "strong", 10);
  }
  if (/\b5\.1\.2\b|domain\s+(?:not\s+found|does\s+not\s+exist)|host\s+not\s+found|mail\s+host\s+not\s+found|no\s+mx(?:\s+record)?|dns\s+(?:lookup\s+)?failed|nxdomain|connection\s+to\s+all\s+mx\s+servers\s+failed|domain\s+mail\s+service\s+suspended/iu.test(codeText)) {
    return result("domain_infrastructure", "Recipient domain, DNS, MX, or target mail host is unavailable", false, "hard_bounce", "DOMAIN_INFRASTRUCTURE", "strong", 20);
  }
  if (/\b5\.7\.[0-9]+\b|unauthenticated\s+mail\s+rejected|spf\s+fail|dkim\s+fail|dmarc\s+fail|sender\s+not\s+authorized|external\s+sender\s+denied|group\s+(?:does\s+not|doesn't)\s+accept\s+external|access\s+denied|policy\s+(?:block|reject|violation)|spam\s+policy|reputation/iu.test(codeText)) {
    return result("policy_or_authentication", "Provider or recipient policy/authentication rejected the message", false, "blocked", "POLICY_AUTHENTICATION", "strong", 30);
  }
  if (/\b(?:mailbox|message)\s+(?:is\s+)?full\b|quota\s+(?:exceeded|full)|over\s+quota|storage\s+exceeded|inode\s+limit|blocks?\s+limit|temporary\s+mailbox\s+failure/iu.test(text)) {
    return result("soft_bounce_mailbox", "Recipient mailbox capacity or temporary mailbox state prevented delivery", true, "soft_bounce", "MAILBOX_CAPACITY", "strong", 50);
  }
  if (/rate\s*limit|too\s+many\s+messages|try\s+again\s+later|temporarily\s+deferred|service\s+unavailable|greylist|temporary\s+(?:server|recipient-server)\s+(?:failure|unavailable)/iu.test(text) || /^(?:421|450|451|452)$/.test(smtp) || /^4\./.test(enhanced)) {
    return result("rate_limited_or_temporary_server", "Recipient server or provider reported a temporary delay or rate limit", true, "deferred", "TEMPORARY_SERVER_OR_RATE_LIMIT", "strong", 40);
  }
  if (/\b(?:5\.1\.1|5\.1\.10)\b|user\s+unknown|unknown\s+user|no\s+such\s+user|no\s+such\s+recipient|recipient\s+(?:does\s+not|not)\s+exist|recipient\s+not\s+found|unknown\s+recipient|account\s+(?:is\s+)?inactive|mailbox\s+disabled|invalid\s+(?:recipient|mailbox)|recipient\s+address\s+rejected.{0,120}(?:does\s+not\s+exist|not\s+found|unknown|invalid)/iu.test(codeText)) {
    return result("hard_bounce_recipient", "Recipient address is explicitly invalid, inactive, disabled, or unknown", false, "hard_bounce", "RECIPIENT_PERMANENT_INVALID", "strong", 60);
  }
  if (input.eventType === "deferred") return result("rate_limited_or_temporary_server", "Provider reported a deferred event without enough diagnostic detail", true, "deferred", "PROVIDER_DEFERRED_ONLY", "partial", 70);
  if (input.eventType === "soft_bounce") return result("soft_bounce_mailbox", "Provider reported a soft bounce without enough diagnostic detail", true, "soft_bounce", "PROVIDER_SOFT_BOUNCE_ONLY", "partial", 80);
  if (input.eventType === "blocked") return result("policy_or_authentication", "Provider reported a policy block without enough diagnostic detail", false, "blocked", "PROVIDER_BLOCKED_ONLY", "partial", 90);
  return result("unknown", "Insufficient SMTP, enhanced status, or diagnostic evidence", false, input.eventType === "failed" ? "failed" : "unknown", "UNKNOWN", "unknown", 999);
}

export function classifyReply(subject: string | null | undefined, headers: Record<string, string> = {}): ReplyKind {
  const text = (subject ?? "") + " " + Object.values(headers).join(" ");
  return /out\s+of\s+office|automatic\s+reply|auto[- ]?reply|autoreply|vacation|away\s+from\s+the\s+office|delivery\s+status|mail\s+delivery\s+subsystem/iu.test(text) ? "auto" : "human";
}

export function eventTypeForResend(type: string): MailEventType {
  const normalized = type.toLocaleLowerCase();
  if (normalized.includes("delivered")) return "delivered";
  if (normalized.includes("delivery_delayed") || normalized.includes("delayed")) return "deferred";
  if (normalized.includes("bounced")) return "hard_bounce";
  if (normalized.includes("complained") || normalized.includes("complaint")) return "complaint";
  if (normalized.includes("unsubscribed") || normalized.includes("unsubscribe")) return "unsubscribe";
  if (normalized.includes("failed")) return "failed";
  if (normalized.includes("sent")) return "sent";
  if (normalized.includes("received")) return "reply";
  return "unknown";
}
