import { expect, test } from "@playwright/test";

test.describe("locale routing and dedicated mobile shell", () => {
  test("root locale precedence preserves UTM and bypasses explicit/static routes", async ({ request }) => {
    const cn = await request.get("/?utm_source=cn", {
      maxRedirects: 0,
      headers: { "accept-language": "zh-CN,zh;q=0.9,en;q=0.8" },
    });
    expect(cn.status()).toBe(307);
    expect(cn.headers().location).toBe("/zh?utm_source=cn");

    const nonCn = await request.get("/", {
      maxRedirects: 0,
      headers: { "x-vercel-ip-country": "US" },
    });
    expect(nonCn.status()).toBe(307);
    expect(nonCn.headers().location).toBe("/en");

    const cookieWins = await request.get("/", {
      maxRedirects: 0,
      headers: { "accept-language": "zh-CN,zh;q=0.9", cookie: "kehong_locale=en" },
    });
    expect(cookieWins.headers().location).toBe("/en");

    const languageFallback = await request.get("/", {
      maxRedirects: 0,
      headers: { "accept-language": "zh-CN,zh;q=0.9" },
    });
    expect(languageFallback.headers().location).toBe("/zh");

    for (const path of ["/en", "/zh"]) {
      const explicit = await request.get(path, {
        maxRedirects: 0,
        headers: { "x-vercel-ip-country": path === "/en" ? "CN" : "US" },
      });
      expect(explicit.status()).toBe(200);
      expect(explicit.headers().location).toBeUndefined();
    }

    const api = await request.get("/api/health", { maxRedirects: 0, headers: { "accept-language": "zh-CN,zh;q=0.9" } });
    expect(api.status()).not.toBe(307);
    const asset = await request.get("/brand/kehong-favicon-v2.ico", { maxRedirects: 0, headers: { "accept-language": "zh-CN,zh;q=0.9" } });
    expect(asset.status()).toBe(200);
  });

  test("mobile drawer traps focus, locks body scroll, supports backdrop close and restores focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/zh", { waitUntil: "networkidle" });
    const toggle = page.locator('button[aria-controls="kh-mobile-menu"]');
    await toggle.click();
    await expect(page.locator("#kh-mobile-menu")).toBeVisible();
    await expect(page.locator(".kh-mobile-backdrop")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await page.locator(".kh-mobile-backdrop").click({ position: { x: 8, y: 8 } });
    await expect(page.locator("#kh-mobile-menu")).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("mobile sticky actions and footer accordion remain usable without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await expect(page.getByTestId("mobile-sticky-actions")).toBeVisible();
    await expect(page.getByTestId("mobile-sticky-actions").getByRole("link", { name: /Get a quote/i })).toHaveAttribute("href", "/en/contact");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

    const group = page.locator("footer details").first();
    await expect(group).toHaveAttribute("open", "");
    await group.locator("summary").click();
    await expect(group).not.toHaveAttribute("open", "");
    await group.locator("summary").click();
    await expect(group).toHaveAttribute("open", "");
  });
});
