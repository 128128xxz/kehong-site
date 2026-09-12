import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getAllSkus, getCatalogFilterOptions, getSkuBySlug } from "@/lib/catalog";
import { localeConfig } from "@/i18n/locales";
import { FACTORY_ADDRESS, FACTORY_MAP_DESTINATION, getFactoryLocationUrl } from "@/data/companyLocation";

describe("launch closure buyer-facing gates", () => {
  it("exposes every confirmed published SKU through a unique detail route", () => {
    const skus = getAllSkus();
    expect(skus).toHaveLength(83);
    expect(new Set(skus.map((sku) => sku.slug)).size).toBe(83);
    expect(skus.every((sku) => getSkuBySlug(sku.slug)?.sku === sku.sku)).toBe(true);
  });

  it("keeps filter query values canonical while display localization stays in the UI", () => {
    const options = getCatalogFilterOptions("zh");
    expect(options.materials).toContain("cupstock-paper");
    expect(options.materials.some((value) => value.includes("杯纸"))).toBe(false);
    expect(options.processes).not.toContain("特种纸");
  });

  it("publishes the reviewed Southeast Asia locale set alongside English and Chinese", () => {
    expect(Object.keys(localeConfig).sort()).toEqual(["en", "id", "ms", "th", "vi", "zh"]);
    expect(localeConfig.id.currency).toBe("IDR");
    expect(localeConfig.vi.currency).toBe("VND");
    expect(localeConfig.th.currency).toBe("THB");
    expect(localeConfig.ms.currency).toBe("MYR");
  });

  it("keeps location addresses and provider split explicit", () => {
    expect(FACTORY_ADDRESS.zh).toBe(FACTORY_MAP_DESTINATION);
    expect(new URL(getFactoryLocationUrl("zh")).hostname).toBe("api.map.baidu.com");
    expect(new URL(getFactoryLocationUrl("en")).hostname).toBe("www.google.com");
  });

  it("uses the shared location click telemetry anchor for every location block", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/site/LocationClickAnchor.tsx"), "utf8");
    expect(source).toContain('trackKehongEvent("location_click"');
    expect(source).toContain("sourceBlock");
    expect(source).toContain("mapProvider");
    expect(source).toContain("page_path");
    expect(source).toContain("source_block");
    expect(source).toContain("device_type");
    expect(source).toContain("data-location-source");
  });

  it("keeps the location card copy action separate from the tracked map anchor", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/site/FactoryLocationCard.tsx"), "utf8");
    expect(source).toContain("copyLabel");
    expect(source).toContain("navigator.clipboard");
    expect(source).toContain("LocationClickAnchor");
  });

  it("keeps buyer-visible copy free of unapproved AI and synthetic claims", () => {
    const sourceRoot = path.join(process.cwd(), "src");
    const source = readFileSync(path.join(sourceRoot, "components/home/HomeHero.tsx"), "utf8")
      + readFileSync(path.join(sourceRoot, "app/[locale]/products/page.tsx"), "utf8");
    expect(source).not.toContain("231 个产品");
    expect(source).not.toContain("内容由 AI 生成");
  });
});
