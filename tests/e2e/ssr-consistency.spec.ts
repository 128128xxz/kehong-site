import { expect, test } from "@playwright/test";

const auditEnabled = process.env.RUN_SSR_AUDIT === "1";

test.describe("Production SSR/CDN consistency", () => {
  test.skip(!auditEnabled, "Run with RUN_SSR_AUDIT=1 to audit the live production origin.");

  test("raw HTML carries the current build and homepage architecture", async ({ request }) => {
    const origin = (process.env.PRODUCTION_BASE_URL || "https://www.kehong.tech").replace(/\/+$/u, "");
    const expectedBuildSha = process.env.EXPECTED_PRODUCTION_BUILD_SHA || "01cf624";

    const root = await request.get(`${origin}/`, { maxRedirects: 0 });
    expect(root.status()).toBe(308);
    expect(root.headers().location).toBe("/en");

    const fetchPage = (suffix: string, headers?: Record<string, string>) =>
      request.get(`${origin}/en${suffix}`, { headers, maxRedirects: 0 });

    const normal = await fetchPage("");
    const noCache = await fetchPage("", { "Cache-Control": "no-cache", Pragma: "no-cache" });
    const cacheBust = await fetchPage(`?__ssr_audit=${Date.now()}`);

    for (const response of [normal, noCache, cacheBust]) {
      expect(response.status()).toBe(200);
      expect(response.headers()["x-kehong-build-sha"]).toBe(expectedBuildSha);
      expect(response.headers()["x-kehong-data-revision"]).toBeTruthy();
    }
    expect(new Set([normal, noCache, cacheBust].map((response) => response.headers()["x-kehong-data-revision"])).size).toBe(1);

    expect(root.headers()["x-kehong-build-sha"]).toBe(expectedBuildSha);
    expect(root.headers()["x-kehong-data-revision"]).toBe(normal.headers()["x-kehong-data-revision"]);

    const html = await normal.text();
    expect(html).not.toContain("0 products");
    expect(html).toContain("Two product systems");
    expect(html).toContain("Packaging solutions for real production needs");
    expect(html).toContain("Production you can verify");
    expect(html).not.toContain("Popular products");
  });
});
