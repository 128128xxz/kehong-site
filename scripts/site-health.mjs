import crypto from "node:crypto";
import dns from "node:dns/promises";
import fs from "node:fs";
import https from "node:https";
import http from "node:http";
import path from "node:path";
import tls from "node:tls";
import process from "node:process";

const DEFAULT_BASE_URL = "https://www.kehong.tech";
const OLD_DOMAINS = ["kehong" + "paper.com", "www." + "kehong" + "paper.com"];
const SERVER_ERROR_PATTERN = /(?:internal server error|application error|unexpected server error|build failed|deployment failed)/i;
const CHALLENGE_PATTERN = /(?:cloudflare|cf-chl-|just a moment|verify you are human|captcha|javascript challenge|attention required)/i;
const PAGE_PATHS = ["/", "/en", "/en/products", "/en/contact"];
const CRAWLER_PATHS = ["/", "/en", "/en/products", "/en/contact"];
const CRAWLER_UAS = {
  desktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
  mobile: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36",
  googlebot: "Googlebot/2.1 (+http://www.google.com/bot.html)",
  googlebotSmartphone: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  bingbot: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
};

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);
const catalogPath = path.join(projectRoot, "src", "data", "catalog.normalized.json");

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, ...rest] = arg.replace(/^--/, "").split("=");
      return [key, rest.length ? rest.join("=") : true];
    }),
  );
  if (args.help) {
    console.log("Usage: npm run site:health -- --base-url=https://www.kehong.tech [--json]");
    process.exit(0);
  }
  return args;
}

function normalizeUrl(value) {
  const url = new URL(value);
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  url.hash = "";
  return url.toString();
}

function displayStatus(status) {
  return Number.isFinite(status) ? String(status) : "n/a";
}

function contentType(headers) {
  const value = headers["content-type"];
  return Array.isArray(value) ? value.join(",") : String(value ?? "");
}

function headerValue(headers, name) {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(",") : String(value ?? "");
}

function requestUrl(urlString, { userAgent, method = "GET", maxBodyBytes = 2_000_000, maxRedirects = 8 } = {}) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const chain = [];
    const visited = new Set();

    function follow(currentUrl, redirectCount) {
      if (visited.has(currentUrl)) {
        resolve({ requestedUrl: urlString, finalUrl: currentUrl, status: undefined, headers: {}, body: "", chain, elapsedMs: Date.now() - startedAt, error: "redirect loop" });
        return;
      }
      visited.add(currentUrl);
      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch {
        resolve({ requestedUrl: urlString, finalUrl: currentUrl, status: undefined, headers: {}, body: "", chain, elapsedMs: Date.now() - startedAt, error: "invalid URL" });
        return;
      }

      const transport = parsed.protocol === "https:" ? https : http;
      const request = transport.request(
        parsed,
        {
          method,
          timeout: 20_000,
          rejectUnauthorized: true,
          headers: {
            "user-agent": userAgent,
            accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8",
            "accept-language": "en-US,en;q=0.8",
          },
        },
        (response) => {
          const headers = response.headers;
          const status = response.statusCode;
          const location = headerValue(headers, "location");
          chain.push({ url: currentUrl, status, location: location || undefined });
          const chunks = [];
          let received = 0;

          response.on("data", (chunk) => {
            if (method === "HEAD" || received >= maxBodyBytes) return;
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            const remaining = maxBodyBytes - received;
            chunks.push(buffer.subarray(0, remaining));
            received += Math.min(buffer.length, remaining);
          });
          response.on("error", (error) => {
            resolve({ requestedUrl: urlString, finalUrl: currentUrl, status, headers, body: Buffer.concat(chunks).toString("utf8"), chain, elapsedMs: Date.now() - startedAt, error: error.message });
          });
          response.on("end", () => {
            if (status >= 300 && status < 400 && location) {
              if (redirectCount >= maxRedirects) {
                resolve({ requestedUrl: urlString, finalUrl: currentUrl, status, headers, body: Buffer.concat(chunks).toString("utf8"), chain, elapsedMs: Date.now() - startedAt, error: "too many redirects" });
                return;
              }
              follow(new URL(location, currentUrl).toString(), redirectCount + 1);
              return;
            }
            resolve({ requestedUrl: urlString, finalUrl: currentUrl, status, headers, body: Buffer.concat(chunks).toString("utf8"), chain, elapsedMs: Date.now() - startedAt });
          });
        },
      );
      request.on("timeout", () => request.destroy(new Error("request timeout")));
      request.on("error", (error) => resolve({ requestedUrl: urlString, finalUrl: currentUrl, status: undefined, headers: {}, body: "", chain, elapsedMs: Date.now() - startedAt, error: error.message }));
      request.end();
    }

    follow(urlString, 0);
  });
}

async function resolveHost(hostname) {
  try {
    const lookup = dns.lookup(hostname, { all: true });
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("DNS lookup timeout")), 5_000));
    const records = await Promise.race([lookup, timeout]);
    return { hostname, addresses: records.map((record) => record.address) };
  } catch (error) {
    return { hostname, addresses: [], error: error.message };
  }
}

function certificateNames(certificate) {
  const names = [];
  if (certificate.subject?.CN) names.push(certificate.subject.CN);
  for (const value of String(certificate.subjectaltname ?? "").split(",")) {
    const name = value.trim().replace(/^DNS:/i, "");
    if (name) names.push(name);
  }
  return names;
}

function certificateCovers(names, hostname) {
  return names.some((name) => name.toLowerCase() === hostname.toLowerCase() || (name.startsWith("*.") && hostname.toLowerCase().endsWith(name.slice(1).toLowerCase())));
}

function inspectTls(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: hostname, port: 443, servername: hostname, rejectUnauthorized: true, timeout: 5_000 }, () => {
      const certificate = socket.getPeerCertificate(true);
      const names = certificateNames(certificate);
      const validFrom = certificate.valid_from ? Date.parse(certificate.valid_from) : NaN;
      const validTo = certificate.valid_to ? Date.parse(certificate.valid_to) : NaN;
      resolve({ hostname, ok: true, covered: certificateCovers(names, hostname), names, validFrom, validTo, daysRemaining: Number.isFinite(validTo) ? Math.floor((validTo - Date.now()) / 86_400_000) : null });
      socket.end();
    });
    socket.on("timeout", () => socket.destroy(new Error("TLS timeout")));
    socket.on("error", (error) => resolve({ hostname, ok: false, covered: false, names: [], validFrom: NaN, validTo: NaN, daysRemaining: null, error: error.message }));
  });
}

function extractMeta(html, name) {
  const attribute = "(?:name|property)";
  const pattern = new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${name}["'][^>]*\\bcontent=["']([^"']*)["'][^>]*>`, "i");
  const reversePattern = new RegExp(`<meta\\b[^>]*\\bcontent=["']([^"']*)["'][^>]*\\b${attribute}=["']${name}["'][^>]*>`, "i");
  return pattern.exec(html)?.[1]?.trim() || reversePattern.exec(html)?.[1]?.trim() || "";
}

function extractLink(html, rel) {
  const pattern = new RegExp(`<link\\b[^>]*\\brel=["']${rel}["'][^>]*\\bhref=["']([^"']+)["'][^>]*>`, "i");
  const reversePattern = new RegExp(`<link\\b[^>]*\\bhref=["']([^"']+)["'][^>]*\\brel=["']${rel}["'][^>]*>`, "i");
  return pattern.exec(html)?.[1]?.trim() || reversePattern.exec(html)?.[1]?.trim() || "";
}

function extractTag(html, tag) {
  return new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(html)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
}

function coreSignature(html) {
  const value = [extractTag(html, "title"), extractTag(html, "h1"), html.match(/<main\b[\s\S]{0,5000}/i)?.[0] ?? ""].join("|").replace(/\s+/g, " ").slice(0, 5000);
  return crypto.createHash("sha256").update(value).digest("hex");
}

function recordFailure(failures, result, check, details) {
  failures.push({
    url: result?.requestedUrl ?? details?.url ?? "n/a",
    status: displayStatus(result?.status),
    finalUrl: result?.finalUrl ?? "n/a",
    check,
    details: String(details?.message ?? details ?? result?.error ?? "failed"),
  });
}

function checkPageResult(result, { expectedLang = "en", expectedCanonical = null, checkSeo = true } = {}, failures) {
  if (result.error) recordFailure(failures, result, "request", result.error);
  if (result.status !== 200) recordFailure(failures, result, "http status", `expected 200, got ${displayStatus(result.status)}`);
  if (!result.body.trim()) recordFailure(failures, result, "non-empty HTML", "response body is empty");
  if (!/^https:\/\//i.test(result.finalUrl)) recordFailure(failures, result, "HTTPS final URL", "final URL is not HTTPS");
  if (result.body && CHALLENGE_PATTERN.test(result.body)) recordFailure(failures, result, "challenge/interstitial", "response looks like a bot challenge or CAPTCHA page");
  if (result.body && SERVER_ERROR_PATTERN.test(result.body)) recordFailure(failures, result, "server error text", "response contains a server error marker");
  if (result.body && OLD_DOMAINS.some((domain) => result.body.toLowerCase().includes(domain))) recordFailure(failures, result, "old domain absent", "response contains the retired domain");
  if (normalizeUrl(result.finalUrl) !== normalizeUrl(expectedCanonical ?? result.finalUrl)) recordFailure(failures, result, "final URL", `expected ${expectedCanonical ?? "canonical final URL"}`);
  if (contentType(result.headers) && !contentType(result.headers).toLowerCase().includes("text/html")) recordFailure(failures, result, "Content-Type", `expected text/html, got ${contentType(result.headers)}`);
  if (!checkSeo) return;

  const canonical = extractLink(result.body, "canonical");
  const canonicalUrl = canonical ? new URL(canonical, result.finalUrl).toString() : "";
  if (!canonicalUrl) recordFailure(failures, result, "canonical", "canonical link is missing");
  else if (normalizeUrl(canonicalUrl) !== normalizeUrl(expectedCanonical ?? result.finalUrl)) recordFailure(failures, result, "canonical", `expected ${expectedCanonical ?? result.finalUrl}`);
  const robotsMeta = extractMeta(result.body, "robots").toLowerCase();
  if (robotsMeta.includes("noindex")) recordFailure(failures, result, "robots meta", "public page contains noindex");
  const xRobots = headerValue(result.headers, "x-robots-tag").toLowerCase();
  if (xRobots.includes("noindex")) recordFailure(failures, result, "X-Robots-Tag", "public page response contains noindex");
  const lang = /<html\b[^>]*\blang=["']([^"']+)["']/i.exec(result.body)?.[1]?.toLowerCase();
  if (lang !== expectedLang) recordFailure(failures, result, "html lang", `expected ${expectedLang}, got ${lang || "missing"}`);
  if (!extractTag(result.body, "title")) recordFailure(failures, result, "title", "title is missing");
  if (!extractMeta(result.body, "description")) recordFailure(failures, result, "meta description", "description is missing");
  if (!extractTag(result.body, "h1")) recordFailure(failures, result, "H1", "H1 is missing");
  const ogUrl = extractMeta(result.body, "og:url") || extractMeta(result.body, "og:url");
  if (ogUrl && normalizeUrl(new URL(ogUrl, result.finalUrl).toString()) !== normalizeUrl(expectedCanonical ?? result.finalUrl)) recordFailure(failures, result, "Open Graph URL", `expected ${expectedCanonical ?? result.finalUrl}`);
  if (!ogUrl) recordFailure(failures, result, "Open Graph URL", "og:url is missing");
}

async function mapConcurrent(items, limit, worker) {
  const results = [];
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function pickProductPaths() {
  try {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    const skus = Array.isArray(catalog.skus)
      ? catalog.skus.filter((sku) => sku?.slug && sku.published === true && sku.sourceStatus !== "pending")
      : [];
    const count = Math.min(10, skus.length);
    return Array.from({ length: count }, (_, index) => {
      const pseudoRandom = Math.abs(Math.sin((index + 1) * 97.137));
      const sku = skus[Math.floor(pseudoRandom * skus.length)];
      return `/en/products/${sku.slug}`;
    });
  } catch {
    return [];
  }
}

async function main() {
  const args = parseArgs();
  const baseUrl = String(args["base-url"] || process.env.SITE_HEALTH_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    console.error(JSON.stringify({ ok: false, failures: [{ url: baseUrl, status: "n/a", finalUrl: "n/a", check: "base URL", details: "invalid base URL" }] }, null, 2));
    process.exitCode = 1;
    return;
  }
  const mainOrigin = `${base.protocol}//${base.host}`;
  const failures = [];
  const checks = [];

  for (const hostname of new Set([base.hostname, "kehong.tech", "www.kehong.tech"])) {
    const dnsResult = await resolveHost(hostname);
    checks.push({ type: "dns", ...dnsResult });
    if (dnsResult.error || dnsResult.addresses.length === 0) failures.push({ url: `dns://${hostname}`, status: "n/a", finalUrl: "n/a", check: "DNS resolution", details: dnsResult.error || "no addresses returned" });
    const tlsResult = await inspectTls(hostname);
    checks.push({ type: "tls", ...tlsResult, names: tlsResult.names });
    if (!tlsResult.ok) failures.push({ url: `https://${hostname}/`, status: "n/a", finalUrl: "n/a", check: "TLS connection", details: tlsResult.error || "TLS connection failed" });
    else {
      if (!tlsResult.covered) failures.push({ url: `https://${hostname}/`, status: "n/a", finalUrl: "n/a", check: "TLS certificate hostname", details: "certificate does not cover the requested hostname" });
      if (tlsResult.daysRemaining !== null && tlsResult.daysRemaining < 14) failures.push({ url: `https://${hostname}/`, status: "n/a", finalUrl: "n/a", check: "TLS certificate expiry", details: `certificate expires in ${tlsResult.daysRemaining} days` });
    }
  }

  const httpRoot = await requestUrl(`http://${base.hostname}/`, { userAgent: CRAWLER_UAS.desktop, maxBodyBytes: 50_000 });
  checks.push({ type: "http-redirect", result: httpRoot });
  if (httpRoot.status !== 200 || !/^https:\/\//i.test(httpRoot.finalUrl)) recordFailure(failures, httpRoot, "HTTP to HTTPS redirect", "HTTP root must finish on HTTPS with a 200 response");
  if (base.hostname === "www.kehong.tech") {
    const apex = await requestUrl("https://kehong.tech/", { userAgent: CRAWLER_UAS.desktop, maxBodyBytes: 50_000 });
    checks.push({ type: "apex-redirect", result: apex });
    const apexFinal = apex.finalUrl ? new URL(apex.finalUrl) : null;
    const apexRedirectedToMain = apex.chain.some((entry) => {
      try {
        return new URL(entry.url).hostname === "kehong.tech" && entry.status >= 300 && entry.status < 400;
      } catch {
        return false;
      }
    });
    if (apex.status !== 200 || !apexFinal || apexFinal.protocol !== "https:" || apexFinal.hostname !== "www.kehong.tech" || !apexRedirectedToMain) {
      recordFailure(failures, apex, "apex to www redirect", "apex must redirect once to the canonical www host and resolve successfully");
    }
  }

  const regularResults = new Map();
  const pageResults = await Promise.all(PAGE_PATHS.map(async (pathname) => {
    const result = await requestUrl(new URL(pathname, `${baseUrl}/`).toString(), { userAgent: CRAWLER_UAS.desktop });
    return { pathname, result };
  }));
  for (const { pathname, result } of pageResults) {
    regularResults.set(pathname, result);
    const expectedCanonical = pathname === "/" ? null : normalizeUrl(new URL(pathname, `${mainOrigin}/`).toString());
    checkPageResult(result, { expectedCanonical }, failures);
    checks.push({ type: "page", path: pathname, status: result.status, finalUrl: result.finalUrl, elapsedMs: result.elapsedMs, chain: result.chain });
  }

  const productPaths = pickProductPaths();
  const productResults = await mapConcurrent(productPaths, 8, async (pathname) => ({ pathname, result: await requestUrl(new URL(pathname, `${baseUrl}/`).toString(), { userAgent: CRAWLER_UAS.desktop }) }));
  for (const { pathname, result } of productResults) {
    const expectedCanonical = normalizeUrl(new URL(pathname, `${mainOrigin}/`).toString());
    checkPageResult(result, { expectedCanonical }, failures);
    checks.push({ type: "product", path: pathname, status: result.status, finalUrl: result.finalUrl, elapsedMs: result.elapsedMs, chain: result.chain });
  }

  const crawlerTasks = Object.entries(CRAWLER_UAS).flatMap(([agentName, userAgent]) => CRAWLER_PATHS.map((pathname) => ({ agentName, userAgent, pathname })));
  const crawlerResults = await mapConcurrent(crawlerTasks, 12, async (task) => ({ ...task, result: await requestUrl(new URL(task.pathname, `${baseUrl}/`).toString(), { userAgent: task.userAgent }) }));
  for (const { agentName, pathname, result } of crawlerResults) {
    const expectedCanonical = pathname === "/" ? null : normalizeUrl(new URL(pathname, `${mainOrigin}/`).toString());
    checkPageResult(result, { expectedCanonical }, failures);
    const reference = regularResults.get(pathname);
    if (reference?.status === 200 && result.status === 200 && coreSignature(reference.body) !== coreSignature(result.body)) recordFailure(failures, result, "crawler content parity", `content signature differs from the desktop response for ${agentName}`);
    checks.push({ type: "crawler", agent: agentName, path: pathname, status: result.status, finalUrl: result.finalUrl, elapsedMs: result.elapsedMs, chain: result.chain });
  }

  const robotsResult = await requestUrl(new URL("/robots.txt", `${baseUrl}/`).toString(), { userAgent: CRAWLER_UAS.googlebot, maxBodyBytes: 100_000 });
  checks.push({ type: "robots", status: robotsResult.status, finalUrl: robotsResult.finalUrl, elapsedMs: robotsResult.elapsedMs, chain: robotsResult.chain });
  if (robotsResult.status !== 200) recordFailure(failures, robotsResult, "robots.txt status", "expected HTTP 200");
  if (contentType(robotsResult.headers).toLowerCase().includes("text/html")) recordFailure(failures, robotsResult, "robots.txt Content-Type", "robots.txt must not return HTML");
  if (/^\s*Disallow:\s*\/\s*$/im.test(robotsResult.body)) recordFailure(failures, robotsResult, "robots.txt Disallow", "robots.txt unexpectedly disallows the entire site");
  if (!robotsResult.body.includes(`${mainOrigin}/sitemap.xml`)) recordFailure(failures, robotsResult, "robots.txt Sitemap", "robots.txt does not reference the canonical sitemap");
  if (OLD_DOMAINS.some((domain) => robotsResult.body.toLowerCase().includes(domain))) recordFailure(failures, robotsResult, "robots.txt old domain", "robots.txt contains a retired domain");

  const sitemapResult = await requestUrl(new URL("/sitemap.xml", `${baseUrl}/`).toString(), { userAgent: CRAWLER_UAS.googlebot, maxBodyBytes: 12_000_000 });
  checks.push({ type: "sitemap", status: sitemapResult.status, finalUrl: sitemapResult.finalUrl, elapsedMs: sitemapResult.elapsedMs, chain: sitemapResult.chain });
  if (sitemapResult.status !== 200) recordFailure(failures, sitemapResult, "sitemap.xml status", "expected HTTP 200");
  if (!contentType(sitemapResult.headers).toLowerCase().includes("xml")) recordFailure(failures, sitemapResult, "sitemap.xml Content-Type", `expected XML, got ${contentType(sitemapResult.headers) || "missing"}`);
  const sitemapLocs = [...sitemapResult.body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
  if (sitemapLocs.length === 0) recordFailure(failures, sitemapResult, "sitemap.xml URLs", "no <loc> entries found");
  const locSeen = new Set();
  for (const loc of sitemapLocs) {
    let parsed;
    try {
      parsed = new URL(loc);
    } catch {
      recordFailure(failures, sitemapResult, "sitemap URL syntax", "sitemap contains an invalid URL");
      continue;
    }
    if (parsed.protocol !== "https:" || parsed.origin !== mainOrigin || parsed.search || parsed.hash || OLD_DOMAINS.includes(parsed.hostname)) recordFailure(failures, { ...sitemapResult, requestedUrl: loc }, "sitemap URL canonicality", "sitemap URL is not a canonical HTTPS URL without query parameters");
    if (locSeen.has(normalizeUrl(loc))) recordFailure(failures, { ...sitemapResult, requestedUrl: loc }, "sitemap duplicate", "sitemap contains a duplicate URL");
    locSeen.add(normalizeUrl(loc));
  }
  const sitemapIsUsable = sitemapResult.status === 200
    && normalizeUrl(sitemapResult.finalUrl) === normalizeUrl(sitemapResult.requestedUrl)
    && contentType(sitemapResult.headers).toLowerCase().includes("xml");
  const sitemapUrlChecks = sitemapIsUsable
    ? await mapConcurrent(sitemapLocs, 20, async (loc) => {
        const result = await requestUrl(loc, { userAgent: CRAWLER_UAS.googlebot, method: "HEAD", maxBodyBytes: 10_000 });
        if (result.status === 405 || result.status === 403) return requestUrl(loc, { userAgent: CRAWLER_UAS.googlebot, method: "GET", maxBodyBytes: 20_000 });
        return result;
      })
    : [];
  sitemapUrlChecks.forEach((result) => {
    if (result.status !== 200) recordFailure(failures, result, "sitemap URL status", "every sitemap URL must return HTTP 200");
    if (normalizeUrl(result.finalUrl) !== normalizeUrl(result.requestedUrl)) recordFailure(failures, result, "sitemap URL redirect", "sitemap URLs must not redirect");
  });

  const healthResult = await requestUrl(new URL("/api/health", `${baseUrl}/`).toString(), { userAgent: CRAWLER_UAS.desktop, maxBodyBytes: 100_000 });
  checks.push({ type: "health-api", status: healthResult.status, finalUrl: healthResult.finalUrl, elapsedMs: healthResult.elapsedMs, chain: healthResult.chain });
  if (healthResult.status !== 200) recordFailure(failures, healthResult, "health API status", "expected HTTP 200");
  try {
    const healthJson = JSON.parse(healthResult.body);
    if (healthJson.status !== "ok" || typeof healthJson.timestamp !== "string") recordFailure(failures, healthResult, "health API payload", "health API must return a non-sensitive ok payload");
  } catch {
    recordFailure(failures, healthResult, "health API JSON", "health API did not return valid JSON");
  }

  const report = {
    ok: failures.length === 0,
    baseUrl,
    checkedAt: new Date().toISOString(),
    dns: checks.filter((check) => check.type === "dns"),
    tls: checks.filter((check) => check.type === "tls").map(({ type, hostname, ok, covered, names, daysRemaining }) => ({ type, hostname, ok, covered, names, daysRemaining })),
    checks: checks.filter((check) => !["dns", "tls"].includes(check.type)),
    failures,
  };
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Site health: ${report.ok ? "PASS" : "FAIL"}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Checked at: ${report.checkedAt}`);
    console.log(`Sitemap URLs checked: ${sitemapLocs.length}`);
    if (failures.length) {
      console.log("Failures:");
      for (const failure of failures) console.log(`- ${failure.check} | status=${failure.status} | url=${failure.url} | final=${failure.finalUrl} | ${failure.details}`);
    }
  }
  process.exitCode = report.ok ? 0 : 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, failures: [{ url: "n/a", status: "n/a", finalUrl: "n/a", check: "site health runner", details: error.message }] }, null, 2));
  process.exitCode = 1;
});
