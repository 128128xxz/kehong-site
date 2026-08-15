export const interests = {
  "pe-coated-paper-roll": {
    id: "pe-coated-paper-roll",
    label: { en: "PE coated paper roll", zh: "PE 淋膜纸卷", id: "Gulungan kertas berlapis PE", vi: "Cuộn giấy phủ PE", th: "กระดาษม้วนเคลือบ PE", ms: "Gulungan kertas bersalut PE" },
    formProductType: "paper-cup-fan",
  },
  "paper-cup-fan": {
    id: "paper-cup-fan",
    label: { en: "Paper cup fan", zh: "纸杯扇形片", id: "Lembaran kipas cangkir kertas", vi: "Phôi quạt cốc giấy", th: "แผ่นพัดแก้วกระดาษ", ms: "Keping kipas cawan kertas" },
    formProductType: "paper-cup-fan",
  },
  "structure-review": {
    id: "structure-review",
    label: { en: "Packaging structure review", zh: "包装结构评审", id: "Tinjauan struktur kemasan", vi: "Đánh giá cấu trúc bao bì", th: "ตรวจสอบโครงสร้างบรรจุภัณฑ์", ms: "Semakan struktur pembungkusan" },
    formProductType: "custom-packaging",
  },
  "artwork-review": {
    id: "artwork-review",
    label: { en: "Artwork review", zh: "设计稿评审", id: "Tinjauan artwork", vi: "Đánh giá thiết kế", th: "ตรวจสอบอาร์ตเวิร์ก", ms: "Semakan karya seni" },
    formProductType: "custom-packaging",
  },
  "dieline-request": {
    id: "dieline-request",
    label: { en: "Dieline request", zh: "刀模图申请", id: "Permintaan dieline", vi: "Yêu cầu dieline", th: "ขอไดไลน์", ms: "Permintaan dieline" },
    formProductType: "custom-packaging",
  },
} as const;

export type InterestId = keyof typeof interests;
export function getInterest(id: string | undefined) {
  return id && id in interests ? interests[id as InterestId] : undefined;
}

export function getInterestLabel(id: string | undefined, locale: string) {
  const interest = getInterest(id);
  if (!interest) return undefined;
  return interest.label[locale as keyof typeof interest.label] ?? interest.label.en;
}
