import { describe, expect, it } from "vitest";
import { getHomepageProductEntries, getProductEntry } from "@/lib/product-routing";
import { getCanonicalTaxonomyCategoryId } from "@/lib/taxonomy";
import { buildProductGroupSummary, filterCatalogSkus, getCatalogGroups, getAllSkus } from "@/lib/catalog";
import { getSkuImageMeta } from "@/lib/productImages";

describe("public product routing", () => {
  it("normalizes legacy category spellings to one canonical public ID", () => {
    expect(getCanonicalTaxonomyCategoryId("food-grade-paper-series")).toBe("food-grade-paper");
    expect(getCanonicalTaxonomyCategoryId("food_grade_paper")).toBe("food-grade-paper");
    expect(getCanonicalTaxonomyCategoryId(" FOOD GRADE PAPER ")).toBe("food-grade-paper");
  });

  it("only sends homepage entries to a filtered directory when a public SKU exists", () => {
    const cupFan = getProductEntry("paper-cup-fan");
    expect(cupFan.hasPublicSku).toBe(false);
    expect(cupFan.href).toBe("/products");

    const roll = getProductEntry("pe-coated-paper-roll");
    expect(roll.hasPublicSku).toBe(true);
    expect(roll.href).toContain("productType=pe-coated-paper-roll");

    expect(getProductEntry("materials").href).toBe("/products?collection=materials");
    expect(getProductEntry("packaging").href).toBe("/packaging");
  });

  it("filters the public cup fan direction without leaking sibling source groups", () => {
    const filtered = filterCatalogSkus({ productType: "paper-cup-fan" }, getAllSkus());
    expect(filtered).toHaveLength(0);
    expect(filterCatalogSkus({ category: "food-grade-paper" }, getAllSkus()).some((sku) => sku.groupId === "paper-cup-fan-kraft-cupstock-paper")).toBe(true);
  });

  it("builds family, coating and GSM summaries from all group variants", () => {
    const groups = getCatalogGroups(getAllSkus());
    const sheet = groups.find((group) => group.id === "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup")!;
    const tray = groups.find((group) => group.id === "paper-cup-fan-food-tray-paper-material")!;
    const summary = buildProductGroupSummary(sheet, "en");
    expect(summary.title).toBe("Coated Paper Sheet for Paper Cup");
    expect(summary.coating).toBe("PE / PLA coating options");
    expect(summary.gsm).toBe("150–350 GSM");
    expect(summary.variantCount).toBe(sheet.variants.length);
    expect(buildProductGroupSummary(tray, "zh").family?.title.zh).toBe("食品纸托与纸内托材料");
  });

  it("keeps the five current homepage product visuals distinct", () => {
    const entries = getHomepageProductEntries();
    expect(entries).toHaveLength(5);
    expect(new Set(entries.map((entry) => entry.image)).size).toBe(entries.length);
    expect(entries.map((entry) => entry.image)).not.toContain("/media/materials/paper-die-cut-sheet-reference.jpg");
    expect(entries.map((entry) => entry.image)).not.toContain("/media/packaging/meal-box-reference.jpg");
  });

  it("assigns distinct approved representative images to the five public product groups", () => {
    const groups = getCatalogGroups(getAllSkus());
    const images = groups.map((group) => getSkuImageMeta(group.representative, "en").src);
    expect(groups).toHaveLength(5);
    expect(new Set(images).size).toBe(groups.length);
    expect(images.every((image) => image.startsWith("/media/"))).toBe(true);
    expect(images).not.toContain("/media/materials/paper-die-cut-sheet-reference.jpg");
    expect(images).not.toContain("/media/packaging/meal-box-reference.jpg");
  });
});
