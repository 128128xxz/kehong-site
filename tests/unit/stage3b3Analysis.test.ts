import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Stage 3B-3 safe analysis", () => {
  it("keeps the five non-cup families out of sitemap admission", () => {
    const readiness = fs.readFileSync("docs/stage-3b3-family-readiness.csv", "utf8");
    expect(readiness).toContain("corrugated,PRODUCT_FAMILY");
    expect(readiness).toContain("specialty,PRODUCT_FAMILY");
    expect(readiness).toContain("functional,PRODUCT_FAMILY");
    expect(readiness).toContain("converted,PRODUCT_FAMILY");
    expect(readiness).toContain("service,SERVICE_FAMILY");
    expect((readiness.match(/BLOCKED_BUSINESS_DATA/g) ?? []).length).toBe(4);
    expect(readiness).toContain("REWORK_CLASSIFICATION");
    expect(readiness).not.toContain("READY_FOR_CONTENT_AND_SITEMAP");
  });

  it("records an exact unchanged sitemap set with no additions or removals", () => {
    const diff = fs.readFileSync("docs/stage-3b3-sitemap-exact-diff.csv", "utf8");
    expect(diff.split(/\r?\n/u).filter(Boolean).length).toBe(260);
    expect(diff).toContain("UNCHANGED");
    expect(diff).not.toContain("ADD_APPROVED_FAMILY");
    expect(diff).not.toContain(",false,false");
  });

  it("does not use pending or manual-review records as evidence", () => {
    const evidence = JSON.parse(fs.readFileSync("docs/stage-3b3-published-evidence-map.json", "utf8")) as Array<Record<string, string | boolean>>;
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.every((row) => row.eligibleAsPublishedEvidence === false)).toBe(true);
    expect(evidence.every((row) => row.eligibleAsRepresentativeProduct === false)).toBe(true);
  });
});
