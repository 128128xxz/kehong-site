import { describe, expect, it } from "vitest";
import { materialCollections } from "@/data/materialCollections";
import { getAllSkus, getLocalizedProductSku } from "@/lib/catalog";

describe("public material collections", () => {
  it("keeps the corrugated, specialty and surface collections on the approved route set", () => {
    expect(materialCollections.map((collection) => collection.slug)).toEqual([
      "corrugated-paper",
      "specialty-paper",
      "metallic-paper",
      "pearlescent-paper",
      "embossed-paper",
      "laser-paper",
    ]);

    const corrugated = materialCollections[0];
    const corrugatedText = JSON.stringify(corrugated);
    expect(corrugatedText).toMatch(/E, F and G flute|E、F、G 坑型/u);
    expect(corrugatedText).toMatch(/double-layer|双层/u);
    expect(corrugatedText).toMatch(/triple-layer|三层/u);
    expect(corrugatedText).toMatch(/Food Paper Pad|食品纸垫/u);
    expect(corrugatedText).not.toMatch(/Pizza Pad|披萨垫纸/u);
  });

  it("does not expose source-derived supplier URLs or grouping keys in public SKU props", () => {
    const serialized = getAllSkus().map((sku) => JSON.stringify(getLocalizedProductSku(sku, "en"))).join("\n");
    expect(serialized).not.toMatch(/productLink|shirong|alibaba\.com|jiasheng|嘉盛/iu);
  });
});
