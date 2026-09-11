import { describe, expect, it } from "vitest";
import {
  buildProductGroupSummary,
  getAllSkus,
  getLocalizedProductTitle,
  getPublicProductGroupSummary,
  getProductGroupId,
  getSkusByGroupId,
} from "@/lib/catalog";
import { DATA_CONFLICT_RECORDS, isDataConflictSku } from "@/data/dataConflictRecords";

describe("DATA_CONFLICT frontend neutralization", () => {
  it("keeps the 29 public conflict records internally listed and marked neutralized", () => {
    expect(DATA_CONFLICT_RECORDS).toHaveLength(29);
    expect(DATA_CONFLICT_RECORDS.every((record) => record.frontend_neutralized)).toBe(true);
    expect(new Set(DATA_CONFLICT_RECORDS.map((record) => record.sku)).size).toBe(29);

    const publicConflicts = getAllSkus().filter(isDataConflictSku);
    expect(publicConflicts).toHaveLength(29);
  });

  it("removes unresolved coating wording from conflict titles without changing source values", () => {
    const roll = getAllSkus().find((sku) => sku.sku === "KH-FD-CUPROLL-150350-PE-052");
    const sheet = getAllSkus().find((sku) => sku.sku === "KH-FD-CUPSHEET-150350-PE-043");
    const cupstock = getAllSkus().find((sku) => sku.sku === "KH-FD-KCUP-150350-PR-048");
    const kraftCupstock = getAllSkus().find((sku) => sku.sku === "KH-FD-KCUP-320-PE-247");

    expect(roll).toBeDefined();
    expect(sheet).toBeDefined();
    expect(cupstock).toBeDefined();
    expect(kraftCupstock).toBeDefined();
    expect(roll!.title.en).toBe("PE Coated Paper Roll for Paper Cup");
    expect(roll!.coating).toBe("PLA coating");
    expect(getLocalizedProductTitle(roll!, "en")).toBe("Coated Paper Roll for Paper Cup");
    expect(getLocalizedProductTitle(sheet!, "en")).toBe("Coated Paper Sheet for Paper Cup");
    expect(getLocalizedProductTitle(cupstock!, "en")).toBe("Cupstock Paper");
    expect(getLocalizedProductTitle(kraftCupstock!, "en")).toBe("Kraft Cupstock Paper");

    const cupstockGroupId = getProductGroupId(cupstock!);
    const cupstockSummary = getPublicProductGroupSummary({
      id: cupstockGroupId,
      representative: cupstock!,
      variants: getSkusByGroupId(cupstockGroupId),
    }, "en");
    expect(cupstockSummary.materials).toEqual(["Cupstock Paper"]);
    expect(cupstockSummary.materials.join(" ")).not.toMatch(/kraft|white/iu);
  });

  it("hides coating summaries for groups containing unresolved conflicts", () => {
    const roll = getAllSkus().find((sku) => sku.sku === "KH-FD-CUPROLL-150350-PE-052");
    expect(roll).toBeDefined();
    const groupId = getProductGroupId(roll!);
    const internalSummary = buildProductGroupSummary({
      id: groupId,
      representative: roll!,
      variants: getSkusByGroupId(groupId),
    }, "en");
    const summary = getPublicProductGroupSummary({
      id: groupId,
      representative: roll!,
      variants: getSkusByGroupId(groupId),
    }, "en");

    expect(internalSummary.coating).toBe("PE / PLA coating options");
    expect(summary.coating).toBe("");
    expect(summary.coatingOptions).toEqual([]);
    expect(summary.description).not.toMatch(/\b(PE|PLA|coating)\b/iu);
  });
});
