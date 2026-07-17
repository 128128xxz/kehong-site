# Review of `kehong-site-audited-followup-reviewed-20260707.zip`

Review date: 2026-07-07

## Executive conclusion

This package is a safer interim build, not a finished SKU/image rebuild.

It is safer because production product cards use approved local representative assets and image labels are visible. It is not finished because there are still **0 exact SKU images** and **398 representative SKU images**.

## Current product data state

- SKUs: 398
- Product groups: 179
- Product families: 11
- Production image assets: 10
- Effective exact SKU images: 0
- Effective representative SKU images: 398
- Effective pending SKU images: 0
- SKUs with productLink: 292
- SKUs missing productLink: 106
- Research-only candidate rows: 179
- Production-ready candidate images: 0

## What is acceptable in this package

- No unapproved competitor or marketplace images are used as production SKU images.
- The product listing and product detail page show image status labels.
- Product images are sourced from approved local project assets and treated as representative visuals.
- The 3D studio remains click-to-load on desktop and static on mobile.
- Basic image references validate successfully.

## Remaining problems

### 1. Exact SKU images are still not complete

All 398 SKUs still resolve to `representative`. No SKU has an `exact` image backed by an approved exact image asset.

### 2. Missing product sources are still significant

106 SKUs still have no `productLink`. These need either Kehong-owned source confirmation, a correct source page, or a deliberate `pending-source` status with clear buyer-facing labeling.

### 3. Candidate image research is not production-ready

`work/product-image-candidates.*` contains 179 research candidates, but every candidate is still pending and uncertain:

- 179 permissionStatus: pending
- 179 exactnessAssessment: uncertain
- 0 production-ready candidates

These candidate records are useful for research workflow only. They must not be copied into `public/images/products` or `src/data/productImages.json` until permission and exactness are approved.

### 4. Duplicate source links remain

There are 88 unique product links for 292 linked SKUs, with 39 duplicate source links. Some duplicates are legitimate shared product-family pages, but Codex should not treat a shared source page as exact proof for every SKU variant without visual and specification verification.

## Fixes applied in this reviewed patch

- Cleaned the package by removing non-delivery workspace artifacts such as `.superpowers`, screenshot dumps and temporary caches.
- Added `scripts/validate-candidate-images.mjs` and `npm run validate:image-candidates`.
- Fixed `scripts/audit-product-data.mjs` so `exactSkuImageMappingComplete` is only true when every SKU has an effective exact image, not merely when one exact image exists.
- Hardened `src/lib/productImages.ts` so gallery image labels also respect SKU-level image status and do not accidentally label an exact asset as exact for a representative SKU mapping.
- Localized product titles in `ProductCatalog` and product detail pages so Chinese pages do not always use English as the primary title.
- Regenerated audit docs.

## Required next step

Do not ask Codex to redesign the page again. Ask it to complete the data workflow:

1. Fill missing productLink/source decisions.
2. Build a candidate image manifest with source page, direct image URL, owner, permission and exactness.
3. Move only approved, exact, Kehong-owned/licensed images into production.
4. Update `src/data/productImages.json` and SKU image mappings.
5. Keep representative/pending labels until exact images are verified.
6. Run all validation scripts and report exact/representative/pending counts.
