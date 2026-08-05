# Final local data-consistency report

Generated: 2026-08-05  
Scope: local implementation and verification only. No deployment, commit, or push was performed.

## Build under test

- Branch: `codex/production-portal-release-fix-20260720-1703`
- Commit: `307a5b4962a9d352a9e94149e036178782961d15`
- Production preview: `http://127.0.0.1:3261`
- Screenshot manifest: `reports/screenshots/final-data-consistency-20260804/manifest.json`

## Completed locally

1. **Brand derivatives**
   - Preserved the supplied official logo reference unchanged.
   - Generated transparent full-logo and mark-only derivatives in `public/brand/`.
   - Switched favicon/app icon and header mark to the mark-only derivative; Footer uses the full transparent logo.
   - Asset source and SHA-256 provenance are recorded in `reports/brand-assets.md`.

2. **Product catalogue and detail/inquiry consistency**
   - Products route uses the shared server-side catalogue-view builder for default, filtered, and invalid-filter states.
   - Product detail, contact, quick quote, guided quote, WhatsApp and email payloads carry canonical product-group ID/name plus the current SKU.
   - Product-detail tests confirm the canonical product-group name, a single current-SKU representation, and the encoded WhatsApp payload.

3. **Attribution**
   - Added session-safe capture and transfer for `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, landing path, referrer, conversion path, CTA location and locale.
   - Inquiry API/email payloads include those fields without changing the existing submission route.
   - End-to-end mock submission confirms the UTM fields and product-group/SKU fields reach the multipart inquiry payload.

4. **Packaging taxonomy and image mapping**
   - The 01–07 section numbers use one structured source in the packaging category template.
   - Added EN/ZH assertions across the six core category pages.
   - Takeout Boxes now has a single local representative visual mapping; it is labelled as representative rather than as a factory photograph.

5. **SKU/coating audit**
   - Added a read-only audit script; raw SKU/coating source was not modified.
   - Result: 337 SKUs reviewed, 90 with explicit PE/PLA tokens, 75 PE-vs-PLA field conflicts, 0 unverified coded records.
   - Full evidence: `reports/product-data/coating-sku-conflict-audit.md` and `.json`.

## Verification results

| Check | Result |
| --- | --- |
| `pnpm run lint` | PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run test:unit` | PASS — 6 files / 23 tests |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3261 pnpm run test:e2e` | PASS — 49 tests |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Latest local preview `/en` | HTTP 200 |

The current preview headers include `x-kehong-canonical-host: www.kehong.tech` and a non-empty `x-kehong-data-revision`. Local build SHA headers deliberately read `local`, because this was not deployed.

## Screenshots

Fresh screenshots were captured from the sole production preview at 390×844, 1024×768, and 1440×900 for:

- `/en`
- `/en/products`
- `/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan`
- `/en/packaging/takeout-boxes`
- `/en/contact`

There are 15 images with per-file SHA-256 values in `reports/screenshots/final-data-consistency-20260804/manifest.json`.

## Business confirmation still required

1. **Coating data:** confirm whether each of the 75 explicit SKU `PE` token / raw `PLA coating` mismatches should be corrected in commercial source data. This implementation intentionally leaves both source fields untouched.
2. **Mail delivery:** local production build warns that `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_TO` are absent. The code path is tested; a real delivery test requires correctly scoped production environment variables.
3. **Representative imagery:** the new local takeout visual is clearly treated as representative. Replace it with approved Kehong photography when factual factory/product provenance is required.

## Key files changed in this continuation

- `src/lib/attribution.ts`
- `src/app/api/inquiry/route.ts`
- `src/lib/inquiryEmail.ts`
- `src/components/site/{InquiryForm,QuickQuoteForm,GuidedQuoteForm,Header,SiteLogo}.tsx`
- `src/app/[locale]/{contact/page.tsx,products/page.tsx,products/[slug]/page.tsx,layout.tsx}`
- `src/components/pages/PackagingCategoryPage.tsx`
- `src/data/{visuals,packagingCategories,industries}.ts`
- `scripts/{audit-coating-sku-conflicts,capture-final-data-consistency}.mjs`
- `tests/{e2e/site.spec.ts,unit/taxonomy.test.ts}`

This report does not list unrelated pre-existing worktree changes.
