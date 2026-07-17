# Codex Next Step Prompt — Finish Kehong SKU/Image Rebuild

Read this file first, then inspect the project. Do not treat the website as finished.

## Current verified status

The current build has:

- 398 SKUs
- 179 product groups
- 10 production image assets
- 0 exact SKU images
- 398 representative SKU images
- 106 SKUs without `productLink`
- 292 paper-cup-fan / cupstock SKUs that still need source and grouping review

`pnpm validate:product-assets` should now print these counts and warn that the image rebuild is incomplete.

## Hard rules

1. Do not randomly assign attractive images to SKUs.
2. Do not mark an image as `exact` unless it is a verified exact SKU/product photo.
3. Do not publish competitor, supplier, marketplace, or scraped product images as Kehong product images unless there is written permission.
4. Unknown-permission images may be stored only in `work/product-image-candidates.*`, not in `public/images/products`.
5. Every image candidate must record source URL, direct image URL, owner, permission status, exactness assessment, target SKU/group, and recommended action.
6. Buyer trust is more important than making every SKU look complete.

## Required deliverable

Build a research manifest first:

- `work/product-image-candidates.json`
- `work/product-image-candidates.csv`

Candidate schema:

```json
{
  "targetSku": "KH-...",
  "targetGroupId": "...",
  "targetProductType": "paper-cup-fan",
  "candidateSourcePageUrl": "https://...",
  "candidateDirectImageUrl": "https://...",
  "sourceOwner": "...",
  "licenseOrPermission": "unknown | authorized | open-license | user-provided",
  "permissionStatus": "pending | approved | rejected",
  "exactnessAssessment": "exact | representative | uncertain | rejected",
  "reasoning": "Explain the match and the risk.",
  "recommendedAction": "use-as-exact | use-as-representative | request-permission | reject",
  "notes": "..."
}
```

## Promotion rule

Only after the user approves candidates should you change production data:

- `public/images/products/...`
- `src/data/productImages.json`
- SKU `mainImageAssetId`
- SKU `galleryAssetIds`
- SKU `imageStatus`

Use this logic:

- exact SKU photo + approved permission => `imageStatus: "exact"`
- family/group visual + approved permission => `imageStatus: "representative"`
- no approved image => `imageStatus: "pending"`

## SKU cleanup priorities

1. Fix the 106 SKUs with no `productLink` or mark them explicitly as pending-source.
2. Review duplicate product links: 39 source URLs are attached to multiple SKU variants.
3. Review 292 cup-fan SKUs so variants are grouped by product family, coating, GSM, cup size, print/process and source page.
4. Separate paper cup fan / cupstock from finished food boxes, paper pads, inserts and raw paper material.
5. Keep product listing grouped by procurement group, not a flood of repeated SKU cards.

## Performance rules

Do not reintroduce scroll-time 3D loading.

- mobile: static preview only
- desktop: 3D only after explicit click
- no `useGLTF.preload(...)` in production components
- use optimized `.web.glb` assets
- avoid loading WebGL while the user scrolls

## Commands

Run:

```bash
pnpm install
pnpm validate:product-assets
pnpm lint
pnpm build
```

If a command fails, fix the exact error or report it clearly.

## Completion criteria

Do not say the rebuild is complete unless:

1. exact SKU image count is greater than 0 and backed by approved SKU-scoped assets;
2. all promoted images have source, owner, permission and exactness fields;
3. representative images are visibly labeled in listing/detail pages;
4. unknown-permission images are not in production image data;
5. build and validation pass.
