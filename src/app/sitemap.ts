import { MetadataRoute } from "next";
import { getAllSkus, getProductCategories } from "@/lib/catalog";
import { getAlternateLanguages, getLocaleUrl, type SiteHref } from "@/lib/site";
import { packagingCategories } from "@/data/packagingCategories";
import { getNewsSlugs } from "@/content/news";
import { PAPER_CUP_SHEET_SOURCE_RECORD_IDS } from "@/data/paperCupSheetVariants";
import { materialCollections } from "@/data/materialCollections";

const staticRoutes = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/products", changeFrequency: "weekly", priority: 0.9 },
  { href: "/industries", changeFrequency: "monthly", priority: 0.84 },
  { href: "/industries/bakery-packaging", changeFrequency: "monthly", priority: 0.84 },
  { href: "/capabilities", changeFrequency: "monthly", priority: 0.82 },
  { href: "/resources", changeFrequency: "monthly", priority: 0.76 },
  { href: "/materials", changeFrequency: "monthly", priority: 0.8 },
  { href: "/news", changeFrequency: "weekly", priority: 0.78 },
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
  const paperCupSheetSourceIds = new Set<string>(PAPER_CUP_SHEET_SOURCE_RECORD_IDS);
  const productRoutes = getAllSkus().filter((sku) => !paperCupSheetSourceIds.has(sku.id)).map((sku) => ({
    href: `/products/${sku.slug}` as SiteHref,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));
  const categoryRoutes = getProductCategories().map((category) => ({
    href: `/products/${category.slug}` as SiteHref,
    changeFrequency: "monthly" as const,
    priority: 0.78,
  }));
  const packagingRoutes = packagingCategories.map((category) => ({
    href: `/packaging/${category.slug}` as SiteHref,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const resourceRoutes = ["artwork-guidelines", "materials-guide", "finishes-guide", "dielines-templates", "packaging-selection-guide", "proofing-samples"].map((slug) => ({ href: `/resources/${slug}` as SiteHref, changeFrequency: "monthly" as const, priority: 0.65 }));
  const materialRoutes = materialCollections.map((collection) => ({ href: `/materials/${collection.slug}` as SiteHref, changeFrequency: "monthly" as const, priority: 0.76 }));
  const bakeryProductRoutes = ["cake-boxes", "cake-boards-and-drums"].map((slug) => ({ href: `/products/${slug}` as SiteHref, changeFrequency: "monthly" as const, priority: 0.78 }));
  const newsRoutes = getNewsSlugs().map((slug) => ({ href: `/news/${slug}` as SiteHref, changeFrequency: "monthly" as const, priority: 0.66 }));
  const paperCupFamilyRoute = { href: "/products/families/paper-cup-materials" as SiteHref, changeFrequency: "monthly" as const, priority: 0.8 };

  const routes = [...staticRoutes, ...resourceRoutes, ...materialRoutes, ...bakeryProductRoutes, ...newsRoutes, ...packagingRoutes, ...categoryRoutes, paperCupFamilyRoute, ...productRoutes];
  const entries = await Promise.all(
    routes.map((route) => sitemapEntry({ ...route, lastModified })),
  );

  return entries;
}
