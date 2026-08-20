/**
 * Stage 3B-2B-R approval boundary for the paper-cup sheet center.
 *
 * These are record identities, not copied business fields. The source catalog
 * remains the only source of specification values.
 */
export const PAPER_CUP_SHEET_TARGET_RECORD_ID = "kh-fd-cupsheet-150350-pe-043";

export const PAPER_CUP_SHEET_SOURCE_RECORD_IDS = [
  "kh-fd-cupsheet-150350-pr-044",
  "kh-fd-cupsheet-150350-pr-068",
  "kh-fd-cupsheet-250-pe-221",
  "kh-fd-cupsheet-280-pe-222",
  "kh-fd-cupsheet-300-pe-223",
  "kh-fd-cupsheet-320-pe-224",
  "kh-fd-cupsheet-320-pr-225",
  "kh-fd-cupsheet-350-pr-226",
  "kh-fd-cupsheet-150-pr-227",
  "kh-fd-cupsheet-170-pr-228",
  "kh-fd-cupsheet-280-pe-229",
  "kh-fd-cupsheet-300-pe-230",
  "kh-fd-cupsheet-320-pe-231",
  "kh-fd-cupsheet-350-pe-232",
  "kh-fd-cupsheet-230-pr-233",
  "kh-fd-cupsheet-240-pr-234",
  "kh-fd-cupsheet-250-pr-235",
  "kh-fd-cupsheet-280-pr-236",
] as const;

export function isApprovedPaperCupSheetSource(recordId: string) {
  return (PAPER_CUP_SHEET_SOURCE_RECORD_IDS as readonly string[]).includes(recordId);
}

export function paperCupSheetDisplayIdentity(record: {
  id: string;
  sku: string;
  slug: string;
}) {
  return record.id + "|" + record.sku + "|" + record.slug;
}
