import { test, expect } from "@playwright/test";

test("font loading budget zh", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("response", (resp) => {
    if (/\.(woff2?|ttf|otf)(\?|$)/i.test(resp.url())) fontRequests.push(resp.url());
  });
  await page.goto("/zh/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  console.log("ZH_FONT_REQUESTS:", fontRequests.length);
  for (const u of fontRequests) console.log("ZH_FONT:", u.split("/").pop());
});
