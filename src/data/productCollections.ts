/**
 * Public browsing collections are deliberately separate from source SKU
 * categories. Source categories describe a record; collections describe the
 * buyer-facing range that a route is allowed to return.
 */
export const productCollections = {
  materials: {
    id: "materials",
    title: { en: "Paper Materials & Components", zh: "纸材与半成品组件" },
    productGroupIds: [
      "paper-cup-fan-pe-coated-paper-roll-for-paper-cup",
      "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup",
      "paper-cup-fan-paper-cup-bottom-roll",
      "paper-cup-fan-kraft-cupstock-paper",
    ],
  },
} as const;

export type ProductCollectionId = keyof typeof productCollections;

/** Compatibility alias for the established buyer-facing food-grade route. */
export const categoryCollectionAliases: Record<string, ProductCollectionId> = {
  "food-grade-paper": "materials",
};

export function getProductCollection(id: string | undefined) {
  return id && id in productCollections
    ? productCollections[id as ProductCollectionId]
    : undefined;
}

export function getCollectionForCategory(categoryId: string | undefined) {
  return categoryId ? getProductCollection(categoryCollectionAliases[categoryId]) : undefined;
}
