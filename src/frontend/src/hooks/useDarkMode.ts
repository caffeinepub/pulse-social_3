import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pulse-theme";

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "dark";
  } catch {
    // localStorage unavailable
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDark(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const initial = getInitialDark();
    applyDark(initial);
    return initial;
  });

  // Sync on first render in case SSR or re-mount
  useEffect(() => {
    applyDark(isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // ignore
      }
      applyDark(next);
      return next;
    });
  }, []);

  return { isDark, toggle };
}
