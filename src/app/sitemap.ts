import { MetadataRoute } from "next";
import { getAllSkus, getProductCategories } from "@/lib/catalog";
import { getAlternateLanguages, getLocaleUrl, type SiteHref } from "@/lib/site";

const staticRoutes = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/products", changeFrequency: "weekly", priority: 0.9 },
  { href: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { href: "/paper-cup-fan-manufacturer", changeFrequency: "monthly", priority: 0.82 },
  { href: "/paper-packaging-supplier", changeFrequency: "monthly", priority: 0.82 },
  { href: "/custom-paper-products", changeFrequency: "monthly", priority: 0.82 },
  { href: "/factory", changeFrequency: "monthly", priority: 0.8 },
  { href: "/process", changeFrequency: "monthly", priority: 0.8 },
  { href: "/procurement", changeFrequency: "monthly", priority: 0.8 },
  { href: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { href: "/terms", changeFrequency: "yearly", priority: 0.2 },
] as const satisfies readonly {
  href: SiteHref;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[];

async function sitemapEntry({
  href,
  changeFrequency,
  priority,
  lastModified,
}: {
  href: SiteHref;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified: Date;
}): Promise<MetadataRoute.Sitemap[number]> {
  return {
    url: await getLocaleUrl("en", href),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: await getAlternateLanguages(href) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const productRoutes = getAllSkus().map((sku) => ({
    href: `/products/${sku.slug}` as SiteHref,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));
  const categoryRoutes = getProductCategories().map((category) => ({
    href: `/products/${category.slug}` as SiteHref,
    changeFrequency: "monthly" as const,
    priority: 0.78,
  }));

  const routes = [...staticRoutes, ...categoryRoutes, ...productRoutes];
  const entries = await Promise.all(
    routes.map((route) => sitemapEntry({ ...route, lastModified })),
  );

  return entries;
}
