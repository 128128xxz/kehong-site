import path from "node:path";
import { defaultManifestPath, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION, SITE_URL, readManifest, timestamp, writeJson } from "./lib.mjs";

const args = process.argv.slice(2);
const manifestPath = args.includes("--manifest") ? path.resolve(args[args.indexOf("--manifest") + 1]) : process.env.SEARCH_URL_MANIFEST || defaultManifestPath();
const dryRun = args.includes("--dry-run") || !args.includes("--send");
const manifest = readManifest(manifestPath);
const urls = manifest.urls.map((item) => item.url);
const reportDir = process.env.SEARCH_REPORT_DIR || path.join(process.cwd(), "reports", "search-submission-runs");
const result = { timestamp: new Date().toISOString(), commit: manifest.head_ref, production_deployment: process.env.PRODUCTION_DEPLOYMENT || null, platform: "indexnow", key_location: INDEXNOW_KEY_LOCATION, url_count: urls.length, dry_run: dryRun, status: "NO_CHANGES", response_category: "none", records: [] };

if (urls.length === 0) result.status = "NO_CHANGES";
else if (dryRun) { result.status = "DRY_RUN"; result.response_category = "not_sent"; result.records = manifest.urls.map((item) => ({ timestamp: result.timestamp, commit: manifest.head_ref, production_deployment: result.production_deployment, canonical_url: item.url, change_type: item.change_type, indexnow_status: "NOT_SENT", baidu_status: "NOT_ATTEMPTED", http_status: item.http_status, response_category: "dry_run" })); }
else {
  let response;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ host: new URL(SITE_URL).hostname, key: INDEXNOW_KEY, keyLocation: INDEXNOW_KEY_LOCATION, urlList: urls }) });
    if (response.status !== 429 || attempt === 3) break;
    await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
  }
  result.status = response.ok ? "SUBMITTED" : response.status === 429 ? "RATE_LIMITED" : "FAILED";
  result.response_category = response.ok ? "accepted" : response.status === 429 ? "rate_limited" : response.status >= 400 && response.status < 500 ? "client_error" : "server_error";
  result.http_status = response.status;
  result.records = manifest.urls.map((item) => ({ timestamp: result.timestamp, commit: manifest.head_ref, production_deployment: result.production_deployment, canonical_url: item.url, change_type: item.change_type, indexnow_status: result.status, baidu_status: "NOT_ATTEMPTED", http_status: item.http_status, response_category: result.response_category }));
  if (!response.ok) process.exitCode = 1;
}
writeJson(path.join(reportDir, `indexnow-${timestamp()}.json`), result);
writeJson(path.join(reportDir, "indexnow-latest.json"), result);
console.log(JSON.stringify({ status: result.status, url_count: result.url_count, response_category: result.response_category }));
