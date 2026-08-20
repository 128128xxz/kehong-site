import { expect, test } from "@playwright/test";

test.describe("Production SSR/CDN consistency", () => {
  test("raw HTML carries the current build and homepage architecture", async ({ request }, testInfo) => {
    const origin = (process.env.PRODUCTION_BASE_URL || testInfo.project.use.baseURL || "https://www.kehong.tech").replace(/\/+$/u, "");
    const expectedBuildSha = process.env.EXPECTED_PRODUCTION_BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA;

    const root = await request.get(`${origin}/`, { maxRedirects: 0, headers: { "accept-language": "zh-CN,zh;q=0.9" } });
    expect(root.status()).toBe(307);
    expect(root.headers().location).toBe("/zh");
    expect(root.headers()["cache-control"]).toContain("private");
    expect(root.headers()["cache-control"]).toContain("no-store");
    expect(root.headers().vary).toContain("Cookie");

    const fetchPage = (suffix: string, headers?: Record<string, string>) =>
      request.get(`${origin}/en${suffix}`, { headers, maxRedirects: 0 });

    const normal = await fetchPage("");
    const noCache = await fetchPage("", { "Cache-Control": "no-cache", Pragma: "no-cache" });
    const cacheBust = await fetchPage(`?__ssr_audit=${Date.now()}`);

    for (const response of [normal, noCache, cacheBust]) {
      expect(response.status()).toBe(200);
      expect(response.headers()["x-kehong-build-sha"]).toBeTruthy();
      if (expectedBuildSha) expect(response.headers()["x-kehong-build-sha"]).toBe(expectedBuildSha);
      expect(response.headers()["x-kehong-data-revision"]).toBeTruthy();
    }
    expect(new Set([normal, noCache, cacheBust].map((response) => response.headers()["x-kehong-build-sha"])).size).toBe(1);
    expect(new Set([normal, noCache, cacheBust].map((response) => response.headers()["x-kehong-data-revision"])).size).toBe(1);

    expect(root.headers()["x-kehong-build-sha"]).toBe(normal.headers()["x-kehong-build-sha"]);
    expect(root.headers()["x-kehong-data-revision"]).toBe(normal.headers()["x-kehong-data-revision"]);

    const html = await normal.text();
    expect(html).not.toContain("0 products");
    expect(html).toContain("Kehong supplies corrugated board, specialty and functional paper");
    expect(html).toContain("kh-home-hero");
    expect(html).toContain("Paper materials &amp; semi-finished components");
    expect(html).not.toContain("Popular products");

    const productPath = "/zh/products/kh-fd-cuproll-150350-pr-032-pe-coated-paper-roll-for-paper-cup";
    const [baseProduct, expandedProduct] = await Promise.all([
      request.get(`${origin}${productPath}`, { maxRedirects: 0 }),
      request.get(`${origin}${productPath}?variants=all`, { maxRedirects: 0 }),
    ]);
    for (const response of [baseProduct, expandedProduct]) {
      expect(response.status()).toBe(200);
      const productHtml = await response.text();
      expect(productHtml).toContain("150–350 GSM");
      expect(productHtml).toContain("最大宽度：1200 mm");
      expect(productHtml).not.toMatch(/常规起订量通常为|metric tons \(typical\)|150-350gsm|Current SKU|Max width 1200mm|PE coating|PLA coating/u);
      expect(productHtml).toContain(`href="https://www.kehong.tech${productPath}"`);
      expect(productHtml).not.toContain("variants=all\" rel=\"canonical");
    }
  });

  test("Chinese product specification stays complete when JavaScript is disabled", async ({ browser }, testInfo) => {
    const origin = (process.env.PRODUCTION_BASE_URL || testInfo.project.use.baseURL || "https://www.kehong.tech").replace(/\/+$/u, "");
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${origin}/zh/products/kh-fd-cuproll-150350-pr-032-pe-coated-paper-roll-for-paper-cup?variants=all`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
    await expect(page.getByText("150–350 GSM", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("最大宽度：1200 mm", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Max width 1200mm");
    await context.close();
  });
});
