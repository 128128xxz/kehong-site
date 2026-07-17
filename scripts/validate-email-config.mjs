const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function firstConfigured(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return { key, value };
  }
  return { key: "", value: "" };
}

function parseEmailList(value) {
  return (value ?? "").split(/[;,\s]+/u).map((item) => item.trim()).filter(Boolean);
}

const from = firstConfigured("EMAIL_FROM", "INQUIRY_FROM_EMAIL");
const to = firstConfigured("EMAIL_TO", "INQUIRY_TO_EMAIL");
const recipients = parseEmailList(to.value);
const missing = [];
const invalid = [];
if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
if (!from.value) missing.push("EMAIL_FROM");
if (recipients.length === 0) missing.push("EMAIL_TO");
if (from.value && !emailPattern.test(from.value)) invalid.push("EMAIL_FROM");
if (recipients.some((email) => !emailPattern.test(email))) invalid.push("EMAIL_TO");
if (process.env.EMAIL_REPLY_TO_FALLBACK && !emailPattern.test(process.env.EMAIL_REPLY_TO_FALLBACK.trim())) invalid.push("EMAIL_REPLY_TO_FALLBACK");

const production = process.env.VERCEL_ENV === "production" || (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");
const result = {
  configured: missing.length === 0 && invalid.length === 0,
  production,
  missing: [...new Set(missing)],
  invalid: [...new Set(invalid)],
  sources: { from: from.key, to: to.key },
};
console.log(JSON.stringify(result, null, 2));
if (production && !result.configured) process.exit(1);
