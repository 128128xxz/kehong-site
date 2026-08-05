import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "src/data/catalog.normalized.json");
const reportDir = path.join(root, "reports/product-data");
const jsonPath = path.join(reportDir, "coating-sku-conflict-audit.json");
const markdownPath = path.join(reportDir, "coating-sku-conflict-audit.md");

const source = await readFile(sourcePath, "utf8");
const catalog = JSON.parse(source);
const normalized = (value) => String(value ?? "").trim().toUpperCase();
const codedCoating = (sku) => {
  const tokens = normalized(sku).split("-");
  if (tokens.includes("PLA")) return "PLA";
  if (tokens.includes("PE")) return "PE";
  return null;
};
const coatingFact = (value) => {
  const text = normalized(value);
  if (text.includes("PLA")) return "PLA";
  if (text.includes("PE")) return "PE";
  return null;
};

const records = catalog.skus.map((item) => {
  const sku = item.sku;
  const code = codedCoating(sku);
  const coating = coatingFact(item.coating);
  const status = code && coating && code !== coating ? "conflict" : code && !coating ? "unverified" : "consistent";
  return {
    sku,
    slug: item.slug,
    groupId: item.groupId,
    canonicalGroupId: item.canonicalGroupId,
    title: item.title?.en ?? "",
    skuCodeCoating: code,
    rawCoating: item.coating ?? "",
    normalizedCoating: coating,
    status,
    note: status === "conflict"
      ? "SKU code and raw coating field disagree; raw source data has not been changed."
      : status === "unverified"
        ? "SKU code contains a coating token but the raw coating field is blank or unrecognized."
        : "No code-to-coating conflict detected by the PE/PLA token rule.",
  };
});

const conflicts = records.filter((record) => record.status === "conflict");
const unverified = records.filter((record) => record.status === "unverified");
const groupedCoatings = Object.values(records.reduce((accumulator, record) => {
  const entry = accumulator[record.groupId] ?? { groupId: record.groupId, skuCount: 0, coatings: new Set(), skus: [] };
  entry.skuCount += 1;
  if (record.normalizedCoating) entry.coatings.add(record.normalizedCoating);
  entry.skus.push(record.sku);
  accumulator[record.groupId] = entry;
  return accumulator;
}, {})).map((entry) => ({ ...entry, coatings: [...entry.coatings].sort() }));

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    path: "src/data/catalog.normalized.json",
    sha256: createHash("sha256").update(source).digest("hex"),
  },
  rule: "Only explicit PE or PLA tokens in the SKU code are compared with the raw coating field. This audit never mutates source SKU facts.",
  totals: {
    skuCount: records.length,
    explicitCoatingCodeCount: records.filter((record) => record.skuCodeCoating).length,
    conflicts: conflicts.length,
    unverified: unverified.length,
  },
  conflicts,
  unverified,
  groupCoatingSummary: groupedCoatings,
};

const table = (items) => items.length
  ? ["| SKU | Product group | SKU code | Raw coating | Status |", "| --- | --- | --- | --- | --- |", ...items.map((record) => `| ${record.sku} | ${record.groupId} | ${record.skuCodeCoating ?? "—"} | ${record.rawCoating || "—"} | ${record.status} |`)].join("\n")
  : "No records.";
const markdown = `# Coating / SKU code conflict audit\n\nGenerated: ${report.generatedAt}\n\nSource: \`src/data/catalog.normalized.json\`  \nSource SHA-256: \`${report.source.sha256}\`\n\n## Scope and rule\n\n${report.rule}\n\n- SKU records checked: ${report.totals.skuCount}\n- Records with an explicit PE or PLA code token: ${report.totals.explicitCoatingCodeCount}\n- Conflicts: ${report.totals.conflicts}\n- Unverified coded records: ${report.totals.unverified}\n\n## Conflicts\n\n${table(conflicts)}\n\n## Unverified coded records\n\n${table(unverified)}\n\n## Product-group coating summary\n\n| Product group | SKUs | Coating values found |\n| --- | ---: | --- |\n${groupedCoatings.map((group) => `| ${group.groupId} | ${group.skuCount} | ${group.coatings.join(" / ") || "—"} |`).join("\n")}\n\n## Required business follow-up\n\nAny listed conflict requires a supplier or production-data owner to confirm the commercial coating before the raw SKU source is corrected. This audit report intentionally leaves the underlying SKU and coating data unchanged.\n`;

await mkdir(reportDir, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(markdownPath, markdown);
console.log(JSON.stringify({ jsonPath, markdownPath, totals: report.totals }, null, 2));
