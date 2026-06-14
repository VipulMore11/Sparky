"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme-store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, applyTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Only apply theme after component has mounted on client
  useEffect(() => {
    setMounted(true);
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Prevent hydration mismatch by not rendering any theme-specific attributes during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
