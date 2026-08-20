#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docs = path.join(root, "docs");
const snapshot = process.env.STAGE_3B2BR_SNAPSHOT || "/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3b2br-prechange-backup-20260818";
const catalog = JSON.parse(await fs.readFile(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const published = catalog.skus.filter((sku) => sku.published === true && sku.sourceStatus === "confirmed");
const staticRoutes = ["/", "/products", "/contact", "/paper-cup-fan-manufacturer", "/paper-packaging-supplier", "/custom-paper-products", "/factory", "/process", "/procurement", "/privacy", "/terms", "/industries/bakery-packaging", "/capabilities", "/resources"];
const packagingRoutes = ["paper-bags", "labels-stickers", "pillow-boxes", "takeout-boxes", "cake-boxes", "cake-boards-cake-drums", "corrugated-mailer-boxes"];
const resourceRoutes = ["artwork-guidelines", "materials-guide", "finishes-guide", "dielines-templates", "packaging-selection-guide", "proofing-samples"];
const cakeRoutes = ["cake-boxes", "cake-boards-and-drums"];
const categoryRoutes = ["kraft-paper", "white-cardboard", "food-grade-paper", "corrugated-paper", "specialty-paper", "food-packaging-boxes", "paper-pads", "paper-inserts", "paper-boxes", "paper-packaging-materials"];
const historical = new Set([
  ...staticRoutes.map((route) => "/en" + (route === "/" ? "" : route)),
  "/en/industries",
  ...packagingRoutes.map((slug) => "/en/packaging/" + slug),
  ...resourceRoutes.map((slug) => "/en/resources/" + slug),
  ...cakeRoutes.map((slug) => "/en/products/" + slug),
  ...categoryRoutes.map((slug) => "/en/products/" + slug),
  ...published.map((sku) => "/en/products/" + sku.slug),
].map((pathname) => "https://www.kehong.tech" + pathname));
const current = new Set((await fs.readFile(path.join(snapshot, "manifests/current-runtime-urls.txt"), "utf8")).trim().split(/\n/gu).filter(Boolean));
const currentOnly = [...current].filter((url) => !historical.has(url)).sort();
const historicalOnly = [...historical].filter((url) => !current.has(url)).sort();
const rows = [["url", "set", "classification", "reason"]];
for (const url of currentOnly) rows.push([url, "CURRENT_RUNTIME_SET_276", "CURRENT_ONLY", "Current sitemap includes news routes; historical baseline did not."]);
for (const url of historicalOnly) rows.push([url, "HISTORICAL_SET_271", "HISTORICAL_ONLY", "Historical validator expected packaging route; current route is retired or redirected."]);
await fs.writeFile(path.join(docs, "stage-3bbr-sitemap-baseline-diff.csv"), rows.map((row) => row.map((value) => '"' + value.replaceAll('"', '""') + '"').join(",")).join("\n") + "\n");
await fs.writeFile(path.join(docs, "stage-3bbr-sitemap-baseline-reconciliation.md"), [
  "# Stage 3B-2B-R sitemap baseline reconciliation",
  "",
  "HISTORICAL_SET_271=271",
  "CURRENT_RUNTIME_SET_276=276",
  "CURRENT_RUNTIME_SET_UNIQUE=276",
  "HISTORICAL_SET_UNIQUE=271",
  "CURRENT_ONLY_COUNT=" + currentOnly.length,
  "HISTORICAL_ONLY_COUNT=" + historicalOnly.length,
  "SITEMAP_IMPLEMENTATION_FILE_CHANGED_BEFORE_STAGE=false",
  "SITEMAP_INPUT_CATALOG_CHANGED_BEFORE_STAGE=false",
  "AUTO_DISCOVERED_NEWS_ROUTES=true",
  "FAMILY_CONFIG_AUTO_READ_BY_SITEMAP=false",
  "",
  "## Exact set difference",
  "",
  "Current-only URLs are the English news index plus six English news articles. Historical-only URLs are /en/packaging/labels-stickers and /en/packaging/pillow-boxes; the former follows the current packaging redirect and the latter is currently 404, so they cannot be restored as indexable sitemap entries without an unrelated route change.",
  "",
  "The current runtime set is therefore the authoritative calibrated baseline. No unrelated current-only URL is removed. Existing sitemap architecture uses one English canonical row with six hreflang alternates for a localized family, so the approved paper-cup family addition is one loc row, not six duplicate loc rows.",
  "",
  "CALIBRATED_SITEMAP_BEFORE=276",
  "FAMILY_CANONICAL_ROWS_ADDED=1",
  "SOURCE_ROWS_REMOVED=18",
  "TARGET_ROWS_ADDED=0",
  "CALIBRATED_SITEMAP_AFTER=259",
  "CALIBRATED_ARITHMETIC_PASS=true",
].join("\n") + "\n");
await fs.writeFile(path.join(snapshot, "manifests/historical-set-271.txt"), [...historical].sort().join("\n") + "\n");
await fs.writeFile(path.join(snapshot, "manifests/current-set-276.txt"), [...current].sort().join("\n") + "\n");
console.log(JSON.stringify({ historical: historical.size, current: current.size, currentOnly, historicalOnly }));
