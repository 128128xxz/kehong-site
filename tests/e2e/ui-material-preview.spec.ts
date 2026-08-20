import { test, expect } from "@playwright/test";

test.describe("Kehong Liquid Glass UI material preview", () => {
  test("uses the same local material switch on English and Chinese pages", async ({ page }) => {
    for (const locale of ["en", "zh"]) {
      await page.goto(`/${locale}?uiMaterial=glass-b`);
      await expect(page.locator("html")).toHaveAttribute("data-ui-material", "glass-b");
      await expect(page.locator(".kh-header")).toBeVisible();
      await expect(page.locator(".kh-header a, .kh-header button").first()).toBeVisible();
    }
    await page.goto("/en?uiMaterial=current");
    await expect(page.locator("html")).toHaveAttribute("data-ui-material", "current");
  });

  test("accepts the softer Glass C preview without changing routing", async ({ page }) => {
    await page.goto("/en?uiMaterial=glass-c");
    await expect(page.locator("html")).toHaveAttribute("data-ui-material", "glass-c");
    await expect(page.locator(".kh-header")).toBeVisible();
    await expect(page).toHaveURL(/\/en\?uiMaterial=glass-c/);
  });

  test("Glass C lens follows real pointer movement in the top navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en?uiMaterial=glass-c");
    const header = page.locator(".kh-header");
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + 8, box.y + box.height / 2);
    const firstX = await header.evaluate((node) => node.style.getPropertyValue("--glass-pointer-x"));
    await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2);
    await expect.poll(() => header.evaluate((node) => node.style.getPropertyValue("--glass-pointer-x"))).not.toBe(firstX);
  });

  test("Glass C keeps one shared header lens and static bubble controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en?uiMaterial=glass-c");
    await expect(page.locator("html")).toHaveAttribute("data-ui-material", "glass-c");
    const audit = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".kh-header");
      const bubbles = [...document.querySelectorAll<HTMLElement>(
        ".kh-desktop-nav > .kh-nav-link, .kh-desktop-nav > .kh-desktop-menu > .kh-nav-link, .kh-header-cta, .kh-language-trigger",
      )];
      const firstIcon = document.querySelector<HTMLElement>(".kh-desktop-nav .kh-nav-icon");
      const firstBubble = bubbles[0];
      return {
        headerLensContent: header ? getComputedStyle(header, "::before").content : "",
        headerLensFilter: header ? getComputedStyle(header, "::before").filter : "",
        bubbleLensContent: firstBubble ? getComputedStyle(firstBubble, "::after").content : "",
        bubbleFrameContent: firstBubble ? getComputedStyle(firstBubble, "::before").content : "",
        bubblePointerX: firstBubble?.style.getPropertyValue("--glass-pointer-x") ?? "",
        iconFilter: firstIcon ? getComputedStyle(firstIcon).filter : "",
      };
    });

    expect(audit.headerLensContent).toBe('""');
    expect(audit.headerLensFilter).toContain("blur");
    expect(audit.bubbleLensContent).toBe("none");
    expect(audit.bubbleFrameContent).toBe("none");
    expect(audit.bubblePointerX).toBe("");
    expect(audit.iconFilter).toBe("none");
  });

  test("desktop popovers remain real interactive DOM and close with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en?uiMaterial=glass-b");
    const products = page.getByRole("button", { name: "Products" });
    await products.click();
    const menu = page.getByTestId("header-product-mega-menu");
    await expect(menu).toBeVisible();
    await expect(menu.locator("a").first()).toBeVisible();
    await menu.locator("a").first().click();
    await expect(page).toHaveURL(/\/en\/(products|packaging)/);

    await page.goto("/en?uiMaterial=glass-b");
    await page.getByRole("button", { name: "Products" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("header-product-mega-menu")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "false");
  });

  test("English Products menu keeps group labels distinct and stays within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en?uiMaterial=glass-b");
    const products = page.getByRole("button", { name: "Products" });
    await products.press("Enter");
    const menu = page.getByTestId("header-product-mega-menu");
    await expect(menu).toBeVisible();

    const audit = await menu.evaluate((node) => {
      const firstGroup = node.querySelector<HTMLElement>(".kh-product-mega-group");
      const firstHeading = node.querySelector<HTMLElement>(".kh-product-mega-group-heading");
      const firstItems = node.querySelector<HTMLElement>(".kh-product-mega-items");
      const menuBox = node.getBoundingClientRect();
      return {
        groupGrid: firstGroup ? getComputedStyle(firstGroup).gridTemplateColumns : "",
        headingBorderLeft: firstHeading ? getComputedStyle(firstHeading).borderLeftWidth : "",
        itemsAlignContent: firstItems ? getComputedStyle(firstItems).alignContent : "",
        withinViewport: menuBox.left >= 0 && menuBox.right <= window.innerWidth,
      };
    });

    expect(audit.groupGrid).toContain("px");
    expect(audit.headingBorderLeft).toBe("3px");
    expect(audit.itemsAlignContent).toBe("start");
    expect(audit.withinViewport).toBe(true);
  });

  test("Capabilities, Resources and language surfaces share the glass affordance", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/en?uiMaterial=glass-a");
    for (const label of ["Capabilities", "Resources"]) {
      const trigger = page.getByRole("button", { name: label });
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.locator("[data-radix-menu-content], .kh-language-menu").first()).toBeVisible();
  });

  test("mobile drawer and sticky actions remain tappable without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/zh?uiMaterial=glass-b");
    await page.getByRole("button", { name: "打开导航菜单" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").locator("a,button").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByTestId("mobile-sticky-actions")).toBeVisible();
  });

  test("mobile header keeps menu and quote actions visible with 44px targets", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/zh?uiMaterial=glass-c");
    const quote = page.getByTestId("site-header-quote");
    const menu = page.getByRole("button", { name: "打开导航菜单" });
    await expect(quote).toBeVisible();
    await expect(menu).toBeVisible();
    const audit = await page.evaluate(() => {
      const quote = document.querySelector<HTMLElement>('[data-testid="site-header-quote"]');
      const menu = document.querySelector<HTMLElement>('.kh-menu-toggle');
      return {
        quoteHeight: quote?.getBoundingClientRect().height ?? 0,
        menuHeight: menu?.getBoundingClientRect().height ?? 0,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(audit.quoteHeight).toBeGreaterThanOrEqual(44);
    expect(audit.menuHeight).toBeGreaterThanOrEqual(44);
    expect(audit.scrollWidth).toBeLessThanOrEqual(audit.clientWidth);
  });

  test("mobile header exposes the same section entry order as desktop", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/zh?uiMaterial=glass-c");
    await expect(page.locator(".kh-header-brand-copy")).toBeVisible();
    await expect(page.locator(".kh-brand-name")).toHaveText("佛山科宏纸品有限公司");
    const nav = page.getByTestId("mobile-inline-nav");
    await expect(nav).toBeVisible();
    await expect(nav.locator("a")).toHaveCount(5);
    await expect(nav.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).resolves.toEqual([
      "/zh/products",
      "/zh/solutions",
      "/zh/capabilities",
      "/zh/factory",
      "/zh/resources",
    ]);
    await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).resolves.toBe(true);
  });

  test("compact header separates the brand row from shortcuts and uses one glass edge", async ({ page }) => {
    await page.setViewportSize({ width: 663, height: 761 });
    await page.goto("/zh?uiMaterial=glass-c", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-ui-material", "glass-c");
    await expect(page.locator(".kh-header")).toBeVisible();
    const audit = await page.evaluate(() => {
      const brand = document.querySelector<HTMLElement>(".kh-header-brand");
      const shortcuts = document.querySelector<HTMLElement>('[data-testid="mobile-inline-nav"]');
      const quote = document.querySelector<HTMLElement>('[data-testid="site-header-quote"]');
      const language = document.querySelector<HTMLElement>(".kh-language-trigger");
      const brandBox = brand?.getBoundingClientRect();
      const shortcutBox = shortcuts?.getBoundingClientRect();
      return {
        shortcutsDisplay: shortcuts ? getComputedStyle(shortcuts).display : "none",
        separateRows: Boolean(brandBox && shortcutBox && brandBox.bottom <= shortcutBox.top),
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
        quoteBefore: quote ? getComputedStyle(quote, "::before").content : "",
        languageBefore: language ? getComputedStyle(language, "::before").content : "",
        quoteBorderWidth: quote ? getComputedStyle(quote).borderTopWidth : "",
      };
    });
    expect(audit.shortcutsDisplay).toBe("flex");
    expect(audit.separateRows).toBe(true);
    expect(audit.pageOverflow).toBe(false);
    expect(audit.quoteBefore).toBe("none");
    expect(audit.languageBefore).toBe("none");
    expect(audit.quoteBorderWidth).toBe("1px");
  });

  test("reduced motion and unsupported material fall back without renderers", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en?uiMaterial=glass-b");
    const audit = await page.evaluate(() => ({
      animationNames: [...document.querySelectorAll<HTMLElement>(".kh-nav-panel, .kh-button")].map((node) => getComputedStyle(node).animationName),
      canvases: document.querySelectorAll("canvas").length,
      html2canvasScripts: [...document.scripts].filter((script) => /html2canvas/i.test(script.src || script.textContent || "")).length,
      fullInstances: document.querySelectorAll('[data-glass-intensity="full"]').length,
    }));
    expect(audit.canvases).toBe(0);
    expect(audit.html2canvasScripts).toBe(0);
    expect(audit.fullInstances).toBe(0);
    expect(audit.animationNames.every((name) => name === "none" || name === "kh-nav-popover-in")).toBe(true);
  });
});
