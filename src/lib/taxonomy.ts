import taxonomy from "@/data/taxonomy.json";
import type { ProductSku } from "@/lib/catalog";

export type TaxonomyCategory = (typeof taxonomy.categories)[number];
export type TaxonomyMaterial = (typeof taxonomy.materials)[number];

const categoriesById = new Map(taxonomy.categories.map((category) => [category.id, category]));
const categoriesBySlug = new Map(taxonomy.categories.map((category) => [category.slug, category]));
const materialsById = new Map(taxonomy.materials.map((material) => [material.id, material]));
const materialAliases = new Map(
  taxonomy.materials.flatMap((material) => material.aliases.map((alias) => [alias.trim().toLocaleLowerCase(), material.id] as const)),
);

/** Stable public taxonomy IDs. Raw import IDs remain accepted as aliases. */
const categoryAliases: Record<string, string> = {
  "kraft-paper-series": "kraft-paper",
  "white-cardboard-series": "white-cardboard",
  "food-grade-paper-series": "food-grade-paper",
  "food-paper": "food-grade-paper",
  "corrugated-fluted-paper-series": "corrugated-paper",
  "specialty-paper-series": "specialty-paper",
  "paper-box-components": "paper-boxes",
  "finished-paper-boxes": "paper-boxes",
};

const canonicalCategoryIds = [
  "kraft-paper",
  "white-cardboard",
  "food-grade-paper",
  "corrugated-paper",
  "specialty-paper",
  "food-packaging-boxes",
  "paper-pads",
  "paper-inserts",
  "paper-boxes",
] as const;

const canonicalCategoryRecords = new Map(
  canonicalCategoryIds.map((id) => {
    const rawId = id === "kraft-paper"
      ? "kraft-paper-series"
      : id === "white-cardboard"
        ? "white-cardboard-series"
        : id === "food-grade-paper"
          ? "food-grade-paper"
          : id === "corrugated-paper"
            ? "corrugated-fluted-paper-series"
            : id === "specialty-paper"
              ? "specialty-paper-series"
              : id === "paper-boxes"
                ? "paper-box-components"
                : id;
    const raw = categoriesById.get(rawId) ?? categoriesBySlug.get(id) ?? taxonomy.categories[0];
    return [id, { ...raw, id, slug: id }] as const;
  }),
);

export function getCanonicalTaxonomyCategoryId(value: string | undefined) {
  if (!value) return undefined;
  const canonicalValue = value as typeof canonicalCategoryIds[number];
  return (categoryAliases[value] ?? (canonicalCategoryRecords.has(canonicalValue) ? canonicalValue : undefined)) as typeof canonicalCategoryIds[number] | undefined;
}

export function getTaxonomyCategories() {
  return [...canonicalCategoryRecords.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getTaxonomyCategoryById(id: string | undefined) {
  const canonicalId = getCanonicalTaxonomyCategoryId(id);
  return canonicalId ? canonicalCategoryRecords.get(canonicalId) : undefined;
}

export function getTaxonomyCategoryBySlug(slug: string | undefined) {
  const canonicalId = getCanonicalTaxonomyCategoryId(slug);
  return canonicalId ? canonicalCategoryRecords.get(canonicalId) : undefined;
}

export function getTaxonomyMaterialById(id: string | undefined) {
  return id ? materialsById.get(id) : undefined;
}

export function getTaxonomyMaterialLabel(id: string | undefined, locale: string) {
  const material = getTaxonomyMaterialById(id);
  if (!material) return "";
  return locale === "zh" ? material.localizedLabel.zh : material.localizedLabel.en;
}

export function getTaxonomyCategoryLabel(id: string | undefined, locale: string) {
  const category = getTaxonomyCategoryById(id);
  if (!category) return "";
  return locale === "zh" ? category.localizedLabel.zh : category.localizedLabel.en;
}

export function getProductMaterialIds(sku: Pick<ProductSku, "materialIds">) {
  return [...new Set((sku.materialIds ?? []).filter((id) => materialsById.has(id)))];
}

export function getLocalizedProductMaterials(sku: Pick<ProductSku, "materialIds">, locale: string) {
  return getProductMaterialIds(sku)
    .map((id) => getTaxonomyMaterialLabel(id, locale))
    .filter(Boolean)
    .join(locale === "zh" ? "、" : " / ");
}

export function resolveTaxonomyMaterialAlias(value: string | undefined) {
  if (!value) return undefined;
  return materialAliases.get(value.trim().toLocaleLowerCase());
}
