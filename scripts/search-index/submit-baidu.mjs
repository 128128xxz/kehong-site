import path from "node:path";
import { defaultManifestPath, SITE_URL, readManifest, timestamp, writeJson } from "./lib.mjs";

const args = process.argv.slice(2);
const manifestPath = args.includes("--manifest") ? path.resolve(args[args.indexOf("--manifest") + 1]) : process.env.SEARCH_URL_MANIFEST || defaultManifestPath();
const send = args.includes("--send") && process.env.BAIDU_PUSH_TOKEN;
const manifest = readManifest(manifestPath);
const urls = manifest.urls.filter((item) => item.change_type !== "deleted").map((item) => item.url);
const result = { timestamp: new Date().toISOString(), commit: manifest.head_ref, production_deployment: process.env.PRODUCTION_DEPLOYMENT || null, platform: "baidu", url_count: urls.length, status: "SKIPPED_TOKEN_MISSING", response_category: "not_configured" };
if (send && urls.length) {
  const site = process.env.BAIDU_SITE_URL || SITE_URL;
  const endpoint = `https://data.zz.baidu.com/urls?site=${encodeURIComponent(site)}&token=${encodeURIComponent(process.env.BAIDU_PUSH_TOKEN)}`;
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain" }, body: `${urls.join("\n")}\n` });
  result.status = response.ok ? "SUBMITTED" : "FAILED";
  result.response_category = response.ok ? "accepted" : response.status === 429 ? "rate_limited" : response.status >= 400 && response.status < 500 ? "client_error" : "server_error";
  result.http_status = response.status;
  if (!response.ok) process.exitCode = 1;
}
writeJson(path.join(process.env.SEARCH_REPORT_DIR || path.join(process.cwd(), "reports", "search-submission-runs"), `baidu-${timestamp()}.json`), result);
writeJson(path.join(process.env.SEARCH_REPORT_DIR || path.join(process.cwd(), "reports", "search-submission-runs"), "baidu-latest.json"), result);
console.log(JSON.stringify({ status: result.status, url_count: result.url_count, response_category: result.response_category }));
