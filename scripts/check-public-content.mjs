import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const roots = [
  path.join(root, "src/app/[locale]"),
  path.join(root, "src/components/site"),
  path.join(root, "src/content/news"),
  path.join(root, "src/lib/legalContent.ts"),
  path.join(root, "src/config/company-public.ts"),
];
const activeDictionaries = ["en", "zh", "id", "vi", "th", "ms"].map((locale) => path.join(root, "dictionary", `${locale}.json`));
const forbidden = [
  /\b(?:TODO|TBD|FIXME)\b/iu,
  /lorem ipsum/iu,
  /subject to confirmation/iu,
  /remain(?:s)? subject to confirmation/iu,
  /should be confirmed before publication of a final legal version/iu,
  /need(?:s)? to be confirmed before publication/iu,
  /正式发布最终法律版本前应进一步确认/u,
  /正式的数据控制者信息和服务商条款仍需确认/u,
  /(?:仍需确认|仍需要确认|需要进一步确认)$/u,
  /example\.com/iu,
  /your company name here/iu,
];
const suspiciousPublicAsset = /(?:^|[/\\])(?:11\s+ai|ai-specialty)(?:[/\\]|["')?])/iu;

function filesAt(target) {
  if (!fs.existsSync(target)) return [];
  if (fs.statSync(target).isFile()) return [target];
  const files = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...filesAt(full));
    else if (/\.(?:json|ts|tsx)$/u.test(entry.name)) files.push(full);
  }
  return files;
}

const files = [...new Set([...roots.flatMap(filesAt), ...activeDictionaries])];
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  for (const pattern of forbidden) {
    if (pattern.test(content)) errors.push(`${relative}: public content contains ${pattern}`);
  }
  if (suspiciousPublicAsset.test(content)) errors.push(`${relative}: suspicious legacy public asset reference`);
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, filesChecked: files.length }));
}
