// Themes: `data-theme` on <html>. index.html applies the saved one before first paint with the
// same key and values, so keep the two in sync. Each id has a block in tokens.css.
export type ThemeId = "light" | "dark";

const KEY = "agentos-theme";

export const THEMES: readonly { id: ThemeId; name: string; mode: string }[] = [
  { id: "light", name: "Paper", mode: "Light · white" },
  { id: "dark", name: "Carbon", mode: "Dark · pitch black" },
];

/** A theme id from outside (the menu's choice, the attribute); anything unknown is the default. */
export function themeOf(id: string | undefined): ThemeId {
  return THEMES.find((t) => t.id === id)?.id ?? "light";
}

export function currentTheme(): ThemeId {
  return themeOf(document.documentElement.dataset.theme);
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
}

/** Pause every animation while the tab is hidden (base.css reads `html.paused`). */
export function watchVisibility(): void {
  const sync = () => {
    document.documentElement.classList.toggle("paused", document.hidden);
  };
  document.addEventListener("visibilitychange", sync);
  sync();
}
