import { randomBytes } from "node:crypto";

const trackingParameter = "tid";
const canonicalSiteHosts = new Set(["kehong.tech", "www.kehong.tech"]);
const excludedLinkPattern = /(?:unsubscribe|opt[-_]?out|email[-_]?preferences?|manage[-_]?preferences?)/iu;
const resourcePathPattern = /\.(?:avif|gif|ico|jpe?g|pdf|png|svg|webp|zip|docx?|xlsx?)(?:$|[?#])/iu;

const htmlEntities: Record<string, string> = {
  "&amp;": "&",
  "&#38;": "&",
  "&#x26;": "&",
  "&quot;": '"',
  "&#34;": '"',
  "&#x22;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&#x27;": "'",
  "&lt;": "<",
  "&#60;": "<",
  "&#x3c;": "<",
  "&gt;": ">",
  "&#62;": ">",
  "&#x3e;": ">",
};

function decodeHtmlEntities(value: string) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#(?:3[489]|6[023]|x(?:22|26|27|3c|3e)));/giu, (entity) => htmlEntities[entity.toLowerCase()] ?? entity);
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#39;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function siteHosts() {
  const hosts = new Set(canonicalSiteHosts);
  for (const configured of [process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL]) {
    if (!configured?.trim()) continue;
    try {
      const url = new URL(configured);
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") hosts.add(url.hostname.toLowerCase());
    } catch {
      // Invalid optional site configuration cannot expand the allow-list.
    }
  }
  return hosts;
}

function isExcludedUrl(value: string, context = "") {
  return excludedLinkPattern.test(`${value} ${context}`);
}

function appendToUrl(value: string, trackingId: string, context = "") {
  const decoded = decodeHtmlEntities(value).trim();
  if (!decoded || !trackingId || isExcludedUrl(decoded, context)) return null;
  let url: URL;
  try {
    url = new URL(decoded);
  } catch {
    return null;
  }
  if (!(["http:", "https:"] as string[]).includes(url.protocol) || url.username || url.password || !siteHosts().has(url.hostname.toLowerCase())) return null;
  if (resourcePathPattern.test(url.pathname)) return null;
  url.searchParams.set(trackingParameter, trackingId);
  return url.toString();
}

export function createTrackingId() {
  return randomBytes(16).toString("base64url");
}

export function appendTrackingIdToUrl(value: string, trackingId: string, context = "") {
  return appendToUrl(value, trackingId, context);
}

export function addTrackingIdToHtml(html: string, trackingId: string) {
  let output = html.replace(/(<a\b[^>]*\bhref\s*=\s*)(["'])([\s\S]*?)\2/giu, (match: string, prefix: string, quote: string, href: string) => {
    const rewritten = appendToUrl(href, trackingId, match);
    return rewritten ? `${prefix}${quote}${escapeHtmlAttribute(rewritten)}${quote}` : match;
  });
  output = output.replace(/(<a\b[^>]*\bhref\s*=\s*)(?!["'])([^\s>]+)/giu, (match: string, prefix: string, href: string) => {
    const rewritten = appendToUrl(href, trackingId, match);
    return rewritten ? `${prefix}${rewritten}` : match;
  });
  return output;
}

function splitTrailingPunctuation(value: string) {
  let url = value;
  let suffix = "";
  while (/[.,!?;:)\]}]$/u.test(url)) {
    suffix = url.slice(-1) + suffix;
    url = url.slice(0, -1);
  }
  return { url, suffix };
}

export function addTrackingIdToText(text: string, trackingId: string) {
  return text.replace(/https?:\/\/[^\s<>"']+/giu, (candidate) => {
    const split = splitTrailingPunctuation(candidate);
    const rewritten = appendToUrl(split.url, trackingId);
    return rewritten ? rewritten + split.suffix : candidate;
  });
}

export function addTrackingIdToEmail({ html, text, trackingId }: { html: string; text: string; trackingId: string }) {
  return { html: addTrackingIdToHtml(html, trackingId), text: addTrackingIdToText(text, trackingId) };
}
