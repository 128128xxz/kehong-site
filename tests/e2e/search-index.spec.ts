import { test, expect } from "@playwright/test";

const indexNowKey = "1e2355a1eb736793a342e4b8e2c503cf";

test("search verification file and discovery feeds stay public and canonical", async ({ request }) => {
  const keyResponse = await request.get(`/${indexNowKey}.txt`, { maxRedirects: 0 });
  expect(keyResponse.status()).toBe(200);
  expect(keyResponse.headers().location).toBeUndefined();
  expect((await keyResponse.text()).trim()).toBe(indexNowKey);

  const homeResponse = await request.get("/en", { maxRedirects: 0 });
  expect(homeResponse.status()).toBe(200);
  const homeHtml = await homeResponse.text();
  expect(homeHtml).toContain('name="sogou_site_verification"');
  expect(homeHtml).toContain('name="shenma-site-verification"');

  const yandexResponse = await request.get("/yandex_8b57a719979b9bf4.html", { maxRedirects: 0 });
  expect(yandexResponse.status()).toBe(200);
  expect(yandexResponse.headers().location).toBeUndefined();
  expect(await yandexResponse.text()).toContain("8b57a719979b9bf4");

  const robotsResponse = await request.get("/robots.txt", { maxRedirects: 0 });
  expect(robotsResponse.status()).toBe(200);
  expect(robotsResponse.headers().location).toBeUndefined();
  expect(await robotsResponse.text()).toContain("https://www.kehong.tech/sitemap.xml");

  const sitemapResponse = await request.get("/sitemap.xml", { maxRedirects: 0 });
  expect(sitemapResponse.status()).toBe(200);
  expect(sitemapResponse.headers().location).toBeUndefined();
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain("https://www.kehong.tech/en/news");
  expect(sitemap).toContain("https://www.kehong.tech/zh/news");
  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
  expect(sitemapLocations.every((url) => !/(?:preview|vercel\.app|\?|#)/iu.test(url))).toBe(true);

  for (const locale of ["en", "zh"]) {
    const rssResponse = await request.get(`/${locale}/news/rss.xml`, { maxRedirects: 0 });
    expect(rssResponse.status()).toBe(200);
    expect(rssResponse.headers().location).toBeUndefined();
    const rss = await rssResponse.text();
    expect(rss).toContain("<rss");
    expect(rss).toContain(`https://www.kehong.tech/${locale}/news/`);
  }
});
