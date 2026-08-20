import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import {
  PAPER_CUP_SHEET_SOURCE_RECORD_IDS,
  PAPER_CUP_SHEET_TARGET_RECORD_ID,
  paperCupSheetDisplayIdentity,
} from "@/data/paperCupSheetVariants";

const root = process.cwd();

describe("Stage 3B-2B-R paper-cup sheet implementation", () => {
  it("keeps exactly 18 approved published source records and one existing target", () => {
    const sourceRecords = PAPER_CUP_SHEET_SOURCE_RECORD_IDS.map((id) => catalog.skus.find((sku) => sku.id === id));
    const target = catalog.skus.find((sku) => sku.id === PAPER_CUP_SHEET_TARGET_RECORD_ID);
    expect(PAPER_CUP_SHEET_SOURCE_RECORD_IDS).toHaveLength(18);
    expect(new Set(PAPER_CUP_SHEET_SOURCE_RECORD_IDS).size).toBe(18);
    expect(target?.published).toBe(true);
    expect(sourceRecords.every((record) => record?.published === true && record.sourceStatus === "confirmed")).toBe(true);
    expect(sourceRecords.every((record) => record && paperCupSheetDisplayIdentity(record).split("|").length === 3)).toBe(true);
    expect(sourceRecords.filter((record) => record?.id === "kh-fd-cupsheet-150350-pr-044" || record?.id === "kh-fd-cupsheet-150350-pr-068")).toHaveLength(2);
  });

  it("retains the duplicate displayed specification as two stable identities", () => {
    const duplicateIds = ["kh-fd-cupsheet-150350-pr-044", "kh-fd-cupsheet-150350-pr-068"];
    const records = duplicateIds.map((id) => catalog.skus.find((sku) => sku.id === id));
    expect(records.every(Boolean)).toBe(true);
    expect(records[0]?.gsmOrThickness).toEqual(records[1]?.gsmOrThickness);
    expect(records[0]?.coating).toEqual(records[1]?.coating);
    expect(records[0]?.commonSize).toEqual(records[1]?.commonSize);
    expect(new Set(records.map((record) => record && paperCupSheetDisplayIdentity(record))).size).toBe(2);
  });

  it("wires the approved family row and source exclusion without changing catalog data", () => {
    const sitemapSource = fs.readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
    const pageSource = fs.readFileSync(path.join(root, "src/app/[locale]/products/[slug]/page.tsx"), "utf8");
    expect(sitemapSource).toContain("PAPER_CUP_SHEET_SOURCE_RECORD_IDS");
    expect(sitemapSource).toContain("/products/families/paper-cup-materials");
    expect(sitemapSource).toContain("paperCupSheetSourceIds.has(sku.id)");
    expect(pageSource).toContain("isApprovedPaperCupSheetSource");
    expect(pageSource).toContain("paperCupSheetDisplayIdentity");
    expect(pageSource).toContain("approvedPaperCupSheetVariants");
    expect(catalog.skus).toHaveLength(337);
  });
});
