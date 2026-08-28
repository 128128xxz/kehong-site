# Release validation architecture

## Current release validation

The current release suite uses only tracked source, tracked configuration, the lockfile dependency tree, current product data and a running current build.

```text
pnpm run validate:release
```

This command runs prebuild, lint, typecheck, current unit tests, product/assets/image/public-media checks, current image SEO checks and current runtime sitemap checks. `validate:sitemap-runtime` expects the current production server at `http://127.0.0.1:3453` or the URL supplied through `RUNTIME_BASE_URL`.

The complete release gate additionally requires:

```text
pnpm run test:e2e
pnpm run build
```

The default Playwright project excludes `tests/e2e/image-seo-smoke.spec.ts`, which is a historical migration audit test with a top-level historical fixture import.

## Historical audit reproducibility

Historical Stage 3 unit tests remain available without changed assertions:

```text
pnpm run test:historical-audit
pnpm run validate:historical-audit
```

The historical command also runs the historical image migration and Stage 3B.3 exact-diff checks. Missing historical artifacts are reported as `BLOCKED BY MISSING HISTORICAL FIXTURE` and return a non-zero exit code.

Historical-only inputs include Stage 1B migration maps, Stage 3A/3A.5 inventories, Stage 3B.2A hashes, Stage 3B.3 exact-diff CSV, Stage 3C.1 snapshots, and external pre-change backups. They are not required by the current release suite and are not copied into this branch.
