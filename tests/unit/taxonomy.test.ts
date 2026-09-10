import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import taxonomy from "@/data/taxonomy.json";
import { buildProductCatalogView, getAllSkus, getCatalogGroups, getFamilies, getFeaturedProductGroups, matchesGsmOption } from "@/lib/catalog";
import { getCanonicalTaxonomyCategoryId, resolveTaxonomyMaterialAlias } from "@/lib/taxonomy";
import { getHomepageProductEntries } from "@/lib/product-routing";
import { productCatalogSections } from "@/data/productDirectory";

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
    const publishedCounts = getAllSkus().reduce((counts, sku) => {
      const categoryId = getCanonicalTaxonomyCategoryId(sku.categoryId);
      if (!categoryId) return counts;
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
    expect(families.find((family) => family.categoryId === "food-grade-paper")?.count).toBe(publishedCounts.get("food-grade-paper"));
    expect(families.find((family) => family.categoryId === "kraft-paper")?.count).toBe(publishedCounts.get("kraft-paper"));

    const featured = getFeaturedProductGroups(8);
    const groupCounts = new Map<string, number>();
    featured.forEach((group) => groupCounts.set(group.productGroupId, (groupCounts.get(group.productGroupId) ?? 0) + 1));
    expect(featured).toHaveLength(8);
    expect([...groupCounts.values()].every((count) => count <= 2)).toBe(true);
    expect(new Set(featured.map((group) => group.categoryId)).size).toBeGreaterThanOrEqual(5);
    expect(featured.filter((group) => group.representative).length).toBeGreaterThan(0);
  });

  it("normalizes legacy category spellings and keeps homepage links out of empty catalog states", () => {
    expect(getCanonicalTaxonomyCategoryId("food_grade_paper")).toBe("food-grade-paper");
    expect(getCanonicalTaxonomyCategoryId(" Food Grade Paper ")).toBe("food-grade-paper");
    expect(getCanonicalTaxonomyCategoryId("food-grade-paper-series")).toBe("food-grade-paper");

    const entries = getHomepageProductEntries();
    expect(entries).toHaveLength(6);
    expect(entries.every((entry) => !entry.href.includes("productType=paper-packaging-material"))).toBe(true);
    expect(entries.every((entry) => entry.hasPublicSku || !entry.href.startsWith("/products?"))).toBe(true);
  });

  it("keeps the buyer-facing materials and finished-packaging taxonomy complete and separate", () => {
    expect(productCatalogSections.map((section) => section.id)).toEqual(["materials", "finished-packaging"]);
    const materials = productCatalogSections[0];
    const finished = productCatalogSections[1];
    expect(materials.groups.flatMap((group) => group.links)).toHaveLength(6);
    expect(finished.groups.flatMap((group) => group.links)).toHaveLength(9);
    expect(materials.label.en).toBe("Paper materials & semi-finished components");
    expect(materials.label.zh).toBe("纸材与半成品");
    expect(finished.label.zh).toBe("成品包装");
    expect(materials.groups.flatMap((group) => group.links).every((link) => link.href.startsWith("/products?group="))).toBe(true);
    expect(finished.groups.flatMap((group) => group.links).every((link) => link.href.startsWith("/packaging/"))).toBe(true);
  });

  it("exposes the six mega-menu groups and their buyer-facing labels from shared taxonomy", () => {
    const materials = productCatalogSections[0];
    const finished = productCatalogSections[1];
    expect(materials.groups.map((group) => group.id)).toEqual([
      "cupstock-components",
      "coated-rolls-sheets",
      "tray-forming-materials",
    ]);
    expect(finished.groups.map((group) => group.id)).toEqual([
      "food-bakery",
      "retail-carry",
      "ecommerce-shipping",
    ]);
    expect([...materials.groups, ...finished.groups].every((group) => group.links.length > 0)).toBe(true);
    expect([...materials.groups, ...finished.groups].flatMap((group) => group.links).some((link) => /labels|贴纸/iu.test(`${link.en} ${link.zh}`))).toBe(false);
  });

  it("builds the unfiltered and query-filtered catalog from one server-side view", () => {
    const unfiltered = buildProductCatalogView({}, "en");
    const cupFan = buildProductCatalogView({ productType: "paper-cup-fan" }, "en");
    const invalid = buildProductCatalogView({ category: "not-a-category" }, "en");

    expect(unfiltered.allSkus).toEqual(getAllSkus());
    expect(unfiltered.totalGroups).toBe(getCatalogGroups(getAllSkus()).length);
    expect(cupFan.skus).not.toHaveLength(0);
    expect(cupFan.skus.every((sku) => sku.productType === "paper-cup-fan")).toBe(true);
    expect(invalid.invalidFilters).toBe(true);
    expect(invalid.skus).toEqual([]);
  });
});
