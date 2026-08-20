# B2B Visitor Intelligence Architecture

## Audit result

The checkpoint repository contains one real inquiry path:

- `INQUIRY_FORM`: multilingual Contact/Quick Quote UI using the existing inquiry context.
- `INQUIRY_API`: `POST /api/inquiry`.
- `INQUIRY_DATABASE`: not found.
- `INQUIRY_MODEL`: not found.
- `INQUIRY_ADMIN`: not found.
- `INQUIRY_DETAIL_PAGE`: not found.
- `INQUIRY_STATUS_MODEL`: not found.
- `INQUIRY_NOTIFICATION`: Resend email from `/api/inquiry`.
- `INQUIRY_RECIPIENT_RULE`: `EMAIL_TO`/`INQUIRY_TO_EMAIL`, validated server-side.
- `INQUIRY_AUTH`: not applicable to customer submission; no admin auth existed.
- `INQUIRY_CSV_EXPORT`: not found.
- `INQUIRY_CRM`: not found.
- `INQUIRY_SPAM_FILTER`: honeypot, validation, attachment allow-list, rate limit, and idempotency in the existing API.

Implementation mode: `MODE B — BUILD_MINIMAL_UNIFIED_INQUIRY_PERSISTENCE`.

## Unified domain

This branch adds an `inquiries` domain with two types:

- `customer_submitted`: the existing customer form remains the authoritative source for name, contact fields, message, and attachments.
- `company_visitor_lead`: an automated, review-only company-level candidate with no invented person fields.

The default visitor status is `待人工核实`, source is
`website_company_identification`, and the notification subject explicitly says
`【企业访客线索】`. Visitor records never receive fake names, emails, phones,
messages, or a claim about a specific visitor identity.

The optional PostgreSQL adapter and `migrations/001_b2b_inquiry_intelligence.sql`
define `inquiries`, `inquiry_company_profiles`, `inquiry_visit_events`,
`inquiry_activity_logs`, and `provider_cache`. With no `DATABASE_URL`, local
and Preview use a process-local memory mock. No Production database was
created or migrated.

## Event and provider flow

`POST /api/lead-event` validates a small JSON allow-list, origin, content type,
body size, event type, path, referrer, UTM values, and duration. It never
accepts PII or a client-supplied IP. Page views are recorded without a provider
lookup; meaningful events can schedule a non-blocking provider lookup. Provider
failures are negative/degraded results and do not affect page interaction.

The provider interfaces are `IpCompanyProvider` and
`CompanyEnrichmentProvider`. The Mock Provider supports business, education,
government, ISP, hosting, VPN, proxy, no-match, timeout, 429, 500, and invalid
JSON scenarios. Real provider adapters are not configured and no external
provider was contacted.

Only business, education, or government networks with confidence at least
0.75, meaningful activity, and an explainable score at least 50 can create a
visitor inquiry. ISP, carrier, hosting, VPN, proxy, unknown, bot, and low
confidence traffic cannot create one.

## Merge, notification, and customer association

Visitor records merge for 30 days by provider company ID or normalized company
domain. IP alone never forces a company merge. Notification records are
deduplicated for 24 hours and can be re-sent after the configured score
increment. Resend is reused as the notification channel; no WeCom message was
sent and no direct WeCom dependency was added.

When a customer later submits the real form, the existing email flow runs
first. Best-effort persistence then stores a `customer_submitted` record and
links a matching visitor lead by company/email domain or explicit company name
and country. A low-confidence match remains reviewable; the customer fields
are never overwritten by visitor data.

## Admin

Because no admin existed, this branch adds a minimal unified `/admin/inquiries`
surface plus authenticated session, inquiry JSON, and CSV endpoints. Access
uses the server-only `ADMIN_ACCESS_SECRET`, a timing-safe comparison, an
HttpOnly SameSite session cookie, expiry, Secure in Production, origin checks,
and failed-attempt limiting. Admin output contains no raw IP and CSV labels
the two inquiry types separately. No separate `/admin/leads` was created.

## Disable switch and safety

Visitor intelligence can be disabled by leaving provider variables unset in
Production, omitting `IP_HASH_SECRET`, or removing the event sender
integration. The existing customer form and `/api/inquiry` remain independent;
provider, persistence, enrichment, scoring, and visitor notification failures
are caught after the real email acceptance path and do not turn a successful
customer submission into a failure.

## Integration boundary

No Homepage, About, Resources, Factory, Capabilities, or related i18n files
were changed. `src/lib/leadEvent.ts` is an available non-blocking tracking
adapter, but page instrumentation is intentionally deferred while Marvis owns
those surfaces. `INTEGRATION_PATCH_REQUIRED=true` for a later coordinated
integration patch.
