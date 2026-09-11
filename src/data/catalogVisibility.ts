/**
 * Public catalog policy for product families that have been removed from the
 * buyer-facing site. Raw catalog records remain available to audit tooling.
 */
export function isRemovedFromPublicCatalog(record: {
  sku?: string;
  groupId?: string;
  canonicalGroupId?: string;
}) {
  return /^KH-FD-CUPFAN-/iu.test(record.sku ?? "")
    || record.groupId === "paper-cup-fan-paper-cup-fan"
    || record.canonicalGroupId === "paper-cup-fan-paper-cup-fan";
}
