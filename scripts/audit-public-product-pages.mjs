import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseArg = process.argv.find((arg) => arg.startsWith("--base-url="))?.slice("--base-url=".length);
const baseUrl = (baseArg || process.env.PRODUCT_AUDIT_BASE_URL || "https://www.kehong.tech").replace(/\/+$/u, "");
const canonicalBaseUrl = (process.env.PRODUCT_CANONICAL_URL || "https://www.kehong.tech").replace(/\/+$/u, "");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const products = catalog.skus.filter((sku) => sku.published === true && sku.sourceStatus === "confirmed" && sku.slug);
const oldDomain = /kehongpaper\.com/iu;
const cjk = /[\u3400-\u9fff]/u;
const concurrency = Math.max(1, Number.parseInt(process.env.PRODUCT_AUDIT_CONCURRENCY || "8", 10) || 8);

function attr(html, name) {
  const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, "iu"));
  return match?.[1] || "";
}

async function auditProduct(sku) {
  const url = `${baseUrl}/en/products/${sku.slug}`;
  const expectedCanonicalUrl = `${canonicalBaseUrl}/en/products/${sku.slug}`;
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: "follow", cache: "no-store", headers: { "user-agent": "KehongPublicProductAudit/1.0" } });
    const html = await response.text();
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu)?.[1] || "";
    const ogUrl = attr(html, "og:url");
    const h1Count = (html.match(/<h1\b/giu) || []).length;
    const failures = [];
    if (response.status !== 200) failures.push(`HTTP ${response.status}`);
    if (!/<title>[^<]+<\/title>/iu.test(html)) failures.push("title missing");
    if (!attr(html, "description")) failures.push("meta description missing");
    if (!canonical) failures.push("canonical missing");
    if (!/<meta[^>]+name=["']robots["'][^>]+content=/iu.test(html)) failures.push("robots meta missing");
    if (!/<html[^>]+lang=["']en["']/iu.test(html)) failures.push("html lang is not en");
    if (h1Count !== 1) failures.push(`H1 count ${h1Count}`);
    if (!ogUrl) failures.push("og:url missing");
    if (canonical !== expectedCanonicalUrl) failures.push(`canonical mismatch: ${canonical}`);
    if (ogUrl !== expectedCanonicalUrl) failures.push(`og:url mismatch: ${ogUrl}`);
    if (oldDomain.test(html)) failures.push("retired domain present");
    if (cjk.test(html)) failures.push("CJK text present in English HTML");
    if (/Follow Kehong|Quote information/iu.test(html)) failures.push("internal/legacy copy present");
    if (!/data-product-template-version=["']v2["']/iu.test(html)) failures.push("product template marker is not v2");
    if (!/href=["'][^"']*\/en\/contact(?:\?|["'])/iu.test(html)) failures.push("quote CTA does not target contact");
    const whatsapp = [...html.matchAll(/href=["'](https:\/\/wa\.me\/[^"']+)["']/giu)].map((match) => decodeURIComponent(match[1]));
    if (!whatsapp.some((href) => href.includes(sku.sku) && href.includes(expectedCanonicalUrl))) failures.push("WhatsApp link missing SKU/current URL");
    return {
      sku: sku.sku,
      slug: sku.slug,
      url,
      expectedCanonicalUrl,
      status: response.status,
      finalUrl: response.url,
      elapsedMs: Date.now() - started,
      templateVersion: html.match(/data-product-template-version=["']([^"']+)["']/iu)?.[1] || "",
      buildId: response.headers.get("x-kehong-build") || "",
      commitSha: response.headers.get("x-kehong-commit-sha") || "",
      productDataRevision: response.headers.get("x-kehong-product-data-revision") || "",
      failures,
    };
  } catch (error) {
    return { sku: sku.sku, slug: sku.slug, url, status: 0, finalUrl: "", elapsedMs: Date.now() - started, failures: [error instanceof Error ? error.message : "request failed"] };
  }
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < products.length) {
    const index = cursor++;
    results[index] = await auditProduct(products[index]);
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, products.length) }, worker));

const failures = results.filter((result) => result.failures.length > 0);
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  totalProducts: products.length,
  passedProducts: products.length - failures.length,
  failedProducts: failures.length,
  failures,
  sample: results.slice(0, 5),
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
