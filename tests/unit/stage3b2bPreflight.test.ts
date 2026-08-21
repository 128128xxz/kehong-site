import { describe, expect, it } from "vitest";
import catalog from "@/data/catalog.normalized.json";

const sheetGroupId = "paper-cup-fan-pe-coated-paper-sheet-for-paper-cup";
const sheetTargetId = "kh-fd-cupsheet-150350-pe-043";
const candidateMap = {
  records: catalog.skus
    .filter((sku) => sku.groupId === sheetGroupId && sku.id !== sheetTargetId)
    .map((sku) => ({ sourceRecordId: sku.id })),
  proposedTarget: {
    url: "/en/products/kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup",
    entityId: `existing-product-anchor:${sheetTargetId}`,
  },
  currentStage3b1Anchor: {
    sourceClusterId: "cluster-paper-cup-fan-food-tray-paper-material",
  },
};

describe("Stage 3B-2B preflight gates", () => {
  it("keeps the approved set at 18 records and detects the duplicate displayed specification", () => {
    expect(candidateMap.records).toHaveLength(18);
    const sourceRecords = candidateMap.records.map((candidate) => catalog.skus.find((sku) => sku.id === candidate.sourceRecordId));
    expect(sourceRecords.every(Boolean)).toBe(true);
    const key = (record: (typeof catalog.skus)[number]) => [
      record.gsmOrThickness,
      record.structureOrFlute,
      record.surfaceProcess,
      record.finishingProcess,
      record.commonSize,
      record.materialIds.join("|"),
    ].join("|");
    const keys = sourceRecords.map((record) => key(record!));
    expect(keys.filter((value, index) => keys.indexOf(value) !== index)).toContain(keys.find((value) => keys.indexOf(value) !== keys.lastIndexOf(value)));
    expect(sourceRecords.filter((record) => record?.id === "kh-fd-cupsheet-150350-pr-044" || record?.id === "kh-fd-cupsheet-150350-pr-068")).toHaveLength(2);
  });

  it("does not treat the 3B-1 food-tray anchor as the paper-cup sheet target", () => {
    expect(candidateMap.proposedTarget.url).toContain("kh-fd-cupsheet-150350-pe-043");
    expect(candidateMap.currentStage3b1Anchor.sourceClusterId).toContain("food-tray-paper-material");
    expect(candidateMap.proposedTarget.entityId).not.toContain("food-tray");
  });
});
