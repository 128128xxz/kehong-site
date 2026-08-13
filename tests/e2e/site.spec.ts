import { expect, test } from "@playwright/test";

async function expectNoConsoleErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test.describe("Kehong production flows", () => {
  test("root selects a locale without caching a visitor-specific redirect", async ({ request }) => {
    const zh = await request.get("/?utm_source=qa", { maxRedirects: 0, headers: { "accept-language": "zh-CN,zh;q=0.9" } });
    expect(zh.status()).toBe(307);
    expect(zh.headers().location).toBe("/zh?utm_source=qa");
    expect(zh.headers()["cache-control"]).toContain("private");
    const english = await request.get("/", { maxRedirects: 0, headers: { cookie: "kehong_locale=en" } });
    expect(english.status()).toBe(307);
    expect(english.headers().location).toBe("/en");
  });

  test("header and footer use the clean supplied transparent mark asset", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const headerLogo = page.locator(".kh-header-brand-mark");
    await expect(headerLogo).toBeVisible();
    await expect(headerLogo).toHaveAttribute("src", /kehong-mark-transparent\.png/);
    await expect(page.locator(".kh-brand-name")).toHaveText("Kehong Paper Products");
    await expect(page.locator(".kh-brand-tag")).toHaveText("Paper materials & custom packaging");
    await expect(page.locator(".kh-monogram")).toHaveCount(0);
    await expect(page.locator(".kh-footer-brand-mark")).toHaveAttribute("src", /kehong-mark-transparent\.png/);
    await expect(page.locator(".kh-footer-brand-name")).toHaveText("Kehong");
    await expect(page.locator(".kh-footer-brand-tag")).toHaveText("Paper products & custom packaging");
    await page.goto("/zh", { waitUntil: "networkidle" });
    await expect(page.locator(".kh-brand-name")).toHaveText("科宏纸品");
    await expect(page.locator(".kh-brand-tag")).toHaveText("纸材、半成品与定制纸包装");
  });

  test("all public routes inherit the versioned Kehong mark-only favicon configuration", async ({ request }) => {
    for (const path of ["/en", "/zh", "/en/products", "/zh/contact", "/en/packaging/takeout-boxes", "/zh/resources", "/en/model-preview"]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain("/brand/kehong-favicon-v2.ico");
      expect(html).toContain("/brand/kehong-tab-icon-v2-32.png");
      expect(html).toContain("/brand/kehong-apple-touch-icon-v2.png");
      expect(html).toContain("/site.webmanifest");
      expect(html).not.toContain("/brand/kehong-mark-32.png");
      expect(html).not.toMatch(/vercel\.svg|vercel\.com\/favicon/i);
    }

    const manifest = await request.get("/site.webmanifest");
    expect(manifest.status()).toBe(200);
    expect(await manifest.json()).toMatchObject({
      icons: expect.arrayContaining([
        expect.objectContaining({ src: "/brand/kehong-pwa-icon-v2-192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/brand/kehong-pwa-icon-v2-512.png", sizes: "512x512" }),
      ]),
    });

    const favicon = await request.get("/favicon.ico");
    expect(favicon.status()).toBe(200);
    expect(favicon.headers()["content-type"]).toMatch(/image\/(?:x-icon|vnd\.microsoft\.icon)/);
  });

  test("legacy all-products route permanently redirects to the canonical directory and preserves filters", async ({ request }) => {
    for (const locale of ["en", "zh"]) {
      const response = await request.get(`/${locale}/packaging/all-products?category=food-grade-paper&productType=paper-cup-fan`, {
        maxRedirects: 0,
      });
      expect([301, 308]).toContain(response.status());
      expect(response.headers().location).toBe(`/${locale}/products?category=food-grade-paper&productType=paper-cup-fan`);
    }
  });

  test("retired Labels & Stickers URLs permanently resolve to the finished-packaging parent", async ({ request }) => {
    for (const locale of ["en", "zh"]) {
      const response = await request.get(`/${locale}/packaging/labels-stickers?utm_source=legacy`, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(`/${locale}/packaging?utm_source=legacy`);
    }
  });

  test("retired locales permanently redirect to their active English route without losing inquiry or UTM query", async ({ request }) => {
    const cases = [
      ["/id", "/en"],
      ["/id/products", "/en/products"],
      ["/id/packaging/takeout-boxes", "/en/packaging/takeout-boxes"],
      ["/id/packaging/pillow-boxes", "/en/packaging"],
      ["/id/resources/not-a-public-resource", "/en/resources"],
    ] as const;
    for (const [from, target] of cases) {
      const response = await request.get(`${from}?product=Paper%20Bags&utm_source=qa`, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      const location = new URL(response.headers().location!, "https://www.kehong.tech");
      expect(location.pathname).toBe(target);
      expect(location.searchParams.get("product")).toBe("Paper Bags");
      expect(location.searchParams.get("utm_source")).toBe("qa");
    }

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapXml = await sitemap.text();
    expect(sitemapXml).not.toContain("/id/");
    expect(sitemapXml).toContain("/en/");
    expect(sitemapXml).toContain("/zh/");
  });

  test("every retired public locale keeps representative routes permanently consolidated", async ({ request }) => {
    const routes = [
      ["", "/en"], ["products", "/en/products"], ["products/kh-fd-cupfan-150350-pr-001-paper-cup-fan", "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan"],
      ["packaging", "/en/packaging"], ["packaging/paper-bags", "/en/packaging/paper-bags"], ["packaging/pillow-boxes", "/en/packaging"],
      ["resources", "/en/resources"], ["contact", "/en/contact"], ["privacy", "/en/privacy"], ["terms", "/en/terms"],
    ] as const;
    for (const locale of ["es", "id", "vi", "th", "ms"]) {
      for (const [route, expectedPath] of routes) {
        const response = await request.get(`/${locale}${route ? `/${route}` : ""}?utm_source=qa`, { maxRedirects: 0 });
        expect(response.status()).toBe(308);
        const location = new URL(response.headers().location!, "https://www.kehong.tech");
        expect(location.pathname).toBe(expectedPath);
        expect(location.searchParams.get("utm_source")).toBe("qa");
      }
    }
  });

  test("core pages load without console or hydration errors", async ({ page }) => {
    const errors = await expectNoConsoleErrors(page);
    for (const path of ["/en", "/en/products", "/en/contact"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /www\.kehong\.tech/);
      await expectNoHorizontalOverflow(page);
    }
    expect(errors.filter((message) => /hydration|console/i.test(message))).toEqual([]);
  });

  test("English public output has no legacy domain or untranslated CJK fields", async ({ page }) => {
    for (const path of ["/en", "/en/products", "/en/contact"]) {
      const errors: string[] = [];
      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(path, { waitUntil: "networkidle" });
      const html = await page.content();
      expect(html).not.toContain(["kehong", "paper.com"].join(""));
      expect(html).not.toMatch(/[\u3400-\u9fff]/u);
      expect(errors).toEqual([]);
    }
  });

  for (const width of [320, 360, 375, 390, 412, 768, 1440]) {
    test(`/en/products has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/en/products", { waitUntil: "networkidle" });
      await expectNoHorizontalOverflow(page);
      if (width < 1024) {
        await page.getByRole("button", { name: /filter products/i }).click();
      }
      await expect(page.locator("select").first()).toBeVisible();
      await page.locator("select").first().focus();
      await page.keyboard.press("Escape");
    });
  }

  test("product filter is operable and survives refresh", async ({ page }) => {
    await page.goto("/en/products", { waitUntil: "networkidle" });
    const category = page.locator("select").first();
    const optionCount = await category.locator("option").count();
    expect(optionCount).toBeGreaterThan(1);
    await category.selectOption({ index: 1 });
    await expect(page).toHaveURL(/category=/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/category=/);
  });

  test("query product direction is server-filtered and remains filtered after hydration", async ({ page, request }) => {
    for (const locale of ["en", "zh"]) {
      const path = `/${locale}/products?productType=paper-cup-fan`;
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain(locale === "zh" ? "纸杯扇形片" : "Paper Cup Fan");
      expect(html).toContain('data-product-group-id="paper-cup-fan-paper-cup-fan"');
      expect(html).not.toContain('data-product-group-id="paper-cup-fan-paper-cup-bottom-roll"');
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("article")).toHaveCount(1);
    }
  });

  test("materials entry includes cupstock and packaging entry reaches the overview", async ({ page }) => {
    await page.goto("/en/products?collection=materials", { waitUntil: "networkidle" });
    await expect(page.getByText("Cupstock Paper", { exact: true }).first()).toBeVisible();
    const overview = await page.goto("/en/packaging", { waitUntil: "networkidle" });
    expect(overview?.ok()).toBe(true);
    await expect(page.locator('main a[href="/en/packaging/cake-boxes"]').last()).toBeVisible();
  });

  test("interest-only inquiry stays out of products and is included separately in the submitted payload", async ({ page }) => {
    let payload = "";
    await page.route("**/api/inquiry", async (route) => {
      payload = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/en/contact?interest=artwork-review", { waitUntil: "networkidle" });
    await expect(page.getByText("Selected request: Artwork review", { exact: true }).first()).toBeVisible();
    await expect(page.locator('input[name="products"]').first()).toHaveValue("");
    await page.locator('input[name="name"]').first().fill("Playwright QA");
    await page.locator('input[name="email"]').first().fill("qa@example.com");
    await page.locator('input[name="privacy"]').first().check();
    await page.getByRole("button", { name: /send quick quote/i }).click();
    expect(payload).toMatch(/name="interestId"[\s\S]*?artwork-review/);
    expect(payload).toMatch(/name="products"\s*\r?\n\r?\n\s*\r?\n/);
  });

  test("product and interest remain visible and separate through a quick quote payload", async ({ page }) => {
    let payload = "";
    await page.route("**/api/inquiry", async (route) => {
      payload = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/en/contact?product=kh-fd-cupfan-150350-pr-001-paper-cup-fan&interest=dieline-request", { waitUntil: "networkidle" });
    await expect(page.getByText(/Selected product:/).first()).toBeVisible();
    await expect(page.getByText("Selected request: Dieline request", { exact: true }).first()).toBeVisible();
    await expect(page.locator('input[name="products"]').first()).toHaveValue(/Current SKU: KH-FD-CUPFAN-150350-PR-001/);
    await page.locator('input[name="name"]').first().fill("Playwright QA");
    await page.locator('input[name="email"]').first().fill("qa-product-interest@example.com");
    await page.locator('input[name="privacy"]').first().check();
    await page.getByRole("button", { name: /send quick quote/i }).click();
    expect(payload).toMatch(/name="interestId"[\s\S]*?dieline-request/);
    expect(payload).toMatch(/name="productGroupId"[\s\S]*?paper-cup-fan-paper-cup-fan/);
    expect(payload).toMatch(/name="products"[\s\S]*?Paper Cup Fan/);
  });

  test("resource CTAs preserve their distinct inquiry directions in both locales", async ({ page }) => {
    const resourceCases = [
      { slug: "artwork-guidelines", interest: "artwork-review" },
      { slug: "dielines-templates", interest: "dieline-request" },
    ];
    for (const locale of ["en", "zh"]) {
      for (const item of resourceCases) {
        await page.goto(`/${locale}/resources/${item.slug}`, { waitUntil: "domcontentloaded" });
        await page.locator("main a[href*='/contact']").first().click();
        await expect(page).toHaveURL(new RegExp(`/contact\\?interest=${item.interest}`));
      }
      await page.goto(`/${locale}/model-preview`, { waitUntil: "domcontentloaded" });
      await page.locator("main a[href*='/contact']").first().click();
      await expect(page).toHaveURL(/\/contact\?interest=structure-review/);
    }
  });

  test("desktop navigation gives the 3D studio its own entry and groups resources", async ({ page }) => {
    const cases = [
      {
        locale: "zh",
        modelLabel: "3D结构展厅",
        resourceLabel: "资源",
        overview: "资源中心",
        groups: ["设计与打样", "采购与内容"],
        links: ["设计稿指南", "刀模图与模板", "采购与询价指南", "新闻与洞察"],
      },
      {
        locale: "en",
        modelLabel: "3D Packaging Studio",
        resourceLabel: "Resources",
        overview: "Resource Center",
        groups: ["Artwork & Sampling", "Buying & Insights"],
        links: ["Artwork Guide", "Dielines & Templates", "Buying & Quotation Guide", "News & Insights"],
      },
    ] as const;

    for (const item of cases) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`/${item.locale}`, { waitUntil: "networkidle" });
      const modelLink = page.getByTestId("header-model-preview-link");
      await expect(modelLink).toHaveText(new RegExp(item.modelLabel));
      await expect(modelLink).toHaveAttribute("href", `/${item.locale}/model-preview`);
      await expect(modelLink).not.toHaveAttribute("aria-haspopup", "true");
      await modelLink.click();
      await expect(page).toHaveURL(new RegExp(`/${item.locale}/model-preview$`));
      await expect(page.locator("h1")).toHaveText(item.modelLabel);
      await expect(page.locator(`nav[aria-label="${item.locale === "zh" ? "面包屑" : "Breadcrumb"}"]`)).toContainText(item.modelLabel);

      await page.goto(`/${item.locale}`, { waitUntil: "networkidle" });
      const resourcesButton = page.getByRole("button", { name: item.resourceLabel, exact: true });
      await resourcesButton.hover();
      const panel = page.getByTestId("header-resources-menu");
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(item.overview);
      for (const heading of item.groups) await expect(panel).toContainText(heading);
      for (const link of item.links) await expect(panel.getByText(link, { exact: true })).toBeVisible();
      await expect(panel).not.toContainText(item.modelLabel);
      await expect(panel.locator("a")).toHaveCount(5);
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
    }
  });

  test("mobile navigation keeps 3D independent and resources two levels deep", async ({ page }) => {
    for (const item of [
      { locale: "zh", modelLabel: "3D结构展厅", resourceLabel: "资源", links: ["资源中心", "设计稿指南", "刀模图与模板", "采购与询价指南", "新闻与洞察"] },
      { locale: "en", modelLabel: "3D Packaging Studio", resourceLabel: "Resources", links: ["Resource Center", "Artwork Guide", "Dielines & Templates", "Buying & Quotation Guide", "News & Insights"] },
    ] as const) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${item.locale}`, { waitUntil: "networkidle" });
      await page.locator('button[aria-controls="kh-mobile-menu"]').click();
      const drawer = page.locator("#kh-mobile-menu");
      await expect(drawer).toBeVisible();
      const modelLink = drawer.getByTestId("mobile-model-preview-link");
      await expect(modelLink).toHaveText(new RegExp(item.modelLabel));
      await expect(modelLink).toHaveAttribute("href", `/${item.locale}/model-preview`);
      await expect(drawer.locator('details.kh-mobile-resource-directory > summary')).toHaveText(new RegExp(item.resourceLabel));
      await drawer.locator('details.kh-mobile-resource-directory > summary').click();
      const resourceDirectory = drawer.locator(".kh-mobile-resource-directory");
      for (const link of item.links) await expect(resourceDirectory.getByRole("link", { name: link, exact: true })).toBeVisible();
      await expect(resourceDirectory.locator("details")).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
  });

  test("contact channels and legal email links stay locale-specific", async ({ page }) => {
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}/contact`, { waitUntil: "networkidle" });
      const expectedSubject = locale === "zh" ? "%E7%A7%91%E5%AE%8F%E7%BA%B8%E5%93%81%E8%AF%A2%E7%9B%98" : "Kehong%20packaging%20inquiry";
      await expect(page.locator('main a[href^="mailto:"]').first()).toHaveAttribute("href", new RegExp(`subject=${expectedSubject}`));
      if (locale === "zh") {
        await expect(page.locator("main")).not.toContainText("WhatsApp");
        await expect(page.locator('main a[href^="tel:+8615888233221"]').first()).toBeVisible();
        await expect(page.getByTestId("wechat-contact").first()).toBeVisible();
      } else {
        await expect(page.locator('main a[href^="https://wa.me/"]').first()).toHaveAttribute("rel", "noopener noreferrer");
        await expect(page.locator('main a[href^="tel:+447599669700"]').first()).toBeVisible();
      }
      await expect(page.locator('footer a[href^="mailto:"]').first()).toHaveAttribute("href", new RegExp(`subject=${expectedSubject}`));

      for (const legal of ["privacy", "terms"]) {
        await page.goto(`/${locale}/${legal}`, { waitUntil: "networkidle" });
        await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(1);
        await expect(page.locator('main a[href^="mailto:"]')).toHaveAttribute("aria-label", /Email|发送邮件/);
      }
    }
  });

  test("Chinese buyer-facing pages use WeChat and phone instead of WhatsApp", async ({ page }) => {
    for (const path of ["/zh", "/zh/products", "/zh/factory", "/zh/contact", "/zh/resources"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("body")).not.toContainText("WhatsApp");
    }
    await page.goto("/zh/contact", { waitUntil: "networkidle" });
    await expect(page.locator("body")).toContainText("+86 15888233221");
    await expect(page.getByTestId("wechat-contact").first()).toBeVisible();
  });

  test("all quick and guided consent labels keep only the privacy policy link interactive", async ({ page }) => {
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}/contact`, { waitUntil: "networkidle" });
      const quickCheckbox = page.locator("#quick-quote-privacy");
      const quickLabel = page.locator('label[for="quick-quote-privacy"]');
      await expect(quickLabel).toContainText(locale === "zh" ? "隐私政策" : "Privacy Policy");
      const quickLink = quickLabel.locator("a");
      await expect(quickLink).toHaveCount(1);
      await quickLink.evaluate((anchor) => anchor.addEventListener("click", (event) => event.preventDefault(), { once: true }));
      await quickLink.click();
      await expect(quickCheckbox).not.toBeChecked();

      await page.locator("#quote-form details > summary").click();
      for (let step = 0; step < 4; step += 1) await page.getByRole("button", { name: locale === "zh" ? "下一步" : "Continue" }).click();
      const guidedCheckbox = page.locator("#guided-quote-privacy");
      const guidedLabel = page.locator('label[for="guided-quote-privacy"]');
      await expect(guidedLabel).toContainText(locale === "zh" ? "隐私政策" : "Privacy Policy");
      const guidedLink = guidedLabel.locator("a");
      await expect(guidedLink).toHaveCount(1);
      await guidedLink.evaluate((anchor) => anchor.addEventListener("click", (event) => event.preventDefault(), { once: true }));
      await guidedLink.click();
      await expect(guidedCheckbox).not.toBeChecked();
    }
  });

  test("selected products persist when moving from catalog to contact", async ({ page }) => {
    await page.goto("/en/products", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /add to inquiry/i }).first().click();
    await expect.poll(() => page.evaluate(() => window.sessionStorage.getItem("kehong-selected-products") || "")).toMatch(/KH-/);
    await page.goto("/en/contact", { waitUntil: "networkidle" });
    await expect(page.locator('input[name="products"]').first()).toHaveValue(/KH-/);
  });

  test("3D showroom is discoverable and has a working preview route", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator('footer a[href*="/model-preview"]')).toBeVisible();
    await page.goto("/en/model-preview", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText("kehong-reference-pizza-box.glb")).toHaveCount(0);
    await expect(page.getByText("GLB / ACES / sRGB / soft shadow")).toHaveCount(0);
  });

  test("3D public server HTML has no asset or renderer implementation labels", async ({ request }) => {
    for (const locale of ["en", "zh"]) {
      const response = await request.get(`/${locale}/model-preview`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      for (const forbidden of [".glb", " MB", "ACES", "sRGB", "soft shadow", "third-party marks"]) {
        expect(html).not.toContain(forbidden);
      }
    }
  });

  test("homepage product entries do not link buyers to unsupported empty filters", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByText("Scroll", { exact: true })).toHaveCount(0);
    const productLinks = page.getByTestId("homepage-product-entry");
    await expect(productLinks).toHaveCount(6);
    expect(new Set(await productLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))).size).toBe(6);
  });

  test("English and Chinese product entry links resolve to a real range, category or inquiry", async ({ page }) => {
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      const entries = page.getByTestId("homepage-product-entry");
      await expect(entries).toHaveCount(6);
      const hrefs = await entries.evaluateAll((links) => links.map((link) => link.getAttribute("href") || ""));
      for (const href of hrefs) {
        const response = await page.goto(href, { waitUntil: "domcontentloaded" });
        expect(response?.ok()).toBe(true);
        await expect(page.getByText(/no matching products/i)).toHaveCount(0);
      }
    }
  });

  test("Chinese buyer pages do not expose English form or 3D control residue", async ({ page }) => {
    const prohibited = [
      "Scroll",
      "Paper cup fan",
      "Die-cut blanks & cupstock components",
      "Reference image, dieline or brief (optional)",
      "Request a quote",
      "Project",
      "Size & quantity",
      "Material & structure",
      "Printing & finish",
      "Delivery & contact",
      "Front",
      "Side",
      "Top",
      "Asset",
      "No third-party marks",
      "soft shadow",
    ];
    for (const path of ["/zh", "/zh/products", "/zh/contact", "/zh/model-preview"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const visibleText = await page.locator("body").innerText();
      for (const text of prohibited) expect(visibleText).not.toContain(text);
    }
  });

  test("homepage section sequence stays unique after the hero", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator(".kh-kicker-index")).toHaveText(["02", "03", "04", "05", "06"]);
  });

  test("home CTA keeps a compact brief and resource links", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator(".kh-cta-watermark")).toHaveCount(0);
    await expect(page.getByText("Inquiry checklist", { exact: true })).toBeVisible();
    await expect(page.locator('a[href="/en/resources"]').last()).toBeVisible();
    await expect(page.locator(".kh-spec-row")).toHaveCount(5);
  });

  test("language changes preserve contact product and interest prefill", async ({ page }) => {
    await page.goto("/en/contact?interest=pe-coated-paper-roll&product=kh-fd-cupfan-150350-pr-001-paper-cup-fan", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "English" }).click();
    await page.getByText("中文", { exact: true }).click();
    await expect(page).toHaveURL(/\/zh\/contact\?interest=pe-coated-paper-roll&product=kh-fd-cupfan-150350-pr-001-paper-cup-fan/);
    await expect(page.locator('input[name="products"]').first()).toHaveValue(/KH-/);
  });

  test("Chinese industry pages and metadata use Chinese copy", async ({ page }) => {
    for (const path of ["/zh/industries", "/zh/industries/bakery-packaging", "/zh/industries/retail-lifestyle", "/zh/industries/ecommerce-industrial-professional"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /[\u3400-\u9fff]/u);
    }
    await page.goto("/zh/industries", { waitUntil: "networkidle" });
    const content = await page.locator("main").innerText();
    for (const residue of ["food bakery beverage", "retail lifestyle", "ecommerce industrial professional", "Buyer-ready brief"]) expect(content.toLowerCase()).not.toContain(residue);
  });

  test("resource metadata follows the active locale and buyer support exposes the resource entry", async ({ page }) => {
    await page.goto("/zh/resources", { waitUntil: "networkidle" });
    await expect(page).toHaveTitle(/纸包装资源与设计支持 \| 科宏纸品/u);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /印刷文件/u);

    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator('a[href="/en/resources"]')).not.toHaveCount(0);
  });

  test("Chinese metadata and visible copy consistently use the Chinese brand and labels", async ({ page }) => {
    await page.goto("/zh/packaging", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("成品纸包装分类总览 | 科宏纸品");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "成品纸包装分类总览 | 科宏纸品");
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "成品纸包装分类总览 | 科宏纸品");

    await page.goto("/zh/model-preview", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("3D结构展厅 | 科宏纸品");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "在线查看包装结构与折叠方式。");
    await expect(page.locator('html')).toHaveAttribute("lang", "zh");

    await page.goto("/zh", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".kh-hero-index")).toContainText("佛山科宏纸品");
    await expect(page.locator(".kh-hero-index")).toContainText("20+ 年");

    await page.goto("/zh/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".kh-fig-caption").filter({ hasText: "图01 — 食品纸盒实拍" }).first()).toBeVisible();

    for (const [path, title] of [
      ["/zh/resources/artwork-guidelines", "设计稿指南 | 科宏纸品"],
      ["/zh/resources/dielines-templates", "刀模图与模板申请 | 科宏纸品"],
      ["/zh/factory", "工厂与服务能力 | 科宏纸品"],
      ["/zh/products", "产品目录 | 科宏纸品"],
      ["/zh/privacy", "隐私政策 | 科宏纸品"],
      ["/zh/terms", "使用条款 | 科宏纸品"],
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
    }
  });

  test("products directory separates published materials from finished packaging without exposing Labels & Stickers", async ({ page }) => {
    for (const [locale, materials, packaging] of [["en", "Paper materials & semi-finished components", "Finished packaging"], ["zh", "纸材与半成品", "成品包装"]] as const) {
      await page.goto(`/${locale}/products`, { waitUntil: "networkidle" });
      const materialsDirectory = page.locator("#materials-and-components");
      const finishedDirectory = page.locator("#finished-packaging");
      await expect(materialsDirectory).toContainText(materials);
      await expect(finishedDirectory).toContainText(packaging);
      await expect(materialsDirectory).not.toContainText(/Labels\s*&\s*Stickers|标签与贴纸/u);
      await expect(finishedDirectory).not.toContainText(/Labels\s*&\s*Stickers|标签与贴纸/u);
      await expect(page.locator("main")).not.toContainText(/Concept visualization|概念示意/u);
      await page.goto(`/${locale}/packaging/takeout-boxes`, { waitUntil: "networkidle" });
      await expect(page.locator("main")).not.toContainText(/Concept visualization|概念示意/u);
    }
  });

  test("factory address card routes Chinese visitors to Baidu directions and English visitors to Google Directions", async ({ page }) => {
    const mapDestination = "佛山市南海区布新工业区7号";
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}/factory`, { waitUntil: "networkidle" });
      const card = page.locator("main").locator("[data-location-card]").first();
      const mapLink = card.locator('a[data-location-action="view_location"]');
      await expect(mapLink).toBeVisible();
      await expect(mapLink).toHaveAttribute("target", "_blank");
      await expect(mapLink).toHaveAttribute("rel", "noopener noreferrer");
      const href = await mapLink.getAttribute("href");
      const url = new URL(href!);
      if (locale === "zh") {
        expect(url.hostname).toBe("api.map.baidu.com");
        expect(url.pathname).toBe("/direction");
        expect(url.searchParams.get("origin")).toBe("我的位置");
        expect(url.searchParams.get("destination")).toBe(mapDestination);
        expect(url.searchParams.get("region")).toBe("佛山");
        expect(url.searchParams.get("mode")).toBe("driving");
        expect(url.searchParams.get("output")).toBe("html");
        expect(url.searchParams.has("query")).toBe(false);
      } else {
        expect(url.hostname).toBe("www.google.com");
        expect(url.pathname).toBe("/maps/dir/");
        expect(url.searchParams.get("destination")).toBe(mapDestination);
        expect(url.searchParams.get("travelmode")).toBe("driving");
        expect(url.searchParams.has("query")).toBe(false);
      }
      await expect(card).toContainText(locale === "zh" ? mapDestination : "No. 7 Buxin Industrial Zone");
      await expect(mapLink).toContainText(locale === "zh" ? "查看位置" : "View location");
    }
  });

  test("Products Mega Menu Escape keeps focus return closed and requires an explicit reopen action", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en", { waitUntil: "networkidle" });
    const trigger = page.getByRole("button", { name: "Products", exact: true });
    const mega = page.getByTestId("header-product-mega-menu");
    await trigger.focus();
    await expect(mega).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(mega).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(mega.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(mega).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await page.waitForTimeout(220);
    await expect(mega).toHaveCount(0);
    await page.keyboard.press("Enter");
    await expect(mega).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(mega).toHaveCount(0);
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(mega).toBeVisible();
    await expect(mega.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");

    await trigger.hover();
    await expect(mega).toBeVisible();
    const triggerBox = await trigger.boundingBox();
    const megaBox = await mega.boundingBox();
    expect(triggerBox).toBeTruthy();
    expect(megaBox).toBeTruthy();
    await page.mouse.move(triggerBox!.x + triggerBox!.width / 2, triggerBox!.y + triggerBox!.height / 2);
    await page.mouse.move(megaBox!.x + Math.min(40, megaBox!.width / 4), megaBox!.y + 16, { steps: 8 });
    await expect(mega).toBeVisible();
    await expect(mega).toContainText("Paper materials & semi-finished components");
    await expect(mega).toContainText("Finished packaging");
    await expect(mega.locator(".kh-product-mega-section")).toHaveCount(2);
    await expect(mega.locator('[data-system="materials"] .kh-product-mega-group')).toHaveCount(3);
    await expect(mega.locator('[data-system="finished-packaging"] .kh-product-mega-group')).toHaveCount(3);
    await expect(mega).toContainText("Cupstock & cup components");
    await expect(mega).toContainText("Paper cup fan");
    await expect(mega).toContainText("Food & bakery packaging");
    await expect(mega).not.toContainText(/Labels\s*&\s*Stickers/u);
    await expect(mega.getByRole("link", { name: "Paper cup fan" })).toHaveAttribute("href", /group=paper-cup-fan-paper-cup-fan/);
    await expect(mega.getByRole("link", { name: "View specifications" })).toHaveAttribute("href", /#materials-and-components$/u);
    await expect(mega.getByRole("link", { name: "View packaging types" })).toHaveAttribute("href", /#finished-packaging$/u);
    await expect(mega.getByRole("link", { name: "View the complete product directory" })).toHaveAttribute("href", "/en/products");
    await page.keyboard.press("Escape");
    await expect(mega).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(mega).toBeVisible();
    await page.keyboard.press("Escape");

    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('button[aria-controls="kh-mobile-menu"]');
    await menu.click();
    const mobileDirectory = page.getByTestId("mobile-product-directory");
    await expect(mobileDirectory).toBeVisible();
    await expect(mobileDirectory.locator("details")).toHaveCount(2);
    await mobileDirectory.getByText("Paper materials & semi-finished components", { exact: true }).click();
    await expect(mobileDirectory.getByRole("link", { name: "Paper cup fan" })).toHaveAttribute("href", /group=paper-cup-fan-paper-cup-fan/);
    await expect(mobileDirectory.getByRole("link", { name: "View specifications" })).toHaveAttribute("href", /#materials-and-components$/u);
    await mobileDirectory.getByText("Finished packaging", { exact: true }).click();
    await expect(mobileDirectory.getByRole("link", { name: "Takeout boxes" })).toHaveAttribute("href", "/en/packaging/takeout-boxes");
    await expect(mobileDirectory.getByRole("link", { name: "View packaging types" })).toHaveAttribute("href", /#finished-packaging$/u);
    await expect(mobileDirectory.getByRole("link", { name: "View the complete product directory" })).toHaveAttribute("href", "/en/products");
    await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).resolves.toBe(true);
  });

  test("products page scopes SKU filters to materials and keeps finished packaging project-led", async ({ page }) => {
    await page.goto("/en/products", { waitUntil: "networkidle" });
    await expect(page.locator("#materials-and-components")).toContainText("Paper materials & semi-finished components");
    await expect(page.locator("#catalog-list")).toContainText("231 published SKUs");
    await expect(page.locator("#finished-packaging")).toContainText("Finished packaging");
    await expect(page.locator("#finished-packaging")).not.toContainText(/231|published SKU/u);
    await expect(page.locator("#finished-packaging").getByRole("link", { name: "Takeout boxes" })).toHaveAttribute("href", "/en/packaging/takeout-boxes");
  });

  test("every packaging category Browse products control targets its in-page product scope", async ({ page }) => {
    const categories = ["paper-bags", "takeout-boxes", "cake-boxes", "cake-boards-cake-drums", "corrugated-mailer-boxes"];
    for (const locale of ["en", "zh"]) {
      for (const slug of categories) {
        await page.goto(`/${locale}/packaging/${slug}`, { waitUntil: "domcontentloaded" });
        const link = page.getByRole("link", { name: locale === "zh" ? "浏览产品" : "Browse products" });
        await expect(link).toHaveAttribute("href", "#catalog-list");
        await link.focus();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/#catalog-list$/);
        await expect(page.locator("#catalog-list")).toBeVisible();
        await expect(page.locator("#catalog-list")).toBeFocused();
      }
    }
  });

  test("Chinese packaging copy prefers Chinese names while preserving technical terms", async ({ page }) => {
    await page.goto("/zh/packaging/paper-bags", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toContainText("科宏根据已提交的项目资料评估");
    await expect(page.locator("main")).not.toContainText("Kehong 可");
    await page.goto("/zh/packaging/cake-boards-cake-drums", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toContainText("蛋糕托板用于日常承托和展示");
    await expect(page.locator("main")).toContainText("蛋糕鼓更厚");
  });

  test("product detail formatting is consistent in English and Chinese", async ({ page }) => {
    const slug = "kh-fd-cuproll-230-pe-181-pe-coated-paper-roll-for-paper-cup";
    const moqSlug = "kh-fd-cupfan-150350-pr-001-paper-cup-fan";
    await page.goto(`/en/products/${moqSlug}`, { waitUntil: "networkidle" });
    await expect(page.getByText("1–5 metric tons", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText("1–5 metric tons (typical)");

    await page.goto(`/en/products/${slug}?variants=all`, { waitUntil: "networkidle" });
    await expect(page.getByText("230 GSM", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Max width: 1200 mm", { exact: true }).first()).toBeVisible();

    await page.goto(`/zh/products/${slug}?variants=all`, { waitUntil: "networkidle" });
    await expect(page.getByText("230 GSM", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("最大宽度：1200 mm", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Max width");
    await expect(page.locator("main")).not.toContainText("Current SKU:");
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole("region", { name: "产品选项表格，可横向滚动" })).toBeVisible();

    await page.goto(`/zh/products/${moqSlug}`, { waitUntil: "networkidle" });
    await expect(page.getByText("1–5 公吨", { exact: true }).first()).toBeVisible();
  });

  test("packaging category pages render a server-side range or explicit empty state", async ({ request }) => {
    const slugs = ["cake-boxes", "takeout-boxes", "paper-bags", "corrugated-mailer-boxes", "cake-boards-cake-drums"];
    for (const locale of ["en", "zh"]) {
      for (const slug of slugs) {
        const response = await request.get(`/${locale}/packaging/${slug}`);
        expect(response.status()).toBe(200);
        const html = await response.text();
        expect(html).not.toContain("Loading product range");
        expect(html).toMatch(/No confirmed public products in this range yet|该分类暂未发布公开产品|Product(?:<!-- -->)? range|产品范围|Takeout structure review from project scope|外带盒结构待提交规格评估/);
        const catalogLabel = slug === "takeout-boxes"
          ? (locale === "zh" ? "项目确认" : "Project confirmation")
          : (locale === "zh" ? "已确认目录" : "Confirmed catalog");
        for (const label of locale === "zh" ? ["快速选择", catalogLabel, "定制与生产", "答疑", "相关材料、行业与资料", "项目协作"] : ["Quick selection", catalogLabel, "Customization &amp; production", "FAQ", "Related materials, industries &amp; resources", "Project collaboration"]) {
          expect(html).toContain(label);
        }
        for (const index of ["02", "03", "04", "05", "07"]) expect(html).toContain(`kh-kicker-index\">${index}</span>`);
        expect(html).toMatch(/06(?:<!-- -->)? ·/);
        for (const id of ["packaging-selection", "catalog-list", "packaging-production", "packaging-faq", "packaging-related", "packaging-project"]) {
          expect((html.match(new RegExp(`id=\\"${id}\\"`, "g")) ?? []).length).toBe(1);
        }
      }
    }
  });

  test("product details prefill inquiry and mock success state", async ({ page }) => {
    await page.route("**/api/inquiry", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, code: "ACCEPTED" }) });
    });
    await page.goto("/en/products", { waitUntil: "networkidle" });
    await page.locator('article a[href*="/products/"]').first().click();
    await page.locator('a[href*="/contact?product="]').first().click();
    await expect(page.locator('input[name="products"]').first()).toHaveValue(/KH-/);
    await page.locator('input[name="name"]').first().fill("Playwright QA");
    await page.locator('input[name="email"]').first().fill("playwright@example.com");
    await page.locator('input[name="privacy"]').first().check();
    await page.getByRole("button", { name: /send quick quote/i }).click();
    await expect(page.getByText(/inquiry.*(accepted|received)/i)).toBeVisible();
  });

  test("published product routes use one v2 template and expose group variants", async ({ page }) => {
    for (const path of [
      "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan",
      "/en/products/kh-fd-cupfan-150350-pr-003-paper-cup-fan",
      "/en/products/kh-fd-cupfan-210-pr-004-paper-cup-fan",
      "/en/products/kh-fd-kcup-150350-pr-048-kraft-cupstock-paper",
    ]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator('[data-product-template-version="v2"]')).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('a[href*="/contact?product="]').first()).toHaveAttribute("href", /\/contact\?product=/);
      await expect(page.locator('footer a[href*="wa.me"]').filter({ hasText: /WhatsApp/i }).first()).toBeVisible();
    }
  });

  test("product detail presents the canonical family rather than the legacy source bucket", async ({ page, request }) => {
    const path = "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan";
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("Cupstock &amp; Cup Components");
    expect(html).not.toContain("Paper cup fan &amp; cupstock");
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.getByText("Paper Cup Fan", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Current SKU", { exact: true })).toHaveCount(1);
    const whatsapp = page.locator('a[href*="wa.me"]').first();
    await expect(whatsapp).toHaveAttribute("href", /Product%20group%3A%20Paper%20Cup%20Fan/);
  });

  test("product group inquiry retains canonical group, current SKU and first-touch attribution", async ({ page }) => {
    let payload = "";
    await page.route("**/api/inquiry", async (route) => {
      payload = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan?utm_source=google&utm_medium=cpc&utm_campaign=cupstock", { waitUntil: "networkidle" });
    await page.locator('a[href*="/contact?product="]').first().click();
    await page.locator('input[name="products"]').first().fill("Paper Cup Fan | Current SKU: KH-FD-CUPFAN-150350-PR-001");
    await page.locator('input[name="name"]').first().fill("Playwright QA");
    await page.locator('input[name="email"]').first().fill("qa@example.com");
    await page.locator('input[name="privacy"]').first().check();
    await page.getByRole("button", { name: /send quick quote/i }).click();
    expect(payload).toMatch(/name="productGroupId"\s+paper-cup-fan-paper-cup-fan/);
    expect(payload).toMatch(/name="productGroupTitle"\s+Paper Cup Fan/);
    expect(payload).toMatch(/name="sku"\s+KH-FD-CUPFAN-150350-PR-001/);
    expect(payload).toMatch(/name="utmSource"\s+google/);
    expect(payload).toMatch(/name="utmMedium"\s+cpc/);
    expect(payload).toMatch(/name="utmCampaign"\s+cupstock/);
    expect(payload).toMatch(/name="firstTouchSource"\s+google/);
    expect(payload).toMatch(/name="latestTouchCampaign"\s+cupstock/);
  });

  test("six canonical cupstock product groups render one current SKU and aligned metadata in both locales", async ({ page, request }) => {
    const groups = [
      ["kh-fd-cupfan-150350-pr-001-paper-cup-fan", "Paper Cup Fan", "纸杯扇形片"],
      ["kh-fd-cuproll-150350-pr-032-pe-coated-paper-roll-for-paper-cup", "Coated Paper Roll for Paper Cup", "纸杯淋膜纸卷"],
      ["kh-fd-cupsheet-150350-pe-043-pe-coated-paper-sheet-for-paper-cup", "Coated Paper Sheet for Paper Cup", "纸杯淋膜平张纸"],
      ["kh-fd-cupbot-150350-pe-025-paper-cup-bottom-roll", "Paper Cup Bottom Roll", "纸杯底纸卷"],
      ["kh-fd-kcup-150350-pr-048-kraft-cupstock-paper", "Cupstock Paper", "杯纸原纸"],
      ["kh-fd-trayp-150350-pe-290-food-tray-paper-material", "Food Tray Paper Material", "食品纸托材料"],
    ] as const;
    for (const [slug, enTitle, zhTitle] of groups) {
      for (const [locale, title, specification] of [["en", enTitle, "Current specification"], ["zh", zhTitle, "当前规格"]] as const) {
        const path = `/${locale}/products/${slug}`;
        const response = await request.get(path);
        expect(response.status()).toBe(200);
        const html = await response.text();
        expect(html).toContain(title);
        expect(html).toContain(specification);
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await expect(page.locator("h1")).toHaveText(title);
        await expect(page.getByText(locale === "en" ? "Current SKU" : "当前 SKU", { exact: true })).toHaveCount(1);
        await expect(page.locator("#product-group-summary-title")).toHaveCount(1);
        await expect(page.locator("#current-specification-title")).toHaveCount(1);
      }
    }
  });

  test("takeout boxes keeps a project-scope structure boundary and a material related link", async ({ page }) => {
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}/packaging/takeout-boxes`, { waitUntil: "networkidle" });
      const catalog = page.locator("#catalog-list");
      await expect(catalog).toContainText(locale === "zh" ? "外带盒结构待提交规格评估" : "Takeout structure review from project scope");
      await expect(catalog.getByRole("heading", { name: locale === "zh" ? "外带盒结构待提交规格评估" : "Takeout structure review from project scope" })).toHaveCount(1);
      await expect(catalog.getByText(locale === "zh" ? "外带盒的结构、尺寸、材料和印刷按项目需求确认。请提交参考图、尺寸和目标数量，以便评估和报价。" : "Takeout box structures, sizes, materials and printing are confirmed against the project brief. Send a reference image, dimensions and target quantity for evaluation.", { exact: true })).toHaveCount(1);
      await expect(catalog).not.toContainText("Food Tray Paper Material");
      await expect(page.locator("#packaging-related")).toContainText(locale === "zh" ? "食品纸托材料" : "Food Tray Paper Material");
      const quoteHref = await catalog.locator('[data-testid="packaging-scope-quote"]').getAttribute("href");
      expect(new URL(quoteHref!, "https://www.kehong.tech").searchParams.get("product")).toBe(locale === "zh" ? "外带食品盒" : "Takeout Boxes");
    }
  });

  test("each packaging category CTA opens the correct prefilled contact form", async ({ page }) => {
    test.setTimeout(120_000);
    const categories = [
      ["paper-bags", "Paper Bags", "纸袋"],
      ["takeout-boxes", "Takeout Boxes", "外带食品盒"],
      ["cake-boxes", "Cake Boxes", "蛋糕盒"],
      ["cake-boards-cake-drums", "Cake Boards & Cake Drums", "蛋糕底托与蛋糕鼓"],
      ["corrugated-mailer-boxes", "Corrugated Mailer Boxes", "瓦楞邮寄盒"],
    ] as const;

    for (const locale of ["en", "zh"] as const) {
      for (const [slug, englishLabel, chineseLabel] of categories) {
        const label = locale === "zh" ? chineseLabel : englishLabel;
        await page.goto(`/${locale}/packaging/${slug}`, { waitUntil: "networkidle" });
        for (const ctaId of ["packaging-hero-quote", "packaging-scope-quote", "packaging-project-quote"] as const) {
          const cta = page.getByTestId(ctaId);
          const href = await cta.getAttribute("href");
          expect(href, `${locale}/${slug}:${ctaId}`).toBeTruthy();
          const destination = new URL(href!, "https://www.kehong.tech");
          expect(destination.pathname).toBe(`/${locale}/contact`);
          expect(destination.searchParams.get("product")).toBe(label);
          expect(destination.searchParams.getAll("product")).toEqual([label]);
          expect(destination.searchParams.get("qa")).toBeNull();

          await Promise.all([
            page.waitForURL((url) => url.pathname === `/${locale}/contact` && url.searchParams.get("product") === label),
            cta.click(),
          ]);
          await expect(page.getByText(`${locale === "zh" ? "已选产品：" : "Selected product: "}${label}`, { exact: true })).toHaveCount(2);
          await expect(page.locator('input[name="products"]').first()).toHaveValue(label);
          await expect(page.locator('textarea[name="products"]')).toHaveValue(label);
          await page.goBack({ waitUntil: "networkidle" });
          await expect(page.getByTestId(ctaId)).toBeVisible();
        }
      }
    }
  });

  test("header quote stays generic while the footer remains contact-only and category briefs retain their purpose", async ({ page }) => {
    await page.goto("/en/packaging/paper-bags", { waitUntil: "networkidle" });
    const headerHref = await page.getByTestId("site-header-quote").getAttribute("href");
    const headerUrl = new URL(headerHref!, "https://www.kehong.tech");
    expect(headerUrl.pathname).toBe("/en/contact");
    expect(headerUrl.searchParams.get("product")).toBeNull();
    await expect(page.getByTestId("site-footer-quote")).toHaveCount(0);
    await expect(page.locator(".kh-footer-contact-column")).toBeVisible();
    const brief = page.getByRole("link", { name: "Start your project brief" });
    const briefUrl = new URL((await brief.getAttribute("href"))!, "https://www.kehong.tech");
    expect(briefUrl.pathname).toBe("/en/contact");
    expect(briefUrl.searchParams.get("interest")).toBe("structure-review");
    expect(briefUrl.searchParams.get("product")).toBeNull();
  });

  test("first-touch is retained and latest-touch only changes on a new tagged entry", async ({ page }) => {
    await page.goto("/en?utm_source=linkedin&utm_medium=social&utm_campaign=production_test&utm_content=hero", { waitUntil: "networkidle" });
    await page.goto("/en/resources", { waitUntil: "networkidle" });
    let attribution = await page.evaluate(() => JSON.parse(window.sessionStorage.getItem("kehong-attribution-v1") || "{}"));
    expect(attribution.firstLandingPath).toContain("utm_source=linkedin");
    expect(attribution.firstTouch.source).toBe("linkedin");
    expect(attribution.latestTouch.source).toBe("linkedin");
    await page.goto("/en/products?utm_source=google&utm_medium=cpc&utm_campaign=cupstock", { waitUntil: "networkidle" });
    attribution = await page.evaluate(() => JSON.parse(window.sessionStorage.getItem("kehong-attribution-v1") || "{}"));
    expect(attribution.firstTouch.source).toBe("linkedin");
    expect(attribution.latestTouch.source).toBe("google");
  });

  test("inquiry failure can be retried with a mocked provider", async ({ page }) => {
    let attempts = 0;
    await page.route("**/api/inquiry", async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ ok: false, code: "EMAIL_PROVIDER_REJECTED" }) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, code: "ACCEPTED" }) });
      }
    });
    await page.goto("/en/contact", { waitUntil: "networkidle" });
    const products = page.locator('input[name="products"]').first();
    await products.fill("KH-QA-001 | QA product");
    await page.locator('input[name="name"]').first().fill("Playwright QA");
    await page.locator('input[name="email"]').first().fill("playwright@example.com");
    await page.locator('input[name="privacy"]').first().check();
    const submit = page.getByRole("button", { name: /send quick quote/i });
    await submit.click();
    await expect(page.getByText(/could not send the inquiry|submission failed/i)).toBeVisible();
    await submit.click();
    await expect(page.getByText(/inquiry.*(accepted|received)/i)).toBeVisible();
  });
});
