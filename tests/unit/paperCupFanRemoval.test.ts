import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import {
  buildProductCatalogView,
  getAllSkus,
  getCatalogFilterOptions,
  getCatalogGroups,
  getLocalizedProductSku,
  getSkuBySlug,
} from "@/lib/catalog";
import {
  getPublicProductFamilyBySlug,
  PUBLIC_PRODUCT_FAMILY_ROUTE_SLUGS,
} from "@/data/product-family-catalog";

describe("Paper Cup Fan public catalog removal", () => {
  it("publishes only the 83 verified non-CUPFAN, non-source-only records across five groups", () => {
    const skus = getAllSkus();

    expect(skus).toHaveLength(83);
    expect(getCatalogGroups(skus)).toHaveLength(5);
    expect(skus.every((sku) => !/^KH-FD-CUPFAN-/iu.test(sku.sku))).toBe(true);
  });

  it("does not expose the removed family through filters, detail lookup, or family routes", () => {
    const removed = catalog.skus.find((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku));
    expect(removed).toBeDefined();
    expect(getSkuBySlug(removed!.slug)).toBeUndefined();
    expect(getCatalogFilterOptions("en").productTypes).not.toContain("paper-cup-fan");
    expect(buildProductCatalogView({ productType: "paper-cup-fan" }, "en").skus).toHaveLength(0);
    expect(PUBLIC_PRODUCT_FAMILY_ROUTE_SLUGS).not.toContain("paper-cup-materials");
    expect(getPublicProductFamilyBySlug("paper-cup-materials")).toBeUndefined();
  });

  it("sanitizes public SKU props so raw CUPFAN grouping cannot reach the rendered catalog", () => {
    const serialized = getAllSkus()
      .map((sku) => JSON.stringify(getLocalizedProductSku(sku, "en")))
      .join("\n");

    expect(serialized).not.toMatch(/paper-cup-fan|cupfan|KH-FD-CUPFAN/iu);
  });
});
