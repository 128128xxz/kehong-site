import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { siteConfig } from "./lib/site-config";
import catalog from "./data/catalog.normalized.json";

const intlMiddleware = createMiddleware(routing);
const canonicalOrigin = siteConfig.url;
const canonicalHost = new URL(canonicalOrigin).hostname;
const apexHost = canonicalHost.replace(/^www\./iu, "");
const buildId = (
  process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.VERCEL_DEPLOYMENT_ID
  || process.env.NEXT_PUBLIC_BUILD_ID
  || "local"
).slice(0, 80);
const commitSha = (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 80);
const productDataRevision = String(catalog.generatedAt ?? "catalog-unknown");

function withDiagnostics(response: NextResponse) {
  response.headers.set("x-kehong-build", buildId);
  response.headers.set("x-kehong-commit-sha", commitSha);
  response.headers.set("x-kehong-product-data-revision", productDataRevision);
  response.headers.set("x-kehong-canonical-host", canonicalHost);
  return response;
}

export default function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();
  const isProductionHost = hostname === canonicalHost || hostname === apexHost;
  const needsCanonicalRedirect = isProductionHost && (
    hostname !== canonicalHost
    || request.nextUrl.protocol !== "https:"
    || request.nextUrl.pathname === "/"
  );
  const needsRootRedirect = request.nextUrl.pathname === "/";

  if (needsCanonicalRedirect || needsRootRedirect) {
    const pathname = needsRootRedirect ? "/en" : request.nextUrl.pathname;
    const url = isProductionHost ? new URL(pathname, canonicalOrigin) : request.nextUrl.clone();
    url.pathname = pathname;
    url.search = request.nextUrl.search;
    return withDiagnostics(NextResponse.redirect(url, 308));
  }

  return withDiagnostics(intlMiddleware(request));
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
