import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "chattong-theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function queryTheme(): Theme | null {
  const value = new URLSearchParams(window.location.search).get("theme");
  return value === "light" || value === "dark" ? value : null;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const fromQuery = queryTheme();
    if (fromQuery) return fromQuery;
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      /* private mode */
    }
    return systemTheme();
  });
  const [explicit, setExplicit] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored === "light" || stored === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#05070B" : "#ffffff");
  }, [theme]);

  useEffect(() => {
    if (explicit) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [explicit]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setExplicit(true);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  return { theme, toggle };
}
