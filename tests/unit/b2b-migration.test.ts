import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("B2B migration rollback safety", () => {
  it("rolls back B2B tables without dropping the shared customer inquiries table", () => {
    const up = readFileSync("migrations/001_b2b_inquiry_intelligence.sql", "utf8");
    const down = readFileSync("migrations/001_b2b_inquiry_intelligence.down.sql", "utf8");
    expect(up).toContain("CREATE TABLE IF NOT EXISTS inquiries");
    expect(down).toContain("shared inquiries table");
    expect(down).toContain("DROP TABLE IF EXISTS inquiry_visit_events");
    expect(down).toContain("DROP TABLE IF EXISTS provider_cache");
    expect(down).not.toMatch(/DROP TABLE IF EXISTS inquiries\b/u);
  });
});
