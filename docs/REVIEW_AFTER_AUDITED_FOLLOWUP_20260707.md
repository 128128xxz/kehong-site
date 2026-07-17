# Review after audited follow-up — 2026-07-07

## Verdict

This package is still an interim, safety-first product data build. It is not a completed SKU image rebuild.

Codex preserved the safe representative-image model and did not promote unverified marketplace/supplier photos into production assets. That is the correct compliance posture. However, it also means the original business problem remains: every SKU still uses a representative image, not an exact SKU photo.

## Current verified counts

- SKUs: 398
- Product groups: 179
- Product families: 11
- Approved production image assets: 10
- Effective exact SKU images: 0
- Effective representative SKU images: 398
- Effective pending SKU images: 0
- SKUs without productLink: 106
- Research-only image candidate rows: 179
- Production images promoted from web candidates: 0

## What changed in this patch

1. Cleaned the delivery package.
   - Removed `screenshots/`, `.superpowers/`, `work/kohon_intro/`, `work/templates/`, `public/models/backup/`, and `tsconfig.tsbuildinfo`.
   - Kept `work/product-image-candidates.*` because those files are still needed for the next SKU/source research pass.

2. Made `src/data/productImages.json` the effective source of truth for displayed SKU image status.
   - Added `getSkuEffectiveImageStatus()` in `src/lib/productImages.ts`.
   - Product listing filters and badges now use the effective image status derived from the production image manifest.
   - Product detail specs and badges now use `getSkuImageMeta()` rather than the stale `sku.imageStatus` value from the normalized catalog.

3. Strengthened validation.
   - `scripts/validate-product-assets.mjs` now prints both requested and effective SKU image status counts.
   - It warns if all SKUs are still representative.
   - It continues to block exact SKU status unless the asset is exact + approved.

4. Added public image reference validation.
   - Added `scripts/validate-public-image-refs.mjs`.
   - Added `npm run validate:image-refs`.
   - Current result: 25 unique `/images` references checked, 0 missing.

## Remaining problems

1. Exact SKU photography is still missing.
   - All 398 SKU mappings are still representative.
   - `src/data/productImages.json` contains no exact image asset.

2. Source coverage is incomplete.
   - 106 SKUs have no `productLink` and remain `pending-source`.

3. Candidate images are research-only.
   - `work/product-image-candidates.*` has 179 rows, all `permissionStatus: pending` and `exactnessAssessment: uncertain`.
   - None should be copied into `public/images/products` unless ownership/permission and exactness are verified.

4. Visual/UX risk remains.
   - The site is visually stronger, but still relies on a small representative image pool. This can make the product catalog feel repetitive.
   - For B2B buyers, the next improvement should be SKU/source accuracy, not more animation.

## Commands run in this patch environment

These do not require `node_modules`:

```bash
node scripts/validate-product-assets.mjs
node scripts/validate-public-image-refs.mjs
node scripts/audit-product-data.mjs
```

Results:

```text
Checked 398 SKUs, 398 SKU-image mappings and 10 image assets.
Requested SKU image status: {"representative":398}
Effective SKU image status: {"representative":398}
Image asset exactness: {"representative":10}
Data status: {"complete":292,"pending-source":106}
Product links: 292 linked, 106 missing.
0 errors, 3 warnings.

Checked 25 unique /images references.
0 missing image reference(s).
```

`npm run lint` and `npm run build` still need to be run after installing dependencies locally.

## Do not claim completion until

- at least some SKU images are exact + approved,
- every exact image has owner/source/permission/exactness recorded,
- unverified competitor/marketplace/supplier photos remain in the research manifest only,
- 106 missing source links are either filled or explicitly marked as user-confirmation-needed,
- production UI keeps `Representative visual` labels for every non-exact SKU.
