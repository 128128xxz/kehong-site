import { expect, test } from "@playwright/test";

const homeSections = ["home", "product-window", "solutions", "capabilities", "studio", "inquiry"];

async function expectActuallyVisible(locator: import("@playwright/test").Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, "element must have a rendered box").not.toBeNull();
  expect(box!.width).toBeGreaterThan(1);
  expect(box!.height).toBeGreaterThan(1);
  await expect(locator).toHaveCSS("visibility", "visible");
  await expect(locator).not.toHaveCSS("opacity", "0");
}

test.describe("final design contract", () => {
  test("homepage keeps the approved six-section portal structure", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    await expect(page.locator("main > section")).toHaveCount(6);
    for (const id of homeSections) await expect(page.locator(`main > section#${id}`)).toHaveCount(1);
    await expect(page.locator("main form")).toHaveCount(0);
    await expect(page.locator('main a[href="#"], main a[href=""]')).toHaveCount(0);
    await expect(page.locator('[data-3d-loading="route-only"]')).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#studio h2")).toHaveText("Review the structure before production.");
    await expect(page.locator("#inquiry h2")).toHaveText("Move your packaging brief into production.");
  });

  test("production metadata stays on the canonical public origin", async ({ request }) => {
    for (const path of [
      "/en",
      "/en/products",
      "/en/contact",
      "/en/factory",
      "/en/process",
      "/en/procurement",
      "/en/model-preview",
      "/en/products/kh-fd-cupfan-150350-pr-001-paper-cup-fan",
    ]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).not.toContain('href="http://127.0.0.1');
      expect(html).not.toContain('content="http://127.0.0.1');
      expect(html).toContain("https://www.kehong.tech");
      expect((html.match(/rel=\"canonical\"/g) ?? []).length).toBe(1);
    }
  });

  test("hero and manufacturing use distinct verified local compositions", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const hero = await page.locator("#home img").first().getAttribute("src");
    const manufacturing = await page.locator("#capabilities img").evaluateAll((images) => images.map((image) => image.getAttribute("src")));
    expect(hero).toBeTruthy();
    expect(manufacturing).toHaveLength(2);
    expect(manufacturing).not.toContain(hero);
    expect(new Set(manufacturing).size).toBe(2);
  });

  test("homepage image semantics are unique and desktop inquiry widget is absent", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const imageSources = await page.locator("main img").evaluateAll((images) => images.map((image) => (image as HTMLImageElement).currentSrc || image.getAttribute("src")).filter(Boolean));
    expect(new Set(imageSources).size).toBe(imageSources.length);
    await expect(page.locator(".kh-solution-visual--cupstock")).toHaveCount(1);
    await expect(page.locator(".kh-solution-visual--corrugated")).toHaveCount(1);
    await expect(page.locator(".kh-solution-visual--inserts")).toHaveCount(1);
    await expect(page.locator("text=CONTACT US")).toHaveCount(0);
    await expect(page.locator(".mobile-sticky-action-bar")).toHaveCount(0);
    await expect(page.getByText("Inquiry", { exact: true })).toHaveCount(0);
    await expect(page.locator(".kh-packaging-diagram")).toHaveCount(1);
    await expect(page.locator("html")).toHaveCSS("scroll-padding-top", "96px");
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 640, height: 960 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    test(`homepage has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    });
  }

  test("640-959 solutions grid has no empty final half-column", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 1024 });
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    for (const width of [640, 768, 959]) {
      await page.setViewportSize({ width, height: 1024 });
      const cards = page.locator("#solutions .kh-solution-card");
      await expect(cards).toHaveCount(4);
      const boxes = await cards.evaluateAll((items) => items.map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, width: rect.width, top: rect.top };
      }));
      expect(boxes[0].width).toBeGreaterThan(width * 0.85);
      expect(boxes[1].top).toBeCloseTo(boxes[2].top, 0);
      expect(boxes[3].width).toBeGreaterThan(width * 0.85);
      expect(boxes[3].left).toBeCloseTo(boxes[0].left, 0);
    }
  });

  test("responsive navigation and hero media remain visible", async ({ page }) => {
    for (const width of [768, 1024]) {
      await page.setViewportSize({ width, height: width === 768 ? 1024 : 768 });
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.locator(".kh-desktop-nav")).toBeHidden();
      await expectActuallyVisible(page.locator("details.kh-compact-nav > summary"));
      await expectActuallyVisible(page.locator("#home .kh-hero__visual"));
      await expect(page.locator(".mobile-sticky-action-bar")).toHaveCount(0);
    }
  });

  test("homepage has no fixed inquiry or floating contact UI", async ({ page }) => {
    for (const viewport of [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 640, height: 960 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.locator(".mobile-sticky-action-bar")).toHaveCount(0);
      await expect(page.getByText("Inquiry", { exact: true })).toHaveCount(0);
      await expect(page.getByText("CONTACT US", { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.body.textContent?.includes("Request a quote") ?? false)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
  });

  test("mobile solutions and studio keep visual and copy regions separate", async ({ page }) => {
    for (const viewport of [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 640, height: 960 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      const result = await page.evaluate(() => {
        const section = document.querySelector("#solutions");
        const cards = [...document.querySelectorAll<HTMLElement>("#solutions .kh-solution-card")];
        const overlap = cards.some((card) => {
          const visual = card.querySelector<HTMLElement>(".kh-solution-visual, .kh-solution-split__media");
          const copy = card.querySelector<HTMLElement>(".kh-solution-card__content, .kh-solution-split__copy");
          if (!visual || !copy) return false;
          const a = visual.getBoundingClientRect();
          const b = copy.getBoundingClientRect();
          return Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) > 1
            && Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) > 1;
        });
        const clippedCopy = cards.some((card) => [...card.querySelectorAll<HTMLElement>("h3, p, a")].some((element) => {
          const style = getComputedStyle(element);
          return style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none" || (style.overflow === "hidden" && element.scrollHeight > element.clientHeight + 1);
        }));
        const studio = document.querySelector<HTMLElement>("#studio .kh-3d-technical");
        const detail = studio?.querySelector<HTMLElement>(".kh-3d-technical__detail");
        const model = studio?.querySelector<HTMLElement>(".kh-3d-technical__model");
        const detailBox = detail?.getBoundingClientRect();
        const modelBox = model?.getBoundingClientRect();
        const positionedOverlays = [...document.querySelectorAll<HTMLElement>("body *")].filter((element) => {
          const position = getComputedStyle(element).position;
          return position === "fixed" || (position === "sticky" && element.tagName.toLowerCase() !== "header");
        });
        const headingsInsideCards = cards.every((card) => {
          const cardBox = card.getBoundingClientRect();
          return [...card.querySelectorAll<HTMLElement>("h3")].every((heading) => {
            const box = heading.getBoundingClientRect();
            return box.top >= cardBox.top - 1 && box.bottom <= cardBox.bottom + 1 && box.left >= cardBox.left - 1 && box.right <= cardBox.right + 1;
          });
        });
        return {
          cardCount: cards.length,
          sectionWidth: section?.getBoundingClientRect().width ?? 0,
          overlap,
          clippedCopy,
          positionedOverlays: positionedOverlays.length,
          headingsInsideCards,
          studioVertical: Boolean(detailBox && modelBox && detailBox.top >= modelBox.bottom - 1),
          structureReviewRows: document.querySelectorAll("#studio .kh-3d-checks li").length,
        };
      });
      expect(result.cardCount).toBe(4);
      expect(result.overlap).toBe(false);
      expect(result.clippedCopy).toBe(false);
      expect(result.positionedOverlays).toBe(0);
      expect(result.headingsInsideCards).toBe(true);
      expect(result.structureReviewRows).toBe(4);
      if (viewport.width < 640) expect(result.studioVertical).toBe(true);

      for (const card of await page.locator("#solutions .kh-solution-card").all()) {
        await card.scrollIntoViewIfNeeded();
        await expect.poll(() => card.evaluate((element) => {
          const box = element.getBoundingClientRect();
          const x = Math.round(box.left + box.width / 2);
          const y = Math.round(box.top + box.height / 2);
          const hit = document.elementFromPoint(x, y);
          return Boolean(hit && (hit === element || element.contains(hit)));
        })).toBe(true);
      }
    }
  });
});
