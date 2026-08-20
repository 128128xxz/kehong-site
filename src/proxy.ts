import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { locales } from "./i18n/locales";
import { siteConfig } from "./lib/site-config";
import catalog from "./data/catalog.normalized.json";
import { getRootLocale } from "./lib/localeRouting";
import { seoMediaRedirects } from "./data/seoMediaRedirects";

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
// Spanish remains retired because no reviewed Spanish buyer-facing bundle is
// published. Indonesian, Vietnamese, Thai and Malay are active locales.
const retiredPublicLocales = new Set(["es"]);
const activePackagingSlugs = new Set([
  "paper-bags",
  "takeout-boxes",
  "cake-boxes",
  "cake-boards-cake-drums",
  "corrugated-mailer-boxes",
]);
const retiredPackagingSlugs = new Set(["labels-stickers"]);
const staticRoutePaths = new Set([
  "",
  "products",
  "industries",
  "industries/bakery-packaging",
  "industries/retail-lifestyle",
  "industries/ecommerce-industrial-professional",
  "capabilities",
  "resources",
  "news",
  "contact",
  "paper-cup-fan-manufacturer",
  "paper-packaging-supplier",
  "custom-paper-products",
  "factory",
  "process",
  "procurement",
  "privacy",
  "terms",
  "solutions",
  "model-preview",
  "packaging",
]);
const resourceSlugs = new Set([
  "artwork-guidelines",
  "materials-guide",
  "finishes-guide",
  "dielines-templates",
  "packaging-selection-guide",
  "proofing-samples",
]);
const newsSlugs = new Set([
  "paper-cup-fans-coated-rolls-sheets-difference",
  "takeout-box-quotation-six-details",
  "corrugated-mailer-dimensions-board-inserts",
  "paper-bag-quotation-paper-handles-printing-quantity",
  "cake-boxes-boards-drums-match",
  "artwork-to-dielines-packaging-sampling",
]);
const publicProductSlugs = new Set([
  ...catalog.skus.filter((sku) => sku.published && sku.sourceStatus === "confirmed").map((sku) => sku.slug),
  ...catalog.groups.map((group) => group.slug),
]);

function withDiagnostics(response: NextResponse) {
  response.headers.set("x-kehong-build", buildId);
  response.headers.set("x-kehong-build-sha", buildId);
  response.headers.set("x-kehong-commit-sha", commitSha);
  response.headers.set("x-kehong-product-data-revision", productDataRevision);
  response.headers.set("x-kehong-data-revision", productDataRevision);
  response.headers.set("x-kehong-canonical-host", canonicalHost);
  return response;
}

function getRetiredLocaleDestination(pathname: string) {
  const [, locale, ...segments] = pathname.split("/");
  if (!retiredPublicLocales.has(locale)) return null;

  const routePath = segments.join("/").replace(/\/$/u, "");
  if (staticRoutePaths.has(routePath)) return `/en${routePath ? `/${routePath}` : ""}`;

  const [section, slug] = segments;
  if (section === "packaging") {
    return slug && activePackagingSlugs.has(slug) && segments.length === 2
      ? `/en/packaging/${slug}`
      : "/en/packaging";
  }
  if (section === "products") {
    return slug && publicProductSlugs.has(slug) && segments.length === 2
      ? `/en/products/${slug}`
      : "/en/products";
  }
  if (section === "resources") {
    return slug && resourceSlugs.has(slug) && segments.length === 2
      ? `/en/resources/${slug}`
      : "/en/resources";
  }
  if (section === "news") {
    return slug && newsSlugs.has(slug) && segments.length === 2 ? `/en/news/${slug}` : "/en/news";
  }
  if (section === "industries") return "/en/industries";

  return "/en";
}

export default function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();
  const isProductionHost = hostname === canonicalHost || hostname === apexHost;
  const mediaRedirect = seoMediaRedirects[request.nextUrl.pathname];

  // Semantic media renames preserve neutral legacy URLs with one direct 308.
  // AI/GPT-marked historical paths are intentionally absent from this map and
  // therefore fall through to the static asset handler as 404/410.
  if (mediaRedirect) {
    const url = isProductionHost ? new URL(mediaRedirect, canonicalOrigin) : request.nextUrl.clone();
    url.pathname = mediaRedirect;
    return withDiagnostics(NextResponse.redirect(url, 308));
  }
  if (request.nextUrl.pathname.startsWith("/media/")) {
    return withDiagnostics(NextResponse.next());
  }
  const retiredLocaleDestination = getRetiredLocaleDestination(request.nextUrl.pathname);
  const localePattern = locales.join("|");
  const legacyAllProducts = request.nextUrl.pathname.match(new RegExp(`^/(${localePattern}|es)/packaging/all-products/?$`, "u"));
  const retiredPackagingRoute = request.nextUrl.pathname.match(new RegExp(`^/(${localePattern})/packaging/([^/]+)/?$`, "u"));

  // Retired public locales are permanently consolidated into an active English
  // route. Valid routes keep their path; unsupported legacy paths use the
  // closest live parent so a withdrawn page cannot become a soft 404.
  if (retiredLocaleDestination) {
    const url = isProductionHost ? new URL(retiredLocaleDestination, canonicalOrigin) : request.nextUrl.clone();
    url.pathname = retiredLocaleDestination;
    url.search = request.nextUrl.search;
    return withDiagnostics(NextResponse.redirect(url, 308));
  }

  // Labels & Stickers is not a Kehong public offering. Keep previously shared
  // URLs useful without retaining a page, metadata, or inquiry prefill for it.
  if (retiredPackagingRoute && retiredPackagingSlugs.has(retiredPackagingRoute[2])) {
    const locale = retiredPackagingRoute[1];
    const url = isProductionHost ? new URL(`/${locale}/packaging`, canonicalOrigin) : request.nextUrl.clone();
    url.pathname = `/${locale}/packaging`;
    url.search = request.nextUrl.search;
    return withDiagnostics(NextResponse.redirect(url, 308));
  }

  // This redirect belongs at the edge, rather than in the statically generated
  // packaging route, so the original query string is preserved without making
  // an otherwise static category route fail with DYNAMIC_SERVER_USAGE.
  if (legacyAllProducts) {
    const locale = legacyAllProducts[1];
    const url = isProductionHost ? new URL(`/${locale}/products`, canonicalOrigin) : request.nextUrl.clone();
    url.pathname = `/${locale}/products`;
    url.search = request.nextUrl.search;
    return withDiagnostics(NextResponse.redirect(url, 308));
  }

  const needsCanonicalRedirect = isProductionHost && (
    hostname !== canonicalHost
    || request.nextUrl.protocol !== "https:"
  );
  const needsRootRedirect = request.nextUrl.pathname === "/";

  if (needsRootRedirect) {
    // Keep an explicit language choice when the browser or a legacy link
    // returns to the unprefixed root. next-intl writes NEXT_LOCALE, while the
    // site switcher also writes kehong_locale; either cookie must outrank
    // mainland geo/browser-language detection.
    const localeCookie = request.cookies.get("kehong_locale")?.value
      ?? request.cookies.get("NEXT_LOCALE")?.value;
    const locale = getRootLocale({
      cookieLocale: localeCookie,
      country: request.headers.get("x-vercel-ip-country"),
      acceptLanguage: request.headers.get("accept-language"),
    });
    const pathname = `/${locale}`;
    const url = isProductionHost ? new URL(pathname, canonicalOrigin) : request.nextUrl.clone();
    url.pathname = pathname;
    url.search = request.nextUrl.search;
    const response = withDiagnostics(NextResponse.redirect(url, 307));
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("Vary", "Cookie, Accept-Language, X-Vercel-IP-Country");
    return response;
  }

  if (needsCanonicalRedirect) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, canonicalOrigin);
    return withDiagnostics(NextResponse.redirect(url, 308));
  }

  const pathnameLocale = request.nextUrl.pathname.split("/")[1];
  const locale = locales.includes(pathnameLocale as (typeof locales)[number])
    ? pathnameLocale
    : routing.defaultLocale;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kehong-locale", locale);
  return withDiagnostics(intlMiddleware(new NextRequest(request, { headers: requestHeaders })));
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    "/media/:path*",
  ],
};
