import { expect, test, type Locator, type Page } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

const iphoneEquivalent = {
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
} as const;

const pixelEquivalent = {
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.23 Mobile Safari/537.36",
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2.625,
} as const;

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
] as const;

const pageRoutes = [
  "/en",
  "/zh",
  "/en/products",
  "/zh/products",
  "/en/packaging",
  "/zh/packaging",
  "/en/factory",
  "/zh/factory",
  "/en/resources",
  "/zh/resources",
  "/en/contact",
  "/zh/contact",
  "/en/model-preview",
  "/zh/model-preview",
] as const;

type HitRecord = {
  route: string;
  viewport: string;
  scrollY: number;
  text: string;
  href: string | null;
  tag: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  center: { x: number; y: number };
  hitElement: string;
  topmostElement: string;
  pointerEvents: string;
  zIndex: string;
  position: string;
  opacity: string;
  ariaDisabled: string | null;
  disabled: boolean;
  hit: boolean;
};

async function hitAudit(page: Page, route: string, viewport: { width: number; height: number }) {
  return page.evaluate(({ route, viewport }) => {
    const records: HitRecord[] = [];
    for (const element of document.querySelectorAll<HTMLElement>("a[href], button, [role=button], summary, select")) {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0" || !box.width || !box.height || box.bottom <= 0 || box.top >= innerHeight) continue;
      const center = {
        x: Math.min(innerWidth - 1, Math.max(0, box.left + box.width / 2)),
        y: Math.min(innerHeight - 1, Math.max(0, box.top + box.height / 2)),
      };
      const topmost = document.elementFromPoint(center.x, center.y);
      const record: HitRecord = {
        route,
        viewport: `${viewport.width}x${viewport.height}`,
        scrollY: Math.round(window.scrollY),
        text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100),
        href: element.getAttribute("href"),
        tag: element.tagName,
        boundingBox: { x: box.x, y: box.y, width: box.width, height: box.height },
        center,
        hitElement: topmost?.tagName || "NONE",
        topmostElement: topmost ? `${topmost.tagName}.${String(topmost.className || "")}` : "NONE",
        pointerEvents: style.pointerEvents,
        zIndex: style.zIndex,
        position: style.position,
        opacity: style.opacity,
        ariaDisabled: element.getAttribute("aria-disabled"),
        disabled: (element as HTMLButtonElement).disabled === true || element.getAttribute("aria-disabled") === "true",
        hit: topmost === element || element.contains(topmost),
      };
      records.push(record);
    }
    return records;
  }, { route, viewport });
}

async function tapAndExpectPath(page: Page, locator: Locator, expected: RegExp) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, "tap target must have a box").not.toBeNull();
  const hit = await page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    return element ? { tag: element.tagName, inside: element.closest("a,button") !== null } : { tag: "NONE", inside: false };
  }, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });
  expect(hit.inside, `center hit ${hit.tag}, not an interactive control`).toBe(true);
  await locator.tap();
  await expect.poll(() => new URL(page.url()).pathname).toMatch(expected);
}

async function openMobileMenuWithTouch(page: Page) {
  const toggle = page.locator('button[aria-controls="kh-mobile-menu"]');
  const box = await toggle.boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(page.locator("#kh-mobile-menu")).toBeVisible();
  return toggle;
}

async function installTapRecorder(page: Page) {
  await page.addInitScript(() => {
    const key = "__kehongTapEvents";
    const events = [] as Array<{ type: string; defaultPrevented: boolean; target: string; currentTarget: string }>;
    Object.defineProperty(window, key, { value: events, configurable: true });
    for (const type of ["pointerdown", "pointerup", "touchstart", "touchend", "click"]) {
      document.addEventListener(type, (event) => {
        events.push({
          type,
          defaultPrevented: event.defaultPrevented,
          target: (event.target as Element | null)?.tagName || "NONE",
          currentTarget: (event.currentTarget as Element | null)?.tagName || "NONE",
        });
      }, true);
    }
  });
}

test.describe("real mobile touch interaction gates", () => {
  test.describe.configure({ mode: "serial" });

  test("iOS and Android touch contexts expose unobstructed tap targets", async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    const audit: HitRecord[] = [];
    for (const [profileName, profile] of [["iPhone Safari equivalent", iphoneEquivalent], ["Pixel 7 Chrome", pixelEquivalent]] as const) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ ...profile, viewport });
        const page = await context.newPage();
        await installTapRecorder(page);
        for (const route of pageRoutes) {
          await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(80);
          for (const y of [0, 0.5, 1]) {
            const maxScroll = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
            await page.evaluate((scrollY) => window.scrollTo(0, scrollY), Math.round(maxScroll * y));
            await page.waitForTimeout(40);
            audit.push(...await hitAudit(page, route, viewport));
          }
        }
        await context.close();
      }
      testInfo.annotations.push({ type: "profile", description: profileName });
    }
    const obstructed = audit.filter((entry) => !entry.hit && entry.pointerEvents !== "none");
    await testInfo.attach("mobile-tap-hit-matrix.json", { body: JSON.stringify(audit, null, 2), contentType: "application/json" });
    expect(obstructed, "visible controls must not be covered at their center point").toEqual([]);
  });

  test("mobile navigation and homepage actions respond to real touch", async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ ...pixelEquivalent, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await installTapRecorder(page);

    await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
    const toggle = await openMobileMenuWithTouch(page);
    const productDirectory = page.getByTestId("mobile-product-directory");
    await productDirectory.locator("summary").first().tap();
    await expect(productDirectory.locator("details").first()).toHaveAttribute("open", "");
    await page.locator(".kh-mobile-head button").tap();
    await expect(page.locator("#kh-mobile-menu")).toHaveCount(0);
    await openMobileMenuWithTouch(page);
    await page.getByTestId("mobile-product-directory").getByRole("link").first().tap();
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/\/en\/products/);
    await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
    await openMobileMenuWithTouch(page);
    await page.locator(".kh-mobile-backdrop").tap({ position: { x: 8, y: 8 } });
    await expect(page.locator("#kh-mobile-menu")).toHaveCount(0);
    await expect(toggle).toBeFocused();

    await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
    await tapAndExpectPath(page, page.locator(".kh-home-hero .kh-actions a").first(), /\/en\/products/);
    await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
    await page.getByTestId("homepage-product-entry").first().scrollIntoViewIfNeeded();
    await tapAndExpectPath(page, page.getByTestId("homepage-product-entry").first(), /\/en\/products/);
    await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
    const processTab = page.getByTestId("home-process").getByRole("tab").nth(1);
    await processTab.scrollIntoViewIfNeeded();
    await processTab.tap();
    await expect(page.getByTestId("home-process").getByRole("tabpanel")).toHaveAttribute("data-active-step", "paper-board-converting");
    await page.goto(`${baseURL}/en`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByTestId("mobile-sticky-actions")).toBeVisible();
    await tapAndExpectPath(page, page.getByTestId("mobile-sticky-actions").getByRole("link", { name: /Get a quote/i }), /\/en\/contact/);

    await context.close();
  });

  test("product, packaging, resources and contact controls remain touchable after scroll", async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ ...pixelEquivalent, viewport: { width: 430, height: 932 } });
    const page = await context.newPage();
    await installTapRecorder(page);

    await page.goto(`${baseURL}/en/products`, { waitUntil: "networkidle" });
    const filter = page.getByRole("button", { name: /Filter products/i });
    await filter.tap();
    await expect(page.locator("#catalog-filters")).toBeVisible();
    await page.locator("#catalog-filters select").first().selectOption({ index: 1 });
    await expect(page).toHaveURL(/catalog-list/);
    await page.goto(`${baseURL}/en/products`, { waitUntil: "networkidle" });
    const productLink = page.locator('main a[href*="/products/"]').first();
    await productLink.scrollIntoViewIfNeeded();
    await tapAndExpectPath(page, productLink, /\/en\/products\//);

    await page.goto(`${baseURL}/en/packaging`, { waitUntil: "networkidle" });
    const packagingLink = page.locator('main a[href*="/packaging/"]').first();
    await packagingLink.scrollIntoViewIfNeeded();
    await tapAndExpectPath(page, packagingLink, /\/en\/packaging\//);

    await page.goto(`${baseURL}/en/resources`, { waitUntil: "networkidle" });
    const resourceLink = page.locator('main a[href*="/resources/"]').first();
    await resourceLink.scrollIntoViewIfNeeded();
    await tapAndExpectPath(page, resourceLink, /\/en\/resources\//);

    await page.goto(`${baseURL}/en/contact`, { waitUntil: "networkidle" });
    await tapAndExpectPath(page, page.locator('a[href="#quote-form"]').first(), /\/en\/contact/);
    await expect(page.locator("#quote-form")).toBeVisible();
    await page.locator("#quote-form details summary").tap();
    await expect(page.locator("#quote-form details")).toHaveAttribute("open", "");
    await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute("href", /mailto:/);
    await expect(page.locator('a[href*="wa.me"]').first()).toHaveAttribute("rel", /noopener/);

    await context.close();
  });
});
