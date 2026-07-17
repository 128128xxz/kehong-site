# Codex 优化提示词 — Kehong Paper Site — 2026-07-09

You are continuing the Kehong Paper multilingual B2B catalog site.

## Read first

Read these files before changing code:

- `docs/WEBSITE_ISSUE_ANALYSIS_20260709.md`
- `docs/AUDIT_PRODUCT_DATA_LATEST.md`
- `docs/audit_product_data_latest.json`
- `src/data/catalog.normalized.json`
- `src/data/productImages.json`
- `work/product-image-candidates.json`
- `work/product-source-decisions.json`
- `scripts/validate-product-assets.mjs`
- `scripts/validate-public-asset-refs.mjs`

## Current factual state

- 398 SKUs
- 179 product groups
- 22 production image assets
- 10 approved local representative assets
- 12 AI-generated representative assets
- 0 exact SKU images
- 398 SKUs using `ai-representative` effective image status
- 106 SKUs missing `productLink`
- 179 candidate image rows
- 179 candidate images still `permissionStatus: pending`
- 179 candidate images still `exactnessAssessment: uncertain`

## Non-negotiable rules

1. Do not redesign the website before fixing the data/source/image workflow.
2. Do not copy Alibaba, ShirongPaper, marketplace, competitor, or unknown-permission images into production folders.
3. Do not place unknown-permission images under `public/images/products`.
4. Do not mark any SKU as `exact` unless the image is both authorized for Kehong use and visually verified against the exact SKU/product/variant/material/coating/structure.
5. AI-generated images must always remain representative. They must never count as exact SKU images.
6. Keep `Representative visual`, `AI-generated representative visual`, and `Image pending confirmation` labels visible wherever status is not exact.
7. Do not reintroduce scroll-triggered 3D loading. Desktop 3D must stay click-to-load; mobile must stay static preview only.

## Task A — Source coverage cleanup

Prioritize the 106 SKUs without `productLink`.

For each unresolved SKU or group, create/update a source decision record with:

```json
{
  "sku": "...",
  "canonicalGroupId": "...",
  "productType": "...",
  "currentDataStatus": "pending-source",
  "recommendedAction": "needs-kehong-photo | needs-written-permission | candidate-source-only | ready-to-promote-exact | not-suitable | manual-confirmation-needed",
  "sourcePageUrl": "... or empty",
  "sourceOwner": "Kehong | approved supplier | marketplace | competitor | unknown",
  "reasoning": "Factual reason, no invented links."
}
```

Rules:

- Do not invent product links.
- A shared category page is not exact proof for every SKU variant.
- If no credible source exists, mark `manual-confirmation-needed` or `needs-kehong-photo`.

## Task B — Candidate image workflow

Improve `work/product-image-candidates.json` without promoting unsafe images.

For each candidate, fill or improve:

- `candidateDirectImageUrl`
- `sourceOwner`
- `licenseOrPermission`
- `permissionStatus`
- `exactnessAssessment`
- `recommendedAction`
- `reasoning`

Allowed production promotion only when all are true:

```text
permissionStatus === "approved"
exactnessAssessment === "exact"
sourceOwner is Kehong / approved supplier / licensed source
```

## Task C — Exact image promotion workflow

When a verified exact image is available:

1. Put the optimized file under `public/images/products/verified/`.
2. Add an asset to `src/data/productImages.json`:

```json
{
  "assetId": "kh-exact-...",
  "localPath": "/images/products/verified/...webp",
  "sourcePageUrl": "...",
  "directImageUrl": "...",
  "sourceOwner": "Kehong / approved supplier / licensed source",
  "licenseOrPermission": "authorized | written-permission | owned",
  "permissionStatus": "approved",
  "exactness": "exact",
  "scope": "sku",
  "alt": {
    "en": "Exact photo of ...",
    "zh": "...准确产品图"
  },
  "notes": "Why this is exact and who approved it."
}
```

3. Update `productImages.skuImages[SKU]`:

```json
{
  "main": "kh-exact-...",
  "gallery": ["kh-exact-..."],
  "imageStatus": "exact"
}
```

4. Keep non-exact SKU mappings as representative or pending.

## Task D — Technical checks

Run:

```bash
pnpm validate:product-assets
pnpm validate:image-refs
pnpm validate:asset-refs
pnpm validate:ai-assets
pnpm validate:image-candidates
pnpm audit:product-data
pnpm lint
pnpm build
```

If any command fails, fix the cause. Do not hide warnings about exact image count or missing product links.

## Required final report format

Return a factual report with:

- Exact SKU image count
- Representative / AI-representative SKU image count
- Pending SKU image count
- SKUs still missing `productLink`
- Candidate image rows by `permissionStatus`
- Candidate image rows by `exactnessAssessment`
- Exact images promoted, with source/permission evidence
- Files changed
- Commands run and exact results
- Remaining blockers

Do not claim the SKU image rebuild is complete unless exact SKU image count is materially above 0 and every exact asset has approved source evidence.
