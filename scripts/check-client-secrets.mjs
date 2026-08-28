import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const sensitiveNames = /(?:RESEND_API_KEY|EMAIL_TO|INQUIRY_TO_EMAIL|CRON_SECRET|PRODUCT_REVALIDATE_SECRET|DATABASE_URL|IP_HASH_SECRET|UPSTASH_REDIS_REST_TOKEN|KV_REST_API_TOKEN|API_KEY|TOKEN|PASSWORD|CREDENTIAL)/u;

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) files.push(...walk(full));
    else if (entry.isFile() && /\.(?:ts|tsx)$/u.test(entry.name)) files.push(full);
  }
  return files;
}

for (const directory of [path.join(root, "src/app"), path.join(root, "src/components"), path.join(root, "src/lib")]) {
  for (const file of walk(directory)) {
    const content = fs.readFileSync(file, "utf8");
    const relative = path.relative(root, file);
    if (/['"]use client['"]/u.test(content) && /process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]+/u.test(content)) {
      errors.push(`${relative}: client module references a non-public environment variable`);
    }
    if (relative === "src/config/company-public.ts" && sensitiveNames.test(content)) {
      errors.push(`${relative}: public company config contains a sensitive variable name`);
    }
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, clientModulesChecked: "src/app, src/components, src/lib" }));
}
