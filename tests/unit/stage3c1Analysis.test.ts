import { describe, expect, it } from "vitest";
import fs from "node:fs";
import crypto from "node:crypto";

const read = (file: string) => fs.readFileSync(file, "utf8");
const sha = (file: string) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

describe("Stage 3C-1 evidence intake analysis", () => {
  it("identifies four blocked families and one OEM/ODM rework family", () => {
    const rows = read("docs/stage-3c1-family-status.csv");
    expect((rows.match(/BLOCKED_BUSINESS_DATA/g) ?? []).length).toBe(4);
    expect((rows.match(/REWORK_CLASSIFICATION/g) ?? []).length).toBe(1);
    expect(rows).toMatch(/service,[^\n]*,SERVICE_FAMILY,/u);
    expect(rows).toContain("MOVE_TO_CAPABILITIES");
  });

  it("audits every pending record without promoting any record", () => {
    const rows = read("docs/stage-3c1-pending-candidate-review.csv").trim().split(/\r?\n/u);
    expect(rows).toHaveLength(107);
    expect(rows.slice(1).every((row) => /STRONG_PENDING_CANDIDATE|POSSIBLE_CANDIDATE_NEEDS_CONFIRMATION|INSUFFICIENT_DATA|FAMILY_CONFLICT|SERVICE_NOT_PRODUCT|NOT_RELEVANT_TO_BLOCKED_FAMILIES/.test(row))).toBe(true);
    expect(rows.join("\n")).not.toMatch(/published=true/);
    expect(read("src/data/catalog.normalized.json")).toContain('"pending"');
  });

  it("keeps the seed plan small, evidence-gated and free of fabricated values", () => {
    const rows = read("docs/stage-3c1-seed-product-plan.csv").trim().split(/\r?\n/u);
    expect(rows).toHaveLength(9);
    expect(rows.join("\n")).toContain("NEEDS_BUSINESS_CONFIRMATION");
    expect(read("docs/stage-3c1-business-product-intake.csv")).toMatch(/,false,/u);
    expect(read("docs/stage-3c1-business-product-intake.csv")).not.toMatch(/,0,|,N\/A,/);
    expect(read("docs/stage-3c1-product-image-intake.csv")).toMatch(/,false,false,false,/u);
  });

  it("keeps OEM/ODM as a capability reclassification candidate", () => {
    expect(read("docs/stage-3c1-oem-odm-reclassification-plan.md")).toMatch(/SERVICE_FAMILY/);
    expect(read("docs/stage-3c1-oem-odm-reclassification-plan.md")).toMatch(/capabilit/i);
    expect(read("docs/stage-3c1-capability-evidence-map.csv")).toContain("inquiry-intent");
  });

  it("preserves the 259-url runtime baseline and protected hashes", () => {
    const urls = read("/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3c1-prechange-backup-20260818/manifests/runtime-urls.txt").trim().split(/\r?\n/u);
    expect(urls).toHaveLength(259);
    expect(read("docs/stage-3b3-sitemap-exact-diff.csv")).toContain("UNCHANGED");
    expect(sha("src/data/catalog.normalized.json")).toBe(read("/Users/a369/Documents/Codex/2026-07-13/new-chat/kehong-site-stage3c1-prechange-backup-20260818/product-data.sha256").split(/\s/u)[0]);
    expect(sha("src/data/catalog.normalized.json")).toBe(read("docs/stage-3c1-summary.md").match(/PRODUCT_DATA_SHA256=([0-9a-f]+)/u)?.[1]);
    expect(read("docs/stage-3b2b-summary.md")).toContain("PE043_SELF_CANONICAL=true");
  });

  it("compresses review into a bounded decision sheet", () => {
    const rows = read("docs/stage-3c1-business-decision-sheet.csv").trim().split(/\r?\n/u);
    expect(rows.length).toBeGreaterThanOrEqual(11);
    expect(rows.length).toBeLessThanOrEqual(21);
  });
});
