# Visitor behavior digest architecture

## Current scope

The current implementation is a small scheduled visitor behavior digest. It
does not identify companies, enrich IP addresses, build a CRM, or expose an
Admin surface. Customer inquiries remain the existing independent
`POST /api/inquiry` flow.

## Runtime flow

`POST /api/lead-event` accepts an allow-listed, non-PII behavior event. The
server extracts and normalizes a trusted public IP, rejects private/local
addresses, and derives `ip_hash` with `HMAC-SHA256(IP_HASH_SECRET, ip)`.
The browser cannot submit, read, or persist the raw IP.

Events are grouped by `ip_hash` and digest window. A visit is the first event
for a visitor or an event after 30 minutes of inactivity; multiple page views
and other events inside that inactivity window remain one visit. Behavior
score only ranks activity for reporting and does not claim purchase intent or
company identity.

## Durable queue

Upstash Redis is the production/Preview durable store, accessed through the
official `@upstash/redis` REST client. Each visitor value has a TTL controlled
by `B2B_DIGEST_RETENTION_HOURS` (default 48). The Redis key uses the digest
window and `ip_hash`; raw IP is stored only inside the short-lived value so it
can be included in the administrator email. Sent-window markers contain no
raw IP and prevent duplicate delivery.

Local unit tests use a Redis-compatible in-memory store. No PostgreSQL,
Neon, SQL migration, company profile table, provider cache, or long-term
visitor history is required.

## Delivery

Vercel cron invokes `/api/visitor-digest?window=noon` at 12:00 Asia/Shanghai
and `/api/visitor-digest?window=evening` at 18:00 Asia/Shanghai. A short Redis
lock prevents concurrent sends. A failed Resend request leaves the window
unsent so a later authorized run can retry. Empty windows send the explicit
empty-digest message when `B2B_DIGEST_SEND_EMPTY` is enabled.

Customer inquiries continue to use the existing Resend transport immediately;
they are not written to the visitor digest queue.

## Privacy boundary

Raw IP is server-captured, temporarily stored in Redis, and sent only in the
scheduled administrator digest. It is not returned to the browser, written to
application logs, analytics, cookies, localStorage, or sessionStorage. No
advertising pixel, cross-site identifier, fingerprint, IP-to-company provider,
or enrichment provider is used. Final public privacy wording remains subject
to legal review.
