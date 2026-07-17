import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["html", { outputFolder: "test-results/playwright-report", open: "never" }], ["line"]] : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
  },
  webServer: {
    command: process.env.PLAYWRIGHT_SERVER_COMMAND || "pnpm start",
    url: `${process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000"}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

