import { describe, expect, it } from "vitest";
import { getPackagingCategory, getPackagingInquiryLabel, PACKAGING_INQUIRY_LABELS, packagingCategories, packagingCategorySlugs } from "@/data/packagingCategories";
import { buildPackagingContactHref } from "@/lib/packagingInquiry";
import { getLocalizedCatalogValue } from "@/lib/catalog";
import { localeConfig, locales } from "@/i18n/locales";
import { buildInquiryContactHref } from "@/lib/inquiryContext";

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
    expect(packagingCategorySlugs).toEqual(packagingCategories.map((category) => category.slug));
    expect(Object.keys(PACKAGING_INQUIRY_LABELS)).toEqual(packagingCategorySlugs);
    expect(packagingCategories.map((category) => getPackagingInquiryLabel(category.slug, "en"))).toEqual([
      "Paper Bags",
      "Labels & Stickers",
      "Takeout Boxes",
      "Cake Boxes",
      "Cake Boards & Cake Drums",
      "Corrugated Mailer Boxes",
    ]);
    expect(packagingCategories.map((category) => getPackagingInquiryLabel(category.slug, "zh"))).toEqual([
      "纸袋",
      "标签与贴纸",
      "外带食品盒",
      "蛋糕盒",
      "蛋糕底托与蛋糕鼓",
      "瓦楞邮寄盒",
    ]);
  });

  it("builds category contact URLs without a Takeout fallback or ampersand loss", () => {
    const labelsHref = buildPackagingContactHref("en", "labels-stickers", {
      interest: "structure-review",
      utm_source: "catalog",
      utm_campaign: "labels",
      qa: "not-for-public-links",
    });
    const labelsUrl = new URL(labelsHref, "https://www.kehong.tech");
    expect(labelsUrl.pathname).toBe("/contact");
    expect(labelsUrl.searchParams.get("product")).toBe("Labels & Stickers");
    expect(labelsUrl.searchParams.get("interest")).toBe("structure-review");
    expect(labelsUrl.searchParams.get("utm_source")).toBe("catalog");
    expect(labelsUrl.searchParams.get("utm_campaign")).toBe("labels");
    expect(labelsUrl.searchParams.get("qa")).toBeNull();
    expect(labelsHref).toContain("Labels+%26+Stickers");
    expect(buildPackagingContactHref("en", "cake-boards-cake-drums")).toContain("Cake+Boards+%26+Cake+Drums");
    expect(buildPackagingContactHref("en", "retired-or-unknown-category")).toBe("/contact");
    expect(getPackagingInquiryLabel("retired-or-unknown-category", "en")).toBeUndefined();
  });

  it("keeps an approved inquiry direction distinct and discards an unknown one", () => {
    const valid = new URL(buildInquiryContactHref({ product: "Cake Boxes", interest: "artwork-review", utm_source: "resource" }), "https://www.kehong.tech");
    expect(valid.searchParams.get("product")).toBe("Cake Boxes");
    expect(valid.searchParams.get("interest")).toBe("artwork-review");
    expect(valid.searchParams.get("utm_source")).toBe("resource");
    expect(buildInquiryContactHref({ interest: "unknown-interest" })).toBe("/contact");
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
