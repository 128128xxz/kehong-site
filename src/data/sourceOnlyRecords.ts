/**
 * Source-only candidates retained for audit and future owner verification.
 * They must not be treated as public just because the normalized source marks
 * them as published or because they share a public-facing product group.
 */
export const SOURCE_ONLY_RECORD_IDS = [
  "kh-fd-cupsheet-300-pe-230",
  "kh-fd-cupsheet-320-pe-231",
  "kh-fd-cupsheet-350-pe-232",
  "kh-fd-cupsheet-230-pr-233",
  "kh-fd-cupsheet-240-pr-234",
  "kh-fd-cupsheet-250-pr-235",
  "kh-fd-cupsheet-280-pr-236",
] as const;

const sourceOnlyRecordIds = new Set<string>(SOURCE_ONLY_RECORD_IDS);

export function isSourceOnlyRecord(recordId: string) {
  return sourceOnlyRecordIds.has(recordId);
}
