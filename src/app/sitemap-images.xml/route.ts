import { getAllSkus } from "@/lib/catalog";
import { getSkuImageMeta } from "@/lib/productImages";
import { absoluteSiteUrl } from "@/lib/site";
import { seoMediaEntries } from "@/data/seoMediaEntries";

const XML_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function pathToUrl(pathname: string) {
  return pathname.startsWith("http") ? pathname : absoluteSiteUrl(pathname);
}

export async function GET() {
  const pairs = new Map<string, { page: string; image: string; title: string }>();
  const add = (page: string, image: string, title: string) => {
    if (!image.startsWith("/media/") || image.includes("/brand/") || image.includes("wechat-qr")) return;
    const pageUrl = pathToUrl(page);
    const imageUrl = pathToUrl(image);
    pairs.set(`${pageUrl}|${imageUrl}`, { page: pageUrl, image: imageUrl, title });
  };

  for (const entry of seoMediaEntries) add(entry.landingPage, entry.newPath, entry.altKey.replace("media.", ""));
  for (const sku of getAllSkus()) {
    const meta = getSkuImageMeta(sku, "en");
    add(`/en/products/${sku.slug}`, meta.src, meta.alt);
  }

  const grouped = new Map<string, { image: string; title: string }[]>();
  for (const pair of pairs.values()) {
    const images = grouped.get(pair.page) ?? [];
    images.push({ image: pair.image, title: pair.title });
    grouped.set(pair.page, images);
  }
  const urls = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([page, images]) => `  <url>\n    <loc>${escapeXml(page)}</loc>\n${images.map(({ image, title }) => `    <image:image>\n      <image:loc>${escapeXml(image)}</image:loc>\n      <image:title>${escapeXml(title)}</image:title>\n    </image:image>`).join("\n")}\n  </url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${XML_NS}" xmlns:image="${IMAGE_NS}">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

export const dynamic = "force-static";
export const revalidate = 3600;
