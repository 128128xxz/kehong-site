# Kehong website handoff — 2026-08-05

## Current release

- Local production commit: `1ca63feb903152c5d3a40e3441e106bfb46a05dd`
- Branch: `codex/production-portal-release-fix-20260720-1703`
- Production deployment: `dpl_5LboGj6Qg6so28wh1zt1JE81bJCY`
- Production URL: `https://www.kehong.tech`
- Production response SHA: `1ca63feb903152c5d3a40e3441e106bfb46a05dd`

## Latest change

The default/legacy browser tab icon was replaced with the official Kehong mark-only asset, consistently configured for favicon, browser tabs, Apple Touch Icon and PWA manifest. Asset record: `reports/favicon-v2-assets.md`.

## Verification completed

- ESLint: passed
- TypeScript: passed
- Unit tests: 23 passed
- Production build: passed
- Production favicon Playwright check: passed
- `/en` and `/zh` production raw HTML use the same versioned v2 icon configuration.

## Git remote state

- Remote branch SHA: `307a5b4962a9d352a9e94149e036178782961d15`
- The production commit is ahead of GitHub because GitHub push is blocked locally by macOS Keychain credential error `-25293` / `Device not configured`.
- Do not force-push, reset, rebase or alter Keychain credentials. Once authentication works, a normal fast-forward push of the current branch is sufficient if the remote has not advanced.

## Working-tree note

There are intentionally untracked historical reports, screenshots and capture scripts. They are included in this handoff archive but were not committed or modified by the favicon deployment task.
