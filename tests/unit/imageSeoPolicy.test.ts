import { describe, expect, it } from "vitest";
import { genericStem, isSemanticFilename, keywordStuffing, filenameForbidden, repeatedKeywordCount } from "../../scripts/lib/image-seo-policy.mjs";

describe("image SEO filename policy", () => {
  it("accepts descriptive lowercase semantic filenames", () => {
    expect(isSemanticFilename("paper-cup-fan-product-reference-01.webp")).toBe(true);
    expect(isSemanticFilename("factory-showroom-interior-01.jpg")).toBe(true);
  });

  it("rejects AI, generic, stuffed and repeated names", () => {
    expect(filenameForbidden.test("ai-generated-box.webp")).toBe(true);
    expect(genericStem.test("image")).toBe(true);
    expect(keywordStuffing.test("best-paper-supplier.webp")).toBe(true);
    expect(repeatedKeywordCount("paper-paper-reference.webp")).toBe(2);
    expect(isSemanticFilename("AI_Box.webp")).toBe(false);
  });
});
