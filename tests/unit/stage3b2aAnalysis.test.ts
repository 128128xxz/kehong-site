import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";

const root = process.cwd();
const docs = path.join(root, "docs");

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((candidate) => candidate.length && candidate.some(Boolean)).map((candidate) => Object.fromEntries(headers.map((header, index) => [header, candidate[index] ?? ""])));
}

function readCsv(file: string) {
  return parseCsv(fs.readFileSync(path.join(docs, file), "utf8"));
}

function sha256(file: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

describe("Stage 3B-2A analysis invariants", () => {
  it("exports exactly the 18 canonical candidates as distinct English records", () => {
    const rows = readCsv("stage-3b2a-canonical-candidate-map.csv");
    expect(rows).toHaveLength(18);
    expect(new Set(rows.map((row) => row.sourceUrl)).size).toBe(18);
    expect(new Set(rows.map((row) => row.sourceRecordId)).size).toBe(18);
    expect(new Set(rows.map((row) => row.sourceLocale))).toEqual(new Set(["en"]));
    expect(rows.every((row) => row.sourcePublishedStatus === "published")).toBe(true);
    expect(rows.every((row) => row.targetUrl === "/en/products/kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup")).toBe(true);
    expect(rows.every((row) => row.targetEntityId === "existing-product-anchor:kh-fd-cupsheet-150350-pe-043")).toBe(true);
    expect(rows.every((row) => row.materialConflict === "false" && row.formConflict === "false")).toBe(true);
    expect(rows.every((row) => row.applicationConflict === "false" && row.buyerIntentConflict === "false")).toBe(true);
  });

  it("keeps catalog accounting unchanged while allowing the approved 3B-2B-R sitemap implementation", () => {
    expect(catalog.skus).toHaveLength(337);
    expect(catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed")).toHaveLength(231);
    expect(catalog.skus.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed"))).toHaveLength(106);
    const snapshot = "/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3b2a-prechange-backup-20260818";
    const productHash = fs.readFileSync(path.join(snapshot, "manifests/product-data.sha256"), "utf8").trim().split(/\s+/)[0];
    expect(sha256(path.join(root, "src/data/catalog.normalized.json"))).toBe(productHash);
    expect(sha256(path.join(root, "src/app/sitemap.ts"))).not.toBe(sha256(path.join(snapshot, "runtime-files/sitemap.ts")));
  });

  it("locks family and anchor indexability decisions to the current evidence", () => {
    const familyRows = readCsv("stage-3b2a-family-indexability-audit.csv");
    const anchorRows = readCsv("stage-3b2a-anchor-indexability-audit.csv");
    expect(familyRows).toHaveLength(36);
    expect(familyRows.filter((row) => row.sitemapDecision === "ADD_TO_SITEMAP")).toHaveLength(6);
    expect(familyRows.filter((row) => row.sitemapDecision === "REWORK_BEFORE_INDEXING")).toHaveLength(30);
    expect(anchorRows).toHaveLength(6);
    expect(anchorRows.every((row) => row.sitemapDecision === "DEFER_NO_SITEMAP_CHANGE")).toBe(true);
    expect(anchorRows.every((row) => row.isVariantHub === "false")).toBe(true);
  });

  it("reconciles the 271-row sitemap scenarios without applying them", () => {
    const scenarios = readCsv("stage-3b2a-sitemap-scenarios.csv");
    const recommended = scenarios.find((row) => row.scenarioId === "SCENARIO_3_SAFE_CANONICAL_CONSOLIDATION");
    expect(recommended).toMatchObject({ current: "271", familyRowsAdded: "6", candidateRowsRemoved: "18", projected: "259", valid: "true" });
    const unsupported = fs.readFileSync(path.join(docs, "stage-3b2a-summary.md"), "utf8");
    expect(unsupported).toContain("UNSUPPORTED_LOCALIZED_ROW_COUNTS=295,307,313,289");
    expect(unsupported).toContain("SITEMAP_CHANGED=false");
    expect(unsupported).toContain("CANONICAL_CHANGED=false");
  });

  it("contains all required analysis-only deliverables and no skip directives", () => {
    const required = [
      "stage-3b2a-summary.md", "stage-3b2a-canonical-candidate-map.csv", "stage-3b2a-canonical-candidate-map.json",
      "stage-3b2a-anchor-semantic-audit.md", "stage-3b2a-anchor-semantic-audit.csv", "stage-3b2a-family-indexability-audit.csv",
      "stage-3b2a-anchor-indexability-audit.csv", "stage-3b2a-sitemap-scenarios.md", "stage-3b2a-sitemap-scenarios.csv",
      "stage-3b2a-sitemap-exact-url-diff.csv", "stage-3b2a-static-page-reconciliation.md", "stage-3b2a-static-route-inventory.csv",
      "stage-3b2a-visual-review.md", "stage-3b2a-stage3b2b-execution-plan.md", "stage-3b2a-stage3b2b-approved-actions.csv", "stage-3b2a-unresolved-risks.md",
    ];
    for (const file of required) expect(fs.existsSync(path.join(docs, file))).toBe(true);
    expect(fs.existsSync(path.join(docs, "stage-3b2a-visual-review", "screenshot-index.csv"))).toBe(true);
    const source = fs.readFileSync(path.join(root, "scripts", "analyze-stage-3b2a.mjs"), "utf8");
    expect(source).not.toMatch(/\.skip|\.only|test\.fixme/);
  });
});
