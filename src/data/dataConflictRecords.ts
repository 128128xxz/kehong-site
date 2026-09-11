/**
 * Publicly reachable records whose source naming and published attributes do
 * not agree. This is a display-layer guard only: the normalized catalog and
 * the frozen R3 image mapping remain unchanged until the business resolves
 * the source conflict.
 */
export type DataConflictType = "CODE_TEXT_VS_PUBLISHED_COATING" | "LEGACY_SLUG_VS_PUBLISHED_MATERIAL";

export type DataConflictRecord = {
  sku: string;
  conflict: DataConflictType;
  frontend_neutralized: true;
  recommendedAction: "Reconcile source naming and published specification before restoring precise wording";
};

const coatingConflictSkus = [
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
  "KH-FD-CUPBOT-150350-PE-025",
  "KH-FD-CUPBOT-170-PE-265",
  "KH-FD-CUPBOT-180-PE-266",
  "KH-FD-CUPBOT-210-PE-268",
  "KH-FD-CUPBOT-240-PE-271",
  "KH-FD-KCUP-320-PE-247",
  "KH-FD-KCUP-350-PE-248",
] as const;

const materialConflictSku = "KH-FD-KCUP-150350-PR-048";

const recommendedAction = "Reconcile source naming and published specification before restoring precise wording" as const;

export const DATA_CONFLICT_RECORDS: readonly DataConflictRecord[] = [
  ...coatingConflictSkus.map((sku) => ({
    sku,
    conflict: "CODE_TEXT_VS_PUBLISHED_COATING" as const,
    frontend_neutralized: true as const,
    recommendedAction,
  })),
  {
    sku: materialConflictSku,
    conflict: "LEGACY_SLUG_VS_PUBLISHED_MATERIAL",
    frontend_neutralized: true,
    recommendedAction,
  },
];

const dataConflictSkuSet = new Set(DATA_CONFLICT_RECORDS.map((record) => record.sku));

export function isDataConflictSku(record: { sku?: string } | undefined): boolean {
  return Boolean(record?.sku && dataConflictSkuSet.has(record.sku));
}
