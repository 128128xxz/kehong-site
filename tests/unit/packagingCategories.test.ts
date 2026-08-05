import { describe, expect, it } from "vitest";
import { getPackagingCategory, getPackagingInquiryLabel, packagingCategories } from "@/data/packagingCategories";
import { getLocalizedCatalogValue } from "@/lib/catalog";
import { localeConfig, locales } from "@/i18n/locales";

describe("public packaging and locale governance", () => {
  it("exposes only the six approved packaging categories with canonical inquiry labels", () => {
    expect(packagingCategories.map((category) => category.slug)).toEqual([
      "paper-bags",
      "labels-stickers",
      "takeout-boxes",
      "cake-boxes",
      "cake-boards-cake-drums",
      "corrugated-mailer-boxes",
    ]);
    expect(getPackagingCategory("pillow-boxes")).toBeUndefined();
    expect(packagingCategories.map((category) => getPackagingInquiryLabel(category, "en"))).toEqual([
      "Paper Bags",
      "Labels & Stickers",
      "Takeout Boxes",
      "Cake Boxes",
      "Cake Boards & Cake Drums",
      "Corrugated Mailer Boxes",
    ]);
    expect(packagingCategories.map((category) => getPackagingInquiryLabel(category, "zh"))).toEqual([
      "纸袋",
      "标签与贴纸",
      "外带食品盒",
      "蛋糕盒",
      "蛋糕底托与蛋糕鼓",
      "瓦楞邮寄盒",
    ]);
  });

  it("keeps only complete English and Chinese public locales", () => {
    expect(locales).toEqual(["en", "zh"]);
    expect(Object.keys(localeConfig)).toEqual(["en", "zh"]);
  });

  it("localizes only exact legacy Chinese display values without changing English", () => {
    expect(getLocalizedCatalogValue("1–5 metric tons (typical)", "zh")).toBe("1–5 公吨");
    expect(getLocalizedCatalogValue("PE coating", "zh")).toBe("PE 淋膜");
    expect(getLocalizedCatalogValue("PLA coating", "zh")).toBe("PLA 淋膜");
    expect(getLocalizedCatalogValue("PE / PLA coating options", "zh")).toBe("可选 PE / PLA 淋膜");
    expect(getLocalizedCatalogValue("piece", "zh")).toBe("件");
    expect(getLocalizedCatalogValue("sheet", "zh")).toBe("张");
    expect(getLocalizedCatalogValue("PE coating", "en")).toBe("PE coating");
    expect(getLocalizedCatalogValue("Unknown coating phrase", "zh")).toBe("Unknown coating phrase");
  });
});
