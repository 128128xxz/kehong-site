import { describe, expect, it } from "vitest";
import { getPackagingCategory, getPackagingInquiryLabel, PACKAGING_INQUIRY_LABELS, packagingCategories, packagingCategorySlugs } from "@/data/packagingCategories";
import { buildPackagingContactHref } from "@/lib/packagingInquiry";
import { getLocalizedCatalogValue } from "@/lib/catalog";
import { localeConfig, locales } from "@/i18n/locales";
import { buildInquiryContactHref } from "@/lib/inquiryContext";
import { getInterestLabel } from "@/data/interests";

describe("public packaging and locale governance", () => {
  it("exposes the active packaging categories with canonical inquiry labels", () => {
    expect(packagingCategories.map((category) => category.slug)).toEqual([
      "paper-bags",
      "takeout-boxes",
      "cake-boxes",
      "cake-boards-cake-drums",
      "pizza-packaging",
      "food-packaging",
      "inserts-dividers",
      "retail-packaging",
      "cosmetic-packaging",
      "corrugated-mailer-boxes",
    ]);
    expect(getPackagingCategory("pillow-boxes")).toBeUndefined();
    expect(packagingCategorySlugs).toEqual(packagingCategories.map((category) => category.slug));
    expect(Object.keys(PACKAGING_INQUIRY_LABELS)).toEqual(packagingCategorySlugs);
    expect(packagingCategories.map((category) => getPackagingInquiryLabel(category.slug, "en"))).toEqual([
      "Paper Bags",
      "Takeout Boxes",
      "Cake Boxes",
      "Cake Boards & Cake Drums",
      "Pizza Boxes & Pizza Pads",
      "Food Packaging",
      "Corrugated Inserts & Paperboard Inserts",
      "Retail Packaging",
      "Cosmetic Packaging",
      "Corrugated Mailer Boxes",
    ]);
    expect(packagingCategories.map((category) => getPackagingInquiryLabel(category.slug, "zh"))).toEqual([
      "纸袋",
      "外带食品盒",
      "蛋糕盒",
      "蛋糕底托与蛋糕鼓",
      "披萨盒与披萨垫纸",
      "食品包装",
      "瓦楞内托与纸板内托",
      "零售包装",
      "化妆品包装",
      "瓦楞邮寄盒",
    ]);
  });

  it("builds active category contact URLs without a fallback or ampersand loss", () => {
    const retiredHref = buildPackagingContactHref("en", "labels-stickers", {
      interest: "structure-review",
      utm_source: "catalog",
      utm_campaign: "labels",
      qa: "not-for-public-links",
    });
    const retiredUrl = new URL(retiredHref, "https://www.kehong.tech");
    expect(retiredUrl.pathname).toBe("/contact");
    expect(retiredUrl.searchParams.get("product")).toBeNull();
    expect(retiredUrl.searchParams.get("interest")).toBe("structure-review");
    expect(retiredUrl.searchParams.get("utm_source")).toBe("catalog");
    expect(retiredUrl.searchParams.get("utm_campaign")).toBe("labels");
    expect(retiredUrl.searchParams.get("qa")).toBeNull();
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

  it("keeps interest context localized without changing the canonical interest key", () => {
    expect(getInterestLabel("structure-review", "id")).toBe("Tinjauan struktur kemasan");
    expect(getInterestLabel("structure-review", "vi")).toBe("Đánh giá cấu trúc bao bì");
    expect(getInterestLabel("structure-review", "th")).toBe("ตรวจสอบโครงสร้างบรรจุภัณฑ์");
    expect(getInterestLabel("structure-review", "ms")).toBe("Semakan struktur pembungkusan");
    expect(getInterestLabel("structure-review", "unknown")).toBe("Packaging structure review");
  });

  it("keeps the public locale order stable for all reviewed language bundles", () => {
    expect(locales).toEqual(["en", "zh", "id", "vi", "th", "ms"]);
    expect(Object.keys(localeConfig)).toEqual(["en", "zh", "id", "vi", "th", "ms"]);
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
