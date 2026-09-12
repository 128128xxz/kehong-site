import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { isRemovedFromPublicCatalog } from "@/data/catalogVisibility";
import { SOURCE_ONLY_RECORD_IDS, isSourceOnlyRecord } from "@/data/sourceOnlyRecords";
import { getAllCatalogSkus, getAllSkus, getCatalogGroups, getSkuBySlug } from "@/lib/catalog";

describe("current catalog publication baseline", () => {
  it("preserves source accounting without confusing it with public exposure", () => {
    const source = getAllCatalogSkus();
    expect(source).toHaveLength(337);
    expect(source.filter((sku) => sku.published && sku.sourceStatus === "confirmed")).toHaveLength(231);
    expect(source.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed"))).toHaveLength(106);
    expect(new Set(source.map((sku) => sku.sku)).size).toBe(337);
    expect(new Set(source.map((sku) => sku.slug)).size).toBe(337);
  });

  it("exposes exactly the verified public records through current detail routes", () => {
    const publicSkus = getAllSkus();
    expect(publicSkus).toHaveLength(83);
    expect(new Set(publicSkus.map((sku) => sku.slug)).size).toBe(83);
    expect(publicSkus.every((sku) => sku.published && sku.sourceStatus === "confirmed")).toBe(true);
    expect(publicSkus.every((sku) => !isRemovedFromPublicCatalog(sku) && !isSourceOnlyRecord(sku.id))).toBe(true);
    expect(publicSkus.every((sku) => getSkuBySlug(sku.slug)?.sku === sku.sku)).toBe(true);
    expect(getCatalogGroups(publicSkus)).toHaveLength(5);
  });

  it("keeps the removed family and source-only records in audit data only", () => {
    const source = getAllCatalogSkus();
    expect(source.filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(141);
    expect(getAllSkus().filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(0);
    expect(SOURCE_ONLY_RECORD_IDS).toHaveLength(7);
    expect(SOURCE_ONLY_RECORD_IDS.every((id) => source.some((sku) => sku.id === id))).toBe(true);
    expect(SOURCE_ONLY_RECORD_IDS.every((id) => !getAllSkus().some((sku) => sku.id === id))).toBe(true);
  });
});
