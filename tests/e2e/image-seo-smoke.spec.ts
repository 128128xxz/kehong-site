import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const migrationMap = JSON.parse(readFileSync(path.join(process.cwd(), "docs/stage-1b-media-migration-map.json"), "utf8")) as { entries: { oldPath: string }[] };
const oldAiPaths = migrationMap.entries.map((entry) => entry.oldPath).filter((entry) => /(?:\/images\/ai|ai-generated|generated-by-ai|chatgpt|gpt)/i.test(entry));

test.describe("Stage 1B SEO media supplement", () => {
  test("serves semantic image sitemap without legacy paths", async ({ request }) => {
    const response = await request.get("/sitemap-images.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).toContain("http://www.google.com/schemas/sitemap-image/1.1");
    expect(xml).toContain("/media/products/");
    expect(xml).not.toMatch(/(?:ai-generated|generated-by-ai|chatgpt|gpt|\/images\/)/i);
  });

  test("keeps semantic rename direct and old AI paths unavailable", async ({ request }) => {
    const redirect = await request.get("/media/factory/factory.png", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toContain("/media/factory/paper-converting-factory-reference.png");

    const semantic = await request.get("/media/factory/paper-converting-factory-reference.png");
    expect(semantic.status()).toBe(200);

    for (const oldPath of oldAiPaths) {
      const oldAi = await request.get(oldPath, { maxRedirects: 0 });
      expect([404, 410], oldPath).toContain(oldAi.status());
    }
  });
});
