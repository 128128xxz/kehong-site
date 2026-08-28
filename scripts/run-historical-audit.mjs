import { spawnSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const checks = [
  ["unit", ["run", "test:historical-audit"]],
  ["e2e", ["run", "test:e2e:historical-audit"]],
  ["image migration", ["run", "validate:image-migration-audit"]],
  ["sitemap exact diff", ["run", "validate:sitemap-historical-audit"]],
];
let failed = false;
let missingFixture = false;

for (const [name, args] of checks) {
  console.log(`\n=== HISTORICAL AUDIT: ${name} ===`);
  const result = spawnSync(pnpm, args, { encoding: "utf8", env: process.env });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    failed = true;
    if (/ENOENT|MISSING HISTORICAL FIXTURE|prechange-backup|stage-1b-media-migration-map|stage-3b3-sitemap-exact-diff/u.test(output)) {
      missingFixture = true;
    }
  }
}

if (missingFixture) {
  console.error("\nHISTORICAL_AUDIT_STATUS=BLOCKED BY MISSING HISTORICAL FIXTURE");
  process.exit(2);
}
if (failed) {
  console.error("\nHISTORICAL_AUDIT_STATUS=FAIL");
  process.exit(1);
}
console.log("\nHISTORICAL_AUDIT_STATUS=PASS");
