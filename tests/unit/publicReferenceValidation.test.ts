import { describe, expect, it } from "vitest";
import {
  classifyPublicReference,
  extractPublicReferences,
  findMissingPublicReferences,
} from "../../scripts/lib/public-ref-utils.mjs";

describe("public asset reference classification", () => {
  it.each([
    ["/images/:path*", "dynamic"],
    ["/media/:category/:file*", "dynamic"],
    ["https://example.com/image.webp", "ignored"],
    ["data:image/svg+xml,<svg></svg>", "ignored"],
    ["blob:https://example.com/image", "ignored"],
    ["/images/\${slug}.webp", "dynamic"],
    ["/images/[...segments]", "dynamic"],
    ["/images/product.webp", "physical"],
    ["/media/products/example.webp", "physical"],
    ["/images/definitely-missing-file.webp", "physical"],
    ["/media/products/missing-product-image.webp", "physical"],
  ])("classifies %s as %s", (ref, kind) => {
    expect(classifyPublicReference(ref).kind).toBe(kind);
  });

  it("extracts quoted public roots without treating unrelated URLs as assets", () => {
    const refs = extractPublicReferences(
      'const a = "/images/product.webp"; const b = "/images/:path*"; const c = "https://example.com/image.webp";',
    );
    expect(refs).toEqual(["/images/product.webp", "/images/:path*"]);
  });

  it("checks physical files while ignoring dynamic and external references", () => {
    const root = process.cwd();
    expect(findMissingPublicReferences(root, ["/media/shared/wechat-qr.png"])).toEqual([]);
    expect(findMissingPublicReferences(root, ["/images/definitely-missing-file.webp"])).toEqual([
      "/images/definitely-missing-file.webp",
    ]);
    expect(findMissingPublicReferences(root, ["/media/products/missing-product-image.webp"])).toEqual([
      "/media/products/missing-product-image.webp",
    ]);
    expect(findMissingPublicReferences(root, ["/images/:path*", "https://example.com/image.webp"])).toEqual([]);
  });
});
