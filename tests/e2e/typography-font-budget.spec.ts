import { test, expect } from "@playwright/test";

test("font loading budget", async ({ page }) => {
  const fontRequests: { url: string; status: number }[] = [];
  page.on("response", (resp) => {
    if (/\.(woff2?|ttf|otf)(\?|$)/i.test(resp.url())) {
      fontRequests.push({ url: resp.url(), status: resp.status() });
    }
  });
  await page.goto("/en/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const unique = new Set(fontRequests.map((f) => f.url.split("?")[0].split("/").pop()));
  console.log("FONT_REQUESTS:", fontRequests.length);
  console.log("UNIQUE_FONT_FILES:", unique.size);
  for (const f of fontRequests) console.log("FONT:", f.status, f.url.split("/").pop());
  expect(fontRequests.every((f) => f.status < 400)).toBe(true);
});
