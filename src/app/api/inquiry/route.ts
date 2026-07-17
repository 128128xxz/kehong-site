import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildInquiryEmail } from "@/lib/inquiryEmail";
import { getInquiryEmailConfig, isValidEmail } from "@/lib/emailConfig";
import { absoluteSiteUrl } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InquiryPayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  whatsapp?: unknown;
  country?: unknown;
  products?: unknown;
  quantity?: unknown;
  size?: unknown;
  material?: unknown;
  gsm?: unknown;
  printing?: unknown;
  process?: unknown;
  market?: unknown;
  message?: unknown;
  sourceUrl?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  privacy?: unknown;
};

type Attachment = { filename: string; content: string };
type RecentInquiry = { timestamp: number; status: "pending" | "accepted" };

const recentRequests = new Map<string, number>();
const recentInquiryKeys = new Map<string, RecentInquiry>();
const allowedAttachmentTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const MAX_ATTACHMENT_COUNT = 3;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 15 * 1024 * 1024;

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toProducts(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => toText(item)).filter(Boolean).slice(0, 20);
  return toText(value).split(/\n|,/u).map((item) => item.trim()).filter(Boolean).slice(0, 20);
}

function canonicalizePublicText(value: string) {
  return value.replaceAll(/https?:\/\/[^\s|]+/giu, (candidate) => {
    try {
      const parsed = new URL(candidate);
      if (!parsed.hostname.toLowerCase().includes("kehong")) return candidate;
      return absoluteSiteUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
      return candidate;
    }
  });
}

function inquiryError(code: string, status: number, message: string) {
  return NextResponse.json({ ok: false, code, error: message }, { status });
}

function makeInquiryKey(inquiry: Record<string, unknown>, idempotencyHeader: string) {
  if (idempotencyHeader) return `header:${idempotencyHeader}`;
  const content = [inquiry.email, ...(inquiry.products as string[]), inquiry.message, inquiry.quantity, inquiry.sourceUrl]
    .map((value) => String(value ?? "").toLocaleLowerCase())
    .join("|");
  return `content:${createHash("sha256").update(content).digest("hex")}`;
}

async function parseAttachments(form: FormData) {
  const files = form.getAll("attachment").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > MAX_ATTACHMENT_COUNT) throw new Error("ATTACHMENT_COUNT");
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) throw new Error("ATTACHMENT_TOTAL_SIZE");
  const attachments: Attachment[] = [];
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) throw new Error("ATTACHMENT_SIZE");
    if (!allowedAttachmentTypes.has(file.type)) throw new Error("ATTACHMENT_TYPE");
    attachments.push({
      filename: file.name.replace(/[^a-zA-Z0-9._-]/gu, "_").slice(0, 120),
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    });
  }
  return attachments;
}

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const lastRequest = recentRequests.get(ip) ?? 0;
  if (now - lastRequest < 30_000) return inquiryError("RATE_LIMITED", 429, "Please wait before sending another inquiry");

  let payload: InquiryPayload;
  let attachments: Attachment[] = [];
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      if (toText(form.get("website"))) return NextResponse.json({ ok: true, code: "ACCEPTED" }, { status: 200 });
      payload = Object.fromEntries([...form.entries()].filter(([key, value]) => key !== "attachment" && typeof value === "string")) as InquiryPayload;
      attachments = await parseAttachments(form);
    } else {
      payload = await request.json();
    }
  } catch (error) {
    const code = error instanceof Error && error.message.startsWith("ATTACHMENT_") ? error.message : "INVALID_PAYLOAD";
    return inquiryError(code, 400, code === "INVALID_PAYLOAD" ? "Invalid inquiry payload" : "Attachment validation failed");
  }

  const inquiry = {
    name: canonicalizePublicText(toText(payload.name)),
    company: canonicalizePublicText(toText(payload.company)),
    email: toText(payload.email).toLowerCase(),
    phone: canonicalizePublicText(toText(payload.phone)),
    whatsapp: canonicalizePublicText(toText(payload.whatsapp)),
    country: canonicalizePublicText(toText(payload.country)),
    products: toProducts(payload.products).map(canonicalizePublicText),
    quantity: canonicalizePublicText(toText(payload.quantity)),
    size: canonicalizePublicText(toText(payload.size)),
    material: canonicalizePublicText(toText(payload.material)),
    gsm: canonicalizePublicText(toText(payload.gsm)),
    printing: canonicalizePublicText(toText(payload.printing)),
    process: canonicalizePublicText(toText(payload.process)),
    market: canonicalizePublicText(toText(payload.market)),
    message: canonicalizePublicText(toText(payload.message)),
    sourceUrl: canonicalizePublicText(toText(payload.sourceUrl)),
    utmSource: canonicalizePublicText(toText(payload.utmSource)),
    utmMedium: canonicalizePublicText(toText(payload.utmMedium)),
    utmCampaign: canonicalizePublicText(toText(payload.utmCampaign)),
    privacy: toText(payload.privacy),
  };

  if (!inquiry.name || !isValidEmail(inquiry.email) || inquiry.products.length === 0 || inquiry.privacy !== "on") {
    return inquiryError("VALIDATION_FAILED", 400, "Name, valid email and at least one product are required");
  }

  const inquiryKey = makeInquiryKey(inquiry, request.headers.get("idempotency-key")?.trim() ?? "");
  const previous = recentInquiryKeys.get(inquiryKey);
  if (previous && now - previous.timestamp < 10 * 60_000) {
    return inquiryError(previous.status === "accepted" ? "DUPLICATE_INQUIRY" : "INQUIRY_IN_PROGRESS", 409, "A matching inquiry was already received recently");
  }
  recentInquiryKeys.set(inquiryKey, { timestamp: now, status: "pending" });

  const emailConfig = getInquiryEmailConfig();
  if (!emailConfig.valid) {
    recentInquiryKeys.delete(inquiryKey);
    console.error("Kehong inquiry email configuration unavailable", { requestId, missing: emailConfig.missing, invalid: emailConfig.invalid });
    return inquiryError("EMAIL_NOT_CONFIGURED", 503, "Email delivery is not configured");
  }

  const email = buildInquiryEmail({ ...inquiry, submittedAt: new Date(now).toISOString(), requestId });
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${emailConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Kehong Website <${emailConfig.from}>`,
        to: emailConfig.to,
        reply_to: isValidEmail(inquiry.email) ? inquiry.email : emailConfig.replyToFallback || undefined,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(attachments.length ? { attachments } : {}),
      }),
    });
  } catch {
    recentInquiryKeys.delete(inquiryKey);
    console.error("Kehong inquiry email request failed", { requestId, status: "network_error", at: new Date().toISOString() });
    return inquiryError("EMAIL_DELIVERY_FAILED", 502, "Email delivery failed");
  }

  if (!response.ok) {
    recentInquiryKeys.delete(inquiryKey);
    console.error("Kehong inquiry email provider rejected request", { requestId, status: response.status, at: new Date().toISOString() });
    return inquiryError("EMAIL_PROVIDER_REJECTED", 502, "Email delivery failed");
  }

  let emailId = "unknown";
  try {
    const result = (await response.json()) as { id?: unknown };
    if (typeof result.id === "string" && result.id) emailId = result.id;
  } catch {
    // Resend normally returns JSON; acceptance is still recorded if the HTTP response was successful.
  }
  recentRequests.set(ip, now);
  recentInquiryKeys.set(inquiryKey, { timestamp: now, status: "accepted" });
  console.info("Kehong inquiry email accepted", { requestId, emailId, at: new Date().toISOString(), status: "accepted" });
  return NextResponse.json({ ok: true, code: "ACCEPTED", message: "Your inquiry has been accepted by the Kehong website." });
}
