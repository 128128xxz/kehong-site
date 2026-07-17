export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function isValidEmail(value: string | undefined) {
  return Boolean(value && emailPattern.test(value.trim()));
}

function firstConfigured(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return { key, value };
  }
  return { key: "", value: "" };
}

export function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(/[;,\s]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getInquiryEmailConfig() {
  const from = firstConfigured("EMAIL_FROM", "INQUIRY_FROM_EMAIL");
  const to = firstConfigured("EMAIL_TO", "INQUIRY_TO_EMAIL");
  const replyToFallback = firstConfigured("EMAIL_REPLY_TO_FALLBACK");
  const recipients = parseEmailList(to.value);
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
  if (!from.value) missing.push("EMAIL_FROM");
  if (recipients.length === 0) missing.push("EMAIL_TO");
  const invalid = [
    ...(from.value && !isValidEmail(from.value) ? ["EMAIL_FROM"] : []),
    ...recipients.filter((email) => !isValidEmail(email)).map(() => "EMAIL_TO"),
    ...(replyToFallback.value && !isValidEmail(replyToFallback.value) ? ["EMAIL_REPLY_TO_FALLBACK"] : []),
  ];
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() ?? "",
    from: from.value,
    to: recipients,
    replyToFallback: replyToFallback.value,
    sources: { from: from.key, to: to.key, replyToFallback: replyToFallback.key },
    missing: [...new Set(missing)],
    invalid: [...new Set(invalid)],
    valid: missing.length === 0 && invalid.length === 0,
  };
}

