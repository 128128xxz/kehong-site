import { revalidatePath, revalidateTag } from "next/cache";

export const PRODUCT_CACHE_TAGS = {
  all: "products",
  catalog: "catalog",
  product: (slug: string) => `product:${slug}`,
  group: (groupId: string) => `product-group:${groupId}`,
} as const;

/**
 * Invalidate every public surface that can contain product data.
 * The current catalog is bundled and product pages are force-dynamic/no-store,
 * but keeping the tags centralized makes future CMS/database writes safe.
 */
export async function revalidateProductPages(input: { slug?: string; groupId?: string } = {}) {
  const tags: string[] = [PRODUCT_CACHE_TAGS.all, PRODUCT_CACHE_TAGS.catalog];
  if (input.slug) tags.push(PRODUCT_CACHE_TAGS.product(input.slug));
  if (input.groupId) tags.push(PRODUCT_CACHE_TAGS.group(input.groupId));

  await Promise.all(tags.map((tag) => revalidateTag(tag, "max")));
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/products/[slug]", "page");

  return { tags };
}
