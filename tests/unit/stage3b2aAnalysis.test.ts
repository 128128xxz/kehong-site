import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { PAPER_CUP_SHEET_SOURCE_RECORD_IDS } from "@/data/paperCupSheetVariants";
import { SOURCE_ONLY_RECORD_IDS } from "@/data/sourceOnlyRecords";
import { getAllSkus, getCatalogGroups } from "@/lib/catalog";

const root = process.cwd();

describe("current product indexability baseline", () => {
  it("exports the 83 verified public records as distinct routes", () => {
    const publicSkus = getAllSkus();
    expect(publicSkus).toHaveLength(83);
    expect(new Set(publicSkus.map((sku) => sku.slug)).size).toBe(83);
    expect(publicSkus.every((sku) => !/^KH-FD-CUPFAN-/iu.test(sku.sku))).toBe(true);
    expect(publicSkus.every((sku) => !SOURCE_ONLY_RECORD_IDS.includes(sku.id as (typeof SOURCE_ONLY_RECORD_IDS)[number]))).toBe(true);
  });

  it("keeps the approved paper-sheet source identities separate from the public set", () => {
    expect(PAPER_CUP_SHEET_SOURCE_RECORD_IDS).toHaveLength(18);
    expect(new Set(PAPER_CUP_SHEET_SOURCE_RECORD_IDS).size).toBe(18);
    const publicIds = new Set(getAllSkus().map((sku) => sku.id));
    expect(PAPER_CUP_SHEET_SOURCE_RECORD_IDS.filter((id) => publicIds.has(id))).toHaveLength(11);
  });

  it("derives product sitemap routes from the current public catalog", () => {
    const source = fs.readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
    expect(source).toContain("const productRoutes = getAllSkus().map");
    expect(source).not.toContain("stage-3b2a");
    expect(source).not.toContain("prechange-backup");
  });

  it("keeps current public groups bounded and removes Paper Cup Fan from them", () => {
    const groups = getCatalogGroups(getAllSkus());
    expect(groups).toHaveLength(5);
    expect(groups.map((group) => group.id)).not.toContain("paper-cup-fan-paper-cup-fan");
    expect(groups.reduce((sum, group) => sum + group.variants.length, 0)).toBe(83);
  });

  it("keeps source accounting available without turning it into an indexability claim", () => {
    expect(catalog.skus).toHaveLength(337);
    expect(catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed")).toHaveLength(231);
    expect(catalog.skus.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed"))).toHaveLength(106);
  });
});
