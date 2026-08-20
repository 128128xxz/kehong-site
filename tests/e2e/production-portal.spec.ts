import { test, expect } from "@playwright/test";

test.describe("homepage manufacturing website", () => {
  test("shows a cinematic hero and the full section stack", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".kh-home-hero")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paper materials & semi-finished components" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Finished packaging" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Request a quote/i }).first()).toBeVisible();
    await expect(page.locator(".production-portal")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Start with the material or packaging route/i })).toBeVisible();
    await expect(page.locator(".kh-section-forest")).toBeVisible();
    await expect(page.locator(".kh-spec-panel")).toBeVisible();
  });

  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    test(`is readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en");
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    });
  }

  test("keeps localized homepage copy", async ({ page }) => {
    await page.goto("/zh");
    await expect(page.locator("h1")).toContainText("纸材");
    await expect(page.getByRole("link", { name: "立即询价" }).first()).toBeVisible();
  });

  test("homepage keeps a compact procurement-focused section stack", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main > section")).toHaveCount(7);
    await expect(page.getByTestId("home-latest-insights")).toBeVisible();
    await expect(page.locator('[data-testid="homepage-product-entry"]')).toHaveCount(6);
    await expect(page.locator('[data-testid="home-buyer-support"]')).toHaveCount(0);
  });

  test("homepage metrics keep a shared value baseline and label start", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const stats = page.locator(".kh-hero-stat");
    await expect(stats).toHaveCount(4);
    const boxes = await stats.locator(".kh-hero-stat-value").evaluateAll((values) => values.map((value) => {
      const valueBox = value.getBoundingClientRect();
      const labelBox = value.parentElement?.querySelector("span.kh-mono")?.getBoundingClientRect();
      return { valueBottom: valueBox.bottom, labelTop: labelBox?.top, whiteSpace: getComputedStyle(value).whiteSpace };
    }));
    expect(Math.max(...boxes.map((item) => item.valueBottom)) - Math.min(...boxes.map((item) => item.valueBottom))).toBeLessThanOrEqual(1);
    expect(Math.max(...boxes.map((item) => item.labelTop ?? 0)) - Math.min(...boxes.map((item) => item.labelTop ?? 0))).toBeLessThanOrEqual(1);
    expect(boxes.every((item) => item.whiteSpace === "nowrap")).toBe(true);
  });

  test("homepage metrics use locale-correct values, units and labels", async ({ page }) => {
    for (const [locale, values, labels, unit] of [
      ["en", ["20+", "8,000+", "OEM / ODM", "MOQ"], ["Years in paper converting", "Production site", "Custom development", "Flexible order quantities"], "m²"],
      ["zh", ["20+", "8,000+", "OEM / ODM", "MOQ"], ["纸品加工经验", "生产场地", "定制开发", "灵活起订"], "㎡"],
    ] as const) {
      await page.goto(`/${locale}`);
      const stats = page.locator(".kh-hero-stat");
      await expect(stats).toHaveCount(4);
      for (let index = 0; index < values.length; index += 1) {
        await expect(stats.nth(index).locator(".kh-hero-stat-value")).toHaveAttribute("aria-label", index === 1 ? `${values[index]} ${unit}` : values[index]);
        await expect(stats.nth(index).locator(".kh-hero-stat-label")).toHaveText(labels[index]);
      }
      await expect(page.locator(".kh-home-hero")).toContainText("8,000+");
      if (locale === "en") await expect(page.locator(".kh-home-hero")).not.toContainText("㎡");
      await expect(page.locator(".kh-hero-stat-value").nth(1)).toContainText(unit);
      const nowrap = await stats.locator(".kh-hero-stat-value").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).whiteSpace === "nowrap"));
      expect(nowrap).toBe(true);
    }
  });

  test("homepage metrics reveal and count up once without layout shift", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const stats = page.locator(".kh-hero-stat");
    await expect(stats.first()).toHaveClass(/kh-metric-motion-(armed|in)/, { timeout: 3000 });
    await stats.first().scrollIntoViewIfNeeded();
    await expect(stats.first()).toHaveClass(/kh-metric-motion-in/, { timeout: 3000 });
    await expect(stats.nth(0).locator(".kh-hero-stat-value")).toHaveText("20+");
    await expect(stats.nth(1).locator(".kh-hero-stat-value")).toContainText("8,000+");
    const before = await stats.evaluateAll((nodes) => nodes.map((node) => ({ top: (node as HTMLElement).offsetTop, height: node.getBoundingClientRect().height })));
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    const after = await stats.evaluateAll((nodes) => nodes.map((node) => ({ top: (node as HTMLElement).offsetTop, height: node.getBoundingClientRect().height })));
    expect(after).toEqual(before);
    await expect(stats.nth(0).locator(".kh-hero-stat-value")).toHaveText("20+");
    await expect(stats.nth(1).locator(".kh-hero-stat-value")).toContainText("8,000+");
  });

  test("homepage metrics honor reduced motion and remain final immediately", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/zh");
    const stats = page.locator(".kh-hero-stat");
    await expect(stats.nth(0).locator(".kh-hero-stat-value")).toHaveText("20+");
    await expect(stats.nth(1).locator(".kh-hero-stat-value")).toContainText("8,000+");
    const styles = await stats.evaluateAll((nodes) => nodes.map((node) => {
      const value = node.querySelector(".kh-hero-stat-value")!;
      return { transition: getComputedStyle(node).transitionDuration, transform: getComputedStyle(node).transform, valueTransition: getComputedStyle(value).transitionDuration };
    }));
    expect(styles.every((style) => parseFloat(style.transition) <= 0.01 && parseFloat(style.valueTransition) <= 0.01 && style.transform === "none")).toBe(true);
  });

  test("homepage metric grid stays aligned at desktop widths and fits mobile", async ({ page }) => {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 1440, height: 1000 }, { width: 1850, height: 1000 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/en");
      const stats = page.locator(".kh-hero-stat");
      const boxes = await stats.evaluateAll((nodes) => nodes.map((node) => {
        const value = node.querySelector(".kh-hero-stat-value")!.getBoundingClientRect();
        const label = node.querySelector(".kh-hero-stat-label")!.getBoundingClientRect();
        return { valueBottom: value.bottom, labelTop: label.top };
      }));
      expect(Math.max(...boxes.map((item) => item.valueBottom)) - Math.min(...boxes.map((item) => item.valueBottom))).toBeLessThanOrEqual(1);
      expect(Math.max(...boxes.map((item) => item.labelTop)) - Math.min(...boxes.map((item) => item.labelTop))).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await expect(page.locator(".kh-hero-stat")).toHaveCount(4);
  });

  test("homepage process tabs change the matching fixed media panel", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const section = page.getByTestId("home-process");
    const tabs = section.getByRole("tab");
    const panel = section.getByRole("tabpanel");
    await expect(tabs).toHaveCount(4);
    await tabs.nth(1).hover();
    await expect(panel).toHaveAttribute("data-active-step", "paper-board-converting");
    await tabs.nth(2).focus();
    await expect(panel).toHaveAttribute("data-active-step", "printing-finishing");
    await tabs.nth(3).click();
    await expect(panel).toHaveAttribute("data-active-step", "forming-packing");
    await tabs.nth(3).press("ArrowUp");
    await expect(panel).toHaveAttribute("data-active-step", "printing-finishing");
    await expect(section.getByTestId("process-caption")).toContainText("Colour and material swatches");
  });

  test("homepage process remains tappable without a media layout shift on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const section = page.getByTestId("home-process");
    const panel = section.getByRole("tabpanel");
    const before = await panel.boundingBox();
    await section.getByRole("tab").nth(1).click();
    await expect(panel).toHaveAttribute("data-active-step", "paper-board-converting");
    const after = await panel.boundingBox();
    expect(after?.height).toBe(before?.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("cinema header starts transparent and turns solid after the hero", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header.kh-header");
    await expect(header).toHaveAttribute("data-variant", "cinema");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).toHaveAttribute("data-scrolled", "false");
  });

  test("hero CTAs stay fully above the fold at 1366x768", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/en");
    const ctas = page.locator(".kh-home-hero .kh-actions a");
    await expect(ctas).toHaveCount(2);
    for (const cta of await ctas.all()) {
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(768);
    }
  });

  test("reduced motion disables product card transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await expect(page.locator("h1")).toBeVisible();
    const card = page.locator('a[href*="group=paper-cup-fan-paper-cup-fan"]:visible').first();
    await expect(card).toBeVisible();
    const transitionDuration = await card.evaluate((element) => getComputedStyle(element).transitionDuration);
    for (const duration of transitionDuration.split(",")) {
      expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
    }
  });

  test("mobile menu opens with focus inside and Escape returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const toggle = page.locator('button[aria-controls="kh-mobile-menu"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    const panel = page.locator("#kh-mobile-menu");
    await expect(panel).toBeVisible();
    await expect.poll(() => page.evaluate(() => Boolean(document.activeElement?.closest("#kh-mobile-menu")))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });

  test("keyboard focus on the first link shows a visible outline", async ({ page }) => {
    await page.goto("/en");
    let linkFocused = false;
    for (let index = 0; index < 5 && !linkFocused; index += 1) {
      await page.keyboard.press("Tab");
      linkFocused = await page.evaluate(() => document.activeElement?.tagName === "A");
    }
    expect(linkFocused).toBe(true);
    const outlineWidth = await page.evaluate(() => parseFloat(getComputedStyle(document.activeElement as Element).outlineWidth));
    expect(outlineWidth).toBeGreaterThan(0);
  });

  test("homepage UI hierarchy keeps one primary arrow language and clear type scale", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    await expect(page.locator(".kh-home-hero .kh-button-light svg")).toHaveCount(1);
    await expect(page.locator(".kh-home-hero .kh-button-ghost svg")).toHaveCount(0);
    await expect(page.locator('[data-testid="homepage-product-entry"] svg')).toHaveCount(0);
    await expect(page.locator(".kh-home-industries .kh-industry-card svg")).toHaveCount(0);
    await expect(page.locator(".kh-home-insights .kh-news-card svg")).toHaveCount(0);
    const scale = await page.evaluate(() => {
      const h1 = document.querySelector(".kh-home-hero h1")!;
      const h2 = document.querySelector(".kh-home-product-systems h2")!;
      const card = document.querySelector(".kh-product-card-title")!;
      return [h1, h2, card].map((node) => parseFloat(getComputedStyle(node).fontSize));
    });
    expect(scale[0]).toBeGreaterThan(scale[1]);
    expect(scale[1]).toBeGreaterThan(scale[2]);
    await expect(page.locator(".kh-home-product-systems")).toHaveClass(/kh-home-product-systems/);
    await expect(page.locator(".kh-home-process")).toHaveClass(/kh-home-process/);
    await expect(page.locator(".kh-home-cta")).toHaveClass(/kh-home-cta/);
  });

  test("Chinese homepage headings stay within the viewport at desktop and mobile widths", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1024, height: 900 },
      { width: 1280, height: 900 },
      { width: 1440, height: 1000 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/zh", { waitUntil: "networkidle" });
      const layout = await page.evaluate(() => {
        const selectors = [".kh-home-hero h1", ".kh-home-cta h2"];
        return {
          pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          headings: selectors.map((selector) => {
            const element = document.querySelector(selector)!;
            const rect = element.getBoundingClientRect();
            return {
              right: rect.right,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            };
          }),
        };
      });
      expect(layout.pageOverflow).toBe(false);
      for (const heading of layout.headings) {
        expect(heading.right).toBeLessThanOrEqual(viewport.width + 1);
        expect(heading.scrollWidth).toBeLessThanOrEqual(heading.clientWidth + 1);
      }
    }
  });

  test("mobile product system cards use horizontal rows in both locales", async ({ page }) => {
    for (const locale of ["en", "zh"] as const) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }]) {
        await page.setViewportSize(viewport);
        await page.goto(`/${locale}`, { waitUntil: "networkidle" });
        const layout = await page.locator(".kh-product-system").first().evaluate((system) => {
          const grid = system.querySelector(".kh-product-card-grid")!;
          const cards = [...system.querySelectorAll<HTMLElement>(".kh-product-card")];
          return {
            columns: getComputedStyle(grid).gridTemplateColumns,
            cards: cards.map((card) => {
              const media = card.querySelector<HTMLElement>(".kh-product-card-media")!;
              const copy = card.querySelector<HTMLElement>(".kh-product-card-copy")!;
              return {
                direction: getComputedStyle(card).flexDirection,
                mediaWidth: media.getBoundingClientRect().width,
                copyWidth: copy.getBoundingClientRect().width,
              };
            }),
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          };
        });
        expect(layout.columns.split(" ")).toHaveLength(1);
        expect(layout.cards).toHaveLength(3);
        expect(layout.cards.every((card) => card.direction === "row" && card.mediaWidth > 0 && card.copyWidth > 0)).toBe(true);
        expect(layout.overflow).toBe(false);
      }
    }
  });

  test("product systems keep desktop panels, headers and representative cards aligned", async ({ page }) => {
    for (const locale of ["en", "zh"] as const) {
      for (const viewport of [
        { width: 1280, height: 900 },
        { width: 1366, height: 768 },
        { width: 1440, height: 1000 },
        { width: 1920, height: 1080 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(`/${locale}`, { waitUntil: "networkidle" });
        const systems = page.locator(".kh-product-system");
        await expect(systems).toHaveCount(2);
        await systems.first().scrollIntoViewIfNeeded();
        const metrics = await systems.evaluateAll((nodes) => {
          const box = (element: Element) => {
            const rect = element.getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, height: rect.height };
          };
          return nodes.map((node) => ({
            panel: box(node),
            header: box(node.querySelector(".kh-product-system-head")!),
            cards: [...node.querySelectorAll(".kh-product-card")].map(box),
            media: box(node.querySelector(".kh-product-system-media")!),
          }));
        });
        expect(Math.abs(metrics[0].panel.top - metrics[1].panel.top)).toBeLessThanOrEqual(2);
        expect(Math.abs(metrics[0].panel.bottom - metrics[1].panel.bottom)).toBeLessThanOrEqual(2);
        expect(Math.abs(metrics[0].header.bottom - metrics[1].header.bottom)).toBeLessThanOrEqual(2);
        for (const system of metrics) {
          expect(system.cards).toHaveLength(3);
          expect(Math.max(...system.cards.map((card) => card.bottom)) - Math.min(...system.cards.map((card) => card.bottom))).toBeLessThanOrEqual(2);
          expect(Math.max(...system.cards.map((card) => card.height)) - Math.min(...system.cards.map((card) => card.height))).toBeLessThanOrEqual(2);
          expect(system.media.height).toBeGreaterThan(0);
        }
        const nextSectionTop = await page.locator(".kh-home-process").boundingBox();
        expect(nextSectionTop).not.toBeNull();
      }
    }

    for (const viewport of [{ width: 768, height: 1024 }, { width: 430, height: 932 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/en", { waitUntil: "networkidle" });
      const systems = page.locator(".kh-product-system");
      await expect(systems).toHaveCount(2);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      const panelHeights = await systems.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      expect(panelHeights.every((height) => height > 0)).toBe(true);
    }
  });

  test("desktop mega menu exposes a structured two-column hierarchy without arrow noise", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en");
    const trigger = page.getByRole("button", { name: "Products", exact: true });
    await trigger.hover();
    const mega = page.getByTestId("header-product-mega-menu");
    await expect(mega).toBeVisible();
    await expect(mega.locator(".kh-product-mega-section")).toHaveCount(2);
    await expect(mega.locator(".kh-product-mega-group")).toHaveCount(6);
    await expect(mega.locator(".kh-product-mega-item-arrow")).toHaveCount(0);
    const metrics = await mega.evaluate((node) => {
      const panel = getComputedStyle(node);
      const sections = [...node.querySelectorAll<HTMLElement>(".kh-product-mega-section")];
      const itemHeights = [...node.querySelectorAll<HTMLElement>(".kh-product-mega-items a")].map((item) => item.getBoundingClientRect().height);
      const all = node.querySelector<HTMLElement>(".kh-product-mega-all")!;
      return { borderTop: panel.borderTopStyle, columns: panel.width, sectionCount: sections.length, minItem: Math.min(...itemHeights), allHeight: all.getBoundingClientRect().height };
    });
    expect(metrics.borderTop).toBe("solid");
    expect(metrics.sectionCount).toBe(2);
    // The menu is translated by a fractional percentage; Chromium can
    // report a 36px rhythm as 35.999984px after that transform.
    expect(metrics.minItem).toBeGreaterThanOrEqual(35.9);
    expect(metrics.allHeight).toBeGreaterThanOrEqual(48);
  });

  test("desktop navigation UI stays single-line and mega menu stays inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/en", { waitUntil: "networkidle" });
    const headerMetrics = await page.evaluate(() => {
      const nav = document.querySelector(".kh-desktop-nav")!;
      // The compact mobile section strip remains in the DOM for responsive
      // hydration; scope this desktop assertion to the actual desktop nav.
      const model = nav.querySelector('a[href$="/factory"]')!;
      const quote = document.querySelector(".kh-header-cta")!;
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        navHeight: nav.getBoundingClientRect().height,
        modelHeight: model.getBoundingClientRect().height,
        quoteHeight: quote.getBoundingClientRect().height,
        modelWhiteSpace: getComputedStyle(model).whiteSpace,
        quoteWhiteSpace: getComputedStyle(quote).whiteSpace,
      };
    });
    expect(headerMetrics.overflow).toBe(false);
    expect(headerMetrics.navHeight).toBeLessThanOrEqual(48);
    expect(headerMetrics.modelHeight).toBeLessThanOrEqual(48);
    expect(headerMetrics.quoteHeight).toBeLessThanOrEqual(48);
    expect(headerMetrics.modelWhiteSpace).toBe("nowrap");
    expect(headerMetrics.quoteWhiteSpace).toBe("nowrap");

    await page.getByRole("button", { name: "Products", exact: true }).hover();
    const mega = page.getByTestId("header-product-mega-menu");
    await expect(mega).toBeVisible();
    const megaRect = await mega.boundingBox();
    expect(megaRect).not.toBeNull();
    expect(megaRect!.x).toBeGreaterThanOrEqual(0);
    expect(megaRect!.x + megaRect!.width).toBeLessThanOrEqual(1280);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("desktop footer menus expose consistent group and link affordances", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en", { waitUntil: "networkidle" });
    const affordances = await page.evaluate(() => {
      const summary = document.querySelector<HTMLElement>(".kh-footer-group > summary");
      const link = document.querySelector<HTMLElement>(".kh-footer-links a");
      return {
        summaryIcon: summary ? getComputedStyle(summary, "::after").content : "none",
        linkIcon: link?.querySelector("svg") ? "svg" : "none",
      };
    });
    expect(affordances.summaryIcon).not.toBe("none");
    expect(affordances.linkIcon).not.toBe("none");
  });

  test("English hero copy uses the available measure without avoidable wrapping", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const pages = ["/en", "/en/products", "/en/factory", "/en/resources", "/en/solutions", "/en/contact"];
    for (const path of pages) {
      await page.goto(path, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const lines = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) return 0;
          const range = document.createRange();
          range.selectNodeContents(element);
          return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
        };
        return {
          heroTitleLines: lines(".kh-home-hero .kh-hero-copy h1, .kh-page-hero h1"),
          heroLedeLines: lines(".kh-home-hero .kh-hero-copy .kh-lede, .kh-page-hero .kh-lede"),
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      expect(metrics.overflow, `${path} should not overflow horizontally`).toBe(false);
      expect(metrics.heroTitleLines, `${path} hero title line count`).toBeLessThanOrEqual(path === "/en" ? 3 : 2);
      expect(metrics.heroLedeLines, `${path} hero description line count`).toBeLessThanOrEqual(2);
    }
  });

  test("mobile mega menu keeps grouped tap targets and no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await page.locator('button[aria-controls="kh-mobile-menu"]').click();
    const directory = page.getByTestId("mobile-product-directory");
    await directory.locator("summary").first().click();
    const targets = directory.locator(".kh-mobile-product-cta, .kh-mobile-product-group a, .kh-mobile-product-all");
    const heights = await targets.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
    expect(heights.length).toBeGreaterThan(3);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
});
