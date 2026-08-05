import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { getLocalizedCatalogValue } from "@/lib/catalog";
import { formatProductDisplayValue, formatProductSkuSummary } from "@/lib/productPresentation";

describe("product presentation formatter", () => {
  it("normalizes only recognized English and Chinese buyer-facing specifications", () => {
    expect(formatProductDisplayValue("150-350gsm", "en")).toBe("150–350 GSM");
    expect(formatProductDisplayValue("170gsm", "zh")).toBe("170 GSM");
    expect(formatProductDisplayValue("8oz/12oz/16oz", "en")).toBe("8 oz/12 oz/16 oz");
    expect(formatProductDisplayValue("Max width 1200mm", "en")).toBe("Max width: 1200 mm");
    expect(formatProductDisplayValue("Max width 1200mm", "zh")).toBe("最大宽度：1200 mm");
    expect(formatProductDisplayValue("Custom L*W", "en")).toBe("Custom L × W");
    expect(formatProductDisplayValue("Custom by cup size / dimensions", "zh")).toBe("按杯型 / 尺寸定制");
    expect(formatProductDisplayValue("200sheets/Rim", "en")).toBe("200sheets/Rim");
    expect(formatProductDisplayValue("Unknown 7x9", "en")).toBe("Unknown 7x9");
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
    expect(formatProductSkuSummary("KH-001", "en")).toBe("Current SKU: KH-001");
    expect(formatProductSkuSummary("KH-001", "zh")).toBe("当前 SKU：KH-001");
  });

  it("audits every published SKU display value without changing raw catalog data", () => {
    const published = catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed");
    expect(published).toHaveLength(231);
    const fields = ["gsmOrThickness", "commonSize", "moq", "coating"] as const;
    for (const sku of published) {
      for (const field of fields) {
        const english = getLocalizedCatalogValue(sku[field], "en");
        const chinese = getLocalizedCatalogValue(sku[field], "zh");
        expect(english).not.toMatch(/\d+-\d+gsm|\d+gsm|\d+oz|\d+mm/iu);
        expect(chinese).not.toMatch(/\d+-\d+gsm|\d+gsm|\d+oz|\d+mm|Max width|PE coating|PLA coating/iu);
        expect(chinese).not.toContain("Current SKU");
        expect(english.includes("Typical MOQ") && english.includes("(typical)")).toBe(false);
      }
    }
  });
});
