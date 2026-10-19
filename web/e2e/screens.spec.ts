// Every screen in its named states (W0), and the kit sheet, in both themes. A failing test is a
// changed picture: look at the diff, and update the baseline (`just shots --update-snapshots`)
// only when the change is meant.
import { expect, type Page, test } from "@playwright/test";

const STATES = [
  { name: "my-queue", path: "/" },
  { name: "my-queue-peek", path: "/?peek=NW-17" },
  { name: "compact-expanded", path: "/compact?open=NW-17" },
  { name: "intake", path: "/intake" },
  { name: "ticket", path: "/t/NW-17" },
  { name: "ticket-missing", path: "/t/NW-404" },
  { name: "compact-repo", path: "/compact?repo=northwind/web" },
  { name: "all-teams", path: "/teams" },
] as const;

async function open(page: Page, path: string, theme: string) {
  await page.addInitScript((t) => {
    localStorage.setItem("agentos-theme", t);
  }, theme);
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

for (const theme of ["light", "dark"]) {
  for (const state of STATES) {
    test(`${state.name} (${theme})`, async ({ page }) => {
      await open(page, state.path, theme);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await expect(page).toHaveScreenshot(`${state.name}-${theme}.png`);
    });
  }

  test(`kit sheet (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 3200 });
    await open(page, "/kit", theme);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot(`kit-${theme}.png`);
  });
}
