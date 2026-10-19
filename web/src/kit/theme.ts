// Themes: `data-theme` on <html>. index.html applies the saved one before first paint with the
// same key and values, so keep the two in sync.
export type ThemeId = "light" | "dark";

const KEY = "agentos-theme";

export const THEMES: readonly { id: ThemeId; name: string; mode: string }[] = [
  { id: "light", name: "Type Case Cool", mode: "Light · default" },
  { id: "dark", name: "Harbour", mode: "Dark · default" },
];

export function currentTheme(): ThemeId {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
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
