import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { isRemovedFromPublicCatalog } from "@/data/catalogVisibility";
import { SOURCE_ONLY_RECORD_IDS, isSourceOnlyRecord } from "@/data/sourceOnlyRecords";
import { getAllSkus, getCatalogGroups } from "@/lib/catalog";

describe("current family and publication boundary", () => {
  it("keeps the five current public groups out of the removed family", () => {
    const groups = getCatalogGroups(getAllSkus());
    expect(groups).toHaveLength(5);
    expect(groups.every((group) => group.variants.every((sku) => !isRemovedFromPublicCatalog(sku)))).toBe(true);
    expect(groups.map((group) => group.id)).not.toContain("paper-cup-fan-paper-cup-fan");
  });

  it("keeps source-only and pending records out of the public indexable set", () => {
    const publicIds = new Set(getAllSkus().map((sku) => sku.id));
    expect(SOURCE_ONLY_RECORD_IDS.every((id) => !publicIds.has(id))).toBe(true);
    expect(catalog.skus.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed")).every((sku) => !publicIds.has(sku.id))).toBe(true);
    expect(catalog.skus.filter((sku) => isSourceOnlyRecord(sku.id))).toHaveLength(7);
  });

  it("keeps source evidence separate from current public records", () => {
    expect(catalog.skus).toHaveLength(337);
    expect(catalog.skus.filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(141);
    expect(getAllSkus()).toHaveLength(83);
    expect(getAllSkus().some((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toBe(false);
  });
});
