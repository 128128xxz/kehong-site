# Technical SEO, i18n and Production Readiness Audit

Date: 2026-08-28
Repository: `kehong-paper-site-final`
Branch: `design/visual-refinement-v2`
Audited commit: `14cb67d6fa8ba183f6bfd1c4021a599d99f8d0ad`

## Changes made

- Added `src/config/legal.ts` as the single source for verified public legal identity fields. Unknown owner inputs remain `null` and are not rendered as invented values.
- Removed unfinished legal-status wording from the six active privacy copies. The pages now describe current information flows without making a legal or jurisdictional conclusion.
- Added deterministic checks for active-locale dictionary parity, public unfinished-content markers, and non-public environment-variable usage in client modules.
- Added `check:i18n`, `check:content`, `check:secrets`, `check:products`, `check:seo`, and `verify:release` package commands. The release command intentionally excludes full E2E.
- Added the Playwright HTML report directory to `.gitignore`.

No product data, public SEO route structure, B2B runtime, inquiry delivery logic, visual page component, secret, or production environment was changed.

## Checks

| Check | Result | Evidence |
| --- | --- | --- |
| Node / pnpm | PASS | Node v24.19.0, pnpm 11.19.0 |
| Prebuild | PASS | Email env absent in local development was reported but did not block; catalog and sitemap static checks passed |
| i18n guard | PASS | 6 active locales, 315 keys each, no missing or empty values |
| Public content guard | PASS | 78 runtime/content files checked |
| Client secret guard | PASS | No non-public environment variable found in client modules |
| Catalog baseline | PASS | 337 SKUs; 231 published; 106 pending; 6 product groups; no duplicate SKU/slug errors |
| Product asset validation | PASS WITH 2 NON-BLOCKING WARNINGS | 0 errors; current assets are representative rather than exact SKU photography |
| Public asset references | PASS | 0 missing references |
| Public image references | PASS | 0 missing references |
| Public media policy | PASS | 173 media files; 0 legacy runtime references |
| Static sitemap validation | PASS | 259 expected URLs; no duplicate or legacy-domain URL |
| Runtime sitemap validation | BLOCKED | Current checkout lacks `docs/stage-3b3-sitemap-exact-diff.csv`, an old analysis fixture |
| Image SEO validation | BLOCKED | Current checkout lacks `docs/stage-1b-seo-media-name-map.json`, an old Stage 1B map |
| Lint | PASS | 0 errors; 15 pre-existing warnings in local typography/debug files |
| Typecheck | PASS | `tsc --noEmit` |
| Unit tests | BLOCKED BY EXISTING FIXTURES | 120 passed; 15 failed because Stage 3A/3B/3C analysis files or external old backup paths are absent |
| Production build | PASS | Next.js 16.2.10 webpack build completed successfully |
| Full E2E | BLOCKED BY LOCAL BROWSER | 195 collected; 19 passed; 2 did not run; remaining attempts failed before test execution because Playwright headless shell 1179 is missing |

## Known blockers and follow-up

The missing Stage 3A/3B/3C documents are historical evidence fixtures referenced by legacy tests. They should not be recreated as fabricated audit artifacts. If those tests remain part of the release gate, restore the approved evidence bundle or update that test suite in a separate maintenance task.

Install the repository-pinned Playwright browser runtime before relying on E2E results. No E2E business assertion was evaluated in this run.

Public legal owner inputs are listed in `docs/OWNER_INPUT_REQUIRED.md`. The site deliberately does not infer those values.

## Follow-up verification: 2026-08-28

### Scope and change boundary

- No business logic, tests, assertions, product data, SEO routes, or public-page behavior were changed during fixture reconciliation.
- The only intentional source/config changes in this workstream remain the previously authorized audit guards and the filename correction from `scripts/check:i18n.mjs` to `scripts/check-i18n.mjs`.
- No commit, push, deployment, cleanup, or deletion was performed.

### Historical fixture reconciliation

The original unit run reported 15 failures in six Stage 3 analysis files. Existing repository generators were used without hand-writing fixture content:

- Stage 3A: generated from the current normalized catalog; 337 products, 231 published, 106 pending.
- Stage 3A.5: generated from current catalog and existing Stage 3A output.
- Stage 3B.1: generated from current catalog and existing route data.
- Stage 3B.3: generated from the local production server and current route data.
- Stage 3C.1: generated from current catalog, Stage 3A and Stage 3B.3 outputs.

This resolved 11 of the original 15 failures. The remaining four failures are historical infrastructure blockers, not business assertion regressions:

1. `tests/unit/stage3b2aAnalysis.test.ts` requires the absent external snapshot manifest `manifests/product-data.sha256` under the former Stage 3B.2A backup directory.
2. `tests/unit/stage3b2aAnalysis.test.ts` requires the locally absent `docs/stage-3b2a-summary.md`; the Stage 3B.2A generator cannot complete because its required `branch-head.txt` is in the absent external snapshot.
3. `tests/unit/stage3b2aAnalysis.test.ts` also fails its required-deliverables assertion because the same Stage 3B.2A summary was not generated.
4. `tests/unit/stage3c1Analysis.test.ts` requires the absent external snapshot manifest `manifests/runtime-urls.txt` under the former Stage 3C.1 backup directory.

The missing historical paths are not tracked in the current Git history and are not ignored by `.gitignore`. The Stage 3B.2A and Stage 3C.1 external backup directories are absent. No fake JSON, CSV, summary, or snapshot was created.

Latest unit result after deterministic generation: 32 test files passed and 2 failed; 149 tests passed and 4 failed out of 153. The four failures are the blockers listed above.

### Playwright environment

The project Playwright configuration was checked and retains the existing port `3451`, HTML report directory `playwright-report`, artifact directory `test-results/artifacts`, and managed web server lifecycle. The standard `pnpm exec playwright install chromium-headless-shell` attempt produced no output and did not make the required binary available. The expected binary remains absent under the Playwright cache.

The complete E2E attempt therefore remains `BLOCKED BY ENVIRONMENT`: 195 tests were collected, 19 reached passing completion, 2 did not run, and the remaining attempts failed before browser launch because Chromium headless shell was unavailable. These are not business assertion failures. No test was skipped or weakened, and no second full E2E run was performed after the unsuccessful browser installation attempt.

### Verification results

- PASS: Node `v24.19.0` and pnpm `11.19.0`.
- PASS: `pnpm run prebuild`; i18n, public-content, client-secret, catalog, static sitemap, and legacy-domain checks completed successfully. The prebuild typo was corrected to `scripts/check-i18n.mjs`.
- PASS: project-source ESLint with generated report/cache/screenshot directories excluded: 0 errors and 15 pre-existing warnings from untracked typography/debug files.
- BLOCKED BY GENERATED ARTIFACTS: the raw `pnpm run lint` command also scans the untracked `playwright-report/trace` bundle as source and reports generated JavaScript errors. The report directory was not deleted. This is local artifact contamination, not a source lint error.
- PASS: `pnpm run typecheck`.
- PASS: `pnpm run build`; 326 static pages generated.
- PASS: runtime sitemap validation: 259 unique runtime URLs matched 259 expected URLs; `pe-043` remained in the sitemap, and all 18 source records returned 200, canonicalized to the anchor, and remained outside the sitemap.
- BLOCKED BY MISSING HISTORICAL FIXTURE: image SEO validation requires absent `docs/stage-1b-seo-media-name-map.json`.
- PASS: `git diff --check`.

### Untracked file classification

No untracked files were deleted. Current classification is:

- Project source: 4 files (`scripts/check-client-secrets.mjs`, `scripts/check-i18n.mjs`, `scripts/check-public-content.mjs`, `src/config/legal.ts`).
- Audit reports: 2 files (`docs/AUDIT_FIX_REPORT.md`, `docs/OWNER_INPUT_REQUIRED.md`).
- Historical audit fixtures/reports: 92 paths, including generated Stage 3A/3A.5/3B.1/3B.2A/3B.3/3C.1 artifacts and the pre-existing Stage 1B map files.
- Historical typography/debug scripts: 21 files.
- Test or screenshot artifacts: `output/` (14 MB), `reports/` (28 KB), and `v2-screenshots-final/` (18 MB).
- Previously unclassified artifact: `docs/stage-artifact-manifest.md`; based on its name and location it is treated as a historical audit artifact, not runtime source.
- No candidate secret, token, email credential, personal-data assignment, `/Users/...` path, `/tmp` path, or `console.log` was found in the tracked diff or newly added source/config scan. The filename `scripts/check-client-secrets.mjs` is a scanner name, not a secret.

### Final disposition

- PASS: current source/config checks and production build.
- FAIL: unit suite is not fully green: 149/153 passed, 4 historical-fixture failures remain.
- BLOCKED BY ENVIRONMENT: browser-dependent E2E cannot run until the standard Chromium headless-shell binary is available.
- BLOCKED BY MISSING HISTORICAL FIXTURE: Stage 3B.2A, Stage 3C.1, and Stage 1B image-SEO artifacts are absent and cannot be truthfully reconstructed from this checkout alone.
- No release or version-control action is authorized by this report. The correct remediation is to restore the authoritative historical snapshots from their source archive, or explicitly retire/update those historical audit tests and validators in a separately reviewed change; do not fabricate their expected outputs.

## Superseding update: 2026-08-28 engineering closeout

### ESLint artifact isolation

The repository uses ESLint flat config in eslint.config.mjs; no .eslintignore is present. The flat-config globalIgnores now excludes only confirmed generated directories: coverage/, playwright-report/, test-results/, output/, reports/, and v2-screenshots-final/, in addition to the existing build directories. Source directories remain linted. The original pnpm run lint now exits successfully with 0 errors and 15 pre-existing warnings from untracked typography/debug files.

### Stage 1B image SEO mapping

The missing docs/stage-1b-seo-media-name-map.json and CSV were deterministically generated by the existing scripts/build-stage-1b-seo-media-map.mjs. The generator reported 0 current entries, 0 renames, 0 duplicate targets, 0 invalid entries, and 0 keyword-stuffed entries. A second generator run produced identical semantic JSON/CSV content; only the generated timestamp is expected to vary.

pnpm run validate:image-seo now passes: 170 semantic media files, 14 core images with alt text across all seven locale entries, 0 broken image sitemap URLs, 0 old image references, and 337 representative SKU mappings. Direct asset-reference, image-reference, and public-media validation also pass. This resolves the historical fixture blocker for the current image SEO check. It does not prove that the removed historical Stage 1B audit process can be replayed from its original snapshot.

### Historical Stage 3 unit status

After all deterministic generation available from the current checkout, the unit suite remains 32/34 files passed and 149/153 tests passed. Four tests remain BLOCKED BY MISSING HISTORICAL FIXTURE:

- Three assertions in tests/unit/stage3b2aAnalysis.test.ts, requiring the absent external product-data.sha256, the absent branch-head.txt needed by its generator, and the consequently absent local docs/stage-3b2a-summary.md.
- One assertion in tests/unit/stage3c1Analysis.test.ts, requiring the absent external runtime-urls.txt.

These are historical audit reproducibility tests, not current product behavior tests. No skip, weakened assertion, ignored exception, or fabricated fixture was introduced.

### Clean-checkout assessment

PASS for current production guard scripts, prebuild, lint, typecheck, build, i18n, public-content, client-secret, catalog, static sitemap, and current image SEO validation after tracking the deterministic Stage 1B SEO map. The historical Stage 3 analysis tests remain intentionally blocked without their external snapshots. The historical Stage 3B.2A and Stage 3C.1 files are not required by the production build.

### Final status categories

- PASS: prebuild, original lint after flat-config ignores, typecheck, production build, current image SEO, asset refs, image refs, public media, runtime sitemap, and git diff check.
- FAIL: unit suite as a whole, with 4/153 historical audit assertions failing.
- BLOCKED BY ENVIRONMENT: Chromium headless shell is unavailable; the standard Playwright install attempt did not provision it, so browser E2E cannot be truthfully rerun.
- BLOCKED BY MISSING HISTORICAL FIXTURE: only the four Stage 3 audit assertions listed above remain; no current production runtime regression was identified.
- No release or version-control action is authorized by this report. The correct remediation is to restore the authoritative historical snapshots from their source archive, or explicitly retire/update those historical audit tests and validators in a separately reviewed change; do not fabricate their expected outputs.

## Final E2E update: 2026-08-28

The Chromium headless shell became available in the standard Playwright cache. The one permitted full E2E rerun completed with 195 tests collected, 185 passed, 10 failed, 0 skipped, and 0 unrun. All ten failures exhausted the existing retry and are current page/test-contract failures, not browser-launch failures:

1. tests/e2e/production-portal.spec.ts:56, homepage metrics aria-label missing on .kh-hero-stat-value; visible text was present but the attribute was null.
2. tests/e2e/production-portal.spec.ts:75, homepage metric motion class missing; received kh-hero-stat instead of kh-metric-motion-armed/in.
3. tests/e2e/production-portal.spec.ts:220, homepage product entries exposed 6 SVGs where the assertion requires 0.
4. tests/e2e/production-portal.spec.ts:275, mobile product-system geometry evaluation dereferenced a missing element and threw getBoundingClientRect on null.
5. tests/e2e/production-portal.spec.ts:305, desktop product-system header bottoms differed by 34.546875 pixels; assertion allows at most 2.
6. tests/e2e/production-portal.spec.ts:355, desktop mega-menu geometry evaluation dereferenced a missing element and threw getBoundingClientRect on null.
7. tests/e2e/production-portal.spec.ts:415, footer link affordance icon was none where a link icon is required.
8. tests/e2e/site.spec.ts:574, footer contact link icons count was 0 where a semantic icon is required.
9. tests/e2e/site.spec.ts:590, Products mega-menu lacked the View the complete product directory link.
10. tests/e2e/ui-material-preview.spec.ts:36, Glass C header lens content was none instead of the expected empty CSS content value.

These failures are concentrated in the current public visual/interaction contract. No B2B, inquiry, product-data, sitemap, canonical, or API regression was identified by this run. They require a separate reviewed visual fix; this round did not alter the relevant pages or tests.

### Updated final categories

- PASS: prebuild, original lint after flat-config artifact ignores, typecheck, production build, image SEO, asset refs, image refs, public media, runtime sitemap, and git diff check.
- FAIL: unit suite at 149/153 because four Stage 3 historical audit assertions require unavailable snapshots.
- FAIL: full E2E at 185/195 because ten current page/test-contract assertions failed as listed above.
- BLOCKED BY ENVIRONMENT: none remaining for the current Playwright environment.
- BLOCKED BY MISSING HISTORICAL FIXTURE: four Stage 3 assertions only.

## Superseding commit-review disposition: 2026-08-28

The ten public-page E2E failures listed in the preceding historical update were fixed in the current working tree and are superseded by the final regression run:

- PASS: prebuild.
- PASS: original lint, with 0 errors and 15 existing warnings.
- PASS: typecheck.
- PASS: image, asset, public-media, and runtime sitemap validation; runtime sitemap result was 259/259.
- PASS: production build.
- PASS: full E2E, 195/195 passed, 0 failed, 0 skipped.
- PASS: git diff --check.
- FAIL / BLOCKED BY MISSING HISTORICAL FIXTURE: unit suite at 149/153, with exactly four assertions requiring unavailable Stage 3B.2A and Stage 3C.1 historical snapshots.

The four remaining unit failures are historical audit reproducibility checks, not current runtime or product-behavior tests. They require the original external `product-data.sha256`, `branch-head.txt`, `stage-3b2a-summary.md`, and `runtime-urls.txt` artifacts; none was fabricated, skipped, or weakened. No current product regression was identified in this final validation.

The earlier 185/195 E2E result and its ten failure list must not be used as the current release result. The current final E2E result is 195/195 PASS after the targeted UI and test-contract fixes.
