import { isRemovedFromPublicCatalog } from "@/data/catalogVisibility";
import { isSourceOnlyRecord } from "@/data/sourceOnlyRecords";

export type R3ImageAlt = {
  en: string;
  zh: string;
};

export type R3Image = {
  src: string;
  alt: R3ImageAlt;
};

export type R3SkuImageMapping = {
  primary: R3Image;
  gallery: R3Image[];
  sharedVisual: boolean;
  productMatch: "REPRESENTATIVE" | "PRODUCT_FAMILY";
  sourceType: "GENERATED_REPRESENTATIVE" | "3D_RENDER";
};

type R3SkuIdentity = {
  id: string;
  sku: string;
  groupId?: string;
  canonicalGroupId?: string;
};

const r3Root = "/media/products/r3";

const alt = {
  rollPrimary: {
    en: "White paper roll with wound edges and a cardboard core",
    zh: "带纸芯和卷绕边缘的白色纸卷",
  },
  rollFamily: {
    en: "White and kraft paper rolls showing material options within the product family",
    zh: "展示产品组材料选项的白色与牛皮纸卷",
  },
  rollFamilyTwo: {
    en: "Side view of white and kraft paper rolls with cardboard cores",
    zh: "带纸芯的白色与牛皮纸卷侧面图",
  },
  rollFamilyThree: {
    en: "White paper roll showing the wound edge and hollow paper core",
    zh: "展示卷绕边缘和中空纸芯的白色纸卷",
  },
  sheetFamily: {
    en: "Stack of white paper sheets with a gently lifted top sheet",
    zh: "顶部纸张微微掀起的白色纸张叠放图",
  },
  sheetFamilyTwo: {
    en: "Side view of layered white paper sheets before packaging conversion",
    zh: "包装加工前层叠白色纸张的侧面图",
  },
  sheetFamilyThree: {
    en: "Detail of white paper sheet edges and gently curved upper leaves",
    zh: "白色纸张边缘和微弯上层纸张细节图",
  },
  bottomPrimary: {
    en: "Narrow white paper bottom roll with closely wound edges",
    zh: "边缘紧密卷绕的窄幅白色纸杯底卷",
  },
  bottomFamily: {
    en: "White and kraft narrow paper bottom rolls in flat and upright positions",
    zh: "平放和竖放的白色与牛皮窄幅纸杯底卷",
  },
  bottomFamilyTwo: {
    en: "Low-angle view of narrow white and kraft paper bottom rolls",
    zh: "窄幅白色与牛皮纸杯底卷的低角度视图",
  },
  bottomFamilyThree: {
    en: "White narrow paper bottom roll showing the wound face and paper core",
    zh: "展示卷绕端面和纸芯的窄幅白色纸杯底卷",
  },
  cupstockFamily: {
    en: "Separate white and kraft paperboard sheet stacks showing cupstock material options",
    zh: "展示杯纸材料选项的白色与牛皮纸板叠放图",
  },
  cupstockFamilyTwo: {
    en: "Low-angle view of white and kraft paperboard sheet stacks",
    zh: "白色与牛皮纸板叠放图的低角度视图",
  },
  cupstockFamilyThree: {
    en: "Detail of paperboard sheet surfaces and stacked cut edges",
    zh: "纸板表面和叠放切边细节图",
  },
  trayPrimary: {
    en: "White paperboard sheets for further packaging conversion, not a formed tray",
    zh: "用于后续包装加工的白色纸板，并非成型纸托",
  },
  trayTwo: {
    en: "Side view of white tray-paper sheet material before converting",
    zh: "加工前白色纸托材料平张纸的侧面图",
  },
  trayThree: {
    en: "Close-up of stacked white paperboard edges and surface",
    zh: "叠放白色纸板边缘和表面特写",
  },
} satisfies Record<string, R3ImageAlt>;

const image = (path: string, imageAlt: R3ImageAlt): R3Image => ({
  src: `${r3Root}/${path}`,
  alt: imageAlt,
});

const familyVisuals: Record<string, R3SkuImageMapping> = {
  "paper-cup-fan-pe-coated-paper-roll-for-paper-cup": {
    primary: image("coated-paper-roll/coated-paper-roll-family-primary.webp", alt.rollFamily),
    gallery: [
      image("coated-paper-roll/coated-paper-roll-family-02.webp", alt.rollFamilyTwo),
    ],
    sharedVisual: true,
    productMatch: "PRODUCT_FAMILY",
    sourceType: "3D_RENDER",
  },
  "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup": {
    primary: image("coated-paper-sheet/coated-paper-sheet-family-primary.webp", alt.sheetFamily),
    gallery: [
      image("coated-paper-sheet/coated-paper-sheet-family-02.webp", alt.sheetFamilyTwo),
      image("coated-paper-sheet/coated-paper-sheet-family-03.webp", alt.sheetFamilyThree),
    ],
    sharedVisual: true,
    productMatch: "PRODUCT_FAMILY",
    sourceType: "3D_RENDER",
  },
  "paper-cup-fan-paper-cup-bottom-roll": {
    primary: image("cup-bottom-roll/cup-bottom-roll-family-primary.webp", alt.bottomFamily),
    gallery: [
      image("cup-bottom-roll/cup-bottom-roll-family-02.webp", alt.bottomFamilyTwo),
    ],
    sharedVisual: true,
    productMatch: "PRODUCT_FAMILY",
    sourceType: "3D_RENDER",
  },
  "paper-cup-fan-kraft-cupstock-paper": {
    primary: image("cupstock/cupstock-family-primary.webp", alt.cupstockFamily),
    gallery: [
      image("cupstock/cupstock-family-02.webp", alt.cupstockFamilyTwo),
      image("cupstock/cupstock-family-03.webp", alt.cupstockFamilyThree),
    ],
    sharedVisual: true,
    productMatch: "PRODUCT_FAMILY",
    sourceType: "3D_RENDER",
  },
};

const individualVisuals: Record<string, R3SkuImageMapping> = {
  "KH-FD-CUPROLL-150350-PR-032": {
    primary: image("coated-paper-roll/kh-fd-cuproll-150350-pr-032-primary.webp", alt.rollPrimary),
    gallery: [
      image("coated-paper-roll/coated-paper-roll-family-03.webp", alt.rollFamilyThree),
    ],
    sharedVisual: false,
    productMatch: "REPRESENTATIVE",
    sourceType: "GENERATED_REPRESENTATIVE",
  },
  "KH-FD-CUPBOT-150350-PR-026": {
    primary: image("cup-bottom-roll/kh-fd-cupbot-150350-pr-026-primary.webp", alt.bottomPrimary),
    gallery: [
      image("cup-bottom-roll/cup-bottom-roll-family-03.webp", alt.bottomFamilyThree),
    ],
    sharedVisual: false,
    productMatch: "REPRESENTATIVE",
    sourceType: "3D_RENDER",
  },
  "KH-FD-TRAYP-150350-PE-290": {
    primary: image("tray-paper/kh-fd-trayp-150350-pe-290-primary.webp", alt.trayPrimary),
    gallery: [
      image("tray-paper/kh-fd-trayp-150350-pe-290-02.webp", alt.trayTwo),
      image("tray-paper/kh-fd-trayp-150350-pe-290-03.webp", alt.trayThree),
    ],
    sharedVisual: false,
    productMatch: "REPRESENTATIVE",
    sourceType: "3D_RENDER",
  },
};

/**
 * R3 rows whose package description conflicts with the current catalog. The
 * package remains available for audit, but these rows are deliberately held
 * out of the public image override until the business data is reconciled.
 */
export const R3_DATA_CONFLICT_SKUS = new Set([
  "KH-FD-CUPROLL-150350-PE-052",
  "KH-FD-CUPROLL-230-PE-181",
  "KH-FD-CUPROLL-240-PE-182",
  "KH-FD-CUPROLL-280-PE-184",
  "KH-FD-CUPROLL-240-PE-193",
  "KH-FD-CUPROLL-350-PE-217",
  "KH-FD-CUPROLL-150-PE-218",
  "KH-FD-CUPROLL-180-PE-220",
  "KH-FD-CUPROLL-210-PE-238",
  "KH-FD-CUPROLL-170-PE-250",
  "KH-FD-CUPROLL-150-PE-259",
  "KH-FD-CUPROLL-320-PE-261",
  "KH-FD-CUPROLL-350-PE-262",
  "KH-FD-CUPROLL-150-PE-263",
  "KH-FD-CUPROLL-170-PE-264",
  "KH-FD-CUPSHEET-150350-PE-043",
  "KH-FD-CUPSHEET-250-PE-221",
  "KH-FD-CUPSHEET-280-PE-222",
  "KH-FD-CUPSHEET-300-PE-223",
  "KH-FD-CUPSHEET-320-PE-224",
  "KH-FD-CUPSHEET-280-PE-229",
  "KH-FD-CUPSHEET-300-PE-230",
  "KH-FD-CUPSHEET-320-PE-231",
  "KH-FD-CUPSHEET-350-PE-232",
  "KH-FD-CUPBOT-150350-PE-025",
  "KH-FD-CUPBOT-170-PE-265",
  "KH-FD-CUPBOT-180-PE-266",
  "KH-FD-CUPBOT-210-PE-268",
  "KH-FD-CUPBOT-240-PE-271",
  "KH-FD-KCUP-150350-PR-048",
  "KH-FD-KCUP-320-PE-247",
  "KH-FD-KCUP-350-PE-248",
]);

export function getR3SkuImageMapping(sku: R3SkuIdentity): R3SkuImageMapping | undefined {
  if (R3_DATA_CONFLICT_SKUS.has(sku.sku) || isSourceOnlyRecord(sku.id) || isRemovedFromPublicCatalog(sku)) {
    return undefined;
  }

  return individualVisuals[sku.sku] ?? familyVisuals[sku.groupId ?? sku.canonicalGroupId ?? ""];
}
