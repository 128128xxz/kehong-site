import { NextResponse } from "next/server";
import { getAllSkus } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let lastAlertKey = "";
let lastAlertAt = 0;

const monitorUserAgent = `KehongSiteMonitor/1.0 (+${siteConfig.url})`;
const legacyDomainPattern = /kehong(?:paper)\.com/iu;

function getMonitorPaths() {
  const firstSku = getAllSkus().find((sku) => sku.slug);
  return [
    "/en",
    "/en/products",
    "/en/contact",
    "/robots.txt",
    "/sitemap.xml",
    "/api/health",
    ...(firstSku ? [`/en/products/${firstSku.slug}`] : []),
  ];
}

async function readResponse(url: string) {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "user-agent": monitorUserAgent,
        accept: "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    const body = await response.text();
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      elapsedMs: Date.now() - startedAt,
      contentType: response.headers.get("content-type") ?? "",
      robots: response.headers.get("x-robots-tag") ?? "",
      body: body.slice(0, 2_000_000),
    };
  } catch (error) {
    return { url, status: 0, finalUrl: "", elapsedMs: Date.now() - startedAt, contentType: "", robots: "", body: "", error: error instanceof Error ? error.message : "request failed" };
  }
}

function inspectResponse(result: Awaited<ReturnType<typeof readResponse>>, pathname: string) {
  const failures: string[] = [];
  if (result.status !== 200) failures.push(`${pathname}: HTTP ${result.status}`);
  if (!result.body.trim()) failures.push(`${pathname}: empty response`);
  if (/cloudflare|captcha|just a moment|verify you are human|javascript challenge/i.test(result.body)) failures.push(`${pathname}: challenge/interstitial detected`);
  if (/internal server error|application error|deployment failed|build failed/i.test(result.body)) failures.push(`${pathname}: server error text detected`);
  if (legacyDomainPattern.test(result.body)) failures.push(`${pathname}: retired domain detected`);
  if (result.robots.toLowerCase().includes("noindex") && pathname.startsWith("/en")) failures.push(`${pathname}: unexpected X-Robots-Tag noindex`);
  if (pathname === "/robots.txt") {
    if (result.contentType.toLowerCase().includes("text/html")) failures.push("/robots.txt: returned HTML");
    if (!result.body.includes(`${siteConfig.url}/sitemap.xml`)) failures.push("/robots.txt: canonical sitemap missing");
  }
  if (pathname === "/sitemap.xml") {
    const locations = [...result.body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]);
    if (!result.contentType.toLowerCase().includes("xml")) failures.push("/sitemap.xml: non-XML Content-Type");
    if (locations.length === 0) failures.push("/sitemap.xml: no URLs found");
    if (locations.some((location) => !location.startsWith(`${siteConfig.url}/`) || location.includes("?") || legacyDomainPattern.test(location))) failures.push("/sitemap.xml: non-canonical URL found");
  }
  return failures;
}

async function sendAlert(failures: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SITE_MONITOR_ALERT_EMAIL ?? process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL ?? "info@kehong.tech";
  if (!apiKey || !to) return false;
  const alertKey = failures.join("\n");
  if (alertKey === lastAlertKey && Date.now() - lastAlertAt < 15 * 60 * 1000) return false;
  lastAlertKey = alertKey;
  lastAlertAt = Date.now();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Kehong production site health alert",
        text: `The Kehong production monitor detected a failure at ${new Date().toISOString()}.\n\n${alertKey}`,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const providedSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (providedSecret !== expectedSecret) return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ status: "monitor_not_configured" }, { status: 503 });
  }

  const results = await Promise.all(
    getMonitorPaths().map(async (pathname) => {
      const result = await readResponse(new URL(pathname, siteConfig.url).toString());
      return { pathname, result };
    }),
  );
  const failures = results.flatMap(({ pathname, result }) => inspectResponse(result, pathname));
  const alertSent = failures.length ? await sendAlert(failures) : false;
  return NextResponse.json(
    {
      status: failures.length ? "degraded" : "ok",
      checkedAt: new Date().toISOString(),
      failureCount: failures.length,
      alertSent,
      failures,
    },
    { status: failures.length ? 503 : 200, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
