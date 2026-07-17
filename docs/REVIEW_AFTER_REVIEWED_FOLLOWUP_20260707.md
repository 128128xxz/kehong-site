# Review after `kehong-site-reviewed-followup-20260707.zip`

Date: 2026-07-07

## Executive conclusion

This build is safer than the early versions because product cards no longer present random competitor photos as exact SKU images. However, it is still **not** a completed SKU image rebuild.

Current production state:

- SKU count: 398
- Product groups: 179
- Product image assets: 10
- Exact SKU image mappings: 0
- Representative SKU image mappings: 398
- SKU image mappings in `productImages.json`: 398
- Research-only candidate rows: 179
- Candidate images promoted to production: 0
- SKUs missing productLink: 106

The site can use this data as a cautious B2B catalog if every image remains visibly labeled as `Representative visual`. It should not claim that SKU photography is complete.

## What improved

1. Production product visuals use only approved local Kehong/user-provided representative assets.
2. `src/data/productImages.json` now includes an explicit SKU-to-image map.
3. Product listing and product detail pages show image/data status labels.
4. Product catalog is grouped by procurement group instead of flooding the page with hundreds of repeated cup-fan SKU cards.
5. 3D studio is no longer loaded on mobile and is only requested by desktop buyers after an explicit click.
6. `work/product-image-candidates.*` records research-only source pages and keeps unknown-permission images out of production.

## Remaining problems

### 1. No exact SKU images

All 398 SKUs are still marked as `representative`. This is safe, but it does not solve exact SKU photography.

Do not mark images as `exact` unless both conditions are true:

- the image is owned/licensed/authorized for Kehong use;
- the image visually matches the target SKU, variant, material, coating and product structure.

### 2. Product source status is still incomplete

292 SKUs have a productLink. 106 SKUs still have no productLink. The 292 linked SKUs are mostly cup-fan/cupstock items and should be treated as source-linked, not fully verified Kehong product data.

### 3. Research candidates are not direct images

`work/product-image-candidates.json` contains 179 research-only rows. All are `permissionStatus: pending` and `exactnessAssessment: uncertain`. These rows are useful for research and permission requests, but they are not production-ready image records.

### 4. Package hygiene needed cleanup

The uploaded zip included screenshots, `.superpowers`, backup GLB files and working folders. These are not needed for production handoff and make the package much larger.

## Patch applied in this reviewed version

1. `src/lib/productImages.ts`
   - Product image rendering now reads `productImages.skuImages[sku.sku]` first.
   - This allows future SKU image updates to be controlled from `productImages.json` instead of relying only on the huge normalized catalog.
   - Exact image status is guarded: a SKU cannot display as exact unless the referenced asset is also exact and approved.

2. `scripts/validate-product-assets.mjs`
   - Validation now checks SKU-image mappings, gallery asset references, exact/approved consistency and productLink coverage.
   - It reports exact/representative/pending counts instead of only checking missing files.

3. `scripts/audit-product-data.mjs`
   - Added a reusable audit script that writes summary JSON and CSV reports into `docs/`.

4. `package.json`
   - Added `audit:product-data` script.

5. `src/components/site/Product3DStudioHeavy.tsx`
   - Removed production console logging.
   - Corrected copy that implied the high-detail model loads automatically near the section.

6. Package cleanup
   - Removed screenshots, `.superpowers`, backup GLB models and unrelated working folders from this clean handoff package.
   - Kept `work/product-image-candidates.*` because these files are useful for the next Codex research pass.

## Recommended next phase

The next phase should not be a visual redesign. It should be a disciplined SKU-image-data operation:

1. Ask Kehong for exact owned photos for the top 30 product groups first.
2. Create one approved asset record per exact image in `src/data/productImages.json`.
3. Map each exact image to the correct SKU or canonical group.
4. Keep all uncertain supplier/marketplace images in candidate manifests only.
5. Do not put pending or unknown-permission images under `public/images/products`.
6. Re-run `npm run validate:product-assets` and `npm run audit:product-data` after each data update.

## Commands to run locally

```bash
npm install
npm run validate:product-assets
npm run audit:product-data
npm run lint
npm run build
npm run dev
```

In this review environment, `eslint`/`next` were not available because `node_modules` was not installed, so only Node-based data scripts could be run.
