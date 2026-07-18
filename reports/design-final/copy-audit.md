# Final English copy audit

## Approved homepage language

- `Paper packaging, built from the material up.`
- `Paper materials for the next production stage.`
- `Finished packaging for practical applications.`
- `Packaging solutions for real production needs.`
- `Production you can verify.`
- `Review the structure before production.`
- `Move your packaging brief into production.`

## Terminology normalization

Use `paperboard` for folding-carton board, `corrugated board` for fluted construction, `cupstock` and `cup fan blanks` for cup converting, and `paper converting`, `die-cutting`, `creasing`, `coating`, `finishing`, and `inspection` for production stages.

## Current issues

- Homepage strings are split between components and `dictionary/en.json`.
- Product-system and solution descriptions need the approved material/process wording.
- Manufacturing copy omits finishing, inspection, and shipment preparation from the approved coordinated-production sentence.
- Some legacy content files contain marketing-style phrases; public English output must reject the explicit banned list.

## Guardrail

Add a source audit that fails on: `Review the structure before you quote`, `Bring your packaging requirement into production`, `Finished structures ready for real applications`, `Best Quality`, `Best Price`, and `One-Stop Service`, excluding historical report artifacts.
