#!/usr/bin/env node

/* Read-only Stage 3B-2B preflight. */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baseUrl = (process.env.STAGE_3B2B_BASE_URL || "http://localhost:3452").replace(/\/$/u, "");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.kehong.tech").replace(/\/$/u, "");
const outDir = path.join(root, "docs");
const map = JSON.parse(await fs.readFile(path.join(outDir, "stage-3b2a-canonical-candidate-map.json"), "utf8"));
const catalog = JSON.parse(await fs.readFile(path.join(root, "src/data/catalog.normalized.json"), "utf8"));
const records = catalog.skus;
const byId = new Map(records.map((record) => [record.id, record]));
const sourceRecords = map.records.map((candidate) => byId.get(candidate.sourceRecordId));
const targetId = "kh-fd-cupsheet-150350-pe-043";
const target = byId.get(targetId);
const sourceUrls = map.records.map((candidate) => candidate.sourceUrl);
const targetUrl = map.proposedTarget.url;
const familyUrls = ["en", "zh", "id", "vi", "th", "ms"].map((locale) => "/".concat(locale, "/products/families/paper-cup-materials"));

function htmlMeta(html) {
  const head = html.match(/<head[\s\S]*?<\/head>/iu)?.[0] || "";
  const canonical = [...head.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/giu)].map((m) => m[1]);
  const robots = head.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/iu)?.[1] || "";
  const alternates = [...head.matchAll(/<link[^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>/giu)].map((m) => ({ lang: m[1], href: m[2] }));
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => m[1].replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim());
  return { head, canonical, robots, alternates, h1s };
}

async function get(url) {
  const response = await fetch(baseUrl + url, { redirect: "manual" });
  return { response, html: await response.text() };
}

function baseMaterial(value) {
  return String(value || "").replace(/\s*(?:\+\s*(?:PE|PLA)\s*(?:淋膜|涂层|coating)|(?:PE|PLA)\s*(?:淋膜|涂层|coating))\s*$/giu, "").trim();
}

const sitemapResponse = await fetch(baseUrl + "/sitemap.xml");
const sitemapText = await sitemapResponse.text();
const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]);
const sitemapSet = new Set(sitemapUrls);
const targetResult = target ? await get(targetUrl) : { response: { status: 0, url: "" }, html: "" };
const sourceResults = await Promise.all(sourceUrls.map((url) => get(url)));
const familyResults = await Promise.all(familyUrls.map((url) => get(url)));
const targetMeta = htmlMeta(targetResult.html);
const targetAbsolute = new URL(targetUrl, siteUrl).toString();
const sourceStatuses = sourceResults.map(({ response, html }, index) => ({
  url: sourceUrls[index], status: response.status, finalUrl: response.url, meta: htmlMeta(html), record: sourceRecords[index],
}));
const familyStatuses = familyResults.map(({ response, html }, index) => ({
  url: familyUrls[index], status: response.status, finalUrl: response.url, meta: htmlMeta(html), html,
}));
const sourceInSitemap = sourceUrls.filter((url) => sitemapSet.has(new URL(url, siteUrl).toString()));
const targetInSitemap = sitemapSet.has(new URL(targetUrl, siteUrl).toString());
const familyInSitemap = familyUrls.filter((url) => sitemapSet.has(new URL(url, siteUrl).toString()));
const expectedSitemapBefore = 271;
const sitemapBaselineMatches = sitemapUrls.length === expectedSitemapBefore;
const activeHreflangs = new Set(["en", "zh", "id", "vi", "th", "ms", "x-default"]);
const targetPublished = Boolean(target && target.published && target.sourceStatus === "confirmed");
const sourceManualReview = sourceRecords.filter((record) => !record || record.sourceStatus !== "confirmed").length;
const duplicateKey = (record) => [record?.gsmOrThickness, record?.structureOrFlute, record?.surfaceProcess, record?.finishingProcess, record?.commonSize, record?.materialIds?.join("|")].join("|");
const duplicateGroups = [...sourceRecords.reduce((groups, record) => {
  const key = duplicateKey(record);
  const list = groups.get(key) || [];
  list.push(record?.id || "MISSING");
  groups.set(key, list);
  return groups;
}, new Map())].filter(([, ids]) => ids.length > 1).map(([key, ids]) => ({ key, ids }));
const materialConflicts = sourceRecords.filter((record) => baseMaterial(record?.material) !== baseMaterial(target?.material)).length;
const formConflicts = sourceRecords.filter((record) => record?.structureOrFlute !== target?.structureOrFlute).length;
const applicationConflicts = sourceRecords.filter((record) => record?.applications !== target?.applications).length;
const buyerIntentConflicts = sourceRecords.filter((record) => record?.canonicalGroupId !== target?.canonicalGroupId && record?.productType !== target?.productType).length;
const pe043 = {
  PE043_EXISTS: Boolean(target),
  PE043_HTTP_STATUS: targetResult.response.status,
  PE043_PUBLISHED: targetPublished,
  PE043_SELF_CANONICAL: targetMeta.canonical.length === 1 && targetMeta.canonical[0] === targetAbsolute,
  PE043_INDEXABLE: !/noindex/iu.test(targetMeta.robots),
  PE043_CURRENTLY_IN_SITEMAP: targetInSitemap,
  PE043_INCLUDED_IN_SOURCE_18: sourceUrls.includes(targetUrl),
  PE043_MANUAL_REVIEW: !target || target.sourceStatus !== "confirmed",
  PE043_MATERIAL_CONFLICT: materialConflicts > 0,
  PE043_FORM_CONFLICT: formConflicts > 0,
  PE043_APPLICATION_CONFLICT: applicationConflicts > 0,
  PE043_BUYER_INTENT_CONFLICT: buyerIntentConflicts > 0,
};
const sourceSummary = {
  APPROVED_SOURCE_URL_COUNT: sourceUrls.length,
  UNIQUE_SOURCE_URL_COUNT: new Set(sourceUrls).size,
  SOURCE_URLS_RETURNING_200: sourceStatuses.filter(({ status }) => status === 200).length,
  SOURCE_URLS_CURRENTLY_IN_SITEMAP: sourceInSitemap.length,
  SOURCE_URLS_SELF_CANONICAL_BEFORE: sourceStatuses.filter(({ meta, url }) => meta.canonical.length === 1 && meta.canonical[0] === new URL(url, siteUrl).toString()).length,
  SOURCE_URLS_NOINDEX_BEFORE: sourceStatuses.filter(({ meta }) => /noindex/iu.test(meta.robots)).length,
  SOURCE_URLS_REDIRECTING_BEFORE: sourceStatuses.filter(({ status }) => status >= 300 && status < 400).length,
  SOURCE_URLS_NON_ENGLISH: sourceStatuses.filter(({ url }) => !url.startsWith("/en/")).length,
  SOURCE_MATERIAL_CONFLICTS: materialConflicts,
  SOURCE_FORM_CONFLICTS: formConflicts,
  SOURCE_APPLICATION_CONFLICTS: applicationConflicts,
  SOURCE_BUYER_INTENT_CONFLICTS: buyerIntentConflicts,
  SOURCE_MANUAL_REVIEW_COUNT: sourceManualReview,
  SOURCE_PENDING_COUNT: sourceRecords.filter((record) => !record?.published).length,
  SOURCE_NOT_COVERED_BY_PE043: sourceRecords.filter((record) => !record || !target || baseMaterial(record.material) !== baseMaterial(target.material) || record.structureOrFlute !== target.structureOrFlute || record.applications !== target.applications).length,
};
const familySummary = {
  APPROVED_PAPER_CUP_FAMILY_URLS: familyUrls.length,
  PAPER_CUP_FAMILY_URLS_RETURNING_200: familyStatuses.filter(({ status }) => status === 200).length,
  PAPER_CUP_FAMILY_URLS_SELF_CANONICAL: familyStatuses.filter(({ meta, url }) => meta.canonical.length === 1 && meta.canonical[0] === new URL(url, siteUrl).toString()).length,
  PAPER_CUP_FAMILY_URLS_HREFLANG_PASS: familyStatuses.filter(({ meta }) => {
    const langs = new Set(meta.alternates.map(({ lang }) => lang));
    return [...activeHreflangs].every((lang) => langs.has(lang));
  }).length,
  PAPER_CUP_FAMILY_URLS_CURRENTLY_IN_SITEMAP: familyInSitemap.length,
  ARCHIVED_ES_FAMILY_URLS_APPROVED: 0,
};
const familyPass = familySummary.APPROVED_PAPER_CUP_FAMILY_URLS === 6
  && familySummary.PAPER_CUP_FAMILY_URLS_RETURNING_200 === 6
  && familySummary.PAPER_CUP_FAMILY_URLS_SELF_CANONICAL === 6
  && familySummary.PAPER_CUP_FAMILY_URLS_HREFLANG_PASS === 6
  && familySummary.PAPER_CUP_FAMILY_URLS_CURRENTLY_IN_SITEMAP === 0
  && familySummary.ARCHIVED_ES_FAMILY_URLS_APPROVED === 0;
const sourcePass = sourceSummary.APPROVED_SOURCE_URL_COUNT === 18
  && sourceSummary.UNIQUE_SOURCE_URL_COUNT === 18
  && sourceSummary.SOURCE_URLS_RETURNING_200 === 18
  && sourceSummary.SOURCE_URLS_CURRENTLY_IN_SITEMAP === 18
  && sourceSummary.SOURCE_URLS_SELF_CANONICAL_BEFORE === 18
  && sourceSummary.SOURCE_URLS_NOINDEX_BEFORE === 0
  && sourceSummary.SOURCE_URLS_REDIRECTING_BEFORE === 0
  && sourceSummary.SOURCE_URLS_NON_ENGLISH === 0
  && sourceSummary.SOURCE_MATERIAL_CONFLICTS === 0
  && sourceSummary.SOURCE_FORM_CONFLICTS === 0
  && sourceSummary.SOURCE_APPLICATION_CONFLICTS === 0
  && sourceSummary.SOURCE_BUYER_INTENT_CONFLICTS === 0
  && sourceSummary.SOURCE_MANUAL_REVIEW_COUNT === 0
  && sourceSummary.SOURCE_PENDING_COUNT === 0
  && sourceSummary.SOURCE_NOT_COVERED_BY_PE043 === 0
  && duplicateGroups.length === 0;
const pe043Pass = Object.entries(pe043).every(([key, value]) => key === "PE043_HTTP_STATUS" ? value === 200 : value === true);
const preflight = pe043Pass && sourcePass && familyPass ? "PASS_FULL" : familyPass ? "PASS_FAMILY_ONLY_CANONICAL_BLOCKED" : "BLOCKED";
const csvRows = [
  ["kind", "url", "recordId", "status", "canonical", "robots", "inSitemap", "selfCanonical", "indexable", "duplicateSpec", "conflict", "notes"],
  ["target", targetUrl, target?.id || "", String(targetResult.response.status), targetMeta.canonical[0] || "", targetMeta.robots || "default", String(targetInSitemap), String(pe043.PE043_SELF_CANONICAL), String(pe043.PE043_INDEXABLE), "false", String(!pe043Pass), duplicateGroups.length ? "duplicate source specification blocks full mode" : ""],
  ...sourceStatuses.map((entry) => ["source", entry.url, entry.record?.id || "", String(entry.status), entry.meta.canonical[0] || "", entry.meta.robots || "default", String(sitemapSet.has(new URL(entry.url, siteUrl).toString())), String(entry.meta.canonical.length === 1 && entry.meta.canonical[0] === new URL(entry.url, siteUrl).toString()), String(!/noindex/iu.test(entry.meta.robots)), String(duplicateGroups.some(({ ids }) => ids.includes(entry.record?.id))), String(!entry.record || !target || baseMaterial(entry.record.material) !== baseMaterial(target.material) || entry.record.structureOrFlute !== target.structureOrFlute || entry.record.applications !== target.applications), ""]),
  ...familyStatuses.map((entry) => ["family", entry.url, "", String(entry.status), entry.meta.canonical[0] || "", entry.meta.robots || "default", String(sitemapSet.has(new URL(entry.url, siteUrl).toString())), String(entry.meta.canonical.length === 1 && entry.meta.canonical[0] === new URL(entry.url, siteUrl).toString()), String(!/noindex/iu.test(entry.meta.robots)), "false", "false", entry.meta.h1s.length === 1 ? "" : "H1 count differs"]),
];
const csvEscape = (value) => '"' + String(value ?? "").replaceAll('"', '""') + '"';
await fs.writeFile(path.join(outDir, "stage-3b2b-preflight-candidate-status.csv"), csvRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
const lines = [
  "# Stage 3B-2B preflight",
  "",
  "BASE_URL=" + baseUrl,
  "SITE_URL=" + siteUrl,
  "SITEMAP_URL_COUNT=" + sitemapUrls.length,
  "EXPECTED_SITEMAP_BEFORE=" + expectedSitemapBefore,
  "SITEMAP_BASELINE_MATCHES=" + String(sitemapBaselineMatches).toLowerCase(),
  "FAMILY_ONLY_EXPECTED_AFTER=277",
  "FAMILY_ONLY_ACTUAL_AFTER=" + (sitemapUrls.length + 6),
  "DUPLICATE_SPEC_GROUPS=" + duplicateGroups.length,
  ...duplicateGroups.map(({ ids }) => "DUPLICATE_SPEC_RECORDS=" + ids.join("|")),
  ...Object.entries(pe043).map(([key, value]) => key + "=" + String(value).toLowerCase()),
  ...Object.entries(sourceSummary).map(([key, value]) => key + "=" + value),
  ...Object.entries(familySummary).map(([key, value]) => key + "=" + value),
  "STAGE_3B2B_PREFLIGHT=" + preflight,
  "",
  "## Blocking detail",
  "",
  duplicateGroups.length ? "The approved 18 source records contain an identical displayed specification combination. Full canonical implementation is blocked; no source canonical or source sitemap removal may be performed." : "No duplicate specification combinations detected.",
  "",
  "Family-only mode is permitted only when all six family URL gates pass.",
];
await fs.writeFile(path.join(outDir, "stage-3b2b-preflight.md"), lines.join("\n") + "\n");
console.log(lines.join("\n"));
process.exit(preflight === "BLOCKED" ? 1 : 0);
