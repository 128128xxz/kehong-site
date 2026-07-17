# Codex Next Task — Finish Exact SKU Image Mapping Safely

You are continuing the Kehong Paper B2B independent-site rebuild. Read these files first:

- docs/REVIEW_AFTER_FOLLOWUP_20260707.md
- docs/audit_after_followup_20260707.json
- work/product-image-candidates.json
- src/data/catalog.normalized.json
- src/data/productImages.json

## Current state

The project has 398 SKUs and 179 product groups. All SKUs are still `imageStatus: "representative"`. There are 0 exact SKU images. Candidate research exists, but every `candidateDirectImageUrl` is empty.

## Hard rules

1. Do not randomly assign attractive images to SKUs.
2. Do not use competitor or marketplace images in production without written permission.
3. Do not mark any SKU image as `exact` unless the image is both the correct SKU and permission is approved.
4. Unknown-permission images must stay in the candidate manifest only.
5. The buyer-facing UI must continue to label representative visuals clearly.
6. Do not reintroduce scroll-triggered 3D loading. Desktop 3D is click-to-load only; mobile is static-only.

## Required work

### 1. Deepen the candidate manifest

For each row in `work/product-image-candidates.json`, fill or add:

- `candidateDirectImageUrl`
- `sourceOwner`
- `permissionStatus`
- `licenseOrPermission`
- `exactnessAssessment`
- `visualMatchNotes`
- `permissionEvidence`
- `recommendedAction`

If you cannot verify permission, leave the image out of production.

### 2. Add approved images only

Only approved assets may be copied to:

```txt
public/images/products/...
```

Then update:

- `src/data/productImages.json`
- SKU `mainImageAssetId`
- SKU `galleryAssetIds`
- SKU `imageStatus`

Promotion rules:

- exact SKU photo + approved permission => `exact`
- approved family/group visual => `representative`
- no approved visual => `pending`

### 3. Fix incomplete source data

Continue improving the 106 SKUs with no `productLink`. Do not invent sources. Use `pending-source` when the source cannot be verified.

### 4. Keep performance safeguards

- no `useGLTF.preload(...)`
- no scroll-triggered 3D loading
- mobile must not load Three.js/GLB from the homepage
- keep product listing grouped
- keep image status badges visible

### 5. Run checks

Run:

```bash
pnpm validate:product-assets
pnpm lint
pnpm build
```

Report exact output. Do not claim completion unless exact SKU image mapping is genuinely done.

## Final report required

1. exact / representative / pending SKU counts
2. approved production images added
3. candidate images still pending permission
4. SKUs still needing user-provided photos
5. files changed
6. commands run and results
7. remaining legal/data risks
