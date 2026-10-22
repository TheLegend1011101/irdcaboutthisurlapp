export type ThemeChoice = "system" | "light" | "dark";

const KEY = "theme";
const query = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getChoice(): ThemeChoice {
  const stored = localStorage.getItem(KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return query().matches ? "dark" : "light";
}

export function applyTheme(choice: ThemeChoice = getChoice()) {
  document.documentElement.dataset.theme = resolveTheme(choice);
}

export function setChoice(choice: ThemeChoice) {
  if (choice === "system") localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, choice);
  applyTheme(choice);
  window.dispatchEvent(new Event("themechange"));
}

export function initTheme() {
  applyTheme();
  query().addEventListener("change", () => {
    if (getChoice() === "system") {
      applyTheme();
      window.dispatchEvent(new Event("themechange"));
    }
  });
}