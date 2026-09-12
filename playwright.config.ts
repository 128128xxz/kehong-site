import { defineConfig, devices } from "@playwright/test";

const PLAYWRIGHT_DEFAULT_PORT = 3451;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${process.env.PLAYWRIGHT_TEST_PORT || process.env.PLAYWRIGHT_PORT || PLAYWRIGHT_DEFAULT_PORT}`;
const serverPort = new URL(baseURL).port || (baseURL.startsWith("https:") ? "443" : "80");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["html", { outputFolder: "playwright-report", open: "never" }], ["line"]] : "list",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    ...(process.env.PW_EXECUTABLE_PATH ? { launchOptions: { executablePath: process.env.PW_EXECUTABLE_PATH } } : {}),
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: process.env.PW_EXECUTABLE_PATH ? "off" : "retain-on-failure",
    actionTimeout: 15_000,
  },
  outputDir: "test-results/artifacts",
  webServer: {
    command: process.env.PLAYWRIGHT_SERVER_COMMAND || `pnpm exec next start --port ${serverPort}`,
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
