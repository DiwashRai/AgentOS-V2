// The web's tests are screenshots: the kit sheet and every screen state, in both themes, against
// committed baselines. Chrome as installed (no browser download, which a work network may block),
// a fixed viewport, time zone and clock (the fixtures' own), and animations stopped.
import { defineConfig } from "@playwright/test";

const PORT = 5175;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: [["list"]],
  // No pixel may differ (each pixel's own colour threshold absorbs anti-aliasing): a ratio would
  // let a changed word through.
  expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 0 } },
  use: {
    baseURL: `http://127.0.0.1:${String(PORT)}`,
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    timezoneId: "Europe/London",
    locale: "en-GB",
  },
  webServer: {
    command: `node node_modules/vite/bin/vite.js --port ${String(PORT)} --strictPort`,
    url: `http://127.0.0.1:${String(PORT)}`,
    reuseExistingServer: false,
  },
});
