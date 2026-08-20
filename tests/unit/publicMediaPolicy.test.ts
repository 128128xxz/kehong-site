import { describe, expect, it } from "vitest";
import { hasLegacyImageStatus, isDisallowedPublicMediaPath, isNeutralMediaFilename } from "../../scripts/lib/public-media-policy.mjs";

describe("public media naming policy", () => {
  it.each(["/images/ai/example.webp", "/media/ai-generated/product.webp", "/product-gpt-image.webp", "ai-representative", "AI-generated"])('rejects "%s"', (value) => {
    expect(isDisallowedPublicMediaPath(value) || hasLegacyImageStatus(value)).toBe(true);
  });

  it.each(["corrugated-board-main-01.webp", "detail-paper-01.webp", "mailto:sales@example.com"])('handles neutral values safely: "%s"', (value) => {
    if (value.startsWith("mailto:")) expect(isDisallowedPublicMediaPath(value)).toBe(false);
    else expect(isNeutralMediaFilename(value)).toBe(true);
  });
});
