# Review: AI Representative Visuals Package - 2026-07-07

## Verdict

This package is acceptable as a safe interim AI representative visual build. It does **not** complete exact SKU photography.

## Verified counts

- SKUs: 398
- SKU image mappings: 398
- AI-generated assets: 12
- Local approved representative assets: 10
- Effective exact SKU images: 0
- Effective AI representative SKU images: 398
- Production-ready external candidate images: 0
- SKUs still missing productLink/source confirmation: 106

## Safety status

The AI assets are correctly constrained as:

- `sourceType: ai-generated`
- `permissionStatus: generated-for-site`
- `exactness: representative`
- `imageStatus: ai-representative`
- `productionUsageAllowed: true`
- `exactSkuEligible: false`

AI assets must not be counted as exact SKU images, Kehong-owned real photos, factory proof, certification proof or customer proof.

## Patch applied in this reviewed package

`src/lib/productImages.ts` was patched so `getSkuGalleryMeta()` uses the same safe display policy as main SKU images. The previous gallery logic only allowed `permissionStatus: approved`, which could cause AI-generated gallery assets with `permissionStatus: generated-for-site` to fall back to the pending image even when the main image was correctly displayed as `ai-representative`.

The gallery now filters through `isAssetDisplayAllowed(asset)` and keeps the AI representative status label intact.

## Checks run

- `node scripts/validate-product-assets.mjs`: 0 errors, 2 expected warnings
- `node scripts/validate-public-image-refs.mjs`: 0 missing image refs
- `node scripts/validate-candidate-images.mjs`: 0 errors, 1 expected warning
- `node scripts/validate-ai-generated-assets.mjs`: 0 errors, 0 warnings
- `node scripts/audit-product-data.mjs`: confirms 0 exact images and 398 AI-representative SKU images

`pnpm lint` and `pnpm build` were not run in this review environment because package dependencies were not installed in the container.

## Packaging cleanup recommendation

The original uploaded package included screenshots, `.superpowers`, old work directories, unused web images and unused heavy model backups. Those files are not needed for the reviewed handoff package and should stay out of deployable/project transfer zips.

## Next step

Do not continue trying to create exact SKU images with AI or public web images. The next stage should be Kehong-owned photography collection and mapping:

1. Use `work/product-source-decisions.csv` to prioritize missing source/photo items.
2. Collect real Kehong-owned family and SKU photos.
3. Add approved real assets to `src/data/productImages.json`.
4. Only mark a SKU as `exact` when the image is real, approved and visually matches that SKU.
5. Re-run all validation scripts before release.
