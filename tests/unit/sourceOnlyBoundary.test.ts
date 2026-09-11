import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { SOURCE_ONLY_RECORD_IDS, isSourceOnlyRecord } from "@/data/sourceOnlyRecords";
import {
  buildProductCatalogView,
  getAllSkus,
  getCatalogFilterOptions,
  getSkuBySlug,
  getSkusByGroupId,
} from "@/lib/catalog";

describe("source-only publication boundary", () => {
  it("retains all seven records in the internal catalog", () => {
    const records = SOURCE_ONLY_RECORD_IDS.map((id) => catalog.skus.find((sku) => sku.id === id));

    expect(records).toHaveLength(7);
    expect(records.every((record) => record && isSourceOnlyRecord(record.id))).toBe(true);
  });

  it("keeps source-only records out of every public catalog lookup", () => {
    const publicSkus = getAllSkus();

    expect(publicSkus).toHaveLength(83);
    expect(publicSkus.some((sku) => isSourceOnlyRecord(sku.id))).toBe(false);
    expect(getCatalogFilterOptions("en").productTypes).not.toContain("paper-cup-fan");

    for (const recordId of SOURCE_ONLY_RECORD_IDS) {
      const source = catalog.skus.find((sku) => sku.id === recordId)!;
      expect(getSkuBySlug(source.slug)).toBeUndefined();
      expect(getSkusByGroupId(source.groupId).some((sku) => sku.id === source.id)).toBe(false);
      expect(getSkusByGroupId(source.groupId).every((sku) => !isSourceOnlyRecord(sku.id))).toBe(true);
      expect(buildProductCatalogView({ search: source.sku }, "en").filteredSkus).toHaveLength(0);
    }
  });
});
