import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "theme";
const EVENT = "theme-change";

const getTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try { localStorage.setItem(KEY, theme); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme);
  const toggle = useCallback(() => applyTheme(getTheme() === "dark" ? "light" : "dark"), []);
  return { theme, toggle };
};
