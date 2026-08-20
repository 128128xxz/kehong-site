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
    expect(published).toHaveLength(231);
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
    expect(groups.reduce((total, group) => total + group.variants.length, 0)).toBe(231);
    expect(groups.some((group) => group.variants.some((variant) => variant.id === anchor?.id))).toBe(true);
    expect(new Set(groups.flatMap((group) => group.variants.map((variant) => variant.id))).size).toBe(231);
  });

  it("emits all Stage 3B-1 audit artifacts without touching sitemap", () => {
    const required = [
      "stage-3b1-summary.md", "stage-3b1-route-preflight.md", "stage-3b1-route-plan.csv", "stage-3b1-static-page-reconciliation.csv",
      "stage-3b1-family-source-map.csv", "stage-3b1-content-claim-audit.md", "stage-3b1-excluded-records.csv", "stage-3b1-anchor-implementation.md",
      "stage-3b1-rfq-prefill-map.csv", "stage-3b1-stage2-link-alignment.csv", "stage-3b1-i18n-review.md", "stage-3b1-sitemap-deferred-actions.csv",
      "stage-3b1-index-state-diff.md", "stage-3b1-unresolved-backlog.md",
    ];
    for (const file of required) expect(fs.existsSync(path.join(root, "docs", file))).toBe(true);
    expect(fs.readFileSync(path.join(root, "docs", "stage-3b1-index-state-diff.md"), "utf8")).toContain("SITEMAP_DELTA=0");
    expect(fs.readFileSync(path.join(root, "src", "app", "sitemap.ts"), "utf8")).not.toContain("product-family-catalog");
  });
});
