import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import xlsx from "xlsx";

const workbookPath = process.env.KEHONG_CATALOG_XLSX;
const outputPath = path.join(process.cwd(), "src/data/catalog.json");

if (!workbookPath) {
  throw new Error("Set KEHONG_CATALOG_XLSX to the Kehong product workbook path.");
}

function compact(value) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value) {
  const slug = compact(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

function findSheet(workbook, marker) {
  const sheetName = workbook.SheetNames.find((name) => name.includes(marker));
  if (!sheetName) {
    throw new Error(`Could not find sheet containing "${marker}".`);
  }
  return sheetName;
}

function sheetRows(workbook, sheetName) {
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
  });
}

function readTable(workbook, sheetMarker, requiredHeader) {
  const sheetName = findSheet(workbook, sheetMarker);
  const rows = sheetRows(workbook, sheetName);
  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => compact(cell) === requiredHeader),
  );

  if (headerIndex === -1) {
    throw new Error(`Could not find "${requiredHeader}" header in "${sheetName}".`);
  }

  const headers = rows[headerIndex].map(compact);
  return rows
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => compact(cell)))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, compact(row[index])])),
    );
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return "";
}

function normalizeSku(row, sourceGroup, index) {
  const sku = pick(row, ["SKU 编码"]) || `KH-${sourceGroup}-${index + 1}`;
  const englishName = pick(row, ["英文名称"]);
  const productNameZh = pick(row, ["产品名称"]);
  const title = englishName || productNameZh || sku;
  const category = pick(row, ["产品大类"]) || "Paper Packaging";
  const slugBase = `${sku}-${title}`;

  return {
    id: slugify(sku),
    slug: slugify(slugBase),
    sku,
    sourceGroup,
    category,
    title: {
      en: title,
      zh: productNameZh || title,
      es: title,
      id: title,
      vi: title,
      th: title,
      ms: title,
    },
    englishName,
    material: pick(row, ["材质", "材质组合"]),
    gsmOrThickness: pick(row, ["克重 / 厚度"]),
    color: pick(row, ["颜色"]),
    structureOrFlute: pick(row, ["坑型 / 结构", "盒型 / 结构", "杯型 / 结构"]),
    surfaceProcess: pick(row, ["表面工艺", "工艺"]),
    finishingProcess: pick(row, ["后加工工艺"]),
    commonSize: pick(row, ["常见尺寸", "尺寸"]),
    moq: pick(row, ["MOQ"]),
    industries: pick(row, ["适用行业"]),
    applications: pick(row, ["适用产品"]),
    unit: pick(row, ["计价单位"]),
    customizable: /yes|支持/i.test(pick(row, ["是否可定制", "是否支持打样"])),
    source: pick(row, ["来源"]),
    sourceReferencePrice: pick(row, ["来源参考价"]),
    productLink: pick(row, ["产品链接"]),
    notes: {
      en: pick(row, ["备注"]),
      zh: pick(row, ["备注"]),
    },
  };
}

function familyTitle(category) {
  const titles = {
    "牛皮纸系列": "Kraft Paper Series",
    "白卡纸系列": "White Cardboard Series",
    "食品纸系列": "Food Grade Paper Series",
    "瓦楞纸 / 坑纸系列": "Corrugated / Fluted Paper Series",
    "特种纸系列": "Specialty Paper Series",
    "食品包装盒": "Food Packaging Boxes",
    "化妆品包装盒": "Cosmetic Packaging Boxes",
    "电子产品包装": "Electronics Packaging",
    "礼品包装盒": "Gift Packaging Boxes",
    "定制结构包装": "Custom Structure Packaging",
    "纸杯扇形片": "Paper Cup Fan",
  };
  return titles[category] || category;
}

function createFamilies(skus) {
  const familyMap = new Map();
  for (const sku of skus) {
    if (!familyMap.has(sku.category)) {
      const title = familyTitle(sku.category);
      familyMap.set(sku.category, {
        id: "",
        slug: "",
        category: sku.category,
        title: {
          en: title,
          zh: sku.category,
          es: title,
          id: title,
          vi: title,
          th: title,
          ms: title,
        },
        count: 0,
        materials: new Set(),
        processes: new Set(),
        applications: new Set(),
      });
    }

    const family = familyMap.get(sku.category);
    family.count += 1;
    if (sku.material) family.materials.add(sku.material);
    if (sku.surfaceProcess) family.processes.add(sku.surfaceProcess);
    if (sku.applications) family.applications.add(sku.applications);
  }

  return Array.from(familyMap.values()).map((family, index) => {
    const slug = `${String(index + 1).padStart(2, "0")}-${slugify(family.title.en)}`;
    return {
      ...family,
      id: slug,
      slug,
      materials: Array.from(family.materials).slice(0, 8),
      processes: Array.from(family.processes).slice(0, 8),
      applications: Array.from(family.applications).slice(0, 8),
    };
  });
}

const workbook = xlsx.readFile(workbookPath);
const semiFinished = readTable(workbook, "半成品纸材", "SKU 编码");
const boxes = readTable(workbook, "纸盒与包装产品", "SKU 编码");
const cupFans = readTable(workbook, "纸杯风扇SKU", "SKU 编码");

const skus = [
  ...semiFinished.map((row, index) => normalizeSku(row, "semi-finished", index)),
  ...boxes.map((row, index) => normalizeSku(row, "boxes", index)),
  ...cupFans.map((row, index) => normalizeSku(row, "cup-fan", index)),
];

const catalog = {
  generatedAt: new Date().toISOString(),
  families: createFamilies(skus),
  skus,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(
  `Imported ${catalog.families.length} product families and ${catalog.skus.length} SKUs to ${outputPath}`,
);
