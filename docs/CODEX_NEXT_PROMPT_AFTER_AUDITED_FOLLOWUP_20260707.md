You are continuing the Kehong Paper B2B catalog project.

Read these files first:

- docs/REVIEW_AFTER_AUDITED_FOLLOWUP_20260707.md
- docs/AUDIT_PRODUCT_DATA_LATEST.md
- docs/audit_product_data_latest.json
- work/product-image-candidates.json
- src/data/productImages.json
- src/data/catalog.normalized.json

Current state:

- 398 SKUs
- 179 product groups
- 10 approved local representative image assets
- 0 exact SKU images
- 398 representative SKU images
- 106 SKUs without productLink
- 179 research-only image candidates
- 0 web candidate images promoted into production

Your task is not to redesign the site. Your task is to continue the data/source/image rebuild safely.

Hard rules:

1. Do not copy ShirongPaper, Alibaba, marketplace, competitor, or unknown-permission images into production.
2. Do not put unknown-permission images under public/images/products.
3. Do not mark any SKU as exact unless the image is exact to that SKU and usage permission is confirmed.
4. Do not change `imageStatus` to exact unless the referenced image asset is `exactness: exact` and `permissionStatus: approved`.
5. Do not remove the Representative visual / Image pending confirmation labels.
6. Do not reintroduce scroll-triggered 3D loading.
7. Keep desktop 3D explicit-click only.

Next goals:

1. Improve source coverage.
   - For the 106 `pending-source` SKUs, either find a credible source link, map to a Kehong-provided source, or mark as `manual-confirmation-needed` in a source review file.
   - Do not invent product links.

2. Improve image candidate records.
   - For each candidate in `work/product-image-candidates.json`, fill or improve:
     - `candidateDirectImageUrl`
     - `sourceOwner`
     - `licenseOrPermission`
     - `permissionStatus`
     - `exactnessAssessment`
     - `recommendedAction`
     - `reasoning`
   - Keep candidate records research-only until permission and exactness are approved.

3. Promote only safe images.
   - If a user-provided/Kehong-owned image is confirmed as exact for one or more SKUs, add it to `public/images/products/`.
   - Add a matching asset record in `src/data/productImages.json`.
   - Update `skuImages[sku].main`, `gallery`, and `imageStatus`.

4. Keep the manifest authoritative.
   - `src/data/productImages.json` is the source of truth for displayed image status.
   - `catalog.normalized.json` can contain legacy status, but UI uses effective manifest status.

5. Run checks:

```bash
npm run validate:product-assets
npm run validate:image-refs
npm run audit:product-data
npm run lint
npm run build
```

6. Output a factual final report:
   - effective exact SKU image count
   - effective representative SKU image count
   - pending SKU image count
   - SKUs still missing productLink
   - candidate images still pending permission
   - exact images promoted, with source/permission evidence
   - files changed
   - any build/lint failures

Do not say the image rebuild is complete unless exact SKU image count is materially above 0 and each exact image has approved source evidence.
