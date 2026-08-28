# Commit Review

Date: 2026-08-28

This manifest records the read-only review state before staging. At authoring time, the branch was `design/visual-refinement-v2` at `14cb67d6fa8ba183f6bfd1c4021a599d99f8d0ad`; the four local commits described below were created afterward. No push or deployment was performed.

## Proposed tracked files

### UI and E2E contract fixes

- `src/app/globals.css`
- `src/components/home/HomeHero.tsx`
- `src/components/home/HomeProductSystems.tsx`
- `src/components/site/Header.tsx`
- `src/components/site/SiteFooter.tsx`
- `tests/e2e/production-portal.spec.ts`
- `tests/e2e/ui-material-preview.spec.ts`

The runtime changes are limited to metric reveal/accessibility output, removal of a product-card arrow, a localized complete-directory menu link, footer link affordances, Glass C pseudo-element cascade behavior, and desktop product-system geometry. No product data, API, inquiry, B2B, SEO route, or Marvis page work is included.

The two E2E files are included only for human review because their assertions were updated to the current visual contract. In particular, the mobile test now checks the shared product-system media region, and the desktop test no longer requires all independently sized cards to share one bottom edge. The Glass C test accepts an absent navigation icon as the current no-icon contract while still checking the actual icon filter if an icon exists.

### Release guards and project configuration

- `.gitignore`
- `eslint.config.mjs`
- `package.json`
- `scripts/check-client-secrets.mjs`
- `scripts/check-i18n.mjs`
- `scripts/check-public-content.mjs`

These files provide the prebuild checks and exclude confirmed generated artifacts from flat-config ESLint. The scripts use repository-relative paths and tracked project inputs only; no secret values or machine paths are embedded.

### Legal runtime configuration

- `src/config/legal.ts`
- `src/lib/legalContent.ts`

These changes keep public legal copy aligned with the current implementation and leave owner-supplied legal fields unset rather than inventing them.

### Current image-SEO validation inputs

- `docs/stage-1b-seo-media-name-map.json`
- `docs/stage-1b-seo-media-name-map.csv`

These two files are deterministic current-media validation inputs consumed by the image-SEO check. They are distinct from the historical Stage 1B migration map and from Stage 3 audit snapshots.

### Review documentation

- `docs/AUDIT_FIX_REPORT.md`
- `docs/COMMIT_REVIEW.md`

`docs/AUDIT_FIX_REPORT.md` contains the superseding final 195/195 E2E result and the four historical-fixture exceptions. `docs/OWNER_INPUT_REQUIRED.md` and `docs/UNTRACKED_REVIEW.md` were reviewed but are not proposed for this implementation commit because they are handoff/inventory documents and still contain older historical status wording that should be refreshed separately before tracking.

## Explicit exclusions

### Unrelated tracked change

- `docs/product-data-cleaning-report.md` must remain untouched and uncommitted in this review.

### Historical Stage and audit outputs

- `docs/stage-1b-media-migration-map.json`
- `docs/stage-1b-media-migration-map.csv`
- `docs/stage-1b-seo-media-keyword-map.json`
- `docs/stage-1b-seo-media-keyword-map.md`
- all `docs/stage-3a*`, `docs/stage-3a5*`, `docs/stage-3b1*`, `docs/stage-3b2a*`, `docs/stage-3b3*`, and `docs/stage-3c1*` files and directories
- `docs/stage-artifact-manifest.md`

The historical Stage 3 outputs are not runtime inputs. The missing external snapshots remain an explicit exception; no substitute fixture is included.

### Local review and test artifacts

- `output/`
- `reports/`
- `playwright-report/`
- `test-results/`
- `v2-screenshots-final/`
- screenshots, videos, traces, logs, coverage, and generated build output
- `node_modules/`, `.next/`, caches, and temporary environment files

### Historical debug files

- all `typography-*.mjs` files

These are local typography investigation scripts, not production source or release tooling.

## Validation

- Prebuild: PASS.
- Lint: PASS, 0 errors and 15 warnings.
- Typecheck: PASS.
- Unit: 149/153 PASS; 4 failures are historical fixture blockers.
- E2E: 195/195 PASS, 0 failed, 0 skipped.
- Build: PASS.
- Runtime sitemap: PASS, 259/259.
- Image/asset/public-media validators: PASS.
- `git diff --check`: PASS.

## Historical exception

The remaining four unit failures are in `tests/unit/stage3b2aAnalysis.test.ts` and `tests/unit/stage3c1Analysis.test.ts`. They require historical external snapshots: `manifests/product-data.sha256`, `branch-head.txt`, the resulting `docs/stage-3b2a-summary.md`, and `manifests/runtime-urls.txt`. The paths are historical evidence only; the original snapshot source is unavailable in the current checkout and current Git history. These tests are historical audit reproducibility tests, not current runtime/product tests. They were not skipped, weakened, or supplied with fabricated data, and they do not block this commit review.

## Security and clean-checkout review

- No secret, token, API key, cookie, credential, personal-data payload, or environment value was found in the proposed source/config diff.
- No `/Users/...` or `/tmp/...` path is present in proposed source/config. Historical absolute paths remain only as clearly identified evidence inside audit/handoff documentation.
- No debug `console.log` or commented-out code block was introduced into proposed source/config. The three check scripts emit compact CI results intentionally.
- No large or generated artifact is proposed for tracking.
- Proposed release scripts depend on normal project files and installed dependencies, not the local historical artifact inventory.

## Risk review

### LOW

- ESLint and Git ignore additions target named generated directories only.
- Localized complete-directory link and footer affordance additions are narrow and covered by the passing E2E suite.
- Legal configuration leaves unknown owner fields null and does not invent public identity details.

### MEDIUM

- The CSS cascade change restores the Glass C header lens while preserving the other material resets; it is a targeted selector-specific override and should receive a human visual check.
- The desktop product-system sizing rules introduce a large-screen reserved header height and equalized card-grid rows; review at the recorded desktop widths before staging.
- `production-portal.spec.ts` and `ui-material-preview.spec.ts` changed test contracts. The current behavior is covered and the final suite passes, but the removal of some old geometry requirements and the absent-icon fallback are the main test-coverage risks.
- The six-locale legal copy is broad content surface area even though it only describes current behavior; multilingual review remains appropriate.

### HIGH

- None identified in the current diff.

## Recommended commit split

1. `chore: add release guards and generated-artifact lint ignores` - `.gitignore`, `eslint.config.mjs`, `package.json`, the three `scripts/check-*.mjs` files, and the two current image-SEO map inputs.
2. `docs: align legal copy with current website behavior` - `src/config/legal.ts` and `src/lib/legalContent.ts`.
3. `fix: restore homepage and navigation UI contracts` - the five UI source files and the two corresponding E2E specs, after human review of the changed assertions.
4. `docs: record audit and commit review disposition` - `docs/AUDIT_FIX_REPORT.md` and `docs/COMMIT_REVIEW.md`.

The four-commit split was executed locally after this review. No push or deployment was performed.
