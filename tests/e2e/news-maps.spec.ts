import { expect, test } from "@playwright/test";

test.describe("factory maps and News & Insights", () => {
  test("routes and map providers stay locale-specific", async ({ page, request }) => {
    for (const locale of ["zh", "en"]) {
      const mapHost = locale === "zh" ? "map.baidu.com" : "www.google.com";
      const mapLabel = locale === "zh" ? /查看位置/ : /View location/;
      for (const path of [`/${locale}/contact`, `/${locale}/factory`, `/${locale}`]) {
        const response = await request.get(path);
        expect(response.status()).toBe(200);
        const html = await response.text();
        expect(html).toContain(mapHost);
        expect(html).toContain("noopener noreferrer");
        const mapHref = (html.match(new RegExp(`https://${mapHost.replaceAll(".", "\\.")}[^\\\" ]+`)) ?? [""])[0];
        expect(decodeURIComponent(mapHref)).toContain("佛山市布新工业区科宏纸品");
      }
      await page.goto(`/${locale}/contact`, { waitUntil: "networkidle" });
      const map = page.locator(`a[href*="${mapHost}"]`).first();
      await expect(map).toBeVisible();
      await expect(map).toHaveAttribute("target", "_blank");
      await expect(map).toHaveAttribute("rel", "noopener noreferrer");
      await expect(map).toContainText(mapLabel);
    }
  });

  test("location cards expose localized labels, provider metadata and safe external links", async ({ page }) => {
    for (const [locale, provider, label, sourceBlock] of [["zh", "baidu", "查看位置", "contact"], ["en", "google", "View location", "factory"]] as const) {
      await page.goto(`/${locale}/${sourceBlock === "contact" ? "contact" : "factory"}`, { waitUntil: "networkidle" });
      const link = page.locator(`a[data-location-source="${sourceBlock}"]`).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("data-map-provider", provider);
      await expect(link).toContainText(label);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("news hub, paired articles, RSS, SEO and share links are public", async ({ page, request }) => {
    for (const locale of ["zh", "en"]) {
      const hub = await request.get(`/${locale}/news`);
      expect(hub.status()).toBe(200);
      const html = await hub.text();
      expect(html).toContain(locale === "zh" ? "新闻与洞察" : "News &amp; Insights");
      expect((html.match(/data-news-card/g) ?? []).length).toBe(6);
      const rss = await request.get(`/${locale}/news/rss.xml`);
      expect(rss.status()).toBe(200);
      expect(rss.headers()["content-type"]).toContain("application/rss+xml");
      expect(await rss.text()).toContain("<item>");
      await page.goto(`/${locale}/news`, { waitUntil: "networkidle" });
      await expect(page.locator("[data-news-archive-grid] [data-news-card]")).toHaveCount(6);
      await page.getByRole("button", { name: locale === "zh" ? "包装采购指南" : "Packaging buying guides" }).click();
      await expect(page.locator("[data-news-archive-grid] [data-news-card]")).toHaveCount(4);
      const firstArticle = page.locator("[data-news-archive-grid] a[href*='/news/']").first();
      await firstArticle.click();
      await expect(page.locator("article.kh-news-article h2").first()).toBeVisible();
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
      const linkedInHref = await page.locator(".kh-news-share").getByRole("link", { name: /LinkedIn/ }).getAttribute("href");
      const whatsappHref = await page.locator(".kh-news-share").getByRole("link", { name: /WhatsApp/ }).getAttribute("href");
      expect(decodeURIComponent(linkedInHref ?? "")).toContain("utm_source=linkedin");
      expect(decodeURIComponent(whatsappHref ?? "")).toContain("utm_source=copy");
      await expect(page.getByRole("link", { name: locale === "zh" ? "提交询盘" : "Start a project brief" }).first()).toBeVisible();
    }
  });
});
