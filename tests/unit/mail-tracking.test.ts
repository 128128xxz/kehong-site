import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMailReport, reportText } from "@/server/mail-history/report";
import { recordMailEvent, createMailMessage } from "@/server/mail-history/service";
import { getMailHistoryStore, resetMemoryMailHistoryStore } from "@/server/mail-history/store";
import { addTrackingIdToHtml, addTrackingIdToText, appendTrackingIdToUrl, createTrackingId } from "@/server/mail-history/tracking";
import { sendWithResend } from "@/server/mail-history/resend";

describe("mail tracking IDs", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    resetMemoryMailHistoryStore();
  });

  it("generates different opaque IDs", () => {
    const first = createTrackingId();
    const second = createTrackingId();
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]{20,}$/u);
    expect(first).not.toMatch(/company|sales|@/iu);
  });

  it("appends before a fragment and preserves existing query parameters", () => {
    const result = appendTrackingIdToUrl("https://www.kehong.tech/products?lang=en&amp;utm_source=outreach#details", "K8f3qN7xP2mR4vX9");
    expect(result).toBe("https://www.kehong.tech/products?lang=en&utm_source=outreach&tid=K8f3qN7xP2mR4vX9#details");
  });

  it("uses one ID across HTML links and handles escaped URLs", () => {
    const result = addTrackingIdToHtml('<a href="https://www.kehong.tech/">Home</a><a href="https://kehong.tech/contact?lang=en&amp;source=mail#quote">Contact</a>', "K8f3qN7xP2mR4vX9");
    expect(result.match(/tid=K8f3qN7xP2mR4vX9/gu)).toHaveLength(2);
    expect(result).toContain("lang=en&amp;source=mail&amp;tid=K8f3qN7xP2mR4vX9#quote");
  });

  it("rewrites plain text page links but not punctuation", () => {
    const result = addTrackingIdToText("Visit https://www.kehong.tech/en/products?lang=en#top.", "plain-text-id");
    expect(result).toBe("Visit https://www.kehong.tech/en/products?lang=en&tid=plain-text-id#top.");
  });

  it("does not rewrite non-marketing links or resources", () => {
    const html = '<a href="mailto:sales@kehong.tech">Email</a><a href="tel:+8615888233221">Call</a><a href="https://www.kehong.tech/unsubscribe">Unsubscribe</a><a href="https://partner.example.com/">Partner</a><img src="https://www.kehong.tech/og-image.png" />';
    expect(addTrackingIdToHtml(html, "safe-id")).toBe(html);
    expect(addTrackingIdToText("mailto:sales@kehong.tech https://www.kehong.tech/og-image.png", "safe-id")).toBe("mailto:sales@kehong.tech https://www.kehong.tech/og-image.png");
  });

  it("stores the tracking ID and rewrites both provider payload formats", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "resend-1" }), { status: 200 }));
    const result = await sendWithResend({ apiKey: "test-key", from: "sales@kehong.tech", to: ["buyer@example.com"], company: "Example Buyer", subject: "Quote", html: '<a href="https://www.kehong.tech/en">Home</a>', text: "https://www.kehong.tech/en", source: "customer_outreach", campaign: "initial" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.html).toContain(`tid=${result.trackingId}`);
    expect(body.text).toContain(`tid=${result.trackingId}`);
    const messages = await getMailHistoryStore().findMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ company: "Example Buyer", trackingId: result.trackingId, recipient: "buyer@example.com" });
    expect(messages[0]?.firstSentAt).not.toBeNull();
  });

  it("retains a tracking ID and failed status when the provider rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("rejected", { status: 500 }));
    const result = await sendWithResend({ apiKey: "test-key", from: "sales@kehong.tech", to: ["buyer@example.com"], subject: "Quote", html: "<p>Hi</p>", text: "Hi", source: "customer_outreach", campaign: "failed-test" });
    expect(result.ok).toBe(false);
    expect(result.trackingId).toMatch(/^[A-Za-z0-9_-]{20,}$/u);
    const events = await getMailHistoryStore().findEvents();
    expect(events.some((event) => event.eventType === "failed")).toBe(true);
    expect((await getMailHistoryStore().findMessages())[0]?.trackingId).toBe(result.trackingId);
  });

  it("creates a new tracking ID for a follow-up", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ id: "resend-follow-up" }), { status: 200 }));
    const first = await sendWithResend({ apiKey: "test-key", from: "sales@kehong.tech", to: ["buyer@example.com"], subject: "Quote", html: "<p>Hi</p>", text: "Hi", source: "customer_outreach", campaign: "initial" });
    const followUp = await sendWithResend({ apiKey: "test-key", from: "sales@kehong.tech", to: ["buyer@example.com"], subject: "Quote", html: "<p>Following up</p>", text: "Following up", source: "customer_outreach", campaign: "follow_up" });
    expect(first.ok).toBe(true);
    expect(followUp.ok).toBe(true);
    expect(first.trackingId).not.toBe(followUp.trackingId);
    expect((await getMailHistoryStore().findMessages()).map((message) => message.trackingId)).toEqual(expect.arrayContaining([first.trackingId, followUp.trackingId]));
  });

  it("shows tracking ID and send status in the daily report", async () => {
    const message = await createMailMessage({ source: "local_send_log", recipient: "buyer@example.com", company: "Example Buyer", subject: "Quote", trackingId: "report-tracking-id" });
    await recordMailEvent({ mailMessageId: message.id, eventType: "accepted", eventTime: "2026-08-30T01:00:00.000Z", recipient: message.recipient, source: "resend_api", confidence: "confirmed" });
    const report = await buildMailReport("2026-08-30");
    expect(report.sendRecords).toHaveLength(1);
    expect(reportText(report)).toContain("Tracking ID: report-tracking-id");
    expect(reportText(report)).toContain("Company: Example Buyer");
  });

  it("leaves historical records without a fabricated tracking ID", async () => {
    const message = await createMailMessage({ source: "zoho_sent", recipient: "legacy@example.com", subject: "Legacy" });
    expect(message.trackingId).toBeNull();
  });
});
