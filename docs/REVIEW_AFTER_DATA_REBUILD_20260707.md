# Kehong Site Review After Data Rebuild — 2026-07-07

## Verdict

This build is a safer intermediate version, but it is not a finished SKU/image rebuild.

It correctly introduces:

- `src/data/catalog.normalized.json`
- `src/data/productImages.json`
- grouped catalog display instead of flooding the list with repeated cup-fan SKUs
- visible `Representative visual` labels
- product detail pages with specs, procurement cards, RFQ CTA and group variants
- validation script for image asset references

However, it still does not solve the user's original complaint that SKU images are not correctly matched.

## Current data status

- Product families: 11
- SKUs: 398
- Product groups: 179
- Product image assets: 10
- SKU image status:
  - exact: 0
  - representative: 398
  - pending: 0
- SKU data status:
  - complete: 292
  - pending-source: 106
- SKUs without `productLink`: 106
- Source URLs:
  - 292 SKUs have `productLink`
  - 88 unique product links
  - most links point to ShirongPaper or Alibaba pages, not Kehong-owned product photography

## Main issues

### 1. No exact SKU image mapping yet

Every SKU is currently mapped to a family-level representative image. This is acceptable as a temporary fallback only if the UI labels it clearly. It must not be described as correct SKU photography.

Required next step: build an exact image manifest from Kehong-owned photos, written-permission supplier images, or confirmed licensed image sources.

### 2. Third-party / competitor images were active in the visual layer

The uploaded build had several public UI sections using images under `/public/images/web`, including Sunshine Bakery Packaging, Unico Packaging, Flickr/Openverse, StockSnap, Unsplash and Pexels assets. Some may be usable with attribution; competitor product images should not be used as Kehong production visuals without written permission.

In this reviewed patch, active references were changed back to Kehong/user-provided representative assets under `/public/images/kehong/...`. The unused third-party image files were removed from `/public/images/web`, except for `studio-pizza-preview.webp`.

### 3. 3D performance regression

The uploaded build reintroduced scroll-triggered 3D loading in `Product3DStudio.tsx`, and `Product3DStudioHeavy.tsx` still preloaded GLB models. This can re-create the original scrolling jank.

In this reviewed patch:

- desktop 3D loads only after explicit click
- mobile stays static-only
- GLB preloads were removed
- `OrinscareModelPreview` loads `.web.glb` assets instead of full GLB files
- a syntax issue in `OrinscareModelPreview.tsx` was fixed

### 4. Heavy unused static assets

The uploaded package kept many large PNG originals and unused GLB files. These inflate deploy size and can increase accidental use risk.

In this reviewed patch:

- unused Kehong PNG originals were removed because WebP/JPEG alternatives are used
- unused full-size GLB/original model assets were removed
- only optimized `.web.glb` files and the active birthday-cake auxiliary model remain

## Files changed in this reviewed patch

- `src/components/site/Product3DStudio.tsx`
  - changed desktop 3D from scroll-near auto-load to click-to-load
  - mobile remains static preview
  - updated copy and CTA

- `src/components/site/Product3DStudioHeavy.tsx`
  - removed `useGLTF.preload(...)`
  - removed unused `packagingSet` model reference

- `src/components/site/OrinscareModelPreview.tsx`
  - removed GLB preloading
  - fixed extra closing syntax in `SceneContent`
  - switched model loading from full `path` to optimized `webPath`
  - reduced antialias / shadow cost

- `src/data/visuals.ts`
  - redirected active web/third-party visual slots to Kehong/user-provided representative assets

- `src/data/orinscareModelManifest.json`
  - switched path/filename/bytes to optimized web model values

- `public/images/web/README.md`
  - explains that third-party/competitor images should not be production visuals

- `docs/audit_summary.json`
- `docs/sku_image_data_audit.csv`
- `docs/source_domain_audit.csv`
- `docs/product_link_duplicates.csv`
- `docs/CODEX_FOLLOWUP_PROMPT_20260707.md`

## What Codex should do next

1. Do not declare the SKU image rebuild complete.
2. Collect candidate images into a research-only manifest first.
3. Only mark an image as `exact` if it is a verified exact SKU photo and Kehong has permission to use it.
4. For competitor/supplier pages, extract specs and candidate references, but do not publish their product photos as Kehong photos without permission.
5. Build a structured CSV/JSON review file for the user to approve before images are promoted to production.
6. Replace `representative` with `exact` gradually, not in bulk.
7. Add a buyer-facing note on product detail pages if a visual is representative.
8. Keep `pnpm validate:product-assets`, `pnpm lint`, and `pnpm build` passing.

## Local checks run here

The dependency tree is not installed in this execution environment, so `pnpm lint` and `pnpm build` could not be run here.

The following direct checks were run:

```bash
node scripts/validate-product-assets.mjs
```

Result:

```text
Checked 398 SKUs and 10 image assets.
0 errors, 0 warnings.
```

A reference scan was also run to catch active references to deleted `/images` and `/models` files.
