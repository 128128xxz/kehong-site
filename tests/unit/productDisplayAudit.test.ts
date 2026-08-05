import { mkdirSync, writeFileSync } from "node:fs";
import catalog from "@/data/catalog.normalized.json";
import { getLocalizedCatalogValue } from "@/lib/catalog";
import { describe, expect, it } from "vitest";

const textFields = ["gsmOrThickness", "coating", "commonSize", "structureOrFlute", "unit", "moq", "applications", "surfaceProcess", "finishingProcess"] as const;
const ownerConfirmationValues = new Set(["200sheets/Rim"]);
const forbiddenChineseResidue = /Custom width|Jumbo roll|Cupstock roll|Sheet for flexo|Sheet for digital|Current SKU|Max width|metric tons \(typical\)|PE coating|PLA coating|\d+\s*oz\/\d+\s*oz|，/iu;

describe("published product display audit", () => {
  it("enumerates every buyer-visible unique source value for all 231 published SKUs", () => {
    const published = catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed");
    expect(published).toHaveLength(231);
    const rows = textFields.flatMap((field) => {
      const grouped = new Map<string, typeof published>();
      for (const sku of published) {
        const value = sku[field];
        if (!value) continue;
        const entries = grouped.get(value) ?? [];
        entries.push(sku);
        grouped.set(value, entries);
      }
      return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([raw, skus]) => {
        const english = getLocalizedCatalogValue(raw, "en");
        const chinese = getLocalizedCatalogValue(raw, "zh");
        return { field, raw, english, chinese, formatterBranch: english !== raw || chinese !== raw ? "exact-or-structured-display" : "identity-fallback", known: english !== raw || chinese !== raw || ownerConfirmationValues.has(raw), allowlisted: ownerConfirmationValues.has(raw), skuCount: skus.length, exampleSku: skus[0].sku };
      });
    });
    const materialRows = [...new Set(published.flatMap((sku) => sku.materialIds ?? []))].sort().map((raw) => {
      const skus = published.filter((sku) => sku.materialIds?.includes(raw));
      return { field: "material", raw, english: raw, chinese: raw, formatterBranch: "taxonomy-display", known: true, allowlisted: false, skuCount: skus.length, exampleSku: skus[0].sku };
    });
    const auditRows = [...rows, ...materialRows];
    const unknownRows = auditRows.filter((row) => !row.known && !row.allowlisted);
    mkdirSync("reports/product-display-audit-20260805", { recursive: true });
    writeFileSync("reports/product-display-audit-20260805/unique-values.json", `${JSON.stringify({ publishedSkuCount: published.length, fields: [...textFields, "material"], ownerConfirmationValues: [...ownerConfirmationValues], unknownRows, rows: auditRows }, null, 2)}\n`);
    expect(auditRows.length).toBeGreaterThan(0);
    for (const row of auditRows) {
      expect(row.chinese).not.toMatch(forbiddenChineseResidue);
    }
  });
});
