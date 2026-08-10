import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { getLocalizedCatalogValue } from "@/lib/catalog";
import { formatProductDisplayList, formatProductDisplayValue, formatProductFieldValue, formatProductSkuSummary } from "@/lib/productPresentation";

describe("product presentation formatter", () => {
  it("normalizes only recognized English and Chinese buyer-facing specifications", () => {
    expect(formatProductDisplayValue("150-350gsm", "en")).toBe("150–350 GSM");
    expect(formatProductDisplayValue("170gsm", "zh")).toBe("170 GSM");
    expect(formatProductDisplayValue("8oz/12oz/16oz", "en")).toBe("8 oz / 12 oz / 16 oz");
    expect(formatProductDisplayValue("16 oz/4 oz", "zh")).toBe("16 oz / 4 oz");
    expect(formatProductDisplayValue("Max width 1200mm", "en")).toBe("Max width: 1200 mm");
    expect(formatProductDisplayValue("Max width 1200mm", "zh")).toBe("最大宽度：1200 mm");
    expect(formatProductDisplayValue("Custom L*W", "en")).toBe("Custom L × W");
    expect(formatProductDisplayValue("Custom by cup size / dimensions", "zh")).toBe("按杯型 / 尺寸定制");
    expect(formatProductDisplayValue("200sheets/Rim", "en")).toBe("200sheets/Rim");
    expect(formatProductDisplayValue("Unknown 7x9", "en")).toBe("Unknown 7x9");
    expect(formatProductDisplayValue("Custom width", "zh")).toBe("定制宽度");
    expect(formatProductDisplayValue("Jumbo roll", "zh")).toBe("大卷规格");
    expect(formatProductDisplayValue("Cupstock roll", "zh")).toBe("杯纸卷");
    expect(formatProductDisplayValue("Sheet for flexo", "zh")).toBe("柔印用平张纸");
    expect(formatProductDisplayValue("Sheet for digital", "zh")).toBe("数码印刷用平张纸");
    expect(formatProductFieldValue("Custom paper packaging specification", "finishing", "en")).toBe("");
    expect(formatProductFieldValue("Custom L*W", "size", "en")).toBe("Custom L × W");
    expect(formatProductFieldValue("hot drink cup", "application", "en")).toBe("Hot-drink cups");
    expect(formatProductFieldValue("paper cup", "application", "en")).toBe("Paper cups");
    expect(formatProductFieldValue("kraft paper cup", "application", "en")).toBe("Kraft paper cups");
    expect(formatProductFieldValue("food container", "application", "en")).toBe("Food containers");
    expect(formatProductDisplayList(["纸杯", "纸碗"], "zh")).toBe("纸杯、纸碗");
    expect(formatProductDisplayList(["Paper cup", "Paper bowl"], "en")).toBe("Paper cup and Paper bowl");
  });

  it("keeps source values immutable while localizing labels and inquiry context", () => {
    const source = { commonSize: "Max width 1200mm" };
    expect(formatProductDisplayValue(source.commonSize, "zh")).toBe("最大宽度：1200 mm");
    expect(source.commonSize).toBe("Max width 1200mm");
    expect(getLocalizedCatalogValue("1–5 metric tons (typical)", "en")).toBe("1–5 metric tons");
    expect(getLocalizedCatalogValue("1–5 metric tons (typical)", "zh")).toBe("1–5 公吨");
    expect(getLocalizedCatalogValue("PE coating", "zh")).toBe("PE 淋膜");
    expect(getLocalizedCatalogValue("PLA coating", "zh")).toBe("PLA 淋膜");
    expect(getLocalizedCatalogValue("roll", "zh")).toBe("卷筒");
    expect(getLocalizedCatalogValue("sheet", "zh")).toBe("张");
    expect(getLocalizedCatalogValue("piece", "zh")).toBe("件");
    expect(getLocalizedCatalogValue("ton", "zh")).toBe("吨");
    expect(getLocalizedCatalogValue("Custom paper packaging specification", "en")).toBe("");
    expect(formatProductSkuSummary("KH-001", "en")).toBe("Current SKU: KH-001");
    expect(formatProductSkuSummary("KH-001", "zh")).toBe("当前 SKU：KH-001");
  });

  it("audits every published SKU display value without changing raw catalog data", () => {
    const published = catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed");
    expect(published).toHaveLength(231);
    const fields = ["gsmOrThickness", "commonSize", "moq", "coating", "structureOrFlute", "unit", "applications", "surfaceProcess", "finishingProcess"] as const;
    for (const sku of published) {
      for (const field of fields) {
        const english = getLocalizedCatalogValue(sku[field], "en");
        const chinese = getLocalizedCatalogValue(sku[field], "zh");
        expect(english).not.toMatch(/\d+-\d+gsm|\d+gsm|\d+oz|\d+mm/iu);
        expect(chinese).not.toMatch(/\d+-\d+gsm|\d+gsm|\d+oz|\d+mm|Max width|PE coating|PLA coating/iu);
        expect(chinese).not.toMatch(/Custom width|Jumbo roll|Cupstock roll|Sheet for flexo|Sheet for digital|metric tons \(typical\)/iu);
        expect(chinese).not.toContain("Current SKU");
        expect(english.includes("Typical MOQ") && english.includes("(typical)")).toBe(false);
        expect(english).not.toContain("Custom paper packaging specification");
        expect(chinese).not.toContain("Custom paper packaging specification");
      }
    }
  });
});
