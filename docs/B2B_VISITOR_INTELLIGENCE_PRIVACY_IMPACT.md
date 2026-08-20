# B2B Visitor Intelligence Privacy Impact

This document records the implementation impact and is not a legal opinion.
`PRIVACY_LEGAL_REVIEW_REQUIRED=true`.

## New processing

- A server-side request IP may be read from the trusted Vercel proxy context for a meaningful visitor event.
- The normalized public IP is immediately converted to an HMAC-SHA256 `ip_hash` using `IP_HASH_SECRET`; the raw IP is not stored, returned, logged, or included in notifications/CSV.
- The system stores allow-listed website behavior: event type, path, sanitized page title, referrer origin/path, UTM values, duration, timestamps, and expiry.
- A configured provider may classify the network and return company-level enrichment such as domain, country, industry, employee range, and confidence.
- A lead score and reasons are calculated from behavior and provider classification.

## Boundaries

This is not personal identity resolution. It cannot confirm the identity of a
visitor, a procurement manager, a specific employee, or an individual behind a
network. Third-party company data may be inaccurate. Visitor records are
automated candidates and are not customer-submitted inquiries.

The event endpoint rejects names, emails, phone numbers, WhatsApp numbers,
messages, attachments, cookies, passwords, payment data, and client IPs.
Customer-submitted inquiry data remains in the real inquiry path and is stored
separately as `customer_submitted` when persistence is available.

## Retention and controls

Visit events expire after 90 days by default. Provider cache entries expire
according to their configured TTL and cleanup policy. Company/inquiry records
are not automatically deleted by the cleanup route. Provider calls are
disabled for the current Production mock configuration, and no paid provider
was enabled.

The implementation should expose an objection/opt-out path and be reviewed for
the applicable jurisdiction before real providers are enabled. Do not label
the system GDPR-compliant, CCPA-compliant, or based on a confirmed legitimate
interest without legal review.
