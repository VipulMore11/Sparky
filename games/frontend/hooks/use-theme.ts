"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function useTheme() {
  const { theme, setTheme, toggleTheme, getResolvedTheme, applyTheme } =
    useThemeStore();

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes when theme is set to "system"
  useEffect(() => {
    if (theme === "system" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, applyTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    resolvedTheme: getResolvedTheme(),
  };
}
