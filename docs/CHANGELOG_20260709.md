# Change log — 2026-07-09

## Changed

- Expanded sitemap coverage to static pages and all product detail pages.
- Added page-level metadata for product catalog, contact, product detail, and internal model preview routes.
- Added Product JSON-LD to SKU detail pages with safe handling for non-exact images.
- Added `x-default` hreflang support.
- Localized product image status, data status, and product type labels across seven locales.
- Improved Header locale labels and mobile menu accessibility label.
- Added remove action for selected SKUs in the product catalog RFQ list.
- Added `scripts/validate-public-asset-refs.mjs` and `validate:asset-refs`.
- Regenerated product-data and AI-asset audit outputs.

## Not changed

- No SKU was marked as exact.
- No unverified external image was copied into production.
- No AI-generated image was promoted to exact SKU evidence.
- No scroll-triggered 3D loading was reintroduced.

## Validation run

```bash
node scripts/validate-product-assets.mjs
node scripts/validate-public-image-refs.mjs
node scripts/validate-public-asset-refs.mjs
node scripts/audit-product-data.mjs
node scripts/validate-ai-generated-assets.mjs
node scripts/validate-candidate-images.mjs
```

`pnpm lint` and `pnpm build` still need to be run in an environment with Node 24.x and installed dependencies.
