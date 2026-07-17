# Codex next task: finish SKU source and exact image rebuild safely

You are working on the Kehong Paper B2B product catalog site.

## Current state

The current package is a safe interim build, but not a completed image rebuild:

- 398 SKUs
- 179 product groups
- 10 approved local representative image assets
- 398 SKU images are still effective `representative`
- 0 SKU images are effective `exact`
- 106 SKUs are missing `productLink`
- `work/product-image-candidates.*` has 179 research-only candidate records
- 0 candidate images are production-ready

## Non-negotiable rules

1. Do not copy ShirongPaper, Alibaba, marketplace or competitor images into production unless written permission or clear license is recorded.
2. Do not mark any image as `approved` unless permission is confirmed.
3. Do not mark any SKU as `exact` unless the image is visually matched to that SKU and the asset itself is `exact` + `approved`.
4. Do not remove buyer-facing labels: `Exact product image`, `Representative visual`, `Image pending confirmation`.
5. Do not reintroduce scroll-triggered 3D loading. Desktop 3D must remain click-to-load; mobile must remain static.
6. Do not claim the SKU image rebuild is complete unless exact SKU images are actually added and validated.

## Required work

### A. Complete product source decisions

For each SKU missing `productLink`, choose one:

- add a verified Kehong source page / official source record;
- mark source as Kehong-owned-photo-needed;
- keep `pending-source` with a clear reason.

Do not fabricate product links.

### B. Upgrade candidate image manifest

Improve `work/product-image-candidates.json` and `.csv` so each candidate has:

- candidateId
- targetSku or targetSkus
- targetProductType
- sourcePageUrl
- directImageUrl when available
- sourceOwner
- licenseOrPermission
- permissionStatus: approved / pending / rejected / unknown
- exactnessAssessment: exact / representative / uncertain / mismatch
- recommendedAction
- notes

Candidates may remain research-only. That is acceptable. Do not push research-only assets into production.

### C. Add production images only when safe

Only after a candidate is `approved` and `exact`:

1. Save the optimized image under `public/images/products/...`.
2. Add an asset row to `src/data/productImages.json` with `exactness: "exact"` and `permissionStatus: "approved"`.
3. Update `skuImages[SKU].main`, `gallery` and `imageStatus: "exact"`.
4. Confirm `getSkuEffectiveImageStatus()` returns `exact` for that SKU.

For images that are approved but not exact, keep them as representative assets and label them as representative.

### D. Validate and report

Run:

```bash
npm run validate:product-assets
npm run validate:image-refs
npm run validate:image-candidates
npm run audit:product-data
npm run lint
npm run build
```

Report:

1. Effective exact SKU image count.
2. Effective representative SKU image count.
3. Effective pending SKU image count.
4. SKUs still missing productLink.
5. Candidate images that became production-ready.
6. Production images added, with source and permission notes.
7. Remaining research-only candidates.
8. Any build/lint errors.

## Acceptance criteria

- The site still builds.
- No missing `/images/...` references.
- No unapproved online images are used in production.
- Every exact SKU image has an approved exact asset.
- Representative visuals remain labeled as representative.
- Pending source/photo SKUs are not hidden or falsely marked complete.
