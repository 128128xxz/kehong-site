import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { SOURCE_ONLY_RECORD_IDS } from "@/data/sourceOnlyRecords";
import { getAllCatalogSkus, getAllSkus, getCatalogGroups, getProductCategories } from "@/lib/catalog";
import { getHomepageProductEntries } from "@/lib/product-routing";
import { getSkuImageMeta } from "@/lib/productImages";

const root = process.cwd();

describe("current catalog and media QA baseline", () => {
  it("keeps the source record accounting explicit", () => {
    const source = getAllCatalogSkus();
    expect(source).toHaveLength(337);
    expect(source.filter((sku) => sku.published && sku.sourceStatus === "confirmed")).toHaveLength(231);
    expect(source.filter((sku) => !(sku.published && sku.sourceStatus === "confirmed"))).toHaveLength(106);
  });

  it("keeps the public directory at 83 verified records", () => {
    const publicSkus = getAllSkus();
    expect(publicSkus).toHaveLength(83);
    expect(new Set(publicSkus.map((sku) => sku.sku)).size).toBe(83);
    expect(new Set(publicSkus.map((sku) => sku.slug)).size).toBe(83);
    expect(publicSkus.every((sku) => sku.published && sku.sourceStatus === "confirmed")).toBe(true);
  });

  it("keeps five public product groups and excludes the removed family", () => {
    const groups = getCatalogGroups(getAllSkus());
    expect(groups).toHaveLength(5);
    expect(groups.some((group) => group.id === "paper-cup-fan-paper-cup-fan")).toBe(false);
    expect(groups.reduce((sum, group) => sum + group.variants.length, 0)).toBe(83);
  });

  it("keeps all seven source-only records outside public lookups", () => {
    const publicIds = new Set(getAllSkus().map((sku) => sku.id));
    expect(SOURCE_ONLY_RECORD_IDS).toHaveLength(7);
    expect(SOURCE_ONLY_RECORD_IDS.every((id) => !publicIds.has(id))).toBe(true);
  });

  it("keeps Paper Cup Fan source records out of the public product type", () => {
    expect(catalog.skus.filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(141);
    expect(getAllSkus().filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(0);
  });

  it("provides a usable current image result for every public SKU", () => {
    for (const sku of getAllSkus()) {
      const image = getSkuImageMeta(sku, "en");
      expect(image.src, sku.sku).toMatch(/^\/media\//u);
      expect(image.alt, sku.sku).toBeTruthy();
      expect(["exact", "representative", "pending"]).toContain(image.status);
    }
  });

  it("keeps the current product category registry non-empty", () => {
    const categories = getProductCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(new Set(categories.map((category) => category.slug)).size).toBe(categories.length);
    expect(categories.every((category) => category.title.en && category.title.zh && category.description.en && category.description.zh)).toBe(true);
  });

  it("keeps homepage product entry links out of empty catalog states", () => {
    const entries = getHomepageProductEntries();
    expect(entries).toHaveLength(5);
    expect(entries.every((entry) => entry.hasPublicSku || !entry.href.startsWith("/products?"))).toBe(true);
    expect(entries.every((entry) => !entry.href.includes("productType=paper-cup-fan"))).toBe(true);
  });

  it("keeps the sitemap implementation independent of retired stage artifacts", () => {
    const sitemap = fs.readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
    expect(sitemap).toContain("getAllSkus");
    expect(sitemap).toContain("productRoutes");
    expect(sitemap).not.toContain("docs/stage-");
    expect(sitemap).not.toContain("migration-map");
  });

  it("keeps source and public counts separate in the current data model", () => {
    expect(getAllCatalogSkus().length).toBeGreaterThan(getAllSkus().length);
    expect(getAllCatalogSkus().length).toBe(337);
    expect(getAllSkus().length).toBe(83);
  });

  it("does not reintroduce historical Spanish routes into the active locale set", () => {
    const localeSource = fs.readFileSync(path.join(root, "src/i18n/locales.ts"), "utf8");
    expect(localeSource).not.toContain('"es"');
  });

  it("keeps current public group representatives stable", () => {
    for (const group of getCatalogGroups(getAllSkus())) {
      expect(group.representative.sku).toBeTruthy();
      expect(group.representative.slug).toBeTruthy();
      expect(group.variants.length).toBeGreaterThan(0);
    }
  });
});
