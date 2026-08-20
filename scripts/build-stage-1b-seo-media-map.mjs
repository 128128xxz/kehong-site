import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const docsRoot = path.join(root, "docs");
const previousMap = JSON.parse(await readFile(path.join(docsRoot, "stage-1b-media-migration-map.json"), "utf8"));
const currentPaths = previousMap.entries.map((entry) => entry.newPath).sort();
const locales = "en,zh,id,vi,th,ms";

const semanticOverrides = {
  "/media/brand/kehong-apple-touch-icon-v2.png": "/media/brand/kehong-apple-touch-icon-180.png",
  "/media/brand/kehong-favicon-v2.ico": "/media/brand/kehong-favicon.ico",
  "/media/brand/kehong-logo-full-transparent.png": "/media/brand/kehong-full-logo-transparent.png",
  "/media/brand/kehong-logo-full-transparent.webp": "/media/brand/kehong-full-logo-transparent.webp",
  "/media/brand/kehong-mark-16.png": "/media/brand/kehong-brand-mark-16.png",
  "/media/brand/kehong-mark-32.png": "/media/brand/kehong-brand-mark-32.png",
  "/media/brand/kehong-mark-48.png": "/media/brand/kehong-brand-mark-48.png",
  "/media/brand/kehong-mark-64.png": "/media/brand/kehong-brand-mark-64.png",
  "/media/brand/kehong-mark-180.png": "/media/brand/kehong-brand-mark-180.png",
  "/media/brand/kehong-mark-192.png": "/media/brand/kehong-brand-mark-192.png",
  "/media/brand/kehong-mark-512.png": "/media/brand/kehong-brand-mark-512.png",
  "/media/brand/kehong-mark-transparent.png": "/media/brand/kehong-brand-mark-transparent.png",
  "/media/brand/kehong-mark-transparent.webp": "/media/brand/kehong-brand-mark-transparent.webp",
  "/media/brand/kehong-official-logo-reference.png": "/media/brand/kehong-official-logo-reference.png",
  "/media/brand/kehong-official-logo.png": "/media/brand/kehong-official-logo.png",
  "/media/brand/kehong-pwa-icon-v2-192.png": "/media/brand/kehong-pwa-icon-192.png",
  "/media/brand/kehong-pwa-icon-v2-512.png": "/media/brand/kehong-pwa-icon-512.png",
  "/media/brand/kehong-tab-icon-v2-16.png": "/media/brand/kehong-tab-icon-16.png",
  "/media/brand/kehong-tab-icon-v2-32.png": "/media/brand/kehong-tab-icon-32.png",
  "/media/brand/kehong-tab-icon-v2-48.png": "/media/brand/kehong-tab-icon-48.png",
  "/media/brand/kehong-tab-icon-v2-64.png": "/media/brand/kehong-tab-icon-64.png",
  "/media/applications/studio-pizza-preview-reference.png": "/media/applications/pizza-box-structure-preview-reference.png",
  "/media/applications/studio-pizza-preview-reference.webp": "/media/applications/pizza-box-structure-preview-reference.webp",
  "/media/applications/factory-paper-worktable-reference.jpg": "/media/applications/paper-converting-worktable-reference.jpg",
  "/media/applications/paper-cups-reference.jpg": "/media/applications/paper-cup-application-reference.jpg",
  "/media/applications/paper-cup-stacks-reference.jpg": "/media/applications/paper-cup-stack-reference.jpg",
  "/media/applications/corrugated-cardboard-sheet-reference.jpg": "/media/applications/corrugated-board-sheet-application-reference.jpg",
  "/media/applications/white-paper-box-reference.jpg": "/media/applications/white-paper-box-application-reference.jpg",
  "/media/factory/automatic-feeder-line.png": "/media/factory/paper-converting-feeder-line-01.png",
  "/media/factory/automatic-feeder-line.webp": "/media/factory/paper-converting-feeder-line-01.webp",
  "/media/factory/booth-interior-01.jpg": "/media/factory/factory-showroom-interior-01.jpg",
  "/media/factory/booth-interior-02.jpg": "/media/factory/factory-showroom-interior-02.jpg",
  "/media/factory/exhibition-booth-wide.png": "/media/factory/factory-exhibition-booth-reference.png",
  "/media/factory/exhibition-booth-wide.webp": "/media/factory/factory-exhibition-booth-reference.webp",
  "/media/factory/exhibition-team.png": "/media/factory/paper-converting-team-reference.png",
  "/media/factory/exhibition-team.webp": "/media/factory/paper-converting-team-reference.webp",
  "/media/factory/factory-samples-floor.jpg": "/media/factory/paper-sample-floor-reference.jpg",
  "/media/factory/factory.png": "/media/factory/paper-converting-factory-reference.png",
  "/media/factory/factory.webp": "/media/factory/paper-converting-factory-reference.webp",
  "/media/factory/precision-machine-closeup.png": "/media/factory/paper-converting-machine-detail.png",
  "/media/factory/precision-machine-closeup.webp": "/media/factory/paper-converting-machine-detail.webp",
  "/media/factory/textile-line.jpg": "/media/factory/paper-converting-line-reference.jpg",
  "/media/materials/category-corrugated-fluted-paper-reference.webp": "/media/products/corrugated-board/corrugated-board-material-reference-01.webp",
  "/media/materials/category-kraft-corrugated-v2-reference.webp": "/media/products/corrugated-board/corrugated-board-material-reference-02.webp",
  "/media/materials/category-kraft-paper-roll-sheet-reference.webp": "/media/products/paper-materials/kraft-paper-roll-sheet-reference-01.webp",
  "/media/materials/category-paper-cup-fan-reference.webp": "/media/products/paper-cup-materials/paper-cup-fan-product-reference-01.webp",
  "/media/materials/category-paper-insert-pad-v2-reference.webp": "/media/products/paper-inserts/paper-insert-tray-reference-02.webp",
  "/media/materials/category-paper-insert-reference.webp": "/media/products/paper-inserts/paper-insert-tray-reference-01.webp",
  "/media/materials/category-paper-pad-reference.webp": "/media/products/cake-boards/paper-pad-reference-01.webp",
  "/media/materials/category-pe-coated-paper-roll-reference.webp": "/media/products/paper-cup-materials/pe-coated-paper-roll-concept-reference-01.webp",
  "/media/materials/category-pe-coated-paper-sheet-reference.webp": "/media/products/paper-cup-materials/pe-coated-paper-sheet-concept-reference-01.webp",
  "/media/materials/category-specialty-paper-reference.webp": "/media/products/specialty-paper/specialty-paper-material-reference-01.webp",
  "/media/materials/category-paper-cup-fan-v2-reference.webp": "/media/products/paper-cup-materials/paper-cup-fan-product-reference-02.webp",
  "/media/materials/color-material-swatch-portal.webp": "/media/materials/paper-color-swatch-portal.webp",
  "/media/materials/color-material-swatch-q68.avif": "/media/materials/paper-color-swatch-detail-01.avif",
  "/media/materials/color-material-swatch-q68.webp": "/media/materials/paper-color-swatch-detail-01.webp",
  "/media/materials/color-material-swatch.png": "/media/materials/paper-color-swatch-01.png",
  "/media/materials/color-material-swatch.webp": "/media/materials/paper-color-swatch-01.webp",
  "/media/materials/color-paper-fan.jpg": "/media/materials/colored-paper-cup-fan-reference.jpg",
  "/media/materials/cup-bottom-rolls-reference.jpg": "/media/products/paper-cup-materials/paper-cup-bottom-roll-reference-01.jpg",
  "/media/materials/cup-fan-blanks-reference.jpg": "/media/products/paper-cup-materials/paper-cup-fan-product-reference-03.jpg",
  "/media/materials/diecut-sheets-reference.jpg": "/media/materials/paper-die-cut-sheet-reference.jpg",
  "/media/materials/flute-macro-reference.jpg": "/media/products/corrugated-board/corrugated-board-surface-detail-reference.jpg",
  "/media/materials/flute-types-reference.jpg": "/media/products/corrugated-board/corrugated-board-cross-section-reference-01.jpg",
  "/media/materials/gold-board-pieces.jpg": "/media/materials/gold-metallic-cardstock-pieces.jpg",
  "/media/materials/gold-board-sheets.jpg": "/media/materials/gold-metallic-cardstock-sheets.jpg",
  "/media/materials/gold-board-stack.png": "/media/materials/gold-metallic-cardstock-stack.png",
  "/media/materials/gold-board-stack.webp": "/media/materials/gold-metallic-cardstock-stack.webp",
  "/media/materials/honeycomb-paper-roll.png": "/media/materials/honeycomb-paper-roll-reference.png",
  "/media/materials/honeycomb-paper-roll.webp": "/media/materials/honeycomb-paper-roll-reference.webp",
  "/media/materials/kraft-cupstock-reference.jpg": "/media/products/paper-cup-materials/cupstock-paper-product-reference-01.jpg",
  "/media/materials/paper-insert-reference.jpg": "/media/products/paper-inserts/paper-insert-tray-reference-03.jpg",
  "/media/materials/pe-coated-roll-reference.jpg": "/media/products/paper-cup-materials/pe-coated-paper-roll-reference-01.jpg",
  "/media/materials/representative-hero-materials-reference.png": "/media/materials/paper-materials-reference.png",
  "/media/materials/representative-inserts-reference.png": "/media/materials/paper-insert-structures-reference.png",
  "/media/materials/representative-material-samples-reference.png": "/media/materials/paper-material-samples-reference.png",
  "/media/materials/representative-material-warehouse-reference.png": "/media/materials/paper-material-warehouse-reference.png",
  "/media/materials/specialty-papers-reference.jpg": "/media/products/specialty-paper/specialty-paper-sheet-reference-01.jpg",
  "/media/materials/structure-material-real.jpg": "/media/materials/packaging-structure-material-reference.jpg",
  "/media/packaging/bakery-dessert-display.jpg": "/media/packaging/bakery-dessert-display-reference.jpg",
  "/media/packaging/cake-board-real-02.jpg": "/media/products/cake-boards/cake-board-reference-02.jpg",
  "/media/packaging/cake-board-real.jpg": "/media/products/cake-boards/cake-board-reference-01.jpg",
  "/media/packaging/custom-box-display-open.png": "/media/packaging/custom-paper-box-display-open.png",
  "/media/packaging/custom-box-display-open.webp": "/media/packaging/custom-paper-box-display-open.webp",
  "/media/packaging/custom-box-display-wide.png": "/media/packaging/custom-paper-box-display-wide.png",
  "/media/packaging/custom-box-display-wide.webp": "/media/packaging/custom-paper-box-display-wide.webp",
  "/media/packaging/easel-white-box.jpg": "/media/packaging/white-paper-box-display-reference.jpg",
  "/media/packaging/food-box-real-01.jpg": "/media/products/food-packaging/food-packaging-box-reference-01.jpg",
  "/media/packaging/food-box-real-02.jpg": "/media/products/food-packaging/food-packaging-box-reference-02.jpg",
  "/media/packaging/food-paper-box-detail.png": "/media/packaging/food-packaging-box-detail.png",
  "/media/packaging/food-paper-box-detail.webp": "/media/packaging/food-packaging-box-detail.webp",
  "/media/packaging/food-paper-box-open.png": "/media/packaging/food-packaging-box-open.png",
  "/media/packaging/food-paper-box-open.webp": "/media/packaging/food-packaging-box-open.webp",
  "/media/packaging/kraft-boxes-gold-logo.jpg": "/media/packaging/kraft-paper-boxes-gold-logo-reference.jpg",
  "/media/packaging/kraft-cartons-pallet.jpg": "/media/packaging/kraft-cartons-pallet-reference.jpg",
  "/media/packaging/kraft-cartons-tall.jpg": "/media/packaging/kraft-cartons-tall-reference.jpg",
  "/media/packaging/packaging-family-reference.jpg": "/media/packaging/paper-packaging-family-reference.jpg",
  "/media/packaging/pink-structural-box.png": "/media/products/paper-box/paper-box-structure-reference-01.png",
  "/media/packaging/pink-structural-box.webp": "/media/products/paper-box/paper-box-structure-reference-01.webp",
  "/media/packaging/rehn-cake-boards-styled.jpg": "/media/packaging/cake-board-display-reference.jpg",
  "/media/packaging/representative-bakery-packaging-reference.png": "/media/packaging/bakery-packaging-structure-reference.png",
  "/media/packaging/representative-box-range-reference.png": "/media/packaging/paper-box-range-reference.png",
  "/media/packaging/representative-die-cutting-reference.png": "/media/packaging/paper-die-cutting-reference.png",
  "/media/packaging/representative-hero-structure-reference.png": "/media/packaging/packaging-structure-reference.png",
  "/media/packaging/representative-protective-structures-reference.png": "/media/packaging/protective-paper-structures-reference.png",
  "/media/packaging/representative-slitting-reference.png": "/media/packaging/paper-slitting-reference.png",
  "/media/packaging/retail-shelf-display.jpg": "/media/packaging/retail-display-packaging-reference.jpg",
  "/media/packaging/sample-room-boxes.png": "/media/packaging/packaging-sample-room-reference.png",
  "/media/packaging/sample-room-boxes.webp": "/media/packaging/packaging-sample-room-reference.webp",
  "/media/resources/og-backdrop-reference.jpg": "/media/resources/paper-packaging-social-share-reference.jpg",
  "/media/shared/3d-preview-reference-pizza-box-open-v1.png": "/media/shared/pizza-box-structure-preview-reference.png",
  "/media/shared/kehong-process-reference.png": "/media/shared/paper-converting-process-reference.png",
  "/media/shared/kehong-process-reference.webp": "/media/shared/paper-converting-process-reference.webp",
  "/media/shared/kehong-products-reference.png": "/media/shared/paper-materials-packaging-reference.png",
  "/media/shared/kehong-products-reference.webp": "/media/shared/paper-materials-packaging-reference.webp",
};

const genericOnly = /^(?:image|img|picture|photo|product|material|sample|main|banner|hero|new-image|final-image|final-final|untitled|copy|generated|asset|uuid)(?:-\d+)?$/iu;
const forbidden = /(?:ai-generated|generated-by-ai|generated_with_ai|chatgpt|gpt|ai-representative|uuid)/iu;

function targetPath(currentPath) {
  if (semanticOverrides[currentPath]) return semanticOverrides[currentPath];
  const extension = path.extname(currentPath).toLowerCase();
  const stem = path.basename(currentPath, extension).replace(/-reference$/u, "");
  const category = currentPath.split("/")[2] || "shared";
  if (category === "applications") return `/media/applications/${stem}-reference${extension}`;
  if (category === "resources") return `/media/resources/${stem}-reference${extension}`;
  if (category === "materials") return `/media/materials/${stem}-reference${extension}`;
  if (category === "packaging") return `/media/packaging/${stem}-reference${extension}`;
  if (category === "factory") return `/media/factory/${stem}-reference${extension}`;
  return currentPath;
}

function keywordFromPath(newPath) {
  return path.basename(newPath, path.extname(newPath)).replace(/-(?:reference|main|detail|open|wide|01|02|03)$/gu, "").replace(/-\d+$/u, "");
}

function roleFor(entry) {
  if (entry.newPath.includes("/brand/")) return "brand asset";
  if (entry.newPath.includes("textures/")) return "decorative material texture";
  if (entry.newPath.includes("/factory/")) return "factory or converting reference";
  if (entry.newPath.includes("/resources/")) return "resource cover";
  if (entry.newPath.includes("/applications/")) return "application reference";
  if (entry.newPath.includes("/products/")) return "product reference";
  if (entry.newPath.includes("/packaging/")) return "packaging reference";
  return "shared reference";
}

function altFor(keyword, locale, representative = true) {
  const words = keyword.split("-").filter(Boolean);
  const subject = words.join(" ");
  if (locale === "zh") return `${subject} 代表图`;
  if (locale === "id") return `Referensi ${subject}`;
  if (locale === "vi") return `Hình ảnh tham khảo ${subject}`;
  if (locale === "th") return `ภาพอ้างอิง ${subject}`;
  if (locale === "ms") return `Imej rujukan ${subject}`;
  if (locale === "es") return `Imagen de referencia de ${subject}`;
  return representative ? `Representative ${subject} reference image` : `${subject} image`;
}

const sha256 = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const entries = [];
for (const oldPath of currentPaths) {
  const newPath = targetPath(oldPath);
  const absolute = path.join(publicRoot, oldPath.slice(1));
  const fileStat = await stat(absolute);
  const keyword = keywordFromPath(newPath);
  const role = roleFor({ newPath });
  const isBrand = newPath.includes("/brand/");
  const isDecorative = newPath.includes("/textures/") || isBrand;
  entries.push({
    oldPath,
    newPath,
    landingPage: isBrand || isDecorative ? "" : newPath.includes("/factory/") ? "/en/factory" : newPath.includes("/resources/") ? "/en/resources" : newPath.includes("/applications/") ? "/en/solutions" : "/en/products",
    localeUsage: isBrand ? "" : locales,
    productGroup: newPath.includes("/products/") ? keyword : "",
    canonicalKeyword: keyword,
    secondaryDescriptor: role,
    imageRole: role,
    altKey: `media.${keyword}`,
    altEn: isDecorative ? "" : altFor(keyword, "en", true),
    altZh: isDecorative ? "" : altFor(keyword, "zh", true),
    isRepresentative: !isBrand && !isDecorative,
    isExact: false,
    isTemporaryReuse: false,
    redirectStrategy: forbidden.test(oldPath) ? "404" : oldPath === newPath ? "none" : "308",
    redirectStatus: forbidden.test(oldPath) ? 404 : oldPath === newPath ? 200 : 308,
    indexInImageSitemap: !isBrand && !isDecorative && !oldPath.includes("wechat-qr"),
    sha256Verified: true,
    manualReviewRequired: !isBrand && !isDecorative,
    sha256: await sha256(absolute),
    fileSize: fileStat.size,
    notes: isBrand ? "Brand/utility asset; excluded from image sitemap." : "SEO name is descriptive but remains a representative reference, not exact SKU photography.",
  });
}

const targets = new Map();
for (const entry of entries) {
  const list = targets.get(entry.newPath) ?? [];
  list.push(entry.oldPath);
  targets.set(entry.newPath, list);
}
const duplicateTargets = [...targets.entries()].filter(([, values]) => values.length > 1);
const invalid = entries.filter((entry) => {
  const basename = path.basename(entry.newPath, path.extname(entry.newPath));
  return forbidden.test(entry.newPath) || genericOnly.test(basename) || basename.length > 90 || /--/u.test(entry.newPath) || !/^\/media\/[a-z0-9./-]+$/u.test(entry.newPath);
});
const keywordStuffed = entries.filter((entry) => entry.canonicalKeyword.split("-").length > 8 || /(manufacturer|supplier|wholesale|china|oem|odm|best|premium|cheap|price|exporter|certified)/iu.test(entry.newPath));
const keywordMap = [
  ["corrugated board", "corrugated-board", ["fluted paper", "corrugated paper sheet"], ["b-flute", "e-flute", "f-flute", "g-flute"], ["corrugated-fluted-paper"], true],
  ["paper cup fan", "paper-cup-fan", ["cupstock component", "fan blank"], ["cupstock-cup-material"], ["paper-cup-fan"], true],
  ["cupstock paper", "cupstock-paper", ["paper cup material"], ["food-grade", "certified"], ["paper-cup-fan"], true],
  ["PE coated paper", "pe-coated-paper", ["coated paper roll", "coated paper sheet"], ["FDA-approved", "food-safe-certified"], ["paper-cup-fan"], true],
  ["paper cup bottom roll", "paper-cup-bottom-roll", ["cup bottom roll"], ["cupstock"], ["paper-cup-fan"], true],
  ["specialty paper", "specialty-paper", ["metallic cardstock", "colored specialty paper"], ["perfume-test-paper"], ["specialty-paper"], true],
  ["metallic cardstock", "metallic-cardstock", ["gold metallic cardstock", "silver metallic cardstock"], ["premium"], ["specialty-paper"], true],
  ["paper insert", "paper-insert", ["protective paper insert", "paper tray"], ["customer-project"], ["paper-insert"], true],
  ["food packaging", "food-packaging", ["takeaway paper box", "bakery packaging"], ["food-safe-certified", "customer-case"], ["food-packaging-box"], true],
  ["cake board", "cake-board", ["cake drum", "paper pad"], ["fixed-load"], ["paper-pad"], true],
  ["paper converting", "paper-converting", ["paper slitting", "paper die-cutting"], ["advanced-production-line"], [], true],
  ["packaging structure", "packaging-structure", ["custom paper packaging"], ["customer-project", "successful-case"], ["paper-box"], true],
  ["paper bag", "paper-bag", ["kraft paper bag", "retail carry bag"], ["export-shipment"], ["kraft-paper"], true],
  ["protective paper structure", "protective-paper-structure", ["paper insert", "divider"], ["fixed-load"], ["paper-insert"], true],
].map(([category, canonicalTerm, approvedSynonyms, disallowedOrAmbiguousTerms, applicableProductGroups, confirmedByExistingData]) => ({ category, canonicalTerm, approvedSynonyms, disallowedOrAmbiguousTerms, applicableProductGroups, confirmedByExistingData }));

await writeFile(path.join(docsRoot, "stage-1b-seo-media-keyword-map.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), entries: keywordMap }, null, 2)}\n`);
await writeFile(path.join(docsRoot, "stage-1b-seo-media-keyword-map.md"), `# Stage 1B SEO media keyword map\n\nGenerated: ${new Date().toISOString()}\n\nThis controlled dictionary uses only product and page terminology already present in the catalog and page copy. It does not assert search volume. Canonical terms are eligible for filenames; synonyms are for contextual alt or future copy only.\n\n${keywordMap.map((entry) => `- **${entry.canonicalTerm}** — approved synonyms: ${entry.approvedSynonyms.join(", ")}; applicable groups: ${entry.applicableProductGroups.join(", ") || "shared"}; confirmed: ${entry.confirmedByExistingData ? "yes" : "no"}`).join("\n")}\n\nDisallowed or ambiguous terms remain owner-review only and are not used to infer specifications, certifications, customer cases, or factory claims.\n`);

const columns = ["oldPath", "newPath", "landingPage", "localeUsage", "productGroup", "canonicalKeyword", "secondaryDescriptor", "imageRole", "altKey", "altEn", "altZh", "isRepresentative", "isExact", "isTemporaryReuse", "redirectStrategy", "redirectStatus", "indexInImageSitemap", "sha256Verified", "manualReviewRequired", "notes"];
const csvEscape = (value) => { const text = Array.isArray(value) ? value.join(" | ") : value == null ? "" : String(value); return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const csv = [columns.join(","), ...entries.map((entry) => columns.map((column) => csvEscape(entry[column])).join(","))].join("\n") + "\n";
await writeFile(path.join(docsRoot, "stage-1b-seo-media-name-map.csv"), csv);
await writeFile(path.join(docsRoot, "stage-1b-seo-media-name-map.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), entries, preflight: { duplicateTargets, invalidCount: invalid.length, keywordStuffedCount: keywordStuffed.length } }, null, 2)}\n`);

console.log(JSON.stringify({ currentEntries: entries.length, renamed: entries.filter((entry) => entry.oldPath !== entry.newPath).length, duplicateTargets: duplicateTargets.length, invalid: invalid.length, keywordStuffed: keywordStuffed.length }, null, 2));
if (duplicateTargets.length || invalid.length || keywordStuffed.length) process.exitCode = 2;
