# Kehong Product Data Cleaning Report

Generated: 2026-07-17T03:38:53.998Z

## Summary

- SKUs: 398
- Product groups: 6
- Duplicate SKUs: 0
- Duplicate slugs: 0
- English CJK errors: 0
- Validation errors: 0

## Cleaning decisions

- Product groups contain published products only; pending source records remain in the data audit but are excluded from catalog, sitemap and detail routes.
- English notes containing unverified source-language text are blanked during data normalization rather than translated by guesswork.
- Legacy category/material fields are removed from the public product records; canonical categoryId/materialIds are validated against taxonomy.json.

## Errors

No blocking data errors.

## Warnings

None.
