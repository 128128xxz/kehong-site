import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const oldDomain = new RegExp(["kehong", "paper.com"].join(""), "giu");
const ignoredDirectories = new Set(["node_modules", ".git", ".next", ".turbo"]);
const allowedSourceFiles = new Set([
  "src/proxy.ts",
  "scripts/site-health.mjs",
  "scripts/validate-sitemap.mjs",
  "scripts/audit-legacy-domain.mjs",
  "src/app/api/site-monitor/route.ts",
  "src/app/api/inquiry/route.ts",
  "tests/unit/inquiryRoute.test.ts",
  "tests/e2e/site.spec.ts",
]);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name) || entry.name.startsWith(".next")) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

function textMatches(file) {
  try {
    const value = fs.readFileSync(file, "utf8");
    return [...value.matchAll(oldDomain)].length;
  } catch {
    return 0;
  }
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

const allSourceFiles = walk(root).filter((file) => !file.includes(`${path.sep}.next${path.sep}`));
const publicCandidates = [
  ...walk(path.join(root, "public")),
  ...walk(path.join(root, ".next/server/app")),
  ...walk(path.join(root, "src/data")).filter((file) => file.endsWith(".json")),
  path.join(root, "src/app/robots.ts"),
  path.join(root, "src/app/sitemap.ts"),
  path.join(root, "src/lib/inquiryEmail.ts"),
  path.join(root, "src/components/site/InquiryForm.tsx"),
  path.join(root, "src/components/site/FloatingContactWidget.tsx"),
].filter((file) => fs.existsSync(file));

const publicFiles = [...new Set(publicCandidates)].filter((file) => {
  const rel = relative(file);
  if (rel.startsWith(".next/")) return /\.(?:html?|json|txt|xml)$/iu.test(rel);
  return true;
});
const publicOccurrences = publicFiles.reduce((total, file) => total + textMatches(file), 0);
const sourceMatches = allSourceFiles.flatMap((file) => {
  const count = textMatches(file);
  return count ? [{ file: relative(file), count, allowed: allowedSourceFiles.has(relative(file)) }] : [];
});
const allowedSourceOccurrences = sourceMatches.filter((match) => match.allowed).reduce((total, match) => total + match.count, 0);
const unexpectedSourceMatches = sourceMatches.filter((match) => !match.allowed);
const unexpectedSourceOccurrences = unexpectedSourceMatches.reduce((total, match) => total + match.count, 0);

console.log(`Public occurrences: ${publicOccurrences}`);
console.log(`Allowed source occurrences: ${allowedSourceOccurrences}`);
console.log(`Unexpected source occurrences: ${unexpectedSourceOccurrences}`);
if (unexpectedSourceMatches.length) console.log(JSON.stringify(unexpectedSourceMatches, null, 2));
if (publicOccurrences || unexpectedSourceOccurrences) process.exit(1);
