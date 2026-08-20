import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8")) as {
  skus: Array<{ id: string; sku: string; slug: string; published: boolean; sourceStatus: string }>;
};
const report = JSON.parse(fs.readFileSync(path.join(root, "docs/stage-3a-product-family-map.json"), "utf8")) as {
  records: Array<{
    recordId: string;
    sku: string;
    slug: string;
    publishStatus: string;
    variantClusterId: string;
    proposedPublicFamily: string;
    proposedSubfamily: string;
    publicEntityType: string;
    recommendedIndexability: string;
    recommendedSitemapAction: string;
    mappingConfidence: number;
  }>;
};

const allowedEntityTypes = new Set([
  "material-family",
  "material-product",
  "semi-finished-component",
  "specification-variant",
  "application",
  "service",
  "archived-compatible-record",
]);
const allowedIndexability = new Set(["INDEX_FAMILY", "INDEX_PRODUCT", "NOINDEX_CANONICAL", "NOINDEX_FOLLOW", "PENDING_NOINDEX", "MANUAL_REVIEW"]);
const allowedSitemapActions = new Set(["KEEP", "REMOVE_FROM_SITEMAP", "ADD_FAMILY_PAGE_LATER", "MANUAL_REVIEW"]);

describe("Stage 3A analysis artifacts", () => {
  it("covers every normalized record without changing SKU or slug", () => {
    expect(report.records).toHaveLength(337);
    expect(report.records.filter((record) => record.publishStatus === "published")).toHaveLength(231);
    expect(report.records.filter((record) => record.publishStatus === "pending")).toHaveLength(106);
    expect(new Set(report.records.map((record) => record.recordId)).size).toBe(337);
    expect(new Set(report.records.map((record) => record.sku)).size).toBe(337);
    expect(new Set(report.records.map((record) => record.slug)).size).toBe(337);
    const sourceBySku = new Map(catalog.skus.map((sku) => [sku.sku, sku]));
    for (const record of report.records) {
      const source = sourceBySku.get(record.sku);
      expect(source).toBeDefined();
      expect(record.recordId).toBe(source?.id);
      expect(record.slug).toBe(source?.slug);
    }
  });

  it("provides complete mappings, valid enums and an exact cluster partition", () => {
    const clusterCounts = new Map<string, number>();
    for (const record of report.records) {
      expect(record.proposedPublicFamily.length).toBeGreaterThan(0);
      expect(record.proposedSubfamily.length).toBeGreaterThan(0);
      expect(allowedEntityTypes.has(record.publicEntityType)).toBe(true);
      expect(allowedIndexability.has(record.recommendedIndexability)).toBe(true);
      expect(allowedSitemapActions.has(record.recommendedSitemapAction)).toBe(true);
      expect(record.mappingConfidence).toBeGreaterThanOrEqual(0);
      expect(record.mappingConfidence).toBeLessThanOrEqual(1);
      clusterCounts.set(record.variantClusterId, (clusterCounts.get(record.variantClusterId) ?? 0) + 1);
    }
    expect([...clusterCounts.values()].reduce((total, count) => total + count, 0)).toBe(337);
    expect(clusterCounts.size).toBeGreaterThan(0);
  });

  it("keeps projected sitemap accounting explainable", () => {
    const plan = fs.readFileSync(path.join(root, "docs/stage-3a-indexation-plan.md"), "utf8");
    expect(plan).toContain("Current validator sitemap baseline: **271 URLs**");
    expect(plan).toContain("Projected sitemap after a future Stage 3B family migration: **46 URLs**");
    expect(plan).toContain("Product URLs projected for removal from sitemap: **231**");
    expect(plan).toContain("Proposed family URLs to add later: **6**");
    expect(plan.match(/\/en\/products\/families\//g)?.length).toBeGreaterThanOrEqual(6);
  });
});
