import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import taxonomy from "@/data/taxonomy.json";
import { getAllSkus, getCatalogGroups, getFamilies, getFeaturedProductGroups, matchesGsmOption } from "@/lib/catalog";
import { resolveTaxonomyMaterialAlias } from "@/lib/taxonomy";

describe("product taxonomy and publication gate", () => {
  it("resolves approved aliases without treating a combined label as one material", () => {
    expect(resolveTaxonomyMaterialAlias("Kraft Paper")).toBe("kraft-paper");
    expect(resolveTaxonomyMaterialAlias("牛皮纸")).toBe("kraft-paper");
    expect(resolveTaxonomyMaterialAlias("E 坑")).toBe("fluted-paper");
    expect(resolveTaxonomyMaterialAlias("unapproved material")).toBeUndefined();
  });

  it("keeps canonical fields valid and excludes pending products from public catalog", () => {
    const skus = catalog.skus;
    const categoryIds = new Set(taxonomy.categories.map((item) => item.id));
    const materialIds = new Set(taxonomy.materials.map((item) => item.id));
    expect(skus.every((sku) => categoryIds.has(sku.categoryId))).toBe(true);
    expect(skus.every((sku) => sku.materialIds.length > 0 && sku.materialIds.every((id) => materialIds.has(id)))).toBe(true);
    expect(skus.some((sku) => Object.hasOwn(sku, "material") || Object.hasOwn(sku, "category"))).toBe(false);
    expect(skus.filter((sku) => sku.sourceStatus === "pending").every((sku) => sku.published === false)).toBe(true);
    expect(getAllSkus().length).toBe(skus.filter((sku) => sku.published).length);
  });

  it("deduplicates SKU and slug values and keeps one-variant groups singular", () => {
    const skus = getAllSkus();
    expect(new Set(skus.map((sku) => sku.sku)).size).toBe(skus.length);
    expect(new Set(skus.map((sku) => sku.slug)).size).toBe(skus.length);
    expect(getCatalogGroups(skus).every((group) => group.variants.length >= 1)).toBe(true);
  });

  it("matches a GSM option against an exact value or range", () => {
    expect(matchesGsmOption("210g", "210gsm")).toBe(true);
    expect(matchesGsmOption("180–250g", "210gsm")).toBe(true);
    expect(matchesGsmOption("180g", "300gsm")).toBe(false);
  });

  it("uses canonical category IDs for family counts and diversifies homepage groups", () => {
    const families = getFamilies();
    expect(new Set(families.map((family) => family.categoryId)).size).toBe(families.length);
    expect(families.find((family) => family.categoryId === "food-grade-paper")?.count).toBe(284);
    expect(families.find((family) => family.categoryId === "kraft-paper")?.count).toBe(8);

    const featured = getFeaturedProductGroups(8);
    const groupCounts = new Map<string, number>();
    featured.forEach((group) => groupCounts.set(group.productGroupId, (groupCounts.get(group.productGroupId) ?? 0) + 1));
    expect(featured).toHaveLength(8);
    expect([...groupCounts.values()].every((count) => count <= 2)).toBe(true);
    expect(new Set(featured.map((group) => group.categoryId)).size).toBeGreaterThanOrEqual(5);
    expect(featured.filter((group) => group.representative).length).toBeGreaterThan(0);
  });
});
