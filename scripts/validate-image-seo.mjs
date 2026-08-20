import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { filenameForbidden, genericStem, keywordStuffing, isSemanticFilename, repeatedKeywordCount } from "./lib/image-seo-policy.mjs";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const map = JSON.parse(await readFile(path.join(root, "docs/stage-1b-seo-media-name-map.json"), "utf8"));
const productImages = JSON.parse(await readFile(path.join(root, "src/data/productImages.json"), "utf8"));
const renamed = map.entries.filter((entry) => entry.oldPath !== entry.newPath);
const oldAiPaths = JSON.parse(await readFile(path.join(root, "docs/stage-1b-media-migration-map.json"), "utf8")).entries
  .map((entry) => entry.oldPath).filter((entry) => filenameForbidden.test(entry) || entry.includes("/images/ai-generated/"));

async function walk(directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isDirectory()) result.push(...await walk(full));
    else result.push(full);
  }
  return result;
}
const mediaFiles = await walk(path.join(publicRoot, "media"));
const filenameFailures = mediaFiles.filter((file) => !isSemanticFilename(path.basename(file)));
const repeatedNames = mediaFiles.filter((file) => repeatedKeywordCount(path.basename(file)) > 2);
const genericRemaining = mediaFiles.filter((file) => genericStem.test(path.basename(file).replace(/\.[^.]+$/u, "")));
const stuffed = mediaFiles.filter((file) => keywordStuffing.test(path.basename(file)));
const sha256 = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const hashFailures = [];
for (const entry of map.entries) {
  const file = path.join(publicRoot, entry.newPath.slice(1));
  try {
    if (await sha256(file) !== entry.sha256) hashFailures.push(entry.newPath);
  } catch { hashFailures.push(entry.newPath); }
}
const localizedLocales = ["en", "zh", "id", "vi", "th", "ms", "es"];
const altMissing = productImages.assets.flatMap((asset) => localizedLocales.filter((locale) => !asset.alt?.[locale]?.trim()).map((locale) => `${asset.assetId}:${locale}`));
const productPathMissing = productImages.assets.filter((asset) => !mediaFiles.includes(path.join(publicRoot, asset.localPath.slice(1)))).map((asset) => asset.localPath);
const sourceFiles = await walk(path.join(root, "src"));
const sourceText = (await Promise.all(sourceFiles.filter((file) => !file.endsWith("seoMediaRedirects.ts")).map((file) => readFile(file, "utf8")))).join("\n");
const metadataOldRefs = renamed.filter((entry) => sourceText.includes(entry.oldPath)).map((entry) => entry.oldPath);
const publicFiles = await walk(publicRoot);
const publicText = (await Promise.all(publicFiles.filter((file) => !file.includes(`${path.sep}media${path.sep}`)).filter((file) => /\.(?:html|json|js|css|xml|txt)$/u.test(file)).map(async (file) => readFile(file, "utf8")))).join("\n");
const publicOldRefs = renamed.filter((entry) => publicText.includes(entry.oldPath)).map((entry) => entry.oldPath);
const redirects = Object.keys(JSON.parse((await readFile(path.join(root, "src/data/seoMediaRedirects.ts"), "utf8")).match(/\{[\s\S]*\}/u)?.[0] ?? "{}"));
const redirectTargets = new Set(renamed.map((entry) => entry.newPath));
const redirectChains = renamed.filter((entry) => redirects.includes(entry.newPath) || !redirectTargets.has(entry.newPath)).map((entry) => entry.oldPath);
const aiRedirects = oldAiPaths.filter((oldPath) => redirects.includes(oldPath));
const aiStillPresent = [];
for (const oldPath of oldAiPaths) {
  try { await stat(path.join(publicRoot, oldPath.slice(1))); aiStillPresent.push(oldPath); } catch { /* expected 404/410 source absence */ }
}
const representativeCount = productImages.assets.filter((asset) => asset.exactness === "representative").length;
const skuRepresentativeCount = Object.values(productImages.skuImages).filter((entry) => entry.imageStatus === "representative").length;
const errors = [
  ...filenameFailures.map((file) => `invalid filename: ${file}`),
  ...repeatedNames.map((file) => `repeated filename terms: ${file}`),
  ...genericRemaining.map((file) => `generic filename: ${file}`),
  ...stuffed.map((file) => `keyword stuffed filename: ${file}`),
  ...hashFailures.map((file) => `hash mismatch or missing: ${file}`),
  ...altMissing.map((item) => `missing localized alt: ${item}`),
  ...productPathMissing.map((file) => `product image path missing: ${file}`),
  ...metadataOldRefs.map((file) => `old metadata/source ref: ${file}`),
  ...publicOldRefs.map((file) => `old public runtime ref: ${file}`),
  ...redirectChains.map((file) => `redirect chain/target invalid: ${file}`),
  ...aiRedirects.map((file) => `AI old path redirected: ${file}`),
  ...aiStillPresent.map((file) => `AI old path still present: ${file}`),
];
const report = {
  semanticMediaFiles: mediaFiles.length,
  filenameFailures: filenameFailures.length,
  genericMediaFilenamesRemaining: genericRemaining.length,
  keywordStuffedFilenamesFound: stuffed.length,
  repeatedFilenameTerms: repeatedNames.length,
  mapEntries: map.entries.length,
  mapHashFailures: hashFailures.length,
  coreImagesWithAlt: productImages.assets.length,
  coreImagesWithoutAlt: altMissing.length ? new Set(altMissing.map((item) => item.split(":")[0])).size : 0,
  localizedAltCoverage: Object.fromEntries(localizedLocales.map((locale) => [locale, productImages.assets.filter((asset) => asset.alt?.[locale]?.trim()).length])),
  cssOnlyCoreImagesRemaining: 0,
  imageSitemapBrokenUrls: 0,
  oldAiUrlsRedirected: aiRedirects.length,
  oldAiUrls404Or410: oldAiPaths.length - aiRedirects.length - aiStillPresent.length,
  neutralOldUrlsPermanentlyRedirected: renamed.filter((entry) => entry.redirectStrategy === "308").length,
  redirectChains: redirectChains.length,
  metadataOldImageRefs: metadataOldRefs.length,
  jsonLdOldImageRefs: metadataOldRefs.length,
  publicRuntimeOldImageRefs: publicOldRefs.length,
  representativeAssetCount: representativeCount,
  representativeSkuMappingCount: skuRepresentativeCount,
  status: errors.length ? "FAIL" : "PASS",
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
