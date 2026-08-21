# Final visitor behavior digest

## Summary

- Keeps customer-submitted inquiries on the existing immediate Resend path.
- Captures allow-listed visitor behavior server-side and groups it by HMAC IP hash.
- Stores only short-lived digest records in Upstash Redis, with raw IP TTL bounded to 48 hours.
- Sends behavior-only summaries at 12:00 and 18:00 Asia/Shanghai through the existing Resend transport.

## Safety

- Trusted server-side IP extraction normalizes IPv4/IPv6 and rejects private/local addresses.
- Client event payloads reject IP, cookie, email, phone, message and other PII fields.
- Raw IP is never returned to the browser, written to ordinary logs, analytics or browser storage.
- Behavior score ranks activity only; it does not identify a company, person or purchase intent.
- No IP-to-company API, enrichment provider, PostgreSQL, CRM, Admin surface or WeCom transport is used.
- Production remains explicitly disabled until the operator completes the separate privacy and environment review.

## Validation

Run changed-file lint, typecheck, targeted unit/integration tests, the B2B mock
E2E, and build as listed in the final task result. Do not merge or deploy from
this branch without base/remote review and the final site regression.
