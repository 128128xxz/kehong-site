import { beforeEach, describe, expect, it, vi } from "vitest";
import { classifyBounce, classifyReply } from "@/server/mail-history/classification";
import { buildMailReport, reportText } from "@/server/mail-history/report";
import { createMailMessage, recordMailEvent, retryDecision, sendEligibility, suppressionDecision } from "@/server/mail-history/service";
import { getMailHistoryStore, resetMemoryMailHistoryStore } from "@/server/mail-history/store";
import { isRoleAddress } from "@/server/mail-history/normalize";
import { sendWithResend } from "@/server/mail-history/resend";

describe("mail history", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    resetMemoryMailHistoryStore();
    vi.stubEnv("MAIL_REPORT_TIMEZONE", "Asia/Shanghai");
    vi.stubEnv("MAIL_REPEATED_SOFT_BOUNCE_THRESHOLD", "3");
  });

  it("classifies mailbox limits as temporary and unknown users as permanent", () => {
    expect(classifyBounce({ smtpStatusCode: "550", enhancedStatusCode: "5.1.1", diagnosticCode: "unknown user" }).category).toBe("hard_bounce");
    expect(classifyBounce({ smtpStatusCode: "452", diagnosticCode: "Mailbox is full" }).category).toBe("soft_bounce");
    expect(classifyBounce({ diagnosticCode: "inode limit exceeded" }).category).toBe("soft_bounce");
    expect(classifyBounce({ enhancedStatusCode: "5.7.1", diagnosticCode: "blocked by policy" }).category).toBe("policy_blocked");
  });

  it("classifies all supported bounce families without using a broad 5xx fallback", () => {
    const cases = [
      [{ smtpStatusCode: "550", enhancedStatusCode: "5.1.1", diagnosticCode: "user unknown" }, "hard_bounce_recipient"],
      [{ smtpStatusCode: "551", enhancedStatusCode: "5.1.1", diagnosticCode: "recipient does not exist" }, "hard_bounce_recipient"],
      [{ smtpStatusCode: "550", diagnosticCode: "recipient account is inactive" }, "hard_bounce_recipient"],
      [{ smtpStatusCode: "550", diagnosticCode: "recipient address rejected: user does not exist" }, "hard_bounce_recipient"],
      [{ smtpStatusCode: "552", diagnosticCode: "mailbox full" }, "soft_bounce_mailbox"],
      [{ smtpStatusCode: "452", diagnosticCode: "quota exceeded" }, "soft_bounce_mailbox"],
      [{ diagnosticCode: "domain mail host not found" }, "domain_infrastructure"],
      [{ diagnosticCode: "DNS lookup failed" }, "domain_infrastructure"],
      [{ smtpStatusCode: "550", enhancedStatusCode: "5.7.1", diagnosticCode: "external sender denied" }, "policy_or_authentication"],
      [{ diagnosticCode: "unauthenticated mail rejected" }, "policy_or_authentication"],
      [{ diagnosticCode: "SPF fail after forwarding" }, "policy_or_authentication"],
      [{ diagnosticCode: "relay access denied" }, "relay_or_configuration"],
      [{ smtpStatusCode: "421", diagnosticCode: "try again later" }, "rate_limited_or_temporary_server"],
    ] as const;
    for (const [input, expected] of cases) expect(classifyBounce(input).normalizedType).toBe(expected);
    const unknown = classifyBounce({ diagnosticCode: "an unfamiliar provider response 799" });
    expect(unknown.normalizedType).toBe("unknown");
    expect(unknown.matchedRuleId).toBe("UNKNOWN");
  });

  it("keeps human replies separate from automatic replies", () => {
    expect(classifyReply("Re: quote request")).toBe("human");
    expect(classifyReply("Automatic reply: out of office")).toBe("auto");
  });

  it("deduplicates provider events and creates hard-bounce suppression", async () => {
    const message = await createMailMessage({ source: "zoho_sent", provider: "zoho", recipient: "buyer@example.com", subject: "Quote" });
    const first = await recordMailEvent({ mailMessageId: message.id, provider: "zoho", providerEventId: "event-1", eventType: "hard_bounce", eventTime: "2026-08-28T04:00:00.000Z", recipient: "buyer@example.com", enhancedStatusCode: "5.1.1", diagnosticCode: "unknown user", source: "zoho_bounce", confidence: "confirmed" });
    const second = await recordMailEvent({ mailMessageId: message.id, provider: "zoho", providerEventId: "event-1", eventType: "hard_bounce", eventTime: "2026-08-28T04:00:00.000Z", recipient: "buyer@example.com", enhancedStatusCode: "5.1.1", diagnosticCode: "unknown user", source: "zoho_bounce", confidence: "confirmed" });
    expect(first.id).toBe(second.id);
    const report = await buildMailReport("2026-08-28");
    expect(report.summary.hardBounce).toBe(1);
    expect(report.activeSuppressions).toHaveLength(1);
    expect(report.rates.deliveryRate).toContain("Unavailable");
    expect(reportText(report)).toContain("hardBounce: 1");
  });

  it("narrows hard bounce to one mailbox and creates a temporary domain hold only for DNS evidence", async () => {
    const recipient = "info@yongkangpowertools.com";
    const message = await createMailMessage({ source: "zoho_sent", provider: "zoho", recipient, subject: "Follow-up" });
    await recordMailEvent({ mailMessageId: message.id, provider: "zoho", eventType: "hard_bounce", recipient, smtpStatusCode: "551", enhancedStatusCode: "5.1.1", diagnosticCode: "recipient does not exist", source: "zoho_bounce", confidence: "confirmed" });
    expect((await suppressionDecision(recipient)).suppressed).toBe(true);
    expect(await getMailHistoryStore().getDomainHold("yongkangpowertools.com")).toBeNull();

    const dnsMessage = await createMailMessage({ source: "zoho_sent", provider: "zoho", recipient: "sales@missing-example.test", subject: "Quote" });
    await recordMailEvent({ mailMessageId: dnsMessage.id, provider: "zoho", eventType: "hard_bounce", recipient: "sales@missing-example.test", enhancedStatusCode: "5.1.2", diagnosticCode: "DNS lookup failed", source: "zoho_bounce", confidence: "confirmed" });
    expect((await getMailHistoryStore().getDomainHold("missing-example.test"))?.holdType).toBe("temporary_dns");
    expect((await suppressionDecision("other@missing-example.test")).scope).toBe("domain");
  });

  it("blocks an already queued follow-up before the provider call after a hard bounce", async () => {
    const recipient = "info@yongkangpowertools.com";
    const message = await createMailMessage({ source: "zoho_sent", provider: "zoho", recipient, subject: "Original" });
    await recordMailEvent({ mailMessageId: message.id, provider: "zoho", eventType: "hard_bounce", recipient, smtpStatusCode: "551", enhancedStatusCode: "5.1.1", diagnosticCode: "recipient does not exist", source: "zoho_bounce", confidence: "confirmed" });
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const result = await sendWithResend({ apiKey: "test-key", from: "sender@example.com", to: [recipient], subject: "Follow-up", html: "<p>Hi</p>", text: "Hi", source: "customer_outreach", campaign: "follow_up" });
    expect(result.reason).toBe("SUPPRESSED");
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it("does not permanently suppress a single mailbox-full event and enforces retry limits", async () => {
    const message = await createMailMessage({ source: "zoho_sent", provider: "zoho", recipient: "buyer@example.com", subject: "Quote" });
    const event = await recordMailEvent({ mailMessageId: message.id, provider: "zoho", eventType: "soft_bounce", recipient: "buyer@example.com", smtpStatusCode: "552", diagnosticCode: "mailbox full", source: "zoho_bounce", confidence: "confirmed", attemptNumber: 1 });
    expect((await getMailHistoryStore().getDomainHold("example.com"))).toBeNull();
    expect((await getMailHistoryStore().getSuppression("buyer@example.com"))?.suppressionType).toBe("temporary_mailbox");
    expect(retryDecision({ ...event, normalizedBounceType: "soft_bounce_mailbox", retryable: true, attemptNumber: 1 })).toEqual({ retry: false, reason: "soft_bounce_max_attempts_reached" });
  });

  it("recognizes role addresses without treating them as valid", async () => {
    expect(isRoleAddress(" INFO@Example.com ")).toBe(true);
    expect(isRoleAddress("buyer@example.com")).toBe(false);
    await expect(sendEligibility("buyer@example.com", { queueStatus: "Pending" })).resolves.toMatchObject({ allowed: false });
  });
});
