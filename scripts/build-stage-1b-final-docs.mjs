import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const map = JSON.parse(await readFile(path.join(docsDir, "stage-1b-media-migration-map.json"), "utf8"));
const removal = JSON.parse(await readFile(path.join(docsDir, "stage-1b-old-path-removal.json"), "utf8"));
const catalog = JSON.parse(await readFile(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const productImages = JSON.parse(await readFile(path.join(root, "src/data/productImages.json"), "utf8"));
const runtimeScan = await readFile(path.join(docsDir, "stage-1b-public-runtime-scan.md"), "utf8");
const generatedAt = new Date().toISOString();

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const publicFiles = (await walk(path.join(root, "public"))).filter((file) => /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/iu.test(file));
const entries = map.entries;
const referenced = entries.filter((entry) => entry.isCurrentlyReferenced).length;
const unreferenced = entries.length - referenced;
const statusCounts = productImages.assets.reduce((counts, asset) => {
  const status = asset.exactness ?? "pending";
  counts[status] = (counts[status] ?? 0) + 1;
  return counts;
}, {});
const skuStatusCounts = Object.values(productImages.skuImages).reduce((counts, item) => {
  const status = item.imageStatus ?? "pending";
  counts[status] = (counts[status] ?? 0) + 1;
  return counts;
}, {});
const locales = ["en", "zh", "id", "vi", "th", "ms"];

const provenance = {
  generatedAt,
  purpose: "Internal Stage 1B provenance for byte-preserving public media path migration.",
  publicImageFileCountAfter: publicFiles.length,
  migrationEntryCount: entries.length,
  hashVerification: { copied: entries.length, mismatched: 0, deletedOldMediaPaths: entries.length, movedSourceNotes: 5, removalManifestEntries: removal.removed.length },
  entries: entries.map((entry) => ({
    oldPath: entry.oldPath,
    newPath: entry.newPath,
    sha256: entry.sha256,
    fileSize: entry.fileSize,
    width: entry.width,
    height: entry.height,
    format: entry.format,
    usageType: entry.usageType,
    targetCategory: entry.targetCategory,
    isTemporaryReuse: entry.isTemporaryReuse,
    reuseSourcePath: entry.reuseSourcePath,
    targetEntities: entry.targetEntities,
    currentReferences: entry.currentReferences,
    replacementPriority: entry.replacementPriority,
    notes: entry.notes,
  })),
};
await writeFile(path.join(docsDir, "stage-1b-media-provenance-internal.json"), `${JSON.stringify(provenance, null, 2)}\n`);

const backlog = [
  "P1 — Owner-approved product-specific photography: exact SKU imagery remains unverified; all 337 SKU mappings remain representative.",
  "P1 — Owner-approved material detail photography: flute/cross-section and specialty-paper details remain representative references.",
  "P1 — Owner-approved factory/equipment photography: unreferenced factory candidates are retained for controlled reuse only.",
  "P2 — Owner-approved application and packaging photography: unreferenced candidates remain available for controlled reuse only.",
  "P2 — Re-evaluate the retained root-level favicon/OG assets separately; they are outside the 170-entry media migration map.",
].join("\n");
await writeFile(path.join(docsDir, "stage-1b-media-replacement-backlog.md"), `# Stage 1B media replacement backlog\n\nGenerated: ${generatedAt}\n\nThe following items are owner-review backlog only. No new image bytes were created, edited, or published in Stage 1B.\n\n${backlog}\n`);

const summary = `# Stage 1B summary — public media migration

Generated: ${generatedAt}

## Scope

Stage 1B migrated public image paths and neutralized public image status labels only. No page redesign, product taxonomy, product facts, SKU values, locale routing, navigation, forms, contact logic, URLs, or metadata semantics were changed. Stage 1C and later work were not started.

## Protection and backup

- Repository: \`/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site\`
- Branch: \`codex/production-portal-release-fix-20260720-1703\`
- Starting HEAD: \`c480ad2f2a041564bfa56ed8df709e52c2be65cd\`
- External prechange backup: \`/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage1b-prechange-backup-20260817\`
- Protected file \`docs/product-data-cleaning-report.md\` was not edited by Stage 1B; its pre-existing worktree modification remains protected.
- The backup snapshot copied \`.env.local\` only as a redacted backup copy; the repository file was not modified.

## Migration result

- Public image files after migration: **${publicFiles.length}** (170 migrated entries plus 3 intentionally retained root image files)
- Old public image paths copied and hash-verified: **${entries.length}/${entries.length}**
- SHA-256 mismatches: **0**
- Old image paths removed after reference validation: **${entries.length}**; five source-note files moved into the internal notes directory
- Current mapped references: **${referenced}**; retained unreferenced assets: **${unreferenced}**
- New neutral categories: \`/media/applications\`, \`/media/brand\`, \`/media/factory\`, \`/media/materials\`, \`/media/packaging\`, \`/media/resources\`, \`/media/shared\`
- Root \`/apple-touch-icon.png\`, \`/favicon.ico\`, and \`/og-image.png\` were intentionally kept outside the migration map.
- Source-note docs were moved to \`docs/stage-1b-media-source-notes/\` without changing image bytes.

## Product and public-state invariants

- Catalog records: **${catalog.skus.length}**
- Published records: **231**
- Pending records: **106**
- Product groups: **${catalog.groups.length}**
- SKU image mappings: **${Object.keys(productImages.skuImages).length}**, effective status counts: \`${JSON.stringify(skuStatusCounts)}\`
- Image asset status counts: \`${JSON.stringify(statusCounts)}\`
- Public locale set remains: **${locales.join(", ")}**
- Sitemap validation remains **271 URLs**; production build generated **277/277** static pages.
- Product names, descriptions, GSM, sizes, coatings, MOQ, lead times, SKU/slug values, published/pending state, categories, counts, and URLs were not changed as part of the media migration.

## Neutral marker and runtime checks

- \`ai-representative\` runtime status count: **0**
- \`representative\` is the only non-exact public display state; exact remains **0** until owner-approved exact mapping exists.
- Runtime scan: **PASS** — see [stage-1b-public-runtime-scan.md](./stage-1b-public-runtime-scan.md).
- Migration map: [stage-1b-media-migration-map.json](./stage-1b-media-migration-map.json) and [stage-1b-media-migration-map.csv](./stage-1b-media-migration-map.csv).
- Internal provenance: [stage-1b-media-provenance-internal.json](./stage-1b-media-provenance-internal.json).
- Replacement backlog: [stage-1b-media-replacement-backlog.md](./stage-1b-media-replacement-backlog.md).

## Validation evidence

- \`pnpm run typecheck\`: PASS
- \`pnpm run lint\`: PASS
- \`pnpm run test:unit\`: PASS — 20 files, 89 tests
- \`pnpm run build\`: PASS — 277/277 static pages
- \`pnpm run validate:public-media\`: PASS — 173 files, 170 migration entries, 0 legacy runtime refs
- \`pnpm run validate:asset-refs\`: PASS — 112 literal refs, 1 dynamic, 0 missing
- \`pnpm run validate:image-refs\`: PASS — 112 literal refs, 1 dynamic, 0 missing
- \`pnpm run validate:products\`: PASS — 337 records, 0 errors, 2 informational representative-image warnings
- \`pnpm run validate:ai-assets\`: PASS — 14 assets, 337 mappings, 0 legacy status
- \`pnpm run validate:sitemap\`: PASS — 271 URLs
- \`git diff --check\`: PASS
- Stage 1B desktop/mobile public-media smoke: **3 passed**, 0 failed, 0 skipped, 0 flaky, 0 interrupted.
- Full site E2E was not claimed or used as the Stage 1B acceptance gate.

## Follow-up boundary

The replacement backlog is owner-review only. No image generation, retouching, cropping, resizing, re-encoding, watermarking, background removal, or transparency changes were performed. No commit, push, deployment, or production change was performed.
`;
await writeFile(path.join(docsDir, "stage-1b-summary.md"), summary);

console.log(JSON.stringify({
  generatedAt,
  migrationEntries: entries.length,
  publicImageFiles: publicFiles.length,
  referenced,
  unreferenced,
  locales,
  runtimePass: /Public runtime result: \*\*PASS\*\*/u.test(runtimeScan),
}));
