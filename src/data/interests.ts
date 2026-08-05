export const interests = {
  "pe-coated-paper-roll": {
    id: "pe-coated-paper-roll",
    label: { en: "PE coated paper roll", zh: "PE 淋膜纸卷" },
    formProductType: "paper-cup-fan",
  },
  "paper-cup-fan": {
    id: "paper-cup-fan",
    label: { en: "Paper cup fan", zh: "纸杯扇形片" },
    formProductType: "paper-cup-fan",
  },
  "structure-review": {
    id: "structure-review",
    label: { en: "Packaging structure review", zh: "包装结构评审" },
    formProductType: "custom-packaging",
  },
} as const;

export type InterestId = keyof typeof interests;
export function getInterest(id: string | undefined) {
  return id && id in interests ? interests[id as InterestId] : undefined;
}
