# Codex Follow-up Prompt — Kehong SKU/Image/Data Rebuild

You are taking over a Next.js / React / Tailwind B2B independent website for Kehong Paper.

Do not treat this as a cosmetic task. The goal is to finish the SKU/image/data rebuild without damaging buyer trust, performance, or legal safety.

## Starting point

The current build already has:

- `src/data/catalog.normalized.json`
- `src/data/productImages.json`
- 398 SKUs
- 179 canonical product groups
- 11 product families
- product cards grouped by procurement group
- product detail pages with specs and RFQ CTAs
- image status labels
- asset validation script

But the rebuild is incomplete:

- all 398 SKUs are still `imageStatus: "representative"`
- no SKU has a verified exact image yet
- 106 SKUs have no `productLink`
- many source links are supplier/competitor/marketplace links, not Kehong-owned image sources
- representative images are acceptable only when clearly labeled

## Critical rules

1. Do not randomly pair images with SKUs.
2. Do not mark any image as `exact` unless it is the confirmed exact SKU image.
3. Do not use competitor or marketplace product images as Kehong production images without permission.
4. If a source image is useful but permission is unknown, store it only as a candidate reference, not as a production image.
5. Keep a manifest for every image: source URL, owner, permission status, exactness, notes, local path, target SKU/group.
6. If exactness is uncertain, keep `imageStatus: "representative"` or `"pending"`.
7. Buyer trust is more important than filling every SKU with a nice-looking image.

## Required work

### 1. Audit current data

Read:

- `docs/REVIEW_AFTER_DATA_REBUILD_20260707.md`
- `docs/audit_summary.json`
- `docs/sku_image_data_audit.csv`
- `docs/source_domain_audit.csv`
- `docs/product_link_duplicates.csv`
- `src/data/catalog.normalized.json`
- `src/data/productImages.json`

Summarize:

- how many SKUs are exact / representative / pending
- how many SKUs have source links
- which product types need the most cleanup
- which source domains are being used

### 2. Build candidate image research output

Create a non-production candidate manifest, for example:

```txt
work/product-image-candidates.json
work/product-image-candidates.csv
```

For each candidate, include:

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
  "reasoning": "Why this image is or is not a match",
  "recommendedAction": "use-as-exact | use-as-representative | request-permission | reject",
  "notes": "..."
}
```

Do not copy unknown-permission product images into `/public/images/products`.

### 3. Source priority

Use this priority order:

1. Kehong-owned or user-provided photos already in the project.
2. Kehong-owned image folders/files provided by the user later.
3. Supplier images with written permission.
4. Open-license stock images only for generic representative visuals, with attribution if required.
5. Competitor / marketplace images only as research references unless permission is approved.

### 4. SKU cleanup

Improve SKU completeness in `catalog.normalized.json` or upstream script, not by hand-editing random UI strings.

Focus fields:

- productType
- category
- material
- gsmOrThickness
- coating
- commonSize
- moq
- applications
- canonicalGroupId
- dataStatus
- productLink
- sourceNotes

Fix obvious misclassifications:

- paper cup fan / cupstock should not be confused with finished food tray unless the title/source proves it
- cake board / paper pad should be separated from generic inserts
- paper boxes should be separated from paper raw materials
- corrugated/fluted material should be separated from finished corrugated boxes

### 5. Production image promotion workflow

Only after the user approves candidates should you modify:

- `public/images/products/...`
- `src/data/productImages.json`
- SKU `mainImageAssetId`
- SKU `galleryAssetIds`
- SKU `imageStatus`

Promotion rule:

- exact SKU photo + approved permission => `imageStatus: "exact"`
- family/group visual + approved permission => `imageStatus: "representative"`
- no approved image => `imageStatus: "pending"`

### 6. UI requirements

Product listing and detail pages must:

- show image status visibly
- avoid implying representative photos are exact SKU images
- group similar SKUs by procurement group
- provide complete spec and RFQ information
- make image/data uncertainty clear but not scary

Do not reintroduce random fallback images that make every SKU look exact.

### 7. Performance requirements

Do not reintroduce scroll-triggered 3D loading.

3D rule:

- mobile: static preview only
- desktop: 3D only loads after explicit user click
- no `useGLTF.preload(...)` in production components
- use `.web.glb` optimized files where possible
- do not load heavy 3D while the user scrolls

### 8. Checks

Run, based on available package manager:

```bash
pnpm install
pnpm validate:product-assets
pnpm lint
pnpm build
```

If a command fails, report the exact error and fix it if possible.

## Deliverables

At the end, output:

1. data/image status summary
2. exact images added, if any
3. representative images retained
4. pending images requiring user approval
5. source/permission manifest
6. files changed
7. commands run and results
8. remaining risks

Do not claim completion unless exact SKU image mapping is genuinely complete.
