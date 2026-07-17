import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidatesPath = path.join(root, "work/product-image-candidates.json");
const productImagesPath = path.join(root, "src/data/productImages.json");

function readJson(file) {
  if (!fs.existsSync(file)) {
    console.error(`Missing file: ${file}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function countBy(items, pick) {
  const counts = new Map();
  for (const item of items) {
    const key = pick(item) || "";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

const candidateDoc = readJson(candidatesPath);
const productImages = readJson(productImagesPath);
const candidates = candidateDoc.candidates || [];
const productionAssets = productImages.assets || [];

let errors = 0;
let warnings = 0;

function warn(message) {
  warnings += 1;
  console.warn(message);
}

function error(message) {
  errors += 1;
  console.error(message);
}

const requiredFields = [
  "candidateId",
  "targetSku",
  "targetSkus",
  "targetGroupId",
  "targetProductType",
  "candidateSourcePageUrl",
  "sourceOwner",
  "licenseOrPermission",
  "permissionStatus",
  "exactnessAssessment",
  "recommendedAction",
];

for (const candidate of candidates) {
  const isKehongFollowUp =
    candidate.sourceOwner === "Kehong / user follow-up required" ||
    candidate.recommendedAction === "request-kehong-owned-photo";

  for (const field of requiredFields) {
    if (field === "candidateSourcePageUrl" && isKehongFollowUp) continue;
    if (!candidate[field] || (Array.isArray(candidate[field]) && candidate[field].length === 0)) {
      warn(`Candidate ${candidate.candidateId || "<missing-id>"} missing ${field}`);
    }
  }

  if (candidate.permissionStatus === "approved") {
    if (!candidate.candidateDirectImageUrl) {
      error(`Approved candidate ${candidate.candidateId} has no direct image URL.`);
    }
    if (candidate.licenseOrPermission === "unknown") {
      error(`Approved candidate ${candidate.candidateId} still has unknown license.`);
    }
  }

  if (candidate.exactnessAssessment === "exact" && candidate.permissionStatus !== "approved") {
    warn(`Candidate ${candidate.candidateId} is visually exact but not approved; keep it research-only.`);
  }

  if (candidate.permissionStatus !== "approved" && candidate.recommendedAction === "use-production") {
    error(`Candidate ${candidate.candidateId} recommends production use without approved permission.`);
  }
}

const productionSourceUrls = new Set(
  productionAssets.map((asset) => asset.sourcePageUrl).filter((url) => typeof url === "string" && !url.startsWith("local://")),
);

for (const candidate of candidates) {
  if (productionSourceUrls.has(candidate.candidateSourcePageUrl) && candidate.permissionStatus !== "approved") {
    error(`Production asset appears to use pending candidate source: ${candidate.candidateId}`);
  }
}

const productionReady = candidates.filter(
  (candidate) =>
    candidate.permissionStatus === "approved" &&
    candidate.exactnessAssessment === "exact" &&
    Boolean(candidate.candidateDirectImageUrl),
);

if (productionReady.length === 0) {
  warn("No candidate image is production-ready. This is safe, but exact SKU image sourcing is still incomplete.");
}

const summary = {
  checkedAt: new Date().toISOString(),
  totalCandidates: candidates.length,
  productionReadyCandidates: productionReady.length,
  permissionStatus: countBy(candidates, (candidate) => candidate.permissionStatus),
  exactnessAssessment: countBy(candidates, (candidate) => candidate.exactnessAssessment),
  recommendedAction: countBy(candidates, (candidate) => candidate.recommendedAction),
  sourceOwner: countBy(candidates, (candidate) => candidate.sourceOwner),
  errors,
  warnings,
};

fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/candidate_image_audit_latest.json"), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));

console.log(`${errors} errors, ${warnings} warnings.`);
if (errors) process.exit(1);
