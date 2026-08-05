export const productFamilies = [
  {
    id: "cupstock-components",
    title: { en: "Cupstock & Cup Components", zh: "杯纸与纸杯组件" },
    productGroupIds: [
      "paper-cup-fan-paper-cup-fan",
      "paper-cup-fan-paper-cup-bottom-roll",
      "paper-cup-fan-kraft-cupstock-paper",
    ],
  },
  {
    id: "coated-paper-rolls-sheets",
    title: { en: "Coated Paper Rolls & Sheets", zh: "淋膜纸卷与平张" },
    productGroupIds: [
      "paper-cup-fan-pe-coated-paper-roll-for-paper-cup",
      "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup",
    ],
  },
  {
    id: "tray-insert-materials",
    title: { en: "Food Tray & Insert Materials", zh: "食品纸托与纸内托材料" },
    productGroupIds: ["paper-cup-fan-food-tray-paper-material"],
  },
] as const;

export function getProductFamily(productGroupId: string) {
  return productFamilies.find((family) => family.productGroupIds.includes(productGroupId as never));
}
