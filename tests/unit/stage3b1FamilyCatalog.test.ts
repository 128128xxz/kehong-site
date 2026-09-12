import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORE_PRODUCT_ANCHOR,
  PRODUCT_FAMILY_ROUTE_SLUGS,
  getCatalogRecordCounts,
  getCoreAnchorVariants,
  getFamilyPublishedGroups,
  getFamilyPublishedSkus,
  PUBLIC_PRODUCT_FAMILY_ROUTE_SLUGS,
  productFamilyCatalog,
} from "@/data/product-family-catalog";
import catalog from "@/data/catalog.normalized.json";

const root = process.cwd();

describe("Stage 3B-1 family catalog", () => {
  it("defines exactly six approved family entities and one anchor", () => {
    expect(productFamilyCatalog).toHaveLength(6);
    expect(new Set(productFamilyCatalog.map((family) => family.id)).size).toBe(6);
    expect(new Set(PRODUCT_FAMILY_ROUTE_SLUGS).size).toBe(6);
    expect(PRODUCT_FAMILY_ROUTE_SLUGS).toContain("paper-cup-materials");
    expect(CORE_PRODUCT_ANCHOR.sourceClusterId).toBe("cluster-paper-cup-fan-food-tray-paper-material");
  });

  it("keeps the 337/231/106 catalog accounting unchanged", () => {
    expect(getCatalogRecordCounts()).toEqual({ total: 337, published: 231, pending: 106 });
    expect(catalog.skus).toHaveLength(337);
    expect(new Set(catalog.skus.map((sku) => sku.sku)).size).toBe(337);
    expect(new Set(catalog.skus.map((sku) => sku.slug)).size).toBe(337);
  });

  it("promotes only published records and keeps pending records out", () => {
    const published = productFamilyCatalog.flatMap((family) => getFamilyPublishedSkus(family));
    expect(published).toHaveLength(83);
    expect(published.every((sku) => sku.published && sku.sourceStatus === "confirmed")).toBe(true);
    expect(getCoreAnchorVariants()).toHaveLength(1);
    expect(getCoreAnchorVariants()[0]?.slug).toBe(CORE_PRODUCT_ANCHOR.recordSlug);
  });

  it("uses real group members without synthetic combinations", () => {
    const anchor = getCoreAnchorVariants()[0];
    const family = productFamilyCatalog.find((item) => item.id === "cup");
    expect(anchor).toBeDefined();
    expect(family).toBeDefined();
    const groups = getFamilyPublishedGroups(family!);
    expect(groups.reduce((total, group) => total + group.variants.length, 0)).toBe(83);
    expect(groups.some((group) => group.variants.some((variant) => variant.id === anchor?.id))).toBe(true);
    expect(new Set(groups.flatMap((group) => group.variants.map((variant) => variant.id))).size).toBe(83);
  });

  it("keeps public family routes separate from the removed cup-fan family", () => {
    expect(PUBLIC_PRODUCT_FAMILY_ROUTE_SLUGS).toHaveLength(5);
    expect(PUBLIC_PRODUCT_FAMILY_ROUTE_SLUGS).not.toContain("paper-cup-materials");
    expect(fs.readFileSync(path.join(root, "src", "app", "sitemap.ts"), "utf8")).toContain("getAllSkus");
  });
});
