# B2B Visitor Intelligence Deployment

## Current status

- `PRODUCTION_DATABASE_STATUS=NOT_CONFIGURED`
- `REAL_PROVIDER_STATUS=NOT_CONFIGURED`
- `PRODUCTION_WECOM_STATUS=NOT_CONFIGURED`
- Mock provider is for local/Preview only.
- No production migration, provider call, secret configuration, or deployment was performed.

## Local/Preview setup

1. Copy the relevant variables from `.env.example` into a local or Preview environment.
2. Keep `IP_COMPANY_PROVIDER=mock` and `COMPANY_ENRICHMENT_PROVIDER=mock`.
3. Set a non-production `IP_HASH_SECRET` for stable local hashes.
4. Set `ADMIN_ACCESS_SECRET` only when testing `/admin/inquiries`.
5. Apply `migrations/001_b2b_inquiry_intelligence.sql` only to an explicitly disposable/test PostgreSQL database if testing the adapter.
6. Use `B2B_MOCK_SCENARIO` to exercise the documented mock outcomes.

## Production prerequisites

Before any Production enablement, separately review the privacy impact, select
an approved provider, configure server-only provider credentials, set
`IP_HASH_SECRET`, provision and migrate a PostgreSQL-compatible database, and
verify retention, objection, access, and deletion procedures. Do not use
`NEXT_PUBLIC_` for any of these values.

The shared `CRON_SECRET` protects `/api/site-monitor`; the existing cron can
run the cleanup hook after the standard authorization check. Do not create a
second cron secret. Confirm the database migration and cleanup behavior before
using the monitor in Production.

## Disable procedure

Leave provider variables unset/disabled and remove any future page
instrumentation. The customer form and `/api/inquiry` do not depend on the
visitor event route, provider, database, or admin surface.
