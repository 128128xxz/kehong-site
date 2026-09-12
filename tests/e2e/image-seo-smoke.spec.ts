import { test, expect } from "@playwright/test";
import { getAllSkus } from "@/lib/catalog";
import { getSkuImageMeta } from "@/lib/productImages";

test.describe("current production image system", () => {
  test("serves the current image sitemap without retired path markers", async ({ request }) => {
    const response = await request.get("/sitemap-images.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).toContain("http://www.google.com/schemas/sitemap-image/1.1");
    expect(xml).toContain("/media/products/");
    expect(xml).not.toMatch(/(?:ai-generated|generated-by-ai|chatgpt|gpt|\/images\/)/i);
  });

  test("serves a usable current image for every public SKU", async ({ request }) => {
    const publicSkus = getAllSkus();
    expect(publicSkus).toHaveLength(83);
    for (const sku of publicSkus) {
      const meta = getSkuImageMeta(sku, "en");
      expect(meta.src, sku.sku).toMatch(/^\/media\//u);
      expect(meta.alt, sku.sku).toBeTruthy();
      const image = await request.get(meta.src);
      expect(image.status(), `${sku.sku}: ${meta.src}`).toBe(200);
    }
  });
});
