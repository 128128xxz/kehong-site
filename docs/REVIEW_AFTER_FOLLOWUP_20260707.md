# Kehong Follow-up Build Review — 2026-07-07

## Verdict

This follow-up build is still an intermediate data-rebuild version. It is safer than the original because SKU cards and detail pages label images as representative, and unapproved online images were not promoted into production. It is not a finished SKU/image rebuild.

## Current counts

- SKUs: 398
- Product groups: 179
- Product families: 11
- Production image assets: 10
- Exact SKU images: 0
- Representative SKU images: 398
- Pending SKU images: 0
- SKUs without productLink: 106
- Unique productLinks: 88
- Duplicate productLink groups: 39
- Candidate research rows: 179
- Candidate rows with direct image URL: 0

## What improved

1. Product listing is grouped by procurement group, so repeated cup-fan SKUs do not flood the page.
2. Product detail pages show specs, RFQ CTAs, group variants and image/source status.
3. Production product images are limited to approved project-local representative assets.
4. Candidate image research output exists under `work/product-image-candidates.*`.
5. 3D studio remains click-to-load on desktop and static-only on mobile.

## Remaining problems

### 1. Still no exact SKU photo mapping

All 398 SKUs are still marked `representative`. This means the site must not imply the product image is the exact SKU photo.

### 2. Candidate research is not deep enough

The candidate file has 179 rows, but `candidateDirectImageUrl` is empty for every row. It records source pages, not actual image candidates. Codex still needs to visit pages or use permitted sources to collect direct image URLs, owner/permission evidence and exactness notes.

### 3. Source ownership is risky

Most linked SKUs point to ShirongPaper or Alibaba domains. These pages can be used as specification references, but their product images should not be published as Kehong images without permission.

### 4. 106 SKUs still lack productLink

These SKUs need Kehong-owned photos, drawings, sample photos or approved supplier sources before they can be promoted beyond representative visuals.

### 5. Package contained avoidable deployment bloat

The uploaded zip included screenshots, backup GLB files, hidden scratch folders and TypeScript build cache. They are not needed for the deployable handoff package and were removed from this reviewed package.

## Changes made in this reviewed handoff package

- Removed `screenshots/`, `.superpowers/`, scratch work folders, `public/models/backup/` and `tsconfig.tsbuildinfo` from the handoff package.
- Strengthened `scripts/validate-product-assets.mjs` to validate gallery references, `productImages.skuImages` consistency, exact-image permission rules and status counts.
- Added a mobile/coarse-pointer CSS guard so `main > section` does not use `content-visibility: auto` on touch devices, reducing section render-on-scroll hitch risk.
- Added this review document and machine-readable audit summary.

## Required next Codex step

Do not ask Codex to “make the images look correct.” Ask it to build a permission-aware exact-image promotion workflow:

1. For each SKU group, collect direct image candidates only from Kehong-owned files, user-provided uploads, approved supplier assets or open-license representative sources.
2. Fill `candidateDirectImageUrl`, owner, permission evidence and exactness assessment.
3. Keep unknown-permission images out of `public/images/products`.
4. Promote images to `exact` only after permission and exact SKU match are both confirmed.
5. Run `pnpm validate:product-assets`, `pnpm lint` and `pnpm build`.
