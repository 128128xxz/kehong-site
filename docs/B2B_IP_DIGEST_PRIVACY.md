# B2B IP behavior digest

- The server extracts and normalizes a public client IP from trusted request headers. The browser cannot submit or read the IP.
- `ip_hash` is an HMAC-SHA-256 value used for rate limiting, session grouping and same-window deduplication.
- A normalized raw IP is temporarily stored in a short-lived Upstash Redis visitor digest queue only so the scheduled administrator email can include it. Queue records expire after `B2B_DIGEST_RETENTION_HOURS` (default 48 hours) and are deleted by TTL cleanup; the sent marker contains only the digest window identifier.
- Raw IP is not returned to the browser, written to cookies or browser storage, sent to analytics, or written to ordinary application logs.
- No IP-to-company provider, company enrichment provider, advertising pixel, cross-site identifier or fingerprinting is used. `REAL_IP_PROVIDER_REQUIRED=false` and the identification API cost is zero.
- Behavior score ranks activity for the digest only. It does not claim a person, company, identity or purchase intent.
- The noon digest covers 18:00 to 12:00 Asia/Shanghai. The evening digest covers 12:00 to 18:00 Asia/Shanghai. Empty windows send a notice when `B2B_DIGEST_SEND_EMPTY=true`.
- Customer-submitted inquiries continue to use the existing immediate Resend delivery path and are not merged with visitor digest records.
- This raw-IP email workflow requires legal review before production activation: `PRIVACY_LEGAL_REVIEW_REQUIRED=true`.
