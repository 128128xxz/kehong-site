import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/data/catalog.normalized.json", import.meta.url);
const reportDirectory = new URL("../reports/product-data/", import.meta.url);
const source = await readFile(sourcePath, "utf8");
const catalog = JSON.parse(source);
const groupId = "paper-cup-fan-kraft-cupstock-paper";
const variants = catalog.skus.filter((sku) => sku.groupId === groupId);
const whiteMaterialIds = new Set(["food-grade-white-board", "cupstock-paper"]);
const kraftMaterialIds = new Set(["food-grade-kraft-paper", "kraft-paper"]);
const whiteVariants = variants.filter((sku) => (sku.materialIds ?? []).some((id) => whiteMaterialIds.has(id)));
const kraftVariants = variants.filter((sku) => (sku.materialIds ?? []).some((id) => kraftMaterialIds.has(id)));
const result = {
  generatedAt: new Date().toISOString(),
  source: "src/data/catalog.normalized.json",
  sourceSha256: createHash("sha256").update(source).digest("hex"),
  productGroupId: groupId,
  productGroupSlug: "kraft-cupstock-paper",
  totalVariants: variants.length,
  whiteCupstockVariantCount: whiteVariants.length,
  kraftCupstockVariantCount: kraftVariants.length,
  determination: whiteVariants.length && kraftVariants.length ? "mixed-white-and-kraft" : "requires-manual-review",
  display: {
    en: "Cupstock Paper",
    zh: "杯纸原纸",
    materialSummary: { en: "White and kraft cupstock options", zh: "可选白色杯纸与牛皮杯纸" },
  },
  variants: variants.map((sku) => ({ sku: sku.sku, slug: sku.slug, sourceTitle: sku.title?.en ?? "", materialIds: sku.materialIds ?? [], coating: sku.coating ?? "" })),
};

await mkdir(reportDirectory, { recursive: true });
await writeFile(new URL("cupstock-material-audit.json", reportDirectory), `${JSON.stringify(result, null, 2)}\n`);
const markdown = `# Cupstock material audit\n\nGenerated: ${result.generatedAt}\n\n- Source: \`${result.source}\`\n- Source SHA-256: \`${result.sourceSha256}\`\n- Product group: \`${result.productGroupId}\`\n- Variants: ${result.totalVariants}\n- White cupstock evidence: ${result.whiteCupstockVariantCount} variants\n- Kraft cupstock evidence: ${result.kraftCupstockVariantCount} variants\n- Determination: **${result.determination}**\n\n## Public display decision\n\n- English group title: **Cupstock Paper**\n- Chinese group title: **杯纸原纸**\n- English material summary: **White and kraft cupstock options**\n- Chinese material summary: **可选白色杯纸与牛皮杯纸**\n\nThis audit is display-layer evidence only. It does not change SKU codes, historical URLs, or source material facts.\n\n## Variant evidence\n\n| SKU | Source title | Material IDs | Structured coating |\n| --- | --- | --- | --- |\n${result.variants.map((item) => `| ${item.sku} | ${item.sourceTitle} | ${(item.materialIds).join(", ")} | ${item.coating} |`).join("\n")}\n`;
await writeFile(new URL("cupstock-material-audit.md", reportDirectory), markdown);
console.log(`Cupstock material audit: ${result.totalVariants} variants; ${result.whiteCupstockVariantCount} white evidence; ${result.kraftCupstockVariantCount} kraft evidence.`);
