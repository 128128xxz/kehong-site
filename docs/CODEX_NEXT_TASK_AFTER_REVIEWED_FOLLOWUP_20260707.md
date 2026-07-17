# Codex next task: finish SKU image/source rebuild safely

Read this file before modifying code.

## Context

The current build is safer than the original because it no longer presents random images as exact SKU photos. However, it is not finished.

Current audit:

- 398 SKUs
- 179 product groups
- 10 approved local representative image assets
- 398 representative SKU image mappings
- 0 exact SKU image mappings
- 179 research-only image candidate rows
- 106 SKUs missing `productLink`

## Non-negotiable rule

Do **not** mark any image as `exact` unless it is both:

1. authorized for Kehong use; and
2. visually verified as the correct SKU/product/variant/material/coating.

Unknown-permission ShirongPaper, Alibaba, marketplace or competitor images may be used for research notes only. They must not be copied into production public image folders.

## Your tasks

### 1. Preserve the current safety model

- Keep `Representative visual` labels where the image is not exact.
- Keep pending/unknown-license research images out of production.
- Do not remove the image status labels from product cards or product detail pages.
- Do not reintroduce random fallback SKU photography.

### 2. Improve exact SKU image workflow

Add or improve the workflow so an operator can promote an image only after confirmation.

A production exact asset must include:

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
  "scope": "sku | group | family",
  "alt": { "en": "...", "zh": "..." },
  "notes": "Why this is exact and who approved it."
}
```

Then update `productImages.skuImages[SKU]`:

```json
{
  "main": "kh-exact-...",
  "gallery": ["kh-exact-..."],
  "imageStatus": "exact"
}
```

### 3. Fill missing product/source coverage

Prioritize these gaps:

- 106 SKUs without productLink.
- non-cup-fan categories: kraft paper, white cardboard, corrugated/fluted paper, specialty paper, food packaging boxes, paper pads, paper inserts, paper packaging material.
- duplicate productLink clusters that currently represent multiple SKU variants.

For each unresolved SKU/group, produce a source decision:

- `needs-kehong-photo`
- `needs-written-permission`
- `candidate-source-only`
- `ready-to-promote-exact`
- `not-suitable`

### 4. Keep 3D performance fixes

Do not reintroduce scroll-triggered Three.js/GLB loading. The 3D studio must remain:

- mobile: static preview only;
- desktop: static preview until buyer explicitly clicks to load 3D.

### 5. Run checks

Run:

```bash
npm run validate:product-assets
npm run audit:product-data
npm run lint
npm run build
```

Output exact counts:

- exact SKU images
- representative SKU images
- pending SKU images
- SKUs missing productLink
- image candidate rows by permissionStatus
- image candidate rows by exactnessAssessment

Do not claim the SKU image rebuild is complete unless exact SKU images are actually present and validated.
