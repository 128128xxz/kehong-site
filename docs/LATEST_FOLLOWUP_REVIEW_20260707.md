# Latest Follow-up Review — Kehong Site — 2026-07-07

## Verdict

This upload is still an intermediate data build, not a finished SKU/image rebuild.

The safer representative-image framework is present, but Codex has not supplied verified exact SKU images. The production UI must continue labeling visuals as representative.

## Current counts

- SKUs: 398
- Product groups: 179
- Product families: 11
- Image assets: 10
- Exact SKU images: 0
- Representative SKU images: 398
- Pending SKU images: 0
- SKUs without productLink: 106
- Unique product links: 88
- Duplicated product links: 39

## Main findings

1. **Images are still not correctly matched at SKU level.** All 398 SKUs use representative images. None are verified as exact product photos.
2. **SKU source coverage is incomplete.** 106 SKUs have no `productLink`, and most linked SKUs point to supplier/marketplace references rather than Kehong-owned exact photography.
3. **The upload contained non-production payload.** `screenshots/`, `work/`, `.superpowers/`, `tsconfig.tsbuildinfo`, and `public/models/backup/` inflated the package size and should not ship.
4. **3D performance needed another pass.** In this patch, desktop 3D remains explicit-click only, and render cost was reduced.

## Changes made in this patch

- Reduced desktop 3D render cost in `src/components/site/Product3DStudioHeavy.tsx`:
  - DPR lowered to `[1, 1.5]`
  - antialias disabled
  - shadow map size lowered to `1024`
  - `ContactShadows` resolution lowered to `512`
  - production console logging removed
  - internal timer-based auto-load removed
- Strengthened `scripts/validate-product-assets.mjs`:
  - prints exact / representative / pending counts
  - warns when exact image count is 0
  - warns when all SKUs remain representative
  - warns about missing product links
  - validates gallery asset references
- Added latest audit files:
  - `docs/LATEST_FOLLOWUP_REVIEW_20260707.json`
  - `docs/LATEST_SKU_IMAGE_AUDIT_20260707.csv`
  - `docs/LATEST_SOURCE_DUPLICATES_20260707.csv`

## Do not claim completion until

- verified exact images exist for real SKU targets,
- every promoted image has owner/source/permission/exactness recorded,
- unverified supplier or marketplace images remain in a candidate manifest only,
- `imageStatus: exact` is only used with SKU-scoped exact assets.
