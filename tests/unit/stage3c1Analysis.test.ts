import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";
import { SOURCE_ONLY_RECORD_IDS } from "@/data/sourceOnlyRecords";
import { getAllCatalogSkus, getAllSkus, getCatalogGroups } from "@/lib/catalog";

const root = process.cwd();

describe("current evidence-gated production baseline", () => {
  it("keeps all pending source records outside the public catalog", () => {
    const pending = getAllCatalogSkus().filter((sku) => !(sku.published && sku.sourceStatus === "confirmed"));
    const publicIds = new Set(getAllSkus().map((sku) => sku.id));
    expect(pending).toHaveLength(106);
    expect(pending.every((sku) => !publicIds.has(sku.id))).toBe(true);
    expect(getAllSkus()).toHaveLength(83);
  });

  it("keeps the seven source-only candidates evidence-gated", () => {
    const source = getAllCatalogSkus();
    const sourceOnly = SOURCE_ONLY_RECORD_IDS.map((id) => source.find((sku) => sku.id === id));
    expect(sourceOnly).toHaveLength(7);
    expect(sourceOnly.every(Boolean)).toBe(true);
    expect(sourceOnly.every((sku) => sku?.published === true)).toBe(true);
    expect(sourceOnly.every((sku) => !getAllSkus().some((publicSku) => publicSku.id === sku?.id))).toBe(true);
  });

  it("keeps the removed Paper Cup Fan source family audit-only", () => {
    expect(catalog.skus.filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(141);
    expect(getAllSkus().filter((sku) => /^KH-FD-CUPFAN-/iu.test(sku.sku))).toHaveLength(0);
    expect(getCatalogGroups(getAllSkus())).toHaveLength(5);
  });

  it("does not promote source records by changing the current source files", () => {
    expect(getAllCatalogSkus()).toHaveLength(337);
    expect(getAllCatalogSkus().filter((sku) => sku.published && sku.sourceStatus === "confirmed")).toHaveLength(231);
    expect(fs.existsSync(path.join(root, "docs", "stage-3c1-family-status.csv"))).toBe(false);
  });

  it("keeps current runtime modules free of retired stage artifact imports", () => {
    const runtimeFiles = ["src/app/sitemap.ts", "src/lib/catalog.ts", "src/lib/productImages.ts"];
    const runtime = runtimeFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
    expect(runtime).not.toContain("docs/stage-");
    expect(runtime).not.toContain("migration-map");
  });

  it("keeps the current source/public boundary numerically explicit", () => {
    expect({ source: getAllCatalogSkus().length, sourcePublished: getAllCatalogSkus().filter((sku) => sku.published).length, public: getAllSkus().length }).toEqual({ source: 337, sourcePublished: 231, public: 83 });
  });
});
