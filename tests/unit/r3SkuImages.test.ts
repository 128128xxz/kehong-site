import { describe, expect, it } from "vitest";
import { getAllSkus } from "@/lib/catalog";
import { getSkuImageMeta } from "@/lib/productImages";
import { getR3SkuImageMapping, R3_DATA_CONFLICT_SKUS } from "@/data/r3SkuImages";
import { SOURCE_ONLY_RECORD_IDS } from "@/data/sourceOnlyRecords";

describe("R3 SKU image boundary", () => {
  it("maps only current public, non-conflicting catalog rows", () => {
    const publicSkus = getAllSkus();
    const activeMappings = publicSkus.flatMap((sku) => {
      const mapping = getR3SkuImageMapping(sku);
      return mapping ? [{ sku, mapping }] : [];
    });

    expect(publicSkus).toHaveLength(83);
    expect(activeMappings).toHaveLength(54);
    expect(activeMappings.filter(({ mapping }) => mapping.sharedVisual)).toHaveLength(51);
    expect(activeMappings.filter(({ mapping }) => !mapping.sharedVisual)).toHaveLength(3);
    expect(R3_DATA_CONFLICT_SKUS.size).toBe(32);
  });

  it("keeps conflicts and source-only rows out of the R3 public override", () => {
    const conflictSku = getAllSkus().find((sku) => R3_DATA_CONFLICT_SKUS.has(sku.sku));
    expect(conflictSku).toBeDefined();
    expect(getR3SkuImageMapping(conflictSku!)).toBeUndefined();

    const sourceOnly = {
      id: SOURCE_ONLY_RECORD_IDS[0],
      sku: "KH-FD-CUPSHEET-300-PE-230",
      groupId: "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup",
      canonicalGroupId: "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup",
    };
    expect(getR3SkuImageMapping(sourceOnly)).toBeUndefined();
  });

  it("gives every current public SKU a usable image metadata result", () => {
    for (const sku of getAllSkus()) {
      const meta = getSkuImageMeta(sku, "en");
      expect(meta.src, sku.sku).toMatch(/^\/media\//u);
      expect(meta.alt, sku.sku).not.toHaveLength(0);
    }
  });
});
