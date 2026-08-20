# B2B visitor company identification integrated with inquiry workflow

## Summary

- Adds a unified inquiry persistence abstraction for customer inquiries and review-only company visitor candidates.
- Adds privacy-safe `/api/lead-event` validation and server-side HMAC IP hashing.
- Adds mock-only provider interfaces, cache boundaries, explainable scoring, merge, notification dedup, and cleanup hook.
- Reuses Resend for visitor notifications and preserves the existing customer inquiry path.
- Adds a minimal authenticated unified `/admin/inquiries` and CSV export because no inquiry admin existed.
- Adds migrations, environment documentation, privacy impact/copy proposal, deployment notes, and targeted tests.

## Safety

- No raw IP is stored, logged, returned, or exported.
- No visitor record receives fake contact fields or a claim about a specific person.
- Mock provider only; no paid provider, WeCom message, Production database, or deployment.
- Homepage/About/Resources and Marvis-owned files are not changed.
- Privacy legal review remains required before a real provider is enabled.

## Validation

Run changed-file lint, typecheck, targeted unit/integration tests, the B2B mock
E2E, and build as listed in the final task result. Do not merge or deploy from
this branch without base/remote review and the final site regression.
