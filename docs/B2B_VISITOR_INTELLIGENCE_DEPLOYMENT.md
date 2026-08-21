# Visitor behavior digest deployment

## Preview prerequisites

Configure the following as server-only Preview variables, without committing
values:

- `B2B_VISITOR_INTELLIGENCE_ENABLED=true`
- `IP_HASH_SECRET`
- `KV_REST_API_URL` (Vercel Marketplace Upstash name) or `UPSTASH_REDIS_REST_URL`
- `KV_REST_API_TOKEN` (Vercel Marketplace Upstash name) or `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`
- `B2B_DIGEST_RETENTION_HOURS=48`
- `B2B_DIGEST_SEND_EMPTY=true`
- `VISIT_SESSION_TIMEOUT_MINUTES=30`
- `B2B_DIGEST_TO_EMAIL` (recommended; falls back to `INQUIRY_TO_EMAIL`, then `EMAIL_TO`)
- `B2B_DIGEST_EMAIL_TRANSPORT=captured` only for local/contract tests without external mail
- existing Resend variables when testing actual digest delivery

The Upstash Redis resource is not created or configured by this repository
change. Production and Preview provisioning remain an explicit operator step.

## Deliberate non-requirements

The final runtime has no `DATABASE_URL`, PostgreSQL, Neon, SQL migrations,
IP-to-company providers, enrichment providers, provider API keys, Admin
secret, CRM database, or WeCom transport. No external company-identification
request is made.

## Schedules and safety

The existing Vercel cron schedules remain: noon covers the previous 18:00 to
12:00 window and evening covers the current 12:00 to 18:00 window in
Asia/Shanghai. `CRON_SECRET` authorizes the route. Redis locks and sent-window
markers prevent concurrent or duplicate delivery; failed delivery is
retryable. TTL cleanup bounds raw-IP retention to the configured short window.

Customer inquiry delivery remains immediate through the existing Resend
configuration and is independent from visitor digest availability.
