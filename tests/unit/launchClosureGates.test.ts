import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getAllSkus, getCatalogFilterOptions, getSkuBySlug } from "@/lib/catalog";
import { localeConfig } from "@/i18n/locales";
import { FACTORY_ADDRESS, getFactoryMapUrl } from "@/data/companyLocation";

describe("launch closure buyer-facing gates", () => {
  it("exposes every confirmed published SKU through a unique detail route", () => {
    const skus = getAllSkus();
    expect(skus).toHaveLength(231);
    expect(new Set(skus.map((sku) => sku.slug)).size).toBe(231);
    expect(skus.every((sku) => getSkuBySlug(sku.slug)?.sku === sku.sku)).toBe(true);
  });

  it("keeps filter query values canonical while display localization stays in the UI", () => {
    const options = getCatalogFilterOptions("zh");
    expect(options.materials).toContain("cupstock-paper");
    expect(options.materials.some((value) => value.includes("杯纸"))).toBe(false);
    expect(options.processes).not.toContain("特种纸");
  });

  it("keeps SEA locales internal until a complete closure exists", () => {
    expect(Object.keys(localeConfig).sort()).toEqual(["en", "zh"]);
  });

  it("keeps location addresses and provider split explicit", () => {
    expect(FACTORY_ADDRESS.zh).toContain("佛山市南海区布新工业区7号科宏坑纸厂");
    expect(new URL(getFactoryMapUrl("zh")).hostname).toBe("map.baidu.com");
    expect(new URL(getFactoryMapUrl("en")).hostname).toBe("www.google.com");
  });

  it("uses the shared location click telemetry anchor for every location block", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/site/LocationClickAnchor.tsx"), "utf8");
    expect(source).toContain('trackKehongEvent("location_click"');
    expect(source).toContain("sourceBlock");
    expect(source).toContain("mapProvider");
    expect(source).toContain("data-location-source");
  });

  it("keeps buyer-visible copy free of unapproved AI and synthetic claims", () => {
    const sourceRoot = path.join(process.cwd(), "src");
    const source = readFileSync(path.join(sourceRoot, "components/home/HomeHero.tsx"), "utf8")
      + readFileSync(path.join(sourceRoot, "app/[locale]/products/page.tsx"), "utf8");
    expect(source).not.toContain("231 个产品");
    expect(source).not.toContain("内容由 AI 生成");
  });
});
