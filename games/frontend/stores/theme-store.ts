"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getResolvedTheme: () => "light" | "dark";
  applyTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",

      setTheme: (theme: Theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === "light" ? "dark" : "light";
        set({ theme: newTheme });
        get().applyTheme(newTheme);
      },

      getResolvedTheme: () => {
        const { theme } = get();
        if (theme === "system") {
          if (typeof window === "undefined") {
            return "light";
          }
          return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return theme;
      },

      applyTheme: (theme: Theme) => {
        if (typeof window === "undefined") {
          return;
        }

        const root = document.documentElement;
        const resolvedTheme =
          theme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : theme;

        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);
        root.setAttribute("data-theme", resolvedTheme);
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on mount
if (typeof window !== "undefined") {
  const { applyTheme, theme } = useThemeStore.getState();
  applyTheme(theme);

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const { theme } = useThemeStore.getState();
      if (theme === "system") {
        applyTheme("system");
      }
    });
}
